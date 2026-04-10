require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user");
const ApiError = require("./utils/ApiError");
const vapiInterviewRouter = require("./routes/vapiInterviewRoutes");
const gdRouter = require("./routes/gdRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const linkedinRoutes = require("./routes/linkedinRoutes");
const referralRoutes = require("./routes/referralRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const codingRoutes = require("./routes/codingRoutes");
const customInterviewRoutes = require("./routes/customInterviewRoutes");
const atsRoutes = require("./routes/ats.route");
const resumeRoutes = require("./routes/resume.route");
const waitlistRoutes = require("./routes/waitlistRoutes");
const questionRoutes = require("./routes/questionRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");
const ttsRoutes = require("./routes/ttsRoutes");

// Connect to Database
connectDB();

const app = express();

// Trust the first proxy (needed for express-rate-limit on certain hosts/local setups)
app.set("trust proxy", 1);

// Middleware
app.use("/api/webhooks", express.raw({ type: "*/*" })); // Raw body for Clerk + Razorpay webhooks
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/vapi-interview", vapiInterviewRouter);
app.use("/api/group-discussion", gdRouter);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/linkedin", linkedinRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/custom-interview", customInterviewRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/tts", ttsRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "PlaceMateAI API is running..." });
});

app.get("/", (req, res) => {
  res.send("Hello from PlaceMateAI's Backend!");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  console.error("Internal Server Error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
