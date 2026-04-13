const Subscription = require("../models/Subscription");
const Order = require("../models/Order");
const User = require("../models/User");
const {
  PLAN_CONFIG,
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  issueRefund,
  fetchPaymentDetails,
} = require("../services/razorpayService");
const {
  TIER_LIMITS,
  getCycleKey,
  getServiceCost,
  isUnlimitedTierService,
} = require("../config/pricingConfig");
const mongoose = require("mongoose");

// ─── Helper: check and handle plan expiry ─────────────────────────────────────
const checkSubscriptionExpiry = async (subscription) => {
  if (
    subscription.tier !== "Free" &&
    subscription.planExpiry &&
    new Date() > new Date(subscription.planExpiry)
  ) {
    console.log(
      `[Subscription] Plan expired for user ${subscription.user}. Reverting to Free tier.`,
    );

    // Restore leftover free credits or fallback to current Free-tier config.
    subscription.credits =
      subscription.leftoverFreeCredits > 0
        ? subscription.leftoverFreeCredits
        : TIER_LIMITS.Free.credits;
    subscription.leftoverFreeCredits = 0; // Reset after restoration

    subscription.tier = "Free";
    subscription.planExpiry = null;
    subscription.billingCycle = null;
    await subscription.save();
    return true; // Expired and updated
  }
  return false; // Not expired
};

// ─── Helper: ensure user + subscription exist ─────────────────────────────────
const ensureSubscription = async (clerkId) => {
  let user = await User.findOne({ clerkId }).populate("subscription");
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });

  let subscription = user.subscription;
  if (!subscription) {
    subscription = await Subscription.create({ user: user._id });
    user.subscription = subscription._id;
    await user.save();
  }

  // Check for plan expiry whenever subscription is accessed
  await checkSubscriptionExpiry(subscription);

  return { user, subscription };
};

// ─── Helper: extract payment metadata ─────────────────────────────────────────
const extractPaymentDetails = (payment) => {
  if (!payment) return null;
  const details = { method: payment.method };
  if (payment.method === "card" && payment.card) {
    details.cardNetwork = payment.card.network;
    details.cardLast4 = payment.card.last4;
    details.cardExpiry = `${String(payment.card.expiry_month).padStart(2, "0")}/${payment.card.expiry_year}`;
  } else if (payment.method === "upi") {
    details.vpa = payment.vpa;
  }
  return details;
};

// ─── GET /subscription/status ─────────────────────────────────────────────────
const getSubscriptionStatus = async (req, res) => {
  try {
    const { user, subscription } = await ensureSubscription(req.auth.userId);
    const cycleKey = getCycleKey();

    if (
      !subscription.codingExecution ||
      subscription.codingExecution.cycleKey !== cycleKey
    ) {
      subscription.codingExecution = {
        cycleKey,
        count: 0,
        updatedAt: new Date(),
      };
      await subscription.save();
    }

    const tierLimit = TIER_LIMITS[subscription.tier] || TIER_LIMITS.Free;
    const codingMonthlyExecution = tierLimit.codingMonthlyExecution;
    const usedExecutions = subscription.codingExecution?.count || 0;
    const isUnlimited = !Number.isFinite(codingMonthlyExecution);

    // Populate last 10 orders for billing history
    await subscription.populate({
      path: "paymentHistory",
      options: { sort: { createdAt: -1 }, limit: 10 },
    });

    // Check refund eligibility for most recent paid order
    let refundEligible = false;
    let refundEligibleUntil = null;
    const latestPaidOrder = subscription.paymentHistory?.find(
      (o) => o.status === "paid" && !o.refund?.razorpayRefundId,
    );
    if (latestPaidOrder) {
      const hoursSincePurchase =
        (Date.now() - new Date(latestPaidOrder.createdAt).getTime()) /
        (1000 * 60 * 60);
      const usagePercent =
        ((tierLimit.credits - subscription.credits) / tierLimit.credits) * 100;

      refundEligible = hoursSincePurchase < 24 && usagePercent < 10;
      if (latestPaidOrder && hoursSincePurchase < 24) {
        refundEligibleUntil = new Date(
          new Date(latestPaidOrder.createdAt).getTime() + 24 * 60 * 60 * 1000,
        );
      }
    }

    // Calculate current plan price from PLAN_CONFIG
    let planKey = Object.keys(PLAN_CONFIG).find(
      (key) =>
        PLAN_CONFIG[key].tier === subscription.tier &&
        PLAN_CONFIG[key].billingCycle === subscription.billingCycle,
    );

    // Fallback: If billingCycle is null, find the first matching tier
    if (!planKey && subscription.tier !== "Free") {
      planKey = Object.keys(PLAN_CONFIG).find(
        (key) => PLAN_CONFIG[key].tier === subscription.tier,
      );
      // Repair the data if found
      if (planKey) {
        subscription.billingCycle = PLAN_CONFIG[planKey].billingCycle;
        await subscription.save();
      }
    }

    const currentPlanAmount = planKey
      ? PLAN_CONFIG[planKey].amountPaise / 100
      : 0;

    // Convert Infinity to null for JSON serialization compatibility
    const limitsForResponse = {
      ...tierLimit,
      resumeLimit: Number.isFinite(tierLimit.resumeLimit)
        ? tierLimit.resumeLimit
        : null,
      codingMonthlyExecution: Number.isFinite(tierLimit.codingMonthlyExecution)
        ? tierLimit.codingMonthlyExecution
        : null,
    };

    res.json({
      tier: subscription.tier,
      credits: subscription.credits,
      topupCredits: subscription.topupCredits || 0,
      role: user.role, // Added role
      limits: limitsForResponse,
      planExpiry: subscription.planExpiry,
      billingCycle: subscription.billingCycle,
      lastPaymentAt: subscription.lastPaymentAt,
      paymentHistory: subscription.paymentHistory,
      currentPaymentMethod:
        subscription.paymentHistory?.find((o) => o.status === "paid")
          ?.paymentDetails || null,
      refundEligible,
      refundEligibleUntil,
      currentPlanAmount, // Added currentPlanAmount
      codingExecution: {
        cycleKey,
        used: usedExecutions,
        limit: isUnlimited ? null : codingMonthlyExecution,
        remaining: isUnlimited
          ? null
          : Math.max(codingMonthlyExecution - usedExecutions, 0),
        unlimited: isUnlimited,
        canExecute: isUnlimited
          ? true
          : usedExecutions < codingMonthlyExecution,
      },
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
    const existingOrder = await Order.findOne({ idempotencyKey });
    if (existingOrder) {
      if (existingOrder.status === "created") {
        return res.json({
          razorpayOrderId: existingOrder.razorpayOrderId,
          amountPaise: existingOrder.amount,
          currency: existingOrder.currency,
          key: process.env.RAZORPAY_KEY_ID,
          planName: existingOrder.planName,
        });
      } else {
        return res.status(400).json({
          message:
            "You have recently purchased or initiated this plan. To prevent accidental double charges, please wait a few minutes before trying again.",
        });
      }
    }

    // Create real Razorpay order
    const receipt = `rcpt_${user._id.toString().slice(-8)}_${Date.now().toString().slice(-6)}`;
    const rzpOrder = await createRazorpayOrder(
      plan.amountPaise,
      "INR",
      receipt,
      {
        planId,
        userId: user._id.toString(),
        email: user.email,
      },
    );

    // Persist order document
    const order = await Order.create({
      user: user._id,
      razorpayOrderId: rzpOrder.id,
      planId,
      planName: plan.planName,
      billingCycle: plan.billingCycle,
      amount: plan.amountPaise,
      currency: "INR",
      status: "created",
      metadata: {
        userEmail: user.email,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        tierAtPurchase: subscription.tier,
        creditsAtPurchase: { ...subscription.credits },
      },
      idempotencyKey,
    });

    console.log(
      `[Order] Created order ${order.razorpayOrderId} for user ${user._id} — plan: ${planId}`,
    );

    res.json({
      razorpayOrderId: rzpOrder.id,
      amountPaise: plan.amountPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      planName: plan.planName,
    });
  } catch (error) {
    if (error.code === 11000) {
      console.warn(
        `[Order] Duplicate create attempt (E11000) for user ${req.auth?.userId || "unknown"} — plan ${planId}`,
      );
      return res.status(400).json({
        message: "Your order is currently processing. Please wait a moment.",
      });
    }
    console.error("[Order] Create order failed:", error);
    res
      .status(500)
      .json({ message: "Failed to create payment order. Please try again." });
  }
};

// ─── POST /subscription/verify-payment ───────────────────────────────────────
// Step 2: Frontend sends payment_id + order_id + signature after checkout.
// Backend verifies HMAC, then grants access. This is the security gate.
const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } =
    req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !planId) {
    return res.status(400).json({ message: "Missing required payment fields" });
  }

  // ── HMAC Verification ──
  const isValid = verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  );
  if (!isValid) {
    console.warn(
      `[Payment] Invalid signature attempt for order ${razorpayOrderId}`,
    );
    return res
      .status(400)
      .json({ message: "Invalid payment signature. Payment rejected." });
  }

  // Use a MongoDB session for atomic update
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user, subscription } = await ensureSubscription(req.auth.userId);

    // Find the order
    const order = await Order.findOne({
      razorpayOrderId,
      user: user._id,
    }).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    // Idempotency — already processed
    if (order.status === "paid") {
      await session.abortTransaction();
      return res.json({
        success: true,
        tier: subscription.tier,
        message: "Payment already verified",
      });
    }

    const plan = PLAN_CONFIG[order.planId];
    if (!plan) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid plan in order" });
    }

    // ── Update Order ──
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.status = "paid";
    await order.save({ session });

    // ── Update Subscription ──
    await applyPlanToSubscription(subscription, plan);
    subscription.lastPaymentAt = new Date();
    if (plan.billingCycle !== "one_time") {
      subscription.billingCycle = plan.billingCycle;
    }
    if (!subscription.paymentHistory.includes(order._id)) {
      subscription.paymentHistory.push(order._id);
    }

    // ── Fetch & Store Payment Details ──
    const payment = await fetchPaymentDetails(razorpayPaymentId);
    if (payment) {
      order.paymentDetails = extractPaymentDetails(payment);
    }

    await subscription.save({ session });
    await order.save({ session });

    await session.commitTransaction();
    console.log(
      `[Payment] Verified + subscription upgraded: user=${user._id} plan=${order.planId}`,
    );

    res.json({
      success: true,
      tier: subscription.tier,
      planName: plan.planName, // Return the actual plan name for UI/Invoices
      credits: subscription.credits,
      planExpiry: subscription.planExpiry,
      planId: order.planId,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("[Payment] Verify failed:", error);
    res
      .status(500)
      .json({ message: "Payment verification failed. Contact support." });
  } finally {
    session.endSession();
  }
};

// ─── POST /api/webhooks/razorpay ──────────────────────────────────────────────
// Razorpay sends events here asynchronously (e.g., payment.captured after a delay).
// This is the second line of defence — handles edge cases like browser crashes.
const handleRazorpayWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  if (!signature) {
    return res.status(400).json({ message: "Missing webhook signature" });
  }

  // Verify the webhook came from Razorpay
  const rawBody = req.body.toString();
  const isValid = verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.warn("[Webhook] Invalid Razorpay webhook signature");
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }

  const event = payload.event;
  console.log(`[Webhook] Received event: ${event}`);

  // ── payment.captured ──────────────────────────────────────────────────────
  if (event === "payment.captured") {
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
      if (order.status === "paid" && order.webhookVerified) {
        return res.status(200).json({ received: true });
      }

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // Record the prior state to determine if verifyPayment already ran
        const wasAlreadyPaid = order.status === "paid";

        order.razorpayPaymentId = order.razorpayPaymentId || razorpayPaymentId;
        order.status = "paid";
        order.webhookVerified = true;

        // ── Fetch & Store Payment Details ──
        const paymentDetails = await fetchPaymentDetails(razorpayPaymentId);
        if (paymentDetails) {
          order.paymentDetails = extractPaymentDetails(paymentDetails);
        }

        await order.save({ session });

        // If verifyPayment hasn't run yet, upgrade the subscription here!
        if (!wasAlreadyPaid) {
          const subscription = await Subscription.findOne({
            user: order.user,
          }).session(session);
          if (subscription) {
            const plan = PLAN_CONFIG[order.planId];
            if (plan) {
              await applyPlanToSubscription(subscription, plan);
              subscription.lastPaymentAt = new Date();
              if (!subscription.paymentHistory.includes(order._id)) {
                subscription.paymentHistory.push(order._id);
              }
              await subscription.save({ session });
              console.log(
                `[Webhook] Realtime subscription upgrade applied: ${plan.tier}`,
              );
            }
          }
        } else {
          // verifyPayment previously completed the upgrade; we're just syncing the webhook flag.
          console.log(
            `[Webhook] verifyPayment already ran. Synced flag for ${razorpayOrderId}`,
          );
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
      console.error("[Webhook] payment.captured handler error:", error);
      // Return 200 anyway — Razorpay retries on 5xx but not 2xx
    }
  }

  // ── refund.processed ──────────────────────────────────────────────────────
  if (event === "refund.processed") {
    const refund = payload.payload?.refund?.entity;
    if (!refund) return res.status(200).json({ received: true });

    try {
      const order = await Order.findOne({
        "refund.razorpayRefundId": refund.id,
      });
      if (order) {
        order.refund.status = "processed";
        order.refund.processedAt = new Date();
        await order.save();
        console.log(`[Webhook] refund.processed for refund ${refund.id}`);
      }
    } catch (error) {
      console.error("[Webhook] refund.processed handler error:", error);
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
      path: "paymentHistory",
      match: { status: "paid", billingCycle: { $ne: "one_time" } },
      options: { sort: { createdAt: -1 }, limit: 1 },
    });

    const order = subscription.paymentHistory?.[0];

    if (!order) {
      return res
        .status(400)
        .json({ message: "No paid order found eligible for refund." });
    }

    // ── Check: no existing refund ──
    if (order.refund && order.refund.razorpayRefundId) {
      return res.status(400).json({
        message: "A refund has already been initiated for this order.",
      });
    }

    // ── Check: within 24 hours ──
    const hoursSincePurchase =
      (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSincePurchase >= 24) {
      return res.status(400).json({
        message:
          "Refund window has expired. Refunds are only available within 24 hours of purchase.",
      });
    }

    // ── Check: < 10% credits consumed ──
    const tierLimits = TIER_LIMITS[subscription.tier] || TIER_LIMITS.Free;
    const creditsUsed = tierLimits.credits - subscription.credits;
    const usagePercent = (creditsUsed / tierLimits.credits) * 100;

    if (usagePercent >= 10) {
      return res.status(400).json({
        message: `Refund not eligible: you have used ${usagePercent.toFixed(1)}% of your plan credits (limit is 10%).`,
      });
    }

    if (!order.razorpayPaymentId) {
      return res
        .status(400)
        .json({ message: "Payment ID not found on order. Contact support." });
    }

    // ── Issue Refund via Razorpay API ──
    const rzpRefund = await issueRefund(order.razorpayPaymentId, order.amount, {
      reason: "user_request",
      userId: user._id.toString(),
      orderId: order._id.toString(),
    });

    // ── Atomically update Order + Subscription ──
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      order.status = "refunded";
      order.refund = {
        razorpayRefundId: rzpRefund.id,
        amount: rzpRefund.amount,
        initiatedAt: new Date(),
        reason: "user_request",
        status: "pending",
      };
      await order.save({ session });

      // Downgrade to Free
      subscription.tier = "Free";
      subscription.credits = TIER_LIMITS.Free.credits;
      subscription.planExpiry = null;
      subscription.billingCycle = null;
      // Remove this order from history
      subscription.paymentHistory = subscription.paymentHistory.filter(
        (id) => id.toString() !== order._id.toString(),
      );
      await subscription.save({ session });

      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }

    console.log(
      `[Refund] Initiated refund ${rzpRefund.id} for user ${user._id}, order ${order._id}`,
    );

    res.json({
      success: true,
      refundId: rzpRefund.id,
      message:
        "Refund initiated successfully. It will reflect in your account within 5-7 business days (instantly for UPI/wallet).",
    });
  } catch (error) {
    console.error("[Refund] Error:", error);
    res
      .status(500)
      .json({ message: "Failed to process refund. Please contact support." });
  }
};

// ─── POST /subscription/deduct-credits ────────────────────────────────────────
// ─── Helper: perform actual deduction ─────────────────────────────────────────
const internalDeductCredits = async (clerkId, amount, service) => {
  const { subscription } = await ensureSubscription(clerkId);
  const normalizedService =
    typeof service === "string" ? service.trim().toLowerCase() : null;

  // Prefer centralized pricing config when service is provided.
  const configuredAmount = normalizedService
    ? getServiceCost(normalizedService, subscription.tier)
    : null;

  let finalAmount = configuredAmount;

  // Backward compatibility for older clients calling with explicit amount only.
  if (finalAmount === null || Number.isNaN(finalAmount)) {
    finalAmount = Number(amount);
    if (!Number.isFinite(finalAmount) || finalAmount < 0) {
      throw Object.assign(new Error("Invalid amount for credit deduction"), {
        statusCode: 400,
      });
    }
  }

  if (
    normalizedService &&
    isUnlimitedTierService(subscription.tier, normalizedService)
  ) {
    return {
      success: true,
      message: `Unlimited credits for ${normalizedService} on Infinite Elite`,
      credits: subscription.credits,
      topupCredits: subscription.topupCredits,
    };
  }

  if (normalizedService && finalAmount === 0) {
    return {
      success: true,
      message: `${normalizedService} included in your plan`,
      credits: subscription.credits,
      topupCredits: subscription.topupCredits,
      deducted: 0,
    };
  }

  const totalAvailable =
    (subscription.credits || 0) + (subscription.topupCredits || 0);

  if (totalAvailable < finalAmount) {
    throw Object.assign(
      new Error(
        `Insufficient credits for ${normalizedService || "requested service"}. Need ${finalAmount}, have ${totalAvailable.toFixed(1)}`,
      ),
      { statusCode: 400 },
    );
  }

  // Deduct from main credits first
  if (subscription.credits >= finalAmount) {
    subscription.credits -= finalAmount;
  } else {
    // Use all main credits and deduct remainder from topup credits
    const remainder = finalAmount - subscription.credits;
    subscription.credits = 0;
    subscription.topupCredits = (subscription.topupCredits || 0) - remainder;
  }

  await subscription.save();
  return {
    success: true,
    message: "Credits deducted",
    credits: subscription.credits,
    topupCredits: subscription.topupCredits,
    deducted: finalAmount,
  };
};

// ─── POST /subscription/cancel ───────────────────────────────────────────────
// Handles both refund (if eligible) and manual cancellation (revert to Free).
const cancelSubscription = async (req, res) => {
  try {
    const { user, subscription } = await ensureSubscription(req.auth.userId);

    if (subscription.tier === "Free") {
      return res
        .status(400)
        .json({ message: "You are already on the Free tier." });
    }

    // 1. Check for refund eligibility (Same logic as status)
    await subscription.populate({
      path: "paymentHistory",
      match: { status: "paid", billingCycle: { $ne: "one_time" } },
      options: { sort: { createdAt: -1 }, limit: 1 },
    });

    const latestPaidOrder = subscription.paymentHistory?.[0];
    let refundEligible = false;

    if (latestPaidOrder) {
      const hoursSincePurchase =
        (Date.now() - new Date(latestPaidOrder.createdAt).getTime()) /
        (1000 * 60 * 60);
      const tierLimits = TIER_LIMITS[subscription.tier] || TIER_LIMITS.Free;
      const usagePercent =
        ((tierLimits.credits - subscription.credits) / tierLimits.credits) *
        100;
      refundEligible =
        hoursSincePurchase < 24 &&
        usagePercent < 10 &&
        !latestPaidOrder.refund?.razorpayRefundId;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (refundEligible && latestPaidOrder.razorpayPaymentId) {
        // Trigger real refund via Razorpay
        const rzpRefund = await issueRefund(
          latestPaidOrder.razorpayPaymentId,
          latestPaidOrder.amount,
          {
            reason: "user_cancelation",
            userId: user._id.toString(),
            orderId: latestPaidOrder._id.toString(),
          },
        );

        latestPaidOrder.status = "refunded";
        latestPaidOrder.refund = {
          razorpayRefundId: rzpRefund.id,
          amount: rzpRefund.amount,
          initiatedAt: new Date(),
          reason: "user_cancelation",
          status: "pending",
        };
        await latestPaidOrder.save({ session });
        console.log(
          `[Cancel] Refund initiated for order ${latestPaidOrder._id}`,
        );
      }

      // Immediately Downgrade to Free
      const priorTier = subscription.tier;
      subscription.tier = "Free";
      subscription.credits =
        subscription.leftoverFreeCredits > 0
          ? subscription.leftoverFreeCredits
          : TIER_LIMITS.Free.credits;
      subscription.leftoverFreeCredits = 0;
      subscription.topupCredits = 0; // Remove top-ups on cancellation
      subscription.planExpiry = null;
      subscription.billingCycle = null;

      await subscription.save({ session });
      await session.commitTransaction();

      console.log(
        `[Cancel] User ${user._id} manually cancelled ${priorTier} tier. Refunded: ${refundEligible}`,
      );

      res.json({
        success: true,
        refunded: refundEligible,
        message: refundEligible
          ? "Subscription cancelled and refund initiated successfully."
          : "Subscription cancelled and account reverted to Free tier.",
      });
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("[Cancel] Error:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Failed to cancel subscription." });
  }
};

// ─── POST /subscription/deduct-credits ────────────────────────────────────────
const deductCredits = async (req, res) => {
  try {
    const { amount, service } = req.body;
    const result = await internalDeductCredits(
      req.auth.userId,
      amount,
      service,
    );
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// ─── Internal helper: apply plan config to subscription ───────────────────────
async function applyPlanToSubscription(subscription, plan) {
  if (plan.isTopup) {
    // Top-ups: add to separate pool, don't change tier
    subscription.topupCredits =
      (subscription.topupCredits || 0) + plan.creditDelta;
  } else {
    // Plan purchase: set tier + reset credits + set expiry

    // If upgrading from Free, store current credits as leftover
    if (subscription.tier === "Free") {
      subscription.leftoverFreeCredits = subscription.credits || 0;
    }

    subscription.tier = plan.tier;
    // Set credits exactly to new plan allowance (don't add old credits)
    subscription.credits = plan.credits;

    const currentExpiry =
      subscription.planExpiry && subscription.planExpiry > new Date()
        ? subscription.planExpiry
        : new Date();
    subscription.planExpiry = new Date(
      currentExpiry.getTime() + plan.expiryDays * 24 * 60 * 60 * 1000,
    );
  }
}

module.exports = {
  getSubscriptionStatus,
  createOrder,
  verifyPayment,
  handleRazorpayWebhook,
  requestRefund,
  cancelSubscription,
  deductCredits,
  internalDeductCredits, // Exported for other controllers
  TIER_LIMITS, // Exported for other controllers
};
