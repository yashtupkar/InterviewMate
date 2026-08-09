require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Referral = require('../models/Referral');
const CreditService = require('../services/creditService');
const { rewardReferrer } = require('../controllers/referralController');

async function runTests() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/placemateai");
  console.log("Connected to MongoDB for Concurrency Testing.");

  // Test 1: Credit Race
  console.log("\\n--- Testing Credit Concurrency ---");
  const user = await User.create({ clerkId: "test_concurrency_user", email: "test@example.com", firstName: "Test" });
  const sub = await Subscription.create({ user: user._id, tier: "Free", credits: 200, topupCredits: 0 });
  user.subscription = sub._id;
  await user.save();

  console.log("Initial credits: 200. Cost per operation: 20. Firing 50 concurrent requests...");
  const creditPromises = Array.from({ length: 50 }).map(() => CreditService.deduct(user._id, "mock_interview", 20)); // mock interview costs 20
  const creditResults = await Promise.all(creditPromises);

  const successfulDeductions = creditResults.filter(r => r.success).length;
  const failedDeductions = creditResults.filter(r => !r.success).length;
  
  const finalSub = await Subscription.findById(sub._id);
  console.log(`Successful: ${successfulDeductions}`);
  console.log(`Failed/Rejected: ${failedDeductions}`);
  console.log(`Final Balance: ${finalSub.credits}`);

  if (successfulDeductions === 10 && finalSub.credits === 0) {
    console.log("✅ Credit Concurrency Test Passed.");
  } else {
    console.log("❌ Credit Concurrency Test Failed.");
  }

  // Cleanup
  await Subscription.findByIdAndDelete(sub._id);
  await User.findByIdAndDelete(user._id);

  console.log("\\n--- Concurrency Testing Complete ---");
  process.exit(0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
