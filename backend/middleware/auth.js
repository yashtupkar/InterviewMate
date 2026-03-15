const { createClerkClient } = require('@clerk/clerk-sdk-node');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const clerkAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  try {
    const decoded = await clerkClient.verifyToken(token);
    const user = await User.findOne({ clerkId: decoded.sub });

    if (!user) {
        // Option A: Auto-sync here if you want to avoid explicit sync routes
        // Option B: Throw 404 as requested
        throw new ApiError(404, "User not found in system. Please sync your account.");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    throw new ApiError(401, "Unauthorized: Invalid or expired token");
  }
});

module.exports = clerkAuth;
