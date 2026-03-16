const mongoose = require("mongoose");

const vapiKeySchema = new mongoose.Schema({
  publicKey: {
    type: String,
    required: true,
    unique: true,
  },
  privateKey: {
    type: String, // The Vapi API Key (Secret)
    required: false, // Optional for now, but good for future-proofing
  },
  isExhausted: {
    type: Boolean,
    default: false,
  },
  lastUsedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("VapiKey", vapiKeySchema);
