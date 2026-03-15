const mongoose = require("mongoose");

const transcriptEntrySchema = new mongoose.Schema({
  speaker: { type: String, required: true }, // agent name or "User"
  role: { type: String, enum: ["user", "agent"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  agentPersonality: { type: String, default: "" },
});

const gdSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userModel",
    required: true,
  },
  topic: { type: String, required: true },
  category: {
    type: String,
    enum: ["general", "technical", "current_affairs", "ethical"],
    required: true,
  },
  agents: [
    {
      name: String,
      personality: String,
      voiceId: String, // browser speech synthesis voice
      color: String,   // UI color
      avatarSeed: String,
    },
  ],
  status: {
    type: String,
    enum: ["active", "completed", "analysis_pending", "analysis_failed"],
    default: "active",
  },
  transcript: [transcriptEntrySchema],
  duration: { type: Number, default: 0 }, // seconds
  report: {
    overallScore: Number,
    contributionScore: Number,
    communicationScore: Number,
    relevanceScore: Number,
    initiationScore: Number,
    depthScore: Number,
    userTurnCount: Number,
    totalTurns: Number,
    strengths: [String],
    improvements: [String],
    summary: String,
    agentSummaries: mongoose.Schema.Types.Mixed,
  },
  createdAt: { type: Date, default: Date.now },
});

const GDSession = mongoose.model("GDSession", gdSessionSchema);
module.exports = GDSession;
