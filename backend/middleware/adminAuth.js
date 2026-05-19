const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const jwtUtils = require("../utils/jwt");
const User = require("../models/User");

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "fallback_super_secret_admin_key_2025";

const adminAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Admin Access Denied: No token provided");
  }

  try {
    const decoded = jwtUtils.verify(token, ADMIN_JWT_SECRET);
    
    if (decoded.role !== "admin") {
       throw new ApiError(403, "Access Denied: Invalid role token");
    }

    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== "admin" || user.status !== "active") {
        throw new ApiError(403, "Access Denied: Admin privileges revoked or account inactive");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin Auth Error:", error.message);
    throw new ApiError(401, "Admin Access Denied: Invalid or expired token");
  }
});

module.exports = {
  adminAuth,
};
