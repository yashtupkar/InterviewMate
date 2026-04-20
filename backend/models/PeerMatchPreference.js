const mongoose = require("mongoose");

const peerMatchPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    isPeerMatchingEnabled: {
      type: Boolean,
      default: false,
    },
    allowDirectInvites: {
      type: Boolean,
      default: true,
    },
    allowInstantMatch: {
      type: Boolean,
      default: false,
    },
    genderIdentity: {
      type: String,
      enum: ["female", "male", "non_binary", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    preferredMatch: {
      type: String,
      enum: ["any", "female_only", "male_only", "non_binary_only"],
      default: "any",
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
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "PeerMatchPreference",
  peerMatchPreferenceSchema,
);
