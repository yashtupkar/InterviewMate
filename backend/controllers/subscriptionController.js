const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const User = require('../models/User');
const {
    PLAN_CONFIG,
    createRazorpayOrder,
    verifyPaymentSignature,
    verifyWebhookSignature,
    issueRefund,
} = require('../services/razorpayService');
const mongoose = require('mongoose');

// ─── Helper: ensure user + subscription exist ─────────────────────────────────
const ensureSubscription = async (clerkId) => {
    const user = await User.findOne({ clerkId }).populate('subscription');
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    let subscription = user.subscription;
    if (!subscription) {
        subscription = await Subscription.create({ user: user._id });
        user.subscription = subscription._id;
        await user.save();
    }
    return { user, subscription };
};

const TIER_LIMITS = {
    Free: { talkTime: 20, interviews: 2, gdSessions: 3 },
    'Student Flash': { talkTime: 150, interviews: 10, gdSessions: 15 },
    'Placement Pro': { talkTime: 500, interviews: 50, gdSessions: 75 },
    'Infinite Elite': { talkTime: 1000, interviews: 1000, gdSessions: 1000 },
};

// ─── GET /subscription/status ─────────────────────────────────────────────────
const getSubscriptionStatus = async (req, res) => {
    try {
        const { user, subscription } = await ensureSubscription(req.auth.userId);

        // Populate last 10 orders for billing history
        await subscription.populate({
            path: 'paymentHistory',
            options: { sort: { createdAt: -1 }, limit: 10 }
        });

        // Check refund eligibility for most recent paid order
        let refundEligible = false;
        let refundEligibleUntil = null;
        const latestPaidOrder = subscription.paymentHistory?.find(o => o.status === 'paid' && !o.refund?.razorpayRefundId);
        if (latestPaidOrder) {
            const hoursSincePurchase = (Date.now() - new Date(latestPaidOrder.createdAt).getTime()) / (1000 * 60 * 60);
            const tierLimits = TIER_LIMITS[subscription.tier] || TIER_LIMITS.Free;
            const usagePercent = (
                ((tierLimits.interviews - subscription.credits.interviews) / tierLimits.interviews) * 100 +
                ((tierLimits.gdSessions - subscription.credits.gdSessions) / tierLimits.gdSessions) * 100
            ) / 2;

            refundEligible = hoursSincePurchase < 24 && usagePercent < 10;
            if (latestPaidOrder && hoursSincePurchase < 24) {
                refundEligibleUntil = new Date(new Date(latestPaidOrder.createdAt).getTime() + 24 * 60 * 60 * 1000);
            }
        }

        res.json({
            tier: subscription.tier,
            credits: subscription.credits,
            limits: TIER_LIMITS[subscription.tier] || TIER_LIMITS.Free,
            planExpiry: subscription.planExpiry,
            billingCycle: subscription.billingCycle,
            lastPaymentAt: subscription.lastPaymentAt,
            paymentHistory: subscription.paymentHistory,
            refundEligible,
            refundEligibleUntil,
        });
    } catch (error) {
        const status = error.statusCode || 500;
        res.status(status).json({ message: error.message });
    }
};

// ─── POST /subscription/create-order ─────────────────────────────────────────
// Step 1 of payment: Server creates a real Razorpay order.
// Amount is read from PLAN_CONFIG — frontend amount is NEVER trusted.
const createOrder = async (req, res) => {
    const { planId } = req.body;

    // Validate planId against whitelist
    const plan = PLAN_CONFIG[planId];
    if (!plan) {
        return res.status(400).json({ message: `Invalid planId: ${planId}` });
    }

    try {
        const { user, subscription } = await ensureSubscription(req.auth.userId);

        // Idempotency: bucket key by user + plan + 10-minute window
        // Prevents double-orders if user clicks "Buy" multiple times quickly
        const windowBucket = Math.floor(Date.now() / (10 * 60 * 1000));
        const idempotencyKey = `${user._id}_${planId}_${windowBucket}`;

        // Return existing created order if within same window
        const existingOrder = await Order.findOne({ idempotencyKey, status: 'created' });
        if (existingOrder) {
            return res.json({
                razorpayOrderId: existingOrder.razorpayOrderId,
                amountPaise: existingOrder.amount,
                currency: existingOrder.currency,
                key: process.env.RAZORPAY_KEY_ID,
                planName: existingOrder.planName,
            });
        }

        // Create real Razorpay order
        const receipt = `rcpt_${user._id.toString().slice(-8)}_${Date.now().toString().slice(-6)}`;
        const rzpOrder = await createRazorpayOrder(plan.amountPaise, 'INR', receipt, {
            planId,
            userId: user._id.toString(),
            email: user.email,
        });

        // Persist order document
        const order = await Order.create({
            user: user._id,
            razorpayOrderId: rzpOrder.id,
            planId,
            planName: plan.planName,
            billingCycle: plan.billingCycle,
            amount: plan.amountPaise,
            currency: 'INR',
            status: 'created',
            metadata: {
                userEmail: user.email,
                userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                tierAtPurchase: subscription.tier,
                creditsAtPurchase: { ...subscription.credits },
            },
            idempotencyKey,
        });

        console.log(`[Order] Created order ${order.razorpayOrderId} for user ${user._id} — plan: ${planId}`);

        res.json({
            razorpayOrderId: rzpOrder.id,
            amountPaise: plan.amountPaise,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID,
            planName: plan.planName,
        });
    } catch (error) {
        console.error('[Order] Create order failed:', error);
        res.status(500).json({ message: 'Failed to create payment order. Please try again.' });
    }
};

// ─── POST /subscription/verify-payment ───────────────────────────────────────
// Step 2: Frontend sends payment_id + order_id + signature after checkout.
// Backend verifies HMAC, then grants access. This is the security gate.
const verifyPayment = async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !planId) {
        return res.status(400).json({ message: 'Missing required payment fields' });
    }

    // ── HMAC Verification ──
    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
        console.warn(`[Payment] Invalid signature attempt for order ${razorpayOrderId}`);
        return res.status(400).json({ message: 'Invalid payment signature. Payment rejected.' });
    }

    // Use a MongoDB session for atomic update
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { user, subscription } = await ensureSubscription(req.auth.userId);

        // Find the order
        const order = await Order.findOne({ razorpayOrderId, user: user._id }).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Order not found' });
        }

        // Idempotency — already processed
        if (order.status === 'paid') {
            await session.abortTransaction();
            return res.json({ success: true, tier: subscription.tier, message: 'Payment already verified' });
        }

        const plan = PLAN_CONFIG[order.planId];
        if (!plan) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Invalid plan in order' });
        }

        // ── Update Order ──
        order.razorpayPaymentId = razorpayPaymentId;
        order.razorpaySignature = razorpaySignature;
        order.status = 'paid';
        await order.save({ session });

        // ── Update Subscription ──
        await applyPlanToSubscription(subscription, plan);
        subscription.lastPaymentAt = new Date();
        if (plan.billingCycle !== 'one_time') {
            subscription.billingCycle = plan.billingCycle;
        }
        if (!subscription.paymentHistory.includes(order._id)) {
            subscription.paymentHistory.push(order._id);
        }
        await subscription.save({ session });

        await session.commitTransaction();
        console.log(`[Payment] Verified + subscription upgraded: user=${user._id} plan=${order.planId}`);

        res.json({
            success: true,
            tier: subscription.tier,
            credits: subscription.credits,
            planExpiry: subscription.planExpiry,
            planId: order.planId, // included for UI personalization
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('[Payment] Verify failed:', error);
        res.status(500).json({ message: 'Payment verification failed. Contact support.' });
    } finally {
        session.endSession();
    }
};

// ─── POST /api/webhooks/razorpay ──────────────────────────────────────────────
// Razorpay sends events here asynchronously (e.g., payment.captured after a delay).
// This is the second line of defence — handles edge cases like browser crashes.
const handleRazorpayWebhook = async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
        return res.status(400).json({ message: 'Missing webhook signature' });
    }

    // Verify the webhook came from Razorpay
    const rawBody = req.body.toString();
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
        console.warn('[Webhook] Invalid Razorpay webhook signature');
        return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    let payload;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }

    const event = payload.event;
    console.log(`[Webhook] Received event: ${event}`);

    // ── payment.captured ──────────────────────────────────────────────────────
    if (event === 'payment.captured') {
        const payment = payload.payload?.payment?.entity;
        if (!payment) return res.status(200).json({ received: true });

        const razorpayOrderId = payment.order_id;
        const razorpayPaymentId = payment.id;

        try {
            const order = await Order.findOne({ razorpayOrderId });
            if (!order) {
                console.warn(`[Webhook] Order not found for ${razorpayOrderId}`);
                return res.status(200).json({ received: true }); // 200 so Razorpay stops retrying
            }

            // Idempotent — already processed
            if (order.status === 'paid' && order.webhookVerified) {
                return res.status(200).json({ received: true });
            }

            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                order.razorpayPaymentId = order.razorpayPaymentId || razorpayPaymentId;
                order.status = 'paid';
                order.webhookVerified = true;
                await order.save({ session });

                // Only update subscription if verifyPayment hasn't already done it
                if (!order.webhookVerified || order.status !== 'paid') {
                    const subscription = await Subscription.findOne({ user: order.user }).session(session);
                    if (subscription) {
                        const plan = PLAN_CONFIG[order.planId];
                        if (plan) {
                            await applyPlanToSubscription(subscription, plan);
                            subscription.lastPaymentAt = new Date();
                            if (!subscription.paymentHistory.includes(order._id)) {
                                subscription.paymentHistory.push(order._id);
                            }
                            await subscription.save({ session });
                        }
                    }
                } else {
                    // verifyPayment already ran — just mark webhook confirmed
                    order.webhookVerified = true;
                    await order.save({ session });
                }

                await session.commitTransaction();
                console.log(`[Webhook] payment.captured confirmed: ${razorpayOrderId}`);
            } catch (e) {
                await session.abortTransaction();
                throw e;
            } finally {
                session.endSession();
            }
        } catch (error) {
            console.error('[Webhook] payment.captured handler error:', error);
            // Return 200 anyway — Razorpay retries on 5xx but not 2xx
        }
    }

    // ── refund.processed ──────────────────────────────────────────────────────
    if (event === 'refund.processed') {
        const refund = payload.payload?.refund?.entity;
        if (!refund) return res.status(200).json({ received: true });

        try {
            const order = await Order.findOne({ 'refund.razorpayRefundId': refund.id });
            if (order) {
                order.refund.status = 'processed';
                order.refund.processedAt = new Date();
                await order.save();
                console.log(`[Webhook] refund.processed for refund ${refund.id}`);
            }
        } catch (error) {
            console.error('[Webhook] refund.processed handler error:', error);
        }
    }

    res.status(200).json({ received: true });
};

// ─── POST /subscription/request-refund ───────────────────────────────────────
// Programmatic refund via Razorpay Refund API.
// Eligibility: paid within 24h AND < 10% credits consumed.
const requestRefund = async (req, res) => {
    try {
        const { user, subscription } = await ensureSubscription(req.auth.userId);

        // Find most recent paid, non-refunded subscription order (not top-ups)
        await subscription.populate({
            path: 'paymentHistory',
            match: { status: 'paid', billingCycle: { $ne: 'one_time' } },
            options: { sort: { createdAt: -1 }, limit: 1 }
        });

        const order = subscription.paymentHistory?.[0];

        if (!order) {
            return res.status(400).json({ message: 'No paid order found eligible for refund.' });
        }

        // ── Check: no existing refund ──
        if (order.refund && order.refund.razorpayRefundId) {
            return res.status(400).json({ message: 'A refund has already been initiated for this order.' });
        }

        // ── Check: within 24 hours ──
        const hoursSincePurchase = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
        if (hoursSincePurchase >= 24) {
            return res.status(400).json({
                message: 'Refund window has expired. Refunds are only available within 24 hours of purchase.'
            });
        }

        // ── Check: < 10% credits consumed ──
        const tierLimits = TIER_LIMITS[subscription.tier] || TIER_LIMITS.Free;
        const interviewsUsed = tierLimits.interviews - subscription.credits.interviews;
        const gdUsed = tierLimits.gdSessions - subscription.credits.gdSessions;
        const totalUsed = interviewsUsed + gdUsed;
        const totalLimit = tierLimits.interviews + tierLimits.gdSessions;
        const usagePercent = (totalUsed / totalLimit) * 100;

        if (usagePercent >= 10) {
            return res.status(400).json({
                message: `Refund not eligible: you have used ${usagePercent.toFixed(1)}% of your plan credits (limit is 10%).`
            });
        }

        if (!order.razorpayPaymentId) {
            return res.status(400).json({ message: 'Payment ID not found on order. Contact support.' });
        }

        // ── Issue Refund via Razorpay API ──
        const rzpRefund = await issueRefund(order.razorpayPaymentId, order.amount, {
            reason: 'user_request',
            userId: user._id.toString(),
            orderId: order._id.toString(),
        });

        // ── Atomically update Order + Subscription ──
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            order.status = 'refunded';
            order.refund = {
                razorpayRefundId: rzpRefund.id,
                amount: rzpRefund.amount,
                initiatedAt: new Date(),
                reason: 'user_request',
                status: 'pending',
            };
            await order.save({ session });

            // Downgrade to Free
            subscription.tier = 'Free';
            subscription.credits = { talkTime: 20, interviews: 2, gdSessions: 3 };
            subscription.planExpiry = null;
            subscription.billingCycle = null;
            // Remove this order from history
            subscription.paymentHistory = subscription.paymentHistory.filter(
                (id) => id.toString() !== order._id.toString()
            );
            await subscription.save({ session });

            await session.commitTransaction();
        } catch (e) {
            await session.abortTransaction();
            throw e;
        } finally {
            session.endSession();
        }

        console.log(`[Refund] Initiated refund ${rzpRefund.id} for user ${user._id}, order ${order._id}`);

        res.json({
            success: true,
            refundId: rzpRefund.id,
            message: 'Refund initiated successfully. It will reflect in your account within 5-7 business days (instantly for UPI/wallet).',
        });
    } catch (error) {
        console.error('[Refund] Error:', error);
        res.status(500).json({ message: 'Failed to process refund. Please contact support.' });
    }
};

// ─── POST /subscription/deduct-interview ──────────────────────────────────────
const deductInterviewCredit = async (req, res) => {
    try {
        const { subscription } = await ensureSubscription(req.auth.userId);

        if (subscription.tier === 'Infinite Elite') {
            return res.json({ message: 'Unlimited credits for Infinite Elite plan', credits: subscription.credits });
        }

        if (subscription.credits.interviews <= 0) {
            return res.status(400).json({ message: 'Insufficient interview credits' });
        }

        subscription.credits.interviews -= 1;
        await subscription.save();
        res.json({ message: 'Interview credit deducted', credits: subscription.credits });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// ─── POST /subscription/deduct-gd ─────────────────────────────────────────────
const deductGdCredit = async (req, res) => {
    try {
        const { subscription } = await ensureSubscription(req.auth.userId);

        if (subscription.tier === 'Infinite Elite') {
            return res.json({ message: 'Unlimited credits for Infinite Elite plan', credits: subscription.credits });
        }

        if (subscription.credits.gdSessions <= 0) {
            return res.status(400).json({ message: 'Insufficient GD credits' });
        }

        subscription.credits.gdSessions -= 1;
        await subscription.save();
        res.json({ message: 'GD session credit deducted', credits: subscription.credits });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// ─── Internal helper: apply plan config to subscription ───────────────────────
async function applyPlanToSubscription(subscription, plan) {
    if (plan.isTopup) {
        // Top-ups: add delta credits, don't change tier
        if (plan.creditDelta.interviews) {
            subscription.credits.interviews += plan.creditDelta.interviews;
        }
        if (plan.creditDelta.gdSessions) {
            subscription.credits.gdSessions += plan.creditDelta.gdSessions;
        }
    } else {
        // Plan purchase: set tier + reset credits + set expiry
        subscription.tier = plan.tier;
        subscription.credits = { ...plan.credits };

        const currentExpiry = subscription.planExpiry && subscription.planExpiry > new Date()
            ? subscription.planExpiry
            : new Date();
        subscription.planExpiry = new Date(currentExpiry.getTime() + plan.expiryDays * 24 * 60 * 60 * 1000);
    }
}

module.exports = {
    getSubscriptionStatus,
    createOrder,
    verifyPayment,
    handleRazorpayWebhook,
    requestRefund,
    deductInterviewCredit,
    deductGdCredit,
};
