const mongoose = require("mongoose");

const transcriptEntrySchema = new mongoose.Schema({
  speaker: { type: String, required: true }, // agent name or "User"
  role: { type: String, enum: ["user", "agent"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  agentPersonality: { type: String, default: "" },
  confidence: { type: Number, default: 1.0 },
  duration: { type: Number, default: 0 },
  status: { type: String, enum: ["interim", "final"], default: "final" },
  isPressure: { type: Boolean, default: false },
  isInterrupt: { type: Boolean, default: false },
});

const gdSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
      behaviorHint: String,
      styleKey: String,
      voiceId: String, // browser speech synthesis voice
      color: String, // UI color
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
  timeLimit: { type: Number, default: 600 }, // seconds (default 10 mins)
  prepTime: { type: Boolean, default: false }, // whether user wants preparation time
  report: {
    overallScore: Number,
    contributionScore: Number,
    communicationScore: Number,
    relevanceScore: Number,
    initiationScore: Number,
    depthScore: Number,
    speakingScore: Number,
    initiationBonus: { type: Boolean, default: false },
    conclusionBonus: { type: Boolean, default: false },
    userTurnCount: Number,
    totalTurns: Number,
    strengths: [String],
    improvements: mongoose.Schema.Types.Mixed,
    summary: String,
    speakingStyle: String,
    agentSummaries: mongoose.Schema.Types.Mixed,
  },
  createdAt: { type: Date, default: Date.now },
});

const GDSession = mongoose.model("GDSession", gdSessionSchema);
module.exports = GDSession;
