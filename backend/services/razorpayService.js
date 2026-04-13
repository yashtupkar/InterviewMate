const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PLAN_CONFIG } = require('../config/pricingConfig');

// ─── Singleton Razorpay Instance ─────────────────────────────────────────────
let razorpayInstance = null;

const getRazorpay = () => {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
        }
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

// ─── Create Razorpay Order ────────────────────────────────────────────────────
const createRazorpayOrder = async (amountPaise, currency = 'INR', receipt, notes = {}) => {
    const rzp = getRazorpay();
    const order = await rzp.orders.create({
        amount: amountPaise,
        currency,
        receipt: receipt.slice(0, 40), // Razorpay limit: 40 chars
        notes,
    });
    return order;
};

// ─── Verify Payment Signature (HMAC-SHA256) ───────────────────────────────────
// This is the ONLY secure way to confirm a Razorpay payment.
// Formula: HMAC_SHA256(razorpayOrderId + '|' + razorpayPaymentId, KEY_SECRET)
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    // Use timingSafeEqual to prevent timing-attack signatures
    const expected = Buffer.from(expectedSignature, 'hex');
    const received = Buffer.from(razorpaySignature, 'hex');

    if (expected.length !== received.length) return false;
    return crypto.timingSafeEqual(expected, received);
};

// ─── Verify Webhook Signature ─────────────────────────────────────────────────
// Validates that a webhook POST came from Razorpay and not a spoofed source.
const verifyWebhookSignature = (rawBody, razorpaySignature) => {
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

    const expected = Buffer.from(expectedSignature, 'hex');
    const received = Buffer.from(razorpaySignature, 'hex');

    if (expected.length !== received.length) return false;
    return crypto.timingSafeEqual(expected, received);
};

// ─── Issue Refund via Razorpay API ────────────────────────────────────────────
const issueRefund = async (razorpayPaymentId, amountPaise, notes = {}) => {
    const rzp = getRazorpay();
    const refund = await rzp.payments.refund(razorpayPaymentId, {
        amount: amountPaise,
        speed: 'normal', // 'normal' = 5-7 biz days; 'optimum' = instant (extra fee)
        notes,
    });
    return refund;
};

// ─── Fetch Payment Details ───────────────────────────────────────────────────
// Fetches full payment entity from Razorpay API to extract card/upi metadata
const fetchPaymentDetails = async (paymentId) => {
    try {
        const rzp = getRazorpay();
        const payment = await rzp.payments.fetch(paymentId);
        return payment;
    } catch (err) {
        console.error(`[Razorpay] Fetch payment ${paymentId} failed:`, err);
        return null;
    }
};

module.exports = {
    PLAN_CONFIG,
    createRazorpayOrder,
    verifyPaymentSignature,
    verifyWebhookSignature,
    issueRefund,
    fetchPaymentDetails,
};
