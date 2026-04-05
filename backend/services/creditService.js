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

      const totalAvailable = (sub.credits || 0) + (sub.topupCredits || 0);

      if (totalAvailable < amount) {
        return { success: false, message: "Insufficient credits", needed: amount, available: totalAvailable };
      }

      // Deduct from main credits first
      if (sub.credits >= amount) {
        sub.credits -= amount;
      } else {
        const remainder = amount - sub.credits;
        sub.credits = 0;
        sub.topupCredits = (sub.topupCredits || 0) - remainder;
      }

      await sub.save();

      return { 
        success: true, 
        amount, 
        remaining: sub.credits, 
        topupRemaining: sub.topupCredits 
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
    
    if (user.subscription.tier === "Infinite Elite" && service !== "tools") return true;

    let minAmount = 0;
    if (service === "mock_interview") minAmount = 10; // Flat costs match deduct logic
    else if (service === "gd_session") minAmount = 8;
    else if (service === "tools") minAmount = 5;

    const totalAvailable = (user.subscription.credits || 0) + (user.subscription.topupCredits || 0);
    return totalAvailable >= minAmount;
  }
};

module.exports = CreditService;
