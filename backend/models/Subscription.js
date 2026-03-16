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
        enum: ['Free', 'Pro', 'Elite'],
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
    paymentHistory: [{
        orderId: String,
        amount: Number,
        currency: { type: String, default: 'INR' },
        date: { type: Date, default: Date.now },
        status: { type: String, default: 'pending' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
