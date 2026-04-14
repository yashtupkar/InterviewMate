const mongoose = require("mongoose");

const interviewPresetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    interviewMode: {
      type: String,
      enum: ["roleBased", "skillsBased"],
      default: "roleBased",
    },
    role: {
      type: String,
      default: "",
      trim: true,
    },
    level: {
      type: String,
      default: "Junior",
      trim: true,
    },
    interviewType: {
      type: String,
      enum: ["behavioral", "technical", "hr", "general"],
      default: "technical",
    },
    inputType: {
      type: String,
      enum: ["resume", "jobDescription", "both"],
      default: "both",
    },
    skillsSourceType: {
      type: String,
      enum: ["resume", "jobDescription", "both"],
      default: "both",
    },
    skills: {
      type: [String],
      default: [],
    },
    jobDescription: {
      type: String,
      default: "",
    },
    resumeContent: {
      type: String,
      default: "",
    },
    resumeFileName: {
      type: String,
      default: "",
      trim: true,
    },
    duration: {
      type: Number,
      min: 5,
      max: 120,
      default: 10,
    },
    agentName: {
      type: String,
      default: "",
      trim: true,
    },
    agentVoiceProvider: {
      type: String,
      default: "",
      trim: true,
    },
    agentVoiceId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

interviewPresetSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("InterviewPreset", interviewPresetSchema);
