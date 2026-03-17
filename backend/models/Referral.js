const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'rewarded'],
        default: 'pending'
    },
    rewardedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);
