const express = require("express");
const vapiInterviewRouter = express.Router();
const {
  startInterview,
  getInterviewReport,
  generateReportFromTranscript,
  getUserInterviews,
  retryAnalysis,
  reportVapiFailure,
} = require("../controllers/vapiInterviewController");
const { clerkAuth: userAuth } = require("../middleware/auth");
const { aiRateLimiter } = require("../middleware/rateLimiters");

vapiInterviewRouter.post("/start", userAuth, aiRateLimiter, startInterview);
vapiInterviewRouter.get("/report/:sessionId", userAuth, getInterviewReport);
vapiInterviewRouter.post(
  "/report-from-transcript",
  userAuth,
  aiRateLimiter,
  generateReportFromTranscript,
);
vapiInterviewRouter.post("/retry-analysis", userAuth, aiRateLimiter, retryAnalysis);
vapiInterviewRouter.get("/user", userAuth, getUserInterviews);
vapiInterviewRouter.post("/report-failure", userAuth, reportVapiFailure);

module.exports = vapiInterviewRouter;
