const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userModel",
    required: true,
  },
  interviewType: {
    type: String,
    enum: ["behavioral", "technical", "hr", "general"],
    required: true,
  },
  status: {
    type: String,
    enum: [
      "initialized",
      "in_progress",
      "analysis_pending",
      "completed",
      "failed",
      "analysis_failed",
    ],
    default: "initialized",
  },
  vapiCallId: {
    type: String,
  },
  transcript: {
    type: String,
    default: "",
  },
  report: {
    overallScore: Number,
    feedback: String,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    detailedAnalysis: mongoose.Schema.Types.Mixed,
  },
  actualDuration: {
    type: Number,
    default: 0,
  },
  metadata: {
    uploadedInfo: { type: String },
    role: { type: String },
    level: { type: String },
    duration: { type: Number, default: 10 },
    agentName: { type: String, default: "Rohan" },
    userName: { type: String, default: "Candidate" },
    interviewMode: {
      type: String,
      enum: ["roleBased", "skillsBased"],
      default: "roleBased",
    },
    sourceType: { type: String, default: "resume-job-description" },
    skills: { type: [String], default: [] },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const InterviewSession = mongoose.model(
  "InterviewSession",
  interviewSessionSchema,
);

module.exports = InterviewSession;
