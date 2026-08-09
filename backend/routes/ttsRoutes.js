const express = require("express");
const router = express.Router();
const ttsController = require("../controllers/ttsController");
const { clerkAuth: userAuth } = require("../middleware/auth");
const { aiRateLimiter } = require("../middleware/rateLimiters");

/**
 * TTS Routes
 * Base path: /api/tts
 * All routes require valid user authentication
 */

// Public ticket-based streaming endpoint (must be BEFORE auth middleware because HTML5 <audio> can't send headers)
router.get("/stream-ticket/:ticketId", ttsController.streamViaTicket);

// Apply auth middleware to all TTS endpoints
router.use(userAuth);

/**
 * POST /api/tts/ticket
 * Generate a short-lived ticket for streaming
 */
router.post("/ticket", ttsController.generateTicket);

/**
 * POST /api/tts/generate
 * Generate TTS audio from text
 * Body: { text, voiceId, engine, sessionId }
 */
router.post("/generate", aiRateLimiter, ttsController.generateTTS);

/**
 * POST /api/tts/stream
 * Stream TTS audio directly (POST only to prevent URL logs/leakage of text)
 * Body: { text, voiceId, engine, sessionId }
 */
router.post("/stream", aiRateLimiter, ttsController.streamTTS);

/**
 * POST /api/tts/batch
 * Generate TTS for multiple texts in batch
 * Body: { items: [{ text, voiceId }] }
 */
router.post("/batch", aiRateLimiter, ttsController.batchGenerateTTS);

/**
 * GET /api/tts/voices
 * Get available voices and agent mapping
 */
router.get("/voices", ttsController.getAvailableVoices);

/**
 * GET /api/tts/cache/stats
 * Get cache statistics
 */
router.get("/cache/stats", ttsController.getCacheStats);

/**
 * GET /api/tts/cache/:cacheId
 * Get cache metadata for specific cache ID
 */
router.get("/cache/:cacheId", ttsController.getCacheInfo);

/**
 * DELETE /api/tts/cache/:cacheId
 * Clear specific cache or all cache (use cacheId="all" to clear all)
 */
router.delete("/cache/:cacheId", ttsController.clearCache);

module.exports = router;
