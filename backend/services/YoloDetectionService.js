const { PythonShell } = require("python-shell");
const path = require("path");
const logger = require("../config/logger");

class YoloDetectionService {
  constructor() {
    this.pythonScriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "yolo_detector.py",
    );
    this.detectionCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Main detection method - processes a frame and returns detection results
   * @param {string} frameData - Base64 encoded frame data
   * @returns {Promise<Object>} Detection results with risks and detections
   */
  async detectCheats(frameData) {
    try {
      if (!frameData) {
        throw new Error("Frame data is required");
      }

      const result = await this._runPythonDetection(frameData);
      return this._formatDetectionResult(result);
    } catch (error) {
      logger.error("Cheat detection error:", error);
      throw error;
    }
  }

  /**
   * Run the Python YOLO detector
   * @private
   */
  async _runPythonDetection(frameData) {
    return new Promise((resolve, reject) => {
      const options = {
        mode: "text",
        pythonPath: process.env.PYTHON_PATH || "python",
        scriptPath: path.dirname(this.pythonScriptPath),
        args: [],
        timeout: 10000, // 10 second timeout
      };

      const pyshell = new PythonShell("yolo_detector.py", options);

      const inputData = JSON.stringify({ frame: frameData });

      let output = "";
      let hasError = false;

      pyshell.on("message", (message) => {
        output += message;
      });

      pyshell.on("error", (error) => {
        hasError = true;
        reject(new Error(`Python detection error: ${error}`));
      });

      pyshell.on("close", () => {
        if (!hasError) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (e) {
            reject(new Error(`Failed to parse detection result: ${e.message}`));
          }
        }
      });

      pyshell.send(inputData);
      pyshell.end((err) => {
        if (err && !hasError) {
          reject(new Error(`Python execution error: ${err}`));
        }
      });
    });
  }

  /**
   * Format and categorize detection results
   * @private
   */
  _formatDetectionResult(rawResult) {
    if (!rawResult.success) {
      return {
        success: false,
        error: rawResult.error,
        detections: null,
        risks: null,
      };
    }

    const risks = rawResult.risks || {};
    const detections = rawResult.detections || {};

    // Calculate overall risk level and flags
    const overallRisk = Math.max(
      risks.phone || 0,
      risks.book || 0,
      risks.gaze_deviation || 0,
      risks.attire || 0,
      risks.multiple_people || 0  // Multiple people is HIGH priority
    );

    let riskLevel = "low";
    if (overallRisk >= 80) {
      riskLevel = "high";
    } else if (overallRisk >= 50) {
      riskLevel = "medium";
    }

    return {
      success: true,
      detections: {
        objects: detections.objects || {
          phone: [],
          book: [],
          laptop: [],
          monitor: [],
          person: [],
        },
        gaze: detections.gaze || {
          gaze_direction: null,
          head_pose: null,
          confidence: 0,
        },
        attire: detections.attire || {
          suspicious_items: [],
          earpiece_detected: false,
          confidence: 0,
        },
      },
      risks: {
        phone: Math.round(risks.phone || 0),
        book: Math.round(risks.book || 0),
        gaze_deviation: Math.round(risks.gaze_deviation || 0),
        attire: Math.round(risks.attire || 0),
        multiple_people: Math.round(risks.multiple_people || 0),
        overall: Math.round(overallRisk),
      },
      flags: {
        phoneDetected:
          (risks.phone || 0) >= 60 ||
          (detections.objects?.phone?.length || 0) > 0,
        bookDetected:
          (risks.book || 0) >= 60 ||
          (detections.objects?.book?.length || 0) > 0,
        extremeGazeDev: (risks.gaze_deviation || 0) >= 60,
        suspiciousAttire: (risks.attire || 0) >= 60,
        multiplePeopleDetected: (risks.multiple_people || 0) > 0,  // NEW
      },
      riskLevel: riskLevel,
      timestamp: new Date(),
    };
  }

  /**
   * Batch process multiple frames
   * @param {Array<string>} frameDataArray - Array of base64 encoded frames
   * @returns {Promise<Array>} Array of detection results
   */
  async detectBatch(frameDataArray) {
    try {
      const results = await Promise.all(
        frameDataArray.map((frame) => this.detectCheats(frame)),
      );
      return results;
    } catch (error) {
      logger.error("Batch detection error:", error);
      throw error;
    }
  }

  /**
   * Analyze multiple detections and generate risk summary
   */
  analyzeDetectionSequence(detectionResults) {
    if (!detectionResults || detectionResults.length === 0) {
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
    let consecutiveBook = 0;
    let maxPhone = 0;
    let maxBook = 0;
    let gazeDeviations = [];
    let suspiciousAttireCount = 0;

    detectionResults.forEach((result) => {
      if (result.flags?.phoneDetected) {
        consecutivePhone++;
        maxPhone = Math.max(maxPhone, consecutivePhone);
      } else {
        consecutivePhone = 0;
      }

      if (result.flags?.bookDetected) {
        consecutiveBook++;
        maxBook = Math.max(maxBook, consecutiveBook);
      } else {
        consecutiveBook = 0;
      }

      if (result.flags?.extremeGazeDev) {
        gazeDeviations.push(result.risks.gaze_deviation);
      }

      if (result.flags?.suspiciousAttire) {
        suspiciousAttireCount++;
      }
    });

    const avgGazeDev =
      gazeDeviations.length > 0
        ? gazeDeviations.reduce((a, b) => a + b, 0) / gazeDeviations.length
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
        "CRITICAL: Strong evidence of cheating detected. Review required.";
    } else if (overallScore >= 50) {
      recommendation =
        "WARNING: Moderate indicators of cheating. Monitor closely.";
    } else if (overallScore >= 30) {
      recommendation =
        "CAUTION: Minor indicators detected. May be false positive.";
    }

    return {
      consecutivePhoneDetections: maxPhone,
      consecutiveBookDetections: maxBook,
      maxGazeDeviation: Math.max(...gazeDeviations, 0),
      averageGazeDeviation: Math.round(avgGazeDev),
      suspiciousAttireCount: suspiciousAttireCount,
      overallRiskScore: Math.round(overallScore),
      recommendation: recommendation,
      timestamp: new Date(),
    };
  }

  /**
   * Get health status of detection service
   */
  async getHealth() {
    try {
      // Try to run a simple detection
      const testFrame = "data:image/jpeg;base64,";
      const result = await this._runPythonDetection(testFrame).catch((e) => ({
        error: e.message,
      }));

      return {
        status: "healthy",
        pythonPath: process.env.PYTHON_PATH || "python",
        detectorScript: this.pythonScriptPath,
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        lastCheck: new Date(),
      };
    }
  }
}

module.exports = YoloDetectionService;
