const express = require("express");
const router = express.Router();
const customInterviewController = require("../controllers/customInterviewController");
const { clerkAuth: userAuth } = require("../middleware/auth");

// 1. Start Custom Session (Generation of Prompt & DB Entry)
router.post("/start", userAuth, customInterviewController.startCustomSession);

// 2. Get Chat Response (LLM)
router.post("/chat", userAuth, customInterviewController.getChatResponse);

// 3. Save Transcript
router.post("/save-transcript", userAuth, customInterviewController.saveTranscriptOnly);

module.exports = router;
