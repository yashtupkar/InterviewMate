const mongoose = require("mongoose");

const peerMatchQueueEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["waiting", "matched", "cancelled"],
      default: "waiting",
      index: true,
    },
    audioOnly: {
      type: Boolean,
      default: false,
    },
    targetRole: {
      type: String,
      default: "",
    },
    targetSkills: {
      type: [String],
      default: [],
    },
    preferredLanguage: {
      type: String,
      default: "English",
    },
    matchedSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PeerInterviewSession",
      default: null,
    },
    matchedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "PeerMatchQueueEntry",
  peerMatchQueueEntrySchema,
);
