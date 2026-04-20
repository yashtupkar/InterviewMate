const mongoose = require("mongoose");

const peerInterviewSessionSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    mode: {
      type: String,
      enum: ["direct", "instant"],
      default: "direct",
    },
    roomName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["livekit"],
      default: "livekit",
    },
    status: {
      type: String,
      enum: ["waiting", "in_progress", "ended", "cancelled"],
      default: "waiting",
      index: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PeerInterviewRequest",
      default: null,
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      audioOnly: { type: Boolean, default: false },
      notes: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

peerInterviewSessionSchema.index({ participants: 1, status: 1 });

module.exports = mongoose.model(
  "PeerInterviewSession",
  peerInterviewSessionSchema,
);
