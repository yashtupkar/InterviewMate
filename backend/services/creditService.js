const User = require("../models/User");
const Subscription = require("../models/Subscription");
const {
  getServiceCost,
  isUnlimitedTierService,
} = require("../config/pricingConfig");

/**
 * Centralized Credit Service
 */
const CreditService = {
  /**
   * Deduct credits for a user based on service and duration
   * @param {string} userId - Mongo ID of the user
   * @param {string} service - 'mock_interview', 'gd_session', or 'tools'
   * @param {number} duration - Duration in minutes (for interviews/GDs)
   */
  deduct: async (userId, service, duration = 0) => {
    try {
      const user = await User.findById(userId).populate("subscription");
      if (!user || !user.subscription)
        return { success: false, message: "No subscription found" };

      const sub = user.subscription;

      // Infinite Elite gets free interviews and GD sessions only.
      if (isUnlimitedTierService(sub.tier, service)) {
        return {
          success: true,
          message: "Infinite Elite: No deduction",
          credits: sub.credits,
        };
      }

      const amount = getServiceCost(service, sub.tier);

      const updateResult = await Subscription.collection.findOneAndUpdate(
        {
          _id: sub._id,
          $expr: {
            $gte: [
              { $add: [{ $ifNull: ["$credits", 0] }, { $ifNull: ["$topupCredits", 0] }] },
              amount,
            ],
          },
        },
        [
          {
            $set: {
              credits: {
                $cond: {
                  if: { $gte: [{ $ifNull: ["$credits", 0] }, amount] },
                  then: { $subtract: [{ $ifNull: ["$credits", 0] }, amount] },
                  else: 0,
                },
              },
              topupCredits: {
                $cond: {
                  if: { $gte: [{ $ifNull: ["$credits", 0] }, amount] },
                  then: { $ifNull: ["$topupCredits", 0] },
                  else: {
                    $subtract: [
                      { $ifNull: ["$topupCredits", 0] },
                      { $subtract: [amount, { $ifNull: ["$credits", 0] }] },
                    ],
                  },
                },
              },
            },
          },
        ],
        { returnDocument: "after" }
      );

      const updatedSub = updateResult ? updateResult.value || updateResult : null;

      if (!updatedSub) {
        // Fetch to provide accurate remaining amounts if it failed
        const currentSub = await Subscription.findById(sub._id);
        const totalAvailable = (currentSub?.credits || 0) + (currentSub?.topupCredits || 0);
        return {
          success: false,
          message: "Insufficient credits",
          needed: amount,
          available: totalAvailable,
        };
      }

      // Centralized referral reward trigger: once user performs a paid action,
      // mark pending referral as rewarded and credit the referrer.
      try {
        const { rewardReferrer } = require("../controllers/referralController");
        await rewardReferrer(userId);
      } catch (rewardError) {
        console.error("Referral reward trigger error:", rewardError);
      }

      return {
        success: true,
        amount,
        remaining: updatedSub.credits,
        topupRemaining: updatedSub.topupCredits,
      };
    } catch (error) {
      console.error("CreditService Error:", error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Check if user has enough credits to start a session
   */
  hasBalance: async (userId, service, minMinutes = 5) => {
    const user = await User.findById(userId).populate("subscription");
    if (!user || !user.subscription) return false;

    if (isUnlimitedTierService(user.subscription.tier, service)) return true;

    const minAmount = getServiceCost(service, user.subscription.tier);

    const totalAvailable =
      (user.subscription.credits || 0) + (user.subscription.topupCredits || 0);
    return totalAvailable >= minAmount;
  },
};

module.exports = CreditService;
