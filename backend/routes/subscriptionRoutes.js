const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const {
    getSubscriptionStatus,
    createOrder,
    verifyPayment,
    requestRefund,
    deductInterviewCredit,
    deductGdCredit,
    deductCredits,
} = require('../controllers/subscriptionController');

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// Prevents spam order creation (e.g., bot hammering create-order)
const orderRateLimit = rateLimit({
    windowMs: 60 * 1000,       // 1 minute
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false }, // suppress IPv6 warning for custom keyGenerator
    message: { message: 'Too many order requests. Please wait a minute before trying again.' },
    keyGenerator: (req) => req.auth?.userId || req.ip,
});

// Prevents replay attack spam on verify-payment
const verifyRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { message: 'Too many verification attempts. Please wait a minute.' },
    keyGenerator: (req) => req.auth?.userId || req.ip,
});

// Prevents refund abuse (strict: only 2 per hour per user)
const refundRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { message: 'Too many refund requests. Maximum 2 per hour allowed.' },
    keyGenerator: (req) => req.auth?.userId || req.ip,
});

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get('/status', ClerkExpressRequireAuth(), getSubscriptionStatus);

router.post('/create-order',    ClerkExpressRequireAuth(), orderRateLimit,  createOrder);
router.post('/verify-payment',  ClerkExpressRequireAuth(), verifyRateLimit, verifyPayment);
router.post('/request-refund',  ClerkExpressRequireAuth(), refundRateLimit, requestRefund);

router.post('/deduct-interview', ClerkExpressRequireAuth(), deductInterviewCredit);
router.post('/deduct-gd',        ClerkExpressRequireAuth(), deductGdCredit);
router.post('/deduct-credits',   ClerkExpressRequireAuth(), deductCredits);

module.exports = router;
