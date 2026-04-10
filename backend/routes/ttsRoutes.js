const express = require("express");
const router = express.Router();
const ttsController = require("../controllers/ttsController");

/**
 * TTS Routes
 * Base path: /api/tts
 */

/**
 * POST /api/tts/generate
 * Generate TTS audio from text
 * Body: { text, voiceId, engine, sessionId }
 */
router.post("/generate", ttsController.generateTTS);

/**
 * POST /api/tts/stream
 * Stream TTS audio directly
 * Body: { text, voiceId, engine, sessionId }
 */
router.post("/stream", ttsController.streamTTS);

/**
 * POST /api/tts/batch
 * Generate TTS for multiple texts in batch
 * Body: { items: [{ text, voiceId }] }
 */
router.post("/batch", ttsController.batchGenerateTTS);

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
