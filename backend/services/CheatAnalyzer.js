const logger = require("../config/logger");
const CheatIndicator = require("../models/CheatIndicator");
const InterviewSession = require("../models/interviewSessionModel");

class CheatAnalyzer {
  /**
   * Analyze detection and create cheat indicators
   */
  static async analyzeDetection(sessionId, userId, detectionResult) {
    if (!detectionResult || !detectionResult.success) {
      return null;
    }

    const indicators = [];
    const { detections, risks, flags } = detectionResult;

    // Phone detection
    if (flags.phoneDetected && risks.phone > 60) {
      const phone = detections.objects.phone[0];
      indicators.push({
        sessionId,
        userId,
        detectionType: "phone",
        severity: risks.phone > 80 ? "high" : "medium",
        confidence: Math.min(100, risks.phone),
        details: {
          description: "Mobile phone detected in frame",
          objectDetected: "Cell Phone",
          additionalData: phone,
        },
        flagged: risks.phone > 80,
      });
    }

    // Book detection
    if (flags.bookDetected && risks.book > 60) {
      const book = detections.objects.book[0];
      indicators.push({
        sessionId,
        userId,
        detectionType: "book",
        severity: risks.book > 80 ? "high" : "medium",
        confidence: Math.min(100, risks.book),
        details: {
          description: "Reference material (book/notes) detected in frame",
          objectDetected: "Book/Notes/Reference Material",
          additionalData: book,
        },
        flagged: risks.book > 80,
      });
    }

    // Extreme gaze deviation
    if (flags.extremeGazeDev && risks.gaze_deviation > 60 && detections.gaze) {
      indicators.push({
        sessionId,
        userId,
        detectionType: "eye_gaze",
        severity: risks.gaze_deviation > 80 ? "high" : "medium",
        confidence: Math.min(100, risks.gaze_deviation),
        details: {
          description:
            "Extreme eye gaze deviation detected - looking away from screen",
          gazeAngle: detections.gaze.gaze_direction?.angle || 0,
          headPose: detections.gaze.head_pose || {},
          additionalData: detections.gaze,
        },
        flagged: risks.gaze_deviation > 80,
      });
    }

    // Suspicious attire
    if (flags.suspiciousAttire && risks.attire > 60 && detections.attire) {
      const attire = detections.attire;
      indicators.push({
        sessionId,
        userId,
        detectionType: "attire",
        severity: risks.attire > 80 ? "high" : "medium",
        confidence: Math.min(100, risks.attire),
        details: {
          description:
            "Suspicious attire detected - potential earpiece or hidden device",
          objectDetected: attire.suspicious_items
            .map((item) => item.type)
            .join(", "),
          additionalData: attire,
        },
        flagged: risks.attire > 80,
      });
    }

    return indicators;
  }

  /**
   * Save indicators to database
   */
  static async saveIndicators(indicators) {
    if (!indicators || indicators.length === 0) {
      return [];
    }

    try {
      const saved = await CheatIndicator.insertMany(indicators);
      return saved;
    } catch (error) {
      logger.error("Error saving cheat indicators:", error);
      throw error;
    }
  }

  /**
   * Update session with cheat flags
   */
  static async updateSessionCheatFlags(sessionId, indicators) {
    if (!indicators || indicators.length === 0) {
      return null;
    }

    try {
      const session = await InterviewSession.findById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      // Initialize cheatFlags if not present
      if (!session.cheatFlags) {
        session.cheatFlags = {
          detected: false,
          indicators: [],
          summary: {
            totalPhoneInstances: 0,
            totalBookInstances: 0,
            totalGazeDeviations: 0,
            totalAttireFlags: 0,
            averageGazeDeviation: 0,
            suspiciousAttire: [],
            overallRiskLevel: "none",
          },
          warnings: [],
          reviewStatus: "pending",
        };
      }

      // Add indicator references
      indicators.forEach((indicator) => {
        session.cheatFlags.indicators.push(indicator._id);

        // Update summary
        if (indicator.detectionType === "phone") {
          session.cheatFlags.summary.totalPhoneInstances += 1;
        } else if (indicator.detectionType === "book") {
          session.cheatFlags.summary.totalBookInstances += 1;
        } else if (indicator.detectionType === "eye_gaze") {
          session.cheatFlags.summary.totalGazeDeviations += 1;
          const angle = indicator.details.gazeAngle || 0;
          session.cheatFlags.summary.averageGazeDeviation = Math.round(angle);
        } else if (indicator.detectionType === "attire") {
          session.cheatFlags.summary.totalAttireFlags += 1;
          session.cheatFlags.summary.suspiciousAttire.push(
            indicator.details.objectDetected,
          );
        }

        // Add warning
        const severityMap = {
          low: "info",
          medium: "warning",
          high: "critical",
        };

        session.cheatFlags.warnings.push({
          type: indicator.detectionType,
          message: this._generateWarningMessage(indicator),
          severity: severityMap[indicator.severity] || "warning",
        });
      });

      // Determine overall risk level
      const flaggedCount = indicators.filter((i) => i.flagged).length;
      if (flaggedCount >= 3) {
        session.cheatFlags.summary.overallRiskLevel = "high";
        session.cheatFlags.detected = true;
      } else if (flaggedCount >= 2) {
        session.cheatFlags.summary.overallRiskLevel = "medium";
        session.cheatFlags.detected = true;
      } else if (indicators.length > 0) {
        session.cheatFlags.summary.overallRiskLevel = "low";
      }

      session.cheatFlags.summary.flaggedAt = new Date();
      session.cheatFlags.summary.lastDetectedAt = new Date();

      await session.save();
      return session.cheatFlags;
    } catch (error) {
      logger.error("Error updating session cheat flags:", error);
      throw error;
    }
  }

  /**
   * Generate a human-readable warning message
   */
  static _generateWarningMessage(indicator) {
    const messages = {
      phone: "📱 Phone detected - Stay focused on the interview",
      book: "📚 Reference material detected - Interview is open-book, but ensure it's legitimate",
      eye_gaze: "👁️ Extreme eye movement detected - Please look at the camera",
      attire:
        "🎧 Suspicious attire detected - Is there something on your head?",
    };

    return messages[indicator.detectionType] || "Suspicious activity detected";
  }

  /**
   * Analyze multiple detections and generate risk summary
   */
  static async analyzeDetectionSequence(sessionId, detections) {
    if (!detections || detections.length === 0) {
      return {
        consecutivePhoneDetections: 0,
        consecutiveBookDetections: 0,
        maxGazeDeviation: 0,
        averageGazeDeviation: 0,
        suspiciousAttireCount: 0,
        overallRiskScore: 0,
        recommendation: "No suspicious activity detected",
      };
    }

    let consecutivePhone = 0;
    let maxPhone = 0;
    let consecutiveBook = 0;
    let maxBook = 0;
    let gazeDeviations = [];
    let suspiciousAttireCount = 0;

    detections.forEach((detection) => {
      if (detection.detectionType === "phone") {
        consecutivePhone++;
        maxPhone = Math.max(maxPhone, consecutivePhone);
      } else {
        consecutivePhone = 0;
      }

      if (detection.detectionType === "book") {
        consecutiveBook++;
        maxBook = Math.max(maxBook, consecutiveBook);
      } else {
        consecutiveBook = 0;
      }

      if (detection.detectionType === "eye_gaze") {
        gazeDeviations.push(detection.details.gazeAngle || 0);
      }

      if (detection.detectionType === "attire") {
        suspiciousAttireCount++;
      }
    });

    const avgGazeDev =
      gazeDeviations.length > 0
        ? Math.round(
            gazeDeviations.reduce((a, b) => a + b, 0) / gazeDeviations.length,
          )
        : 0;

    // Calculate overall risk score (0-100)
    let overallScore = 0;
    if (maxPhone >= 3) overallScore += 30;
    if (maxBook >= 2) overallScore += 30;
    if (avgGazeDev >= 45) overallScore += 20;
    if (suspiciousAttireCount >= 2) overallScore += 20;

    let recommendation = "No suspicious activity detected";
    if (overallScore >= 70) {
      recommendation =
        "CRITICAL: Strong evidence of cheating detected. Manual review recommended.";
    } else if (overallScore >= 50) {
      recommendation =
        "WARNING: Moderate indicators detected. Monitor closely.";
    } else if (overallScore >= 30) {
      recommendation =
        "CAUTION: Minor indicators detected. May be false positive.";
    }

    return {
      sessionId,
      consecutivePhoneDetections: maxPhone,
      consecutiveBookDetections: maxBook,
      maxGazeDeviation: Math.max(...gazeDeviations, 0),
      averageGazeDeviation: avgGazeDev,
      suspiciousAttireCount: suspiciousAttireCount,
      overallRiskScore: Math.round(overallScore),
      totalDetections: detections.length,
      recommendation: recommendation,
      timestamp: new Date(),
    };
  }

  /**
   * Generate final cheat report for session
   */
  static async generateCheatReport(sessionId) {
    try {
      const session = await InterviewSession.findById(sessionId).populate(
        "cheatFlags.indicators",
      );

      if (!session || !session.cheatFlags) {
        return {
          sessionId,
          detected: false,
          indicators: [],
          report: "No cheat indicators found",
        };
      }

      const indicators = await CheatIndicator.find({ sessionId });

      return {
        sessionId,
        detected: session.cheatFlags.detected,
        riskLevel: session.cheatFlags.summary.overallRiskLevel,
        summary: session.cheatFlags.summary,
        indicators: indicators.map((ind) => ({
          type: ind.detectionType,
          severity: ind.severity,
          confidence: ind.confidence,
          timestamp: ind.frameMeta.timestamp,
          details: ind.details,
        })),
        warnings: session.cheatFlags.warnings,
        reviewStatus: session.cheatFlags.reviewStatus,
        reviewNotes: session.cheatFlags.reviewNotes,
        generatedAt: new Date(),
      };
    } catch (error) {
      logger.error("Error generating cheat report:", error);
      throw error;
    }
  }

  /**
   * Clear/remove flags (e.g., after appeal or review)
   */
  static async clearCheatFlags(sessionId, reason) {
    try {
      const session = await InterviewSession.findById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      session.cheatFlags.detected = false;
      session.cheatFlags.summary.overallRiskLevel = "none";
      session.cheatFlags.reviewStatus = "cleared";
      session.cheatFlags.reviewNotes = reason;
      session.cheatFlags.reviewedAt = new Date();

      await session.save();
      return session.cheatFlags;
    } catch (error) {
      logger.error("Error clearing cheat flags:", error);
      throw error;
    }
  }
}

module.exports = CheatAnalyzer;
