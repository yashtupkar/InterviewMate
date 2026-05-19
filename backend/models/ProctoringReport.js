const mongoose = require("mongoose");

const ProctoringEventSchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true },
    message: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    score: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ProctoringReportSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true, unique: true },
    userId: { type: String },
    totalViolations: { type: Number, default: 0 },
    suspicionScore: { type: Number, default: 0 },
    focusScore: { type: Number, default: 100 },
    attentionScore: { type: Number, default: 100 },
    screenLogs: { type: [ProctoringEventSchema], default: [] },
    events: { type: [ProctoringEventSchema], default: [] },
    startedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ProctoringReport", ProctoringReportSchema);
