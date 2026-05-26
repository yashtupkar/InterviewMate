require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
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
const blogRoutes = require("./routes/blogRoutes");
const proctoringRoutes = require("./routes/proctoringRoutes");
const ProctoringReport = require("./models/ProctoringReport");
const { getSitemapXml } = require("./controllers/blogController");

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
app.use("/api/blogs", blogRoutes);
app.use("/api/proctoring", proctoringRoutes);

// SEO
app.get("/sitemap.xml", getSitemapXml);

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
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Proctoring socket connected:", socket.id);

  socket.on("proctoring:event", async (payload) => {
    if (!payload?.sessionId) {
      return;
    }

    try {
      const update = {
        $push: {
          events: {
            eventType: payload.eventType,
            message: payload.message,
            details: payload.details || {},
            score: payload.score || 0,
            timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
          },
        },
        $inc: {
          totalViolations: payload.score > 0 ? 1 : 0,
          suspicionScore: payload.score || 0,
        },
      };

      if (payload.eventType?.startsWith("screen") || payload.eventType === "fullscreen-exit") {
        update.$push.screenLogs = update.$push.events;
      }

      await ProctoringReport.findOneAndUpdate(
        { sessionId: payload.sessionId },
        update,
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
      );
    } catch (error) {
      console.error("Failed to save proctoring event", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Proctoring socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
