const asyncHandler = require("../utils/asyncHandler");
const deepgramService = require("../services/deepgramService");

const transcribe = asyncHandler(async (req, res) => {
  try {
    const audioFile = req.file;
    const language = req.body?.language || "en-US";

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required.",
      });
    }

    if (audioFile.size > 8 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: "Audio file is too large.",
      });
    }

    const result = await deepgramService.transcribeAudio({
      audioBuffer: audioFile.buffer,
      mimeType: audioFile.mimetype,
      language,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("STT transcription error:", error.message);

    if (error.message === "Deepgram is not configured on server.") {
      return res.status(503).json({
        success: false,
        message: "STT provider is not configured.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to transcribe audio.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

const health = asyncHandler(async (req, res) => {
  const configured = Boolean(process.env.DEEPGRAM_API_KEY);
  return res.status(configured ? 200 : 503).json({
    success: configured,
    provider: "deepgram",
    configured,
  });
});

module.exports = {
  transcribe,
  health,
};
