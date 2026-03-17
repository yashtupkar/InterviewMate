const Referral = require('../models/Referral');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const crypto = require('crypto');

// Helper to generate a unique referral code
const generateReferralCode = async () => {
    let code;
    let exists = true;
    while (exists) {
        code = `PRI-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        exists = await User.findOne({ referralCode: code });
    }
    return code;
};

// Get user's referral stats
const getReferralStats = asyncHandler(async (req, res) => {
    let user = req.user;
    if (!user) throw new ApiError(404, 'User not found');

    // Ensure referral code exists for existing users
    if (!user.referralCode) {
        user.referralCode = await generateReferralCode();
        await user.save();
    }

    const referrals = await Referral.find({ referrer: user._id })
        .populate('referee', 'firstName lastName email avatar createdAt')
        .sort({ createdAt: -1 });

    const stats = {
        referralCode: user.referralCode,
        totalReferrals: referrals.length,
        rewardedReferrals: referrals.filter(r => r.status === 'rewarded').length,
        potentialRewards: referrals.filter(r => r.status === 'pending').length,
        history: referrals
    };

    res.status(200).json({
        success: true,
        stats
    });
});

// Logic to process a referral (called during user sync)
const processReferral = async (newUserId, referralCode) => {
    if (!referralCode) return;

    const referrer = await User.findOne({ referralCode });
    if (!referrer) return;

    // Check if user is trying to refer themselves
    if (referrer._id.toString() === newUserId.toString()) return;

    // Link new user to referrer
    await User.findByIdAndUpdate(newUserId, { referredBy: referrer._id });

    // Create a pending referral record
    await Referral.create({
        referrer: referrer._id,
        referee: newUserId,
        status: 'pending'
    });

    // IMMEDIATELY reward the referee (the new user)
    // +1 Interview and +1 GD session credit
    const refereeSubscription = await Subscription.findOne({ user: newUserId });
    if (refereeSubscription) {
        refereeSubscription.credits.interviews += 1;
        refereeSubscription.credits.gdSessions += 1;
        await refereeSubscription.save();
    }
};

// Reward the referrer when referee completes their first action
const rewardReferrer = async (refereeId) => {
    const referral = await Referral.findOne({ referee: refereeId, status: 'pending' });
    if (!referral) return;

    // Reward the referrer
    const referrerSubscription = await Subscription.findOne({ user: referral.referrer });
    if (referrerSubscription) {
        referrerSubscription.credits.interviews += 1;
        referrerSubscription.credits.gdSessions += 1;
        await referrerSubscription.save();

        // Update referral status
        referral.status = 'rewarded';
        referral.rewardedAt = new Date();
        await referral.save();
    }
};

// Public endpoint to get referrer info by code
const getReferrerInfo = asyncHandler(async (req, res) => {
    const { code } = req.params;
    if (!code) throw new ApiError(400, 'Referral code is required');

    const referrer = await User.findOne({ referralCode: code }).select('firstName lastName avatar');
    if (!referrer) throw new ApiError(404, 'Referrer not found');

    res.status(200).json({
        success: true,
        referrer: {
            name: referrer.firstName,
            avatar: referrer.avatar
        }
    });
});

module.exports = {
    generateReferralCode,
    getReferralStats,
    processReferral,
    rewardReferrer,
    getReferrerInfo
};
