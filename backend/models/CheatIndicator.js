const mongoose = require("mongoose");

const cheatIndicatorSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewSession",
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userModel",
    required: true,
    index: true,
  },
  detectionType: {
    type: String,
    enum: ["phone", "book", "eye_gaze", "attire"],
    required: true,
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  frameMeta: {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    frameIndex: Number,
    boundingBox: {
      x: Number,
      y: Number,
      w: Number,
      h: Number,
    },
    frameWidth: Number,
    frameHeight: Number,
  },
  details: {
    description: String,
    objectDetected: String,
    gazeAngle: Number,
    headPose: {
      pitch: Number,
      yaw: Number,
      roll: Number,
    },
    additionalData: mongoose.Schema.Types.Mixed,
  },
  flagged: {
    type: Boolean,
    default: false,
  },
  reason: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

cheatIndicatorSchema.index({ sessionId: 1, createdAt: -1 });
cheatIndicatorSchema.index({ userId: 1, createdAt: -1 });
cheatIndicatorSchema.index({ detectionType: 1, severity: 1 });

const CheatIndicator = mongoose.model("CheatIndicator", cheatIndicatorSchema);

module.exports = CheatIndicator;
