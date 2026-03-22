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
        talkTime: { type: Number, default: 20 },
        interviews: { type: Number, default: 2 },
        gdSessions: { type: Number, default: 3 }
    },
    planExpiry: {
        type: Date
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
    }]
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
