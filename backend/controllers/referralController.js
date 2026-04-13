const Referral = require("../models/Referral");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const crypto = require("crypto");

// ===== CONFIGURATION =====
// Reward multiplier - 50 credits per referral
const REFERRAL_REWARD = 50;

// Keep User.subscription aligned with the subscription document we modify.
const ensureSubscriptionLinked = async (userId, subscriptionId) => {
  if (!userId || !subscriptionId) return;
  await User.findByIdAndUpdate(userId, { subscription: subscriptionId });
};

// Helper to generate a unique referral code
const generateReferralCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = `PRI-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    exists = await User.findOne({ referralCode: code });
  }
  return code;
};

// Get user's referral stats
const getReferralStats = asyncHandler(async (req, res) => {
  let user = req.user;
  if (!user) throw new ApiError(404, "User not found");

  // Ensure referral code exists for existing users
  if (!user.referralCode) {
    user.referralCode = await generateReferralCode();
    await user.save();
  }

  try {
    const referrals = await Referral.find({ referrer: user._id })
      .populate("referee", "firstName lastName email avatar createdAt")
      .sort({ createdAt: -1 });

    const rewardedReferrals = referrals.filter((r) => r.status === "rewarded");
    const pendingReferrals = referrals.filter((r) => r.status === "pending");

    const stats = {
      referralCode: user.referralCode,
      totalReferrals: referrals.length,
      rewardedReferrals: rewardedReferrals.length,
      potentialRewards: pendingReferrals.length,
      totalCreditsEarned: rewardedReferrals.length * REFERRAL_REWARD,
      history: referrals,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    throw new ApiError(500, "Error fetching referral stats: " + error.message);
  }
});

// Logic to process a referral (called during user sync)
const processReferral = async (newUserId, referralCode) => {
  if (!referralCode) return;

  try {
    const referrer = await User.findOne({ referralCode });
    if (!referrer) return;

    // Check if user is trying to refer themselves
    if (referrer._id.toString() === newUserId.toString()) return;

    // Check if referral already exists
    const existingReferral = await Referral.findOne({ referee: newUserId });
    if (existingReferral) return; // Prevent duplicate referrals

    // Link new user to referrer
    await User.findByIdAndUpdate(newUserId, { referredBy: referrer._id });

    // Create a pending referral record
    await Referral.create({
      referrer: referrer._id,
      referee: newUserId,
      status: "pending",
    });

    // IMMEDIATELY reward the referee (the new user)
    // Add REFERRAL_REWARD credits to subscription
    let refereeSubscription = await Subscription.findOne({ user: newUserId });
    if (!refereeSubscription) {
      // Create subscription if doesn't exist with referral credits
      refereeSubscription = await Subscription.create({
        user: newUserId,
        credits: REFERRAL_REWARD,
        tier: "Free",
      });
    } else {
      // Add referral credits to existing subscription
      refereeSubscription.credits =
        (refereeSubscription.credits || 0) + REFERRAL_REWARD;
      await refereeSubscription.save();
    }

    await ensureSubscriptionLinked(newUserId, refereeSubscription._id);

    console.log(
      `✓ Referral processed: New user ${newUserId} got ${REFERRAL_REWARD} credits from code ${referralCode}`,
    );
  } catch (error) {
    console.error("Error processing referral:", error);
  }
};

// Reward the referrer when referee completes their first action
const rewardReferrer = async (refereeId) => {
  if (!refereeId) {
    console.warn("⚠️  rewardReferrer called with no refereeId");
    return;
  }

  try {
    // Find the referral record where this user is the referee
    const referral = await Referral.findOne({
      referee: refereeId,
      status: "pending",
    }).populate("referrer", "_id");

    if (!referral) {
      console.log(`ℹ️  No pending referral found for referee: ${refereeId}`);
      return;
    }

    if (!referral.referrer) {
      console.warn(`⚠️  Referral record has no referrer ID`);
      return;
    }

    const referrerId = referral.referrer._id || referral.referrer;
    console.log(
      `📝 Processing reward: Referrer ${referrerId} <- Referee ${refereeId}`,
    );

    // Reward the referrer - Add REFERRAL_REWARD credits to subscription
    let referrerSubscription = await Subscription.findOne({
      user: referrerId,
    });

    if (!referrerSubscription) {
      console.log(
        `ℹ️  No subscription found for referrer ${referrerId}. Creating new one with ${REFERRAL_REWARD} credits`,
      );
      referrerSubscription = await Subscription.create({
        user: referrerId,
        credits: REFERRAL_REWARD,
        tier: "Free",
      });
    } else {
      // Add referral credits to existing subscription
      const previousCredits = referrerSubscription.credits || 0;
      referrerSubscription.credits = previousCredits + REFERRAL_REWARD;
      await referrerSubscription.save();
      console.log(
        `✓ Credits updated for referrer ${referrerId}: ${previousCredits} → ${referrerSubscription.credits}`,
      );
    }

    await ensureSubscriptionLinked(referrerId, referrerSubscription._id);

    // Update referral status to rewarded
    referral.status = "rewarded";
    referral.rewardedAt = new Date();
    await referral.save();

    console.log(
      `✓ Referrer rewarded: ${referrerId} earned ${REFERRAL_REWARD} credits from referee ${refereeId}`,
    );
    return { success: true, referrerId, rewardAmount: REFERRAL_REWARD };
  } catch (error) {
    console.error("❌ Error rewarding referrer:", error);
    return { success: false, error: error.message };
  }
};

// Public endpoint to get referrer info by code
const getReferrerInfo = asyncHandler(async (req, res) => {
  const { code } = req.params;
  if (!code) throw new ApiError(400, "Referral code is required");

  try {
    const referrer = await User.findOne({ referralCode: code }).select(
      "firstName lastName avatar",
    );
    if (!referrer) throw new ApiError(404, "Referrer not found");

    res.status(200).json({
      success: true,
      referrer: {
        name: referrer.firstName + " " + referrer.lastName,
        avatar: referrer.avatar,
        reward: REFERRAL_REWARD,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Error fetching referrer info");
  }
});

module.exports = {
  generateReferralCode,
  getReferralStats,
  processReferral,
  rewardReferrer,
  getReferrerInfo,
};
