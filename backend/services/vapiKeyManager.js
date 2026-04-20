const VapiKey = require("../models/vapiKeyModel");

class VapiKeyManager {
  constructor() {
    this.currentKey = null;
  }

  async getActiveKey() {
    // If we have a cached key and it's not marked exhausted, return it
    if (this.currentKey && !this.currentKey.isExhausted) {
      return this.currentKey.publicKey;
    }

    // Otherwise, fetch the next available key from DB
    const keyDoc = await VapiKey.findOne({ isExhausted: false }).sort({
      lastUsedAt: 1,
    });

    if (!keyDoc) {
      // Fallback to env if no keys in DB
      return process.env.VAPI_PUBLIC_KEY;
    }

    this.currentKey = keyDoc;

    // Update last used timestamp
    keyDoc.lastUsedAt = new Date();
    await keyDoc.save();

    return keyDoc.publicKey;
  }

  async reportExhaustion(publicKey) {
    if (!publicKey) return;

    await VapiKey.updateOne(
      { publicKey: publicKey },
      { $set: { isExhausted: true } },
    );

    // If the exhausted key was our cached key, clear the cache
    if (this.currentKey && this.currentKey.publicKey === publicKey) {
      this.currentKey = null;
    }
  }

  async addKey(publicKey) {
    return await VapiKey.findOneAndUpdate(
      { publicKey },
      { publicKey, isExhausted: false },
      { upsert: true, returnDocument: "after" },
    );
  }
}

// Export a singleton instance
module.exports = new VapiKeyManager();
