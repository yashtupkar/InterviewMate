const express = require("express");
const router = express.Router();
const YoloDetectionService = require("../services/YoloDetectionService");
const CheatAnalyzer = require("../services/CheatAnalyzer");
const FrameProcessor = require("../services/FrameProcessor");
const CheatIndicator = require("../models/CheatIndicator");
const InterviewSession = require("../models/interviewSessionModel");
const logger = require("../config/logger");

const yoloService = new YoloDetectionService();

/**
 * POST /api/cheat/detect-frame
 * Detect cheating indicators in a single frame
 */
router.post("/detect-frame", async (req, res) => {
  try {
    const { frameData, sessionId, userId } = req.body;

    if (!frameData) {
      return res.status(400).json({ error: "Frame data is required" });
    }

    if (!sessionId || !userId) {
      return res
        .status(400)
        .json({ error: "Session ID and User ID are required" });
    }

    // Validate frame
    if (!FrameProcessor.isValidFrame(frameData)) {
      return res.status(400).json({ error: "Invalid frame data format" });
    }

    // Compress frame for faster processing
    const compressedFrame = await FrameProcessor.compressFrame(frameData, 60);

    // Run detection
    const detectionResult = await yoloService.detectCheats(compressedFrame);

    // Analyze and save if detections found
    if (
      detectionResult.flags &&
      Object.values(detectionResult.flags).some((v) => v)
    ) {
      const indicators = await CheatAnalyzer.analyzeDetection(
        sessionId,
        userId,
        detectionResult,
      );

      if (indicators.length > 0) {
        const saved = await CheatAnalyzer.saveIndicators(indicators);
        await CheatAnalyzer.updateSessionCheatFlags(sessionId, saved);
      }
    }

    res.json({
      success: true,
      detectionResult,
      indicatorsCreated: 0,
    });
  } catch (error) {
    logger.error("Detect frame error:", error);
    res.status(500).json({
      error: "Detection failed",
      details: error.message,
    });
  }
});

/**
 * POST /api/cheat/detect-stream
 * Stream frames for continuous detection during interview
 */
router.post("/detect-stream", async (req, res) => {
  try {
    const { frameData, sessionId, userId, frameIndex } = req.body;

    if (!frameData || !sessionId || !userId) {
      return res.status(400).json({
        error: "Frame data, session ID, and user ID are required",
      });
    }

    // Validate session exists
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Compress and detect
    const compressedFrame = await FrameProcessor.compressFrame(frameData, 50);
    const detectionResult = await yoloService.detectCheats(compressedFrame);

    // Save frame metadata
    const frameMeta = {
      timestamp: new Date(),
      frameIndex: frameIndex || 0,
      detectionResult: {
        risks: detectionResult.risks,
        riskLevel: detectionResult.riskLevel,
      },
    };

    // Create indicators for significant detections
    let indicatorsCount = 0;
    if (
      detectionResult.flags &&
      Object.values(detectionResult.flags).some((v) => v)
    ) {
      const indicators = await CheatAnalyzer.analyzeDetection(
        sessionId,
        userId,
        detectionResult,
      );

      if (indicators.length > 0) {
        const saved = await CheatAnalyzer.saveIndicators(indicators);
        await CheatAnalyzer.updateSessionCheatFlags(sessionId, saved);
        indicatorsCount = saved.length;
      }
    }

    res.json({
      success: true,
      detectionResult,
      indicatorsCreated: indicatorsCount,
      frameMeta,
    });
  } catch (error) {
    logger.error("Stream detection error:", error);
    res.status(500).json({
      error: "Stream detection failed",
      details: error.message,
    });
  }
});

/**
 * GET /api/cheat/session/:sessionId/flags
 * Get cheat flags and indicators for a session
 */
router.get("/session/:sessionId/flags", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session =
      await InterviewSession.findById(sessionId).select("cheatFlags");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({
      success: true,
      cheatFlags: session.cheatFlags || null,
    });
  } catch (error) {
    logger.error("Get flags error:", error);
    res.status(500).json({
      error: "Failed to retrieve cheat flags",
      details: error.message,
    });
  }
});

/**
 * GET /api/cheat/session/:sessionId/report
 * Generate full cheat analysis report
 */
router.get("/session/:sessionId/report", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const report = await CheatAnalyzer.generateCheatReport(sessionId);

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    logger.error("Report generation error:", error);
    res.status(500).json({
      error: "Failed to generate report",
      details: error.message,
    });
  }
});

/**
 * GET /api/cheat/indicators/:sessionId
 * Get all indicators for a session
 */
router.get("/indicators/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { type, severity } = req.query;

    let query = { sessionId };
    if (type) query.detectionType = type;
    if (severity) query.severity = severity;

    const indicators = await CheatIndicator.find(query).sort({
      "frameMeta.timestamp": -1,
    });

    res.json({
      success: true,
      indicators,
      count: indicators.length,
    });
  } catch (error) {
    logger.error("Get indicators error:", error);
    res.status(500).json({
      error: "Failed to retrieve indicators",
      details: error.message,
    });
  }
});

/**
 * POST /api/cheat/analyze-sequence
 * Analyze a sequence of detections for comprehensive risk assessment
 */
router.post("/analyze-sequence", async (req, res) => {
  try {
    const { detections, sessionId } = req.body;

    if (!detections || !Array.isArray(detections)) {
      return res.status(400).json({
        error: "Detections array is required",
      });
    }

    const analysis = await CheatAnalyzer.analyzeDetectionSequence(
      sessionId,
      detections,
    );

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    logger.error("Sequence analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze sequence",
      details: error.message,
    });
  }
});

/**
 * POST /api/cheat/session/:sessionId/clear
 * Clear cheat flags (admin/review action)
 */
router.post("/session/:sessionId/clear", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        error: "Reason for clearing flags is required",
      });
    }

    const updatedFlags = await CheatAnalyzer.clearCheatFlags(sessionId, reason);

    res.json({
      success: true,
      message: "Cheat flags cleared",
      updatedFlags,
    });
  } catch (error) {
    logger.error("Clear flags error:", error);
    res.status(500).json({
      error: "Failed to clear flags",
      details: error.message,
    });
  }
});

/**
 * GET /api/cheat/health
 * Health check for YOLO service
 */
router.get("/health", async (req, res) => {
  try {
    const health = await yoloService.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
});

module.exports = router;
