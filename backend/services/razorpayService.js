const Razorpay = require('razorpay');
const crypto = require('crypto');

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

// ─── Plan Configuration (Server-side canonical prices) ───────────────────────
// All amountPaise values are in PAISE (1 INR = 100 paise).
// Frontend amount is NEVER trusted — backend always reads from here.
const PLAN_CONFIG = {
    // Monthly plans
    student_flash_monthly: {
        tier: 'Student Flash',
        planName: 'Student Flash (Monthly)',
        amountPaise: 19900,   // ₹199
        billingCycle: 'monthly',
        expiryDays: 30,
        credits: 200,
        isTopup: false
    },
    placement_pro_monthly: {
        tier: 'Placement Pro',
        planName: 'Placement Pro (Monthly)',
        amountPaise: 49900,   // ₹499
        billingCycle: 'monthly',
        expiryDays: 30,
        credits: 600,
        isTopup: false
    },
    infinite_elite_monthly: {
        tier: 'Infinite Elite',
        planName: 'Infinite Elite (Monthly)',
        amountPaise: 89900,   // ₹899
        billingCycle: 'monthly',
        expiryDays: 30,
        credits: 1200,
        isTopup: false
    },
    // Yearly plans
    student_flash_yearly: {
        tier: 'Student Flash',
        planName: 'Student Flash (Yearly)',
        amountPaise: 199900,  // ₹1,999
        billingCycle: 'yearly',
        expiryDays: 365,
        credits: 2000, 
        isTopup: false
    },
    placement_pro_yearly: {
        tier: 'Placement Pro',
        planName: 'Placement Pro (Yearly)',
        amountPaise: 499900,  // ₹4,999
        billingCycle: 'yearly',
        expiryDays: 365,
        credits: 6000,
        isTopup: false
    },
    infinite_elite_yearly: {
        tier: 'Infinite Elite',
        planName: 'Infinite Elite (Yearly)',
        amountPaise: 899900,  // ₹8,999
        billingCycle: 'yearly',
        expiryDays: 365,
        credits: 12000,
        isTopup: false
    },
    // Top-ups (one-time credits)
    quick_boost: {
        tier: null,
        planName: 'Quick Boost (30 Credits)',
        amountPaise: 2900,    // ₹29
        billingCycle: 'one_time',
        expiryDays: null,
        creditDelta: 30,
        isTopup: true
    },
    power_pack: {
        tier: null,
        planName: 'Power Pack (70 Credits)',
        amountPaise: 4900,    // ₹49
        billingCycle: 'one_time',
        expiryDays: null,
        creditDelta: 70, // 60 + 10 bonus
        isTopup: true
    },
    pro_master: {
        tier: null,
        planName: 'Pro Master (200 Credits)',
        amountPaise: 9900,    // ₹99
        billingCycle: 'one_time',
        expiryDays: null,
        creditDelta: 200, // 150 + 50 bonus
        isTopup: true
    },
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

module.exports = {
    PLAN_CONFIG,
    createRazorpayOrder,
    verifyPaymentSignature,
    verifyWebhookSignature,
    issueRefund,
};
