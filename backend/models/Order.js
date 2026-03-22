const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    razorpayRefundId: { type: String, default: null },
    amount: { type: Number },          // in paise
    initiatedAt: { type: Date },
    processedAt: { type: Date },
    reason: { type: String, default: 'user_request' },
    status: {
        type: String,
        enum: ['pending', 'processed', 'failed'],
        default: 'pending'
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Razorpay identifiers
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    },

    // Plan details
    planId: {
        type: String,
        required: true
    },
    planName: {
        type: String,
        required: true
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly', 'one_time'],
        required: true
    },

    // Amount always stored in PAISE (1 INR = 100 paise) — avoids float bugs
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },

    status: {
        type: String,
        enum: ['created', 'paid', 'failed', 'refunded'],
        default: 'created',
        index: true
    },

    // Snapshot of user info at purchase time for audit
    metadata: {
        userEmail: String,
        userName: String,
        tierAtPurchase: String,
        creditsAtPurchase: {
            talkTime: Number,
            interviews: Number,
            gdSessions: Number
        }
    },

    // Refund details
    refund: {
        type: refundSchema,
        default: null
    },

    // True once confirmed via Razorpay webhook (double-confirmation)
    webhookVerified: {
        type: Boolean,
        default: false
    },

    // Prevents duplicate order creation for same user + plan in short window
    idempotencyKey: {
        type: String,
        unique: true,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
