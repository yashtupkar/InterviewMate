const edgeTtsService = require("../services/edgeTtsService");
const asyncHandler = require("../utils/asyncHandler");

const generateTTS = asyncHandler(async (req, res) => {
  try {
    const { text, voiceId, sessionId } = req.body;
    const userId = req.user?._id || req.body.userId;

    console.log("TTS Request received:", {
      text: text?.substring(0, 50),
      voiceId,
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

    // Allow any voice ID returned from the Edge voice list.
    // The TTS service will fail if the voice is truly unsupported.
    if (voiceId && !edgeTtsService.isValidVoiceId(voiceId)) {
      console.error(`Validation failed: Invalid voice ID: ${voiceId}`);
      return res.status(400).json({
        message: "Invalid voice ID",
        receivedVoiceId: voiceId,
      });
    }

    const result = await edgeTtsService.generateTTS(text, voiceId || "Sophia");

    const audioBase64 = result.audioBuffer.toString("base64");

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

    res.status(500).json({
      message: "Failed to generate TTS audio",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

const streamTTS = asyncHandler(async (req, res) => {
  try {
    const { text, voiceId, sessionId } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Text cannot be empty" });
    }

    if (text.length > 3000) {
      return res.status(400).json({
        message: "Text exceeds maximum length of 3000 characters",
      });
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=2592000");
    res.setHeader("X-Cache-ID", edgeTtsService.generateCacheId(text, voiceId));

    const audioBuffer = await edgeTtsService.streamTTS(
      text,
      voiceId || "Sophia",
    );

    res.end(audioBuffer);
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

const batchGenerateTTS = asyncHandler(async (req, res) => {
  try {
    const { items } = req.body;
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

    const results = await edgeTtsService.batchGenerateTTS(items);

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
      return result;
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

const getCacheInfo = asyncHandler(async (req, res) => {
  try {
    const { cacheId } = req.params;

    const metadata = edgeTtsService.getCacheMetadata(cacheId);

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

const getCacheStats = asyncHandler(async (req, res) => {
  try {
    const stats = edgeTtsService.getCacheStats();

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

const clearCache = asyncHandler(async (req, res) => {
  try {
    const { cacheId } = req.params;

    if (cacheId === "all") {
      edgeTtsService.clearCache();
      return res.status(200).json({
        success: true,
        message: "All cache cleared",
      });
    }

    edgeTtsService.clearCache(cacheId);

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

const getAvailableVoices = asyncHandler(async (req, res) => {
  try {
    const edgeVoices = await edgeTtsService.getAvailableVoices();

    const processedVoices = edgeVoices.map((voice) => ({
      id: voice.ShortName,
      name: voice.FriendlyName,
      locale: voice.Locale,
      gender: voice.Gender,
    }));

    const femaleVoices = processedVoices.filter((v) => v.gender === "Female");
    const maleVoices = processedVoices.filter((v) => v.gender === "Male");

    res.status(200).json({
      success: true,
      voices: {
        femaleVoices,
        maleVoices,
        agentMapping: {
          sophia: {
            voiceId: "en-US-JennyNeural",
            description: "Empathetic and people-focused",
          },
          rohan: {
            voiceId: "en-US-GuyNeural",
            description: "Analytical and logical",
          },
          marcus: {
            voiceId: "en-US-DavisNeural",
            description: "Bold and direct",
          },
          emma: {
            voiceId: "en-US-AriaNeural",
            description: "Creative and unconventional",
          },
          drew: {
            voiceId: "en-US-ChristopherNeural",
            description: "Solid and reliable",
          },
          rachel: {
            voiceId: "en-US-SaraNeural",
            description: "Clear and articulate",
          },
        },
      },
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
