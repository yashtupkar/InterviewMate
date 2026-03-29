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

vapiInterviewRouter.post("/start", userAuth, startInterview);
vapiInterviewRouter.get("/report/:sessionId", userAuth, getInterviewReport);
vapiInterviewRouter.post(
  "/report-from-transcript",
  userAuth,
  generateReportFromTranscript,
);
vapiInterviewRouter.post("/retry-analysis", userAuth, retryAnalysis);
vapiInterviewRouter.get("/user", userAuth, getUserInterviews);
vapiInterviewRouter.post("/report-failure", userAuth, reportVapiFailure);

module.exports = vapiInterviewRouter;
