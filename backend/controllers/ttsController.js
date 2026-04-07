const pollyService = require("../services/pollyService");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Generate TTS audio for given text
 * POST /api/tts/generate
 */
const generateTTS = asyncHandler(async (req, res) => {
  try {
    const { text, voiceId, engine = "neural", sessionId } = req.body;
    const userId = req.user?._id || req.body.userId;

    // Validation with logging
    console.log("TTS Request received:", {
      text: text?.substring(0, 50),
      voiceId,
      engine,
    });

    if (!text || text.trim().length === 0) {
      console.error("Validation failed: Text is empty");
      return res.status(400).json({ message: "Text cannot be empty" });
    }

    if (text.length > 3000) {
      console.error(`Validation failed: Text too long (${text.length} chars)`);
      return res.status(400).json({
        message: "Text exceeds maximum length of 3000 characters",
        length: text.length,
      });
    }

    if (voiceId && !pollyService.isValidVoiceId(voiceId)) {
      console.error(`Validation failed: Invalid voice ID: ${voiceId}`);
      return res.status(400).json({
        message: "Invalid voice ID",
        receivedVoiceId: voiceId,
        validVoices: [
          "Sophia",
          "Rohan",
          "Marcus",
          "Emma",
          "Joanna",
          "Matthew",
          "Liam",
          "Ivy",
          "Joey",
          "Kevin",
          "Kendra",
          "Salli",
          "Justin",
          "Kimberly",
        ],
      });
    }

    // Generate TTS
    const result = await pollyService.generateTTS(text, voiceId || "Sophia", {
      engine,
      outputFormat: "mp3",
    });

    // Convert audio buffer to base64
    const audioBase64 = result.audioBuffer.toString("base64");

    // Return response
    res.status(200).json({
      success: true,
      cacheId: result.cacheId,
      voiceId: result.voiceId,
      duration: result.duration,
      audioBase64,
      format: result.format,
      contentType: result.contentType,
      _metadata: {
        sessionId,
        userId,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("TTS Generation Error:", error);

    // Check if error is rate limit
    if (error.code === "ThrottlingException") {
      return res.status(429).json({
        message: "Too many TTS requests. Please wait before trying again.",
        retryAfter: 60,
      });
    }

    // Check if error is related to invalid text
    if (
      error.code === "InvalidParameterValue" ||
      error.code === "InvalidParameterException"
    ) {
      return res.status(400).json({
        message: "Invalid text for TTS processing",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to generate TTS audio",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * Stream TTS audio with WebSocket/chunked response
 * POST /api/tts/stream
 */
const streamTTS = asyncHandler(async (req, res) => {
  try {
    const { text, voiceId, engine = "neural", sessionId } = req.body;
    const userId = req.user?._id || req.body.userId;

    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Text cannot be empty" });
    }

    if (text.length > 3000) {
      return res.status(400).json({
        message: "Text exceeds maximum length of 3000 characters",
      });
    }

    // Set response headers for streaming
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=2592000"); // 30 days
    res.setHeader("X-Cache-ID", pollyService.generateCacheId(text, voiceId));

    // Stream the audio directly
    const audioStream = await pollyService.streamTTS(
      text,
      voiceId || "Sophia",
      {
        engine,
        outputFormat: "mp3",
      },
    );

    audioStream.pipe(res);
  } catch (error) {
    console.error("TTS Stream Error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Failed to stream TTS audio",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
});

/**
 * Batch generate TTS for multiple texts
 * POST /api/tts/batch
 */
const batchGenerateTTS = asyncHandler(async (req, res) => {
  try {
    const { items } = req.body; // [{ text: string, voiceId: string }]
    const userId = req.user?._id || req.body.userId;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Items array is required and must not be empty" });
    }

    if (items.length > 10) {
      return res.status(400).json({
        message: "Maximum 10 items per batch request",
        provided: items.length,
      });
    }

    // Validate all items
    for (let i = 0; i < items.length; i++) {
      if (!items[i].text || items[i].text.trim().length === 0) {
        return res.status(400).json({
          message: `Item ${i}: Text cannot be empty`,
        });
      }

      if (items[i].text.length > 3000) {
        return res.status(400).json({
          message: `Item ${i}: Text exceeds maximum length of 3000 characters`,
        });
      }
    }

    // Generate all TTS
    const results = await pollyService.batchGenerateTTS(items);

    // Convert audio buffers to base64
    const processedResults = results.map((result) => {
      if (result.success) {
        return {
          success: true,
          cacheId: result.cacheId,
          voiceId: result.voiceId,
          duration: result.duration,
          audioBase64: result.audioBuffer.toString("base64"),
          format: result.format,
        };
      }
      return result; // Return error as-is
    });

    res.status(200).json({
      success: true,
      results: processedResults,
      totalCount: results.length,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
    });
  } catch (error) {
    console.error("Batch TTS Error:", error);
    res.status(500).json({
      message: "Failed to generate batch TTS audio",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * Get cache metadata
 * GET /api/tts/cache/:cacheId
 */
const getCacheInfo = asyncHandler(async (req, res) => {
  try {
    const { cacheId } = req.params;

    const metadata = pollyService.getCacheMetadata(cacheId);

    if (!metadata) {
      return res
        .status(404)
        .json({ message: "Cache entry not found or has expired" });
    }

    res.status(200).json({
      success: true,
      cacheId,
      metadata,
    });
  } catch (error) {
    console.error("Get Cache Error:", error);
    res.status(500).json({
      message: "Failed to get cache info",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * Get cache statistics
 * GET /api/tts/cache/stats
 */
const getCacheStats = asyncHandler(async (req, res) => {
  try {
    const stats = pollyService.getCacheStats();

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get Stats Error:", error);
    res.status(500).json({
      message: "Failed to get cache stats",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * Clear specific cache or all cache
 * DELETE /api/tts/cache/:cacheId
 */
const clearCache = asyncHandler(async (req, res) => {
  try {
    const { cacheId } = req.params;

    if (cacheId === "all") {
      pollyService.clearCache();
      return res.status(200).json({
        success: true,
        message: "All cache cleared",
      });
    }

    pollyService.clearCache(cacheId);

    res.status(200).json({
      success: true,
      message: `Cache ${cacheId} cleared`,
      cacheId,
    });
  } catch (error) {
    console.error("Clear Cache Error:", error);
    res.status(500).json({
      message: "Failed to clear cache",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * Get available voices
 * GET /api/tts/voices
 */
const getAvailableVoices = asyncHandler(async (req, res) => {
  try {
    const voices = {
      femaleVoices: [
        {
          id: "Joanna",
          name: "Joanna (Professional Female)",
          engine: "neural",
        },
        { id: "Ivy", name: "Ivy (Young Female)", engine: "neural" },
        { id: "Kimberly", name: "Kimberly (Clear Female)", engine: "neural" },
      ],
      maleVoices: [
        {
          id: "Matthew",
          name: "Matthew (Professional Male)",
          engine: "neural",
        },
        { id: "Justin", name: "Justin (Young Male)", engine: "neural" },
        { id: "Liam", name: "Liam (Formal Male)", engine: "neural" },
      ],
      agentMapping: {
        sophia: {
          voiceId: "Joanna",
          description: "Empathetic and people-focused",
        },
        rohan: { voiceId: "Matthew", description: "Analytical and logical" },
        marcus: { voiceId: "Liam", description: "Bold and direct" },
        emma: { voiceId: "Ivy", description: "Creative and unconventional" },
      },
    };

    res.status(200).json({
      success: true,
      voices,
    });
  } catch (error) {
    console.error("Get Voices Error:", error);
    res.status(500).json({
      message: "Failed to get available voices",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = {
  generateTTS,
  streamTTS,
  batchGenerateTTS,
  getCacheInfo,
  getCacheStats,
  clearCache,
  getAvailableVoices,
};
