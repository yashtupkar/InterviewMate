const User = require("../models/User");
const Subscription = require("../models/Subscription");

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
      if (!user || !user.subscription) return { success: false, message: "No subscription found" };

      const sub = user.subscription;

      // Infinite Elite gets free interviews and GDs
      if (sub.tier === "Infinite Elite" && service !== "tools") {
        return { success: true, message: "Infinite Elite: No deduction", credits: sub.credits };
      }

      let amount = 0;
      if (service === "mock_interview") {
        amount = 10; // Flat 10 credits per interview
      } else if (service === "gd_session") {
        amount = 8; // Flat 8 credits per GD session
      } else if (service === "tools") {
        amount = 5; // Flat 5 credits for Resume/LinkedIn
      }

      if (sub.credits < amount) {
        return { success: false, message: "Insufficient credits", needed: amount, available: sub.credits };
      }

      sub.credits -= amount;
      await sub.save();

      return { success: true, amount, remaining: sub.credits };
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
    
    if (user.subscription.tier === "Infinite Elite" && service !== "tools") return true;

    let minAmount = 0;
    if (service === "mock_interview") minAmount = minMinutes * 0.5;
    else if (service === "gd_session") minAmount = minMinutes * 0.3;
    else if (service === "tools") minAmount = 2;

    return user.subscription.credits >= minAmount;
  }
};

module.exports = CreditService;
