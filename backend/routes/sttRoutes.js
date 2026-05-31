const express = require("express");
const router = express.Router();
const sttController = require("../controllers/sttController");
const { clerkAuth: userAuth } = require("../middleware/auth");

/**
 * STT Routes
 * Base path: /api/stt
 */

/**
 * POST /api/stt/token
 * Generate a temporary Deepgram token
 */
router.post("/token", userAuth, sttController.getDeepgramToken);

module.exports = router;
