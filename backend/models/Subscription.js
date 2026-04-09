const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    tier: {
        type: String,
        enum: ['Free', 'Student Flash', 'Placement Pro', 'Infinite Elite'],
        default: 'Free'
    },
    credits: {
        type: Number,
        default: 30
    },
    planExpiry: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired'],
        default: 'active'
    },
    leftoverFreeCredits: {
        type: Number,
        default: 0
    },
    topupCredits: {
        type: Number,
        default: 0
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly', null],
        default: null
    },
    lastPaymentAt: {
        type: Date
    },
    // References to Order documents — full details live in Order collection
    paymentHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    // Admin manual adjustments tracking
    manualAdjustments: [{
        date: { type: Date, default: Date.now },
        type: { type: String, enum: ['credit_add', 'refund', 'tier_change'], default: 'credit_add' },
        amount: Number,
        reason: String,
        adminId: mongoose.Schema.Types.ObjectId
    }],
    // Track why subscription was cancelled
    cancellationReason: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
