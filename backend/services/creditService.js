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
   * Deduct credits for a user based on service or an explicit amount
   * @param {string} userId - Mongo ID of the user
   * @param {string} service - 'mock_interview', 'gd_session', or 'tools'
   * @param {number} explicitAmount - Optional: explicit amount to deduct (bypasses getServiceCost)
   */
  deduct: async (userId, service, explicitAmount = null) => {
    const mongoose = require("mongoose");
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = await User.findById(userId)
        .populate("subscription")
        .session(session);
      if (!user || !user.subscription) {
        await session.abortTransaction();
        return { success: false, message: "No subscription found" };
      }

      const sub = user.subscription;

      // Infinite Elite gets free interviews and GD sessions only.
      if (service && isUnlimitedTierService(sub.tier, service)) {
        await session.abortTransaction();
        return {
          success: true,
          message: "Infinite Elite: No deduction",
          amount: 0,
          remaining: sub.credits,
          topupRemaining: sub.topupCredits,
        };
      }

      const amount =
        explicitAmount !== null
          ? explicitAmount
          : getServiceCost(service, sub.tier);
      const totalAvailable = (sub.credits || 0) + (sub.topupCredits || 0);

      if (totalAvailable < amount) {
        await session.abortTransaction();
        return {
          success: false,
          message: "Insufficient credits",
          needed: amount,
          available: totalAvailable,
        };
      }

      // Deduct from main credits first
      if (sub.credits >= amount) {
        sub.credits -= amount;
      } else {
        const remainder = amount - (sub.credits || 0);
        sub.credits = 0;
        sub.topupCredits = (sub.topupCredits || 0) - remainder;
      }

      await sub.save({ session });
      await session.commitTransaction();

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
        remaining: sub.credits,
        topupRemaining: sub.topupCredits,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error("CreditService Error:", error);
      return { success: false, message: error.message };
    } finally {
      session.endSession();
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
