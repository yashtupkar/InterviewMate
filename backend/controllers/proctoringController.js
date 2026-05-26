const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ProctoringReport = require("../models/ProctoringReport");

exports.getProctoringReport = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const report = await ProctoringReport.findOne({ sessionId });
  if (!report) {
    throw new ApiError(404, "Proctoring report not found for this session.");
  }
  res.json({ success: true, report });
});

exports.saveProctoringReport = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const payload = req.body;
  if (!sessionId || !payload) {
    throw new ApiError(400, "Session ID and report payload are required.");
  }

  const report = await ProctoringReport.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        userId: payload.userId || payload.userId,
        totalViolations: payload.totalViolations || 0,
        suspicionScore: payload.suspicionScore || 0,
        focusScore: payload.focusPercentage ?? 0,
        attentionScore: payload.attentionScore ?? 0,
        screenLogs: payload.screenLogs || [],
        events: payload.events || [],
        startedAt: payload.startedAt ? new Date(payload.startedAt) : undefined,
        updatedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  res.json({ success: true, report });
});
