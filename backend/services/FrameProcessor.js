const sharp = require("sharp");
const logger = require("../config/logger");

class FrameProcessor {
  /**
   * Convert base64 frame to optimized format
   * Supports data URIs and raw base64 strings
   */
  static async normalizeFrame(frameData, options = {}) {
    const {
      targetWidth = 640,
      targetHeight = 480,
      quality = 75,
      format = "jpeg",
    } = options;

    try {
      let buffer;

      // Handle data URI format (e.g., "data:image/jpeg;base64,...")
      if (frameData.startsWith("data:")) {
        const base64String = frameData.split(",")[1];
        buffer = Buffer.from(base64String, "base64");
      } else {
        // Assume raw base64 string
        buffer = Buffer.from(frameData, "base64");
      }

      // Resize and optimize
      let transform = sharp(buffer);

      if (format === "webp") {
        transform = transform.webp({ quality });
      } else {
        transform = transform.jpeg({ quality, progressive: true });
      }

      const optimized = await transform
        .resize(targetWidth, targetHeight, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();

      return optimized.toString("base64");
    } catch (error) {
      logger.error("Frame normalization error:", error);
      throw new Error(`Failed to normalize frame: ${error.message}`);
    }
  }

  /**
   * Extract multiple frames from a video stream or array of frames
   */
  static async extractFrames(videoBuffer, options = {}) {
    const { intervalMs = 500, maxFrames = 100 } = options;

    // For now, this would integrate with ffmpeg for video extraction
    // This is a placeholder for future video processing
    logger.info(
      `Frame extraction requested: interval=${intervalMs}ms, maxFrames=${maxFrames}`,
    );

    // TODO: Implement with ffmpeg or similar
    return [];
  }

  /**
   * Compress frame data for transmission
   */
  static async compressFrame(frameData, quality = 60) {
    try {
      return await this.normalizeFrame(frameData, {
        targetWidth: 480,
        targetHeight: 360,
        quality: quality,
        format: "jpeg",
      });
    } catch (error) {
      logger.error("Frame compression error:", error);
      throw error;
    }
  }

  /**
   * Validate frame data integrity
   */
  static isValidFrame(frameData) {
    if (!frameData || typeof frameData !== "string") {
      return false;
    }

    try {
      // Check if it's a valid data URI or base64
      let base64String = frameData;
      if (frameData.startsWith("data:")) {
        base64String = frameData.split(",")[1];
      }

      // Try to decode
      Buffer.from(base64String, "base64");
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate frame similarity (to avoid processing duplicate frames)
   * Uses a simple hash comparison
   */
  static async getFrameHash(frameData) {
    const crypto = require("crypto");
    try {
      let base64String = frameData;
      if (frameData.startsWith("data:")) {
        base64String = frameData.split(",")[1];
      }

      const buffer = Buffer.from(base64String, "base64");
      return crypto.createHash("md5").update(buffer).digest("hex");
    } catch (error) {
      logger.error("Frame hash error:", error);
      return null;
    }
  }

  /**
   * Resize frame to standard detection size
   */
  static async resizeFrame(frameData, width = 640, height = 480) {
    try {
      let buffer;
      if (frameData.startsWith("data:")) {
        const base64String = frameData.split(",")[1];
        buffer = Buffer.from(base64String, "base64");
      } else {
        buffer = Buffer.from(frameData, "base64");
      }

      const resized = await sharp(buffer)
        .resize(width, height, { fit: "fill" })
        .jpeg()
        .toBuffer();

      return resized.toString("base64");
    } catch (error) {
      logger.error("Frame resize error:", error);
      throw error;
    }
  }

  /**
   * Batch process multiple frames
   */
  static async processBatch(frameDataArray, processor) {
    const results = [];
    for (const frameData of frameDataArray) {
      try {
        const processed = await processor(frameData);
        results.push(processed);
      } catch (error) {
        logger.error("Batch processing error:", error);
        results.push({ error: error.message });
      }
    }
    return results;
  }
}

module.exports = FrameProcessor;
