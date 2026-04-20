const mongoose = require("mongoose");
const VapiKey = require("../models/vapiKeyModel");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// List all your Vapi accounts here
const accounts = [{ publicKey: "", privateKey: "" }];

const seedKeys = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    for (const account of accounts) {
      await VapiKey.findOneAndUpdate(
        { publicKey: account.publicKey },
        {
          publicKey: account.publicKey,
          privateKey: account.privateKey,
          isExhausted: false,
        },
        { upsert: true, returnDocument: "after" },
      );
      console.log(`Added/Updated account: ${account.publicKey}`);
    }

    console.log(`\nSuccessfully seeded ${accounts.length} accounts.`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding keys:", err.message);
    process.exit(1);
  }
};

seedKeys();
