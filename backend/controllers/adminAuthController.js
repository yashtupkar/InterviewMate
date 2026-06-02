const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendAdminOtpEmail } = require("../utils/emailService");
const jwtUtils = require("../utils/jwt");

// Secret for custom admin JWT token
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "fallback_super_secret_admin_key_2025";

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email, role: "admin", status: "active" });
  if (!user) {
    // Return 200 even if not found to prevent email enumeration
    return res.json({ success: true, message: "If this email belongs to an admin, an OTP has been sent." });
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiry to 10 minutes from now
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  user.adminOtp = otp;
  user.adminOtpExpires = expiresAt;
  await user.save();

  // Send Email
  sendAdminOtpEmail(user.email, otp).catch(console.error);

  res.json({ success: true, message: "If this email belongs to an admin, an OTP has been sent." });
});

const verifyLogin = asyncHandler(async (req, res) => {
  const { email, otp, secretCode } = req.body;

  if (!email || !otp || !secretCode) {
    throw new ApiError(400, "Email, OTP, and Secret Code are required");
  }

  const user = await User.findOne({ email, role: "admin", status: "active" });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Check if OTP is expired
  if (!user.adminOtp || !user.adminOtpExpires || user.adminOtpExpires < new Date()) {
    throw new ApiError(401, "OTP has expired or is invalid");
  }

  // Check OTP
  if (user.adminOtp !== otp) {
    throw new ApiError(401, "Invalid OTP");
  }

  // Check Secret Code
  if (!user.adminSecretCode || user.adminSecretCode !== secretCode.trim().toUpperCase()) {
    throw new ApiError(401, "Invalid Secret Code");
  }

  // Clear OTP to prevent reuse
  user.adminOtp = undefined;
  user.adminOtpExpires = undefined;
  await user.save();

  // Generate custom JWT admin token
  const payload = {
    userId: user._id,
    email: user.email,
    role: "admin",
  };
  const token = jwtUtils.sign(payload, ADMIN_JWT_SECRET, "24h");

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    }
  });
});

module.exports = {
  sendOtp,
  verifyLogin,
};
