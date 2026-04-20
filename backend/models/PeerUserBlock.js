const mongoose = require("mongoose");

const peerUserBlockSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    blockedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      default: "",
      maxlength: 300,
    },
  },
  { timestamps: true },
);

peerUserBlockSchema.index({ userId: 1, blockedUserId: 1 }, { unique: true });

module.exports = mongoose.model("PeerUserBlock", peerUserBlockSchema);
