const mongoose = require("mongoose");

const peerInterviewRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ["direct", "instant"],
      default: "direct",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted_waiting_sender",
        "accepted",
        "rejected",
        "cancelled",
        "expired",
      ],
      default: "pending",
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PeerInterviewSession",
      default: null,
    },
    message: {
      type: String,
      default: "",
      maxlength: 500,
    },
    metadata: {
      audioOnly: { type: Boolean, default: false },
      scheduledFor: { type: Date, default: null },
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 10),
      index: true,
    },
  },
  { timestamps: true },
);

peerInterviewRequestSchema.index({ requesterId: 1, recipientId: 1, status: 1 });

module.exports = mongoose.model(
  "PeerInterviewRequest",
  peerInterviewRequestSchema,
);
