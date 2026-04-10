const { Polly } = require("aws-sdk");
const crypto = require("crypto");

// Initialize Polly client
const polly = new Polly({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Voice mapping for agents
const VOICE_MAPPING = {
  sophia: "Joanna", // Female - Professional
  rohan: "Matthew", // Male - Professional
  marcus: "Liam", // Male - Formal
  emma: "Ivy", // Female - Young
  // Fallback voices
  default_female: "Joanna",
  default_male: "Matthew",
};

// Cache metadata (can be stored in Redis or memory)
const cacheMetadata = new Map();

/**
 * Generate unique cache ID based on text + voice
 * @param {string} text
 * @param {string} voiceId
 * @returns {string} Cache ID
 */
const generateCacheId = (text, voiceId) => {
  const hash = crypto
    .createHash("sha256")
    .update(`${text}:${voiceId}`)
    .digest("hex");
  return `audio_${hash.substring(0, 16)}`;
};

/**
 * Get AWS Polly voice ID from agent name or custom voice
 * @param {string} voiceId - Agent name or voice ID
 * @returns {string} AWS Polly voice ID
 */
const getPollyVoiceId = (voiceId) => {
  if (!voiceId) return VOICE_MAPPING.default_female;

  const mapped = VOICE_MAPPING[voiceId.toLowerCase()];
  if (mapped) return mapped;

  // If it's already a valid Polly voice, use it
  const validVoices = [
    "Joanna",
    "Ivy",
    "Kimberly",
    "Salli",
    "Kendra",
    "Matthew",
    "Justin",
    "Liam",
    "Joey",
    "Kevin",
  ];

  if (validVoices.includes(voiceId)) return voiceId;

  // Fallback to default
  return VOICE_MAPPING.default_female;
};

/**
 * Clean text for TTS (remove special characters that Polly doesn't handle well)
 * @param {string} text
 * @returns {string} Cleaned text
 */
const cleanTextForPolly = (text) => {
  if (!text) return "";

  // Remove markdown
  let cleaned = text
    .replace(/\*\*/g, "") // Bold
    .replace(/__/g, "") // Bold alternate
    .replace(/\*/g, "") // Italic
    .replace(/_/g, "") // Italic alternate
    .replace(/##/g, "") // Headings
    .replace(/#+\s/g, "") // All headings
    .replace(/`/g, "") // Code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Links
    .replace(/[-*]\s/g, "") // Bullet points
    .replace(/^\d+\.\s/gm, ""); // Numbered lists

  // Replace multiple spaces with single space
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Remove excessive punctuation
  cleaned = cleaned.replace(/([.!?])\1{2,}/g, "$1");

  return cleaned;
};

/**
 * Generate TTS audio from text using AWS Polly
 * @param {string} text - Text to convert to speech
 * @param {string} voiceId - Voice ID (agent name or Polly voice)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} { audioBuffer, cacheId, duration, format }
 */
const generateTTS = async (text, voiceId = "Sophia", options = {}) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    const cleanedText = cleanTextForPolly(text);
    const pollyVoiceId = getPollyVoiceId(voiceId);
    const cacheId = generateCacheId(cleanedText, pollyVoiceId);

    // Store cache metadata
    cacheMetadata.set(cacheId, {
      text: cleanedText,
      voiceId: pollyVoiceId,
      createdAt: new Date(),
      expiresAt: new Date(
        Date.now() + (process.env.AUDIO_CACHE_TTL || 2592000) * 1000,
      ),
    });

    const params = {
      Text: cleanedText,
      OutputFormat: options.outputFormat || "mp3",
      VoiceId: pollyVoiceId,
      Engine: options.engine || "neural",
      ...options.pollyOptions,
    };

    const result = await polly.synthesizeSpeech(params).promise();

    return {
      audioBuffer: result.AudioStream,
      cacheId,
      voiceId: pollyVoiceId,
      format: params.OutputFormat,
      contentType: result.ContentType,
      duration: estimateDuration(cleanedText), // Rough estimate
    };
  } catch (error) {
    console.error("Polly TTS Error:", error);
    throw error;
  }
};

/**
 * Estimate audio duration based on text length
 * Rough estimate: average 250 characters per minute
 * @param {string} text
 * @returns {number} Estimated duration in seconds
 */
const estimateDuration = (text) => {
  const wordCount = text.split(/\s+/).length;
  const wordsPerSecond = 2.5; // Average speaking rate
  return Math.ceil(wordCount / wordsPerSecond);
};

/**
 * Get cached audio metadata
 * @param {string} cacheId
 * @returns {Object|null} Cache metadata or null
 */
const getCacheMetadata = (cacheId) => {
  const metadata = cacheMetadata.get(cacheId);

  if (!metadata) return null;

  // Check if cache has expired
  if (new Date() > metadata.expiresAt) {
    cacheMetadata.delete(cacheId);
    return null;
  }

  return metadata;
};

/**
 * Clear cache (can be called periodically)
 * @param {string} cacheId - Optional: clear specific cache
 */
const clearCache = (cacheId = null) => {
  if (cacheId) {
    cacheMetadata.delete(cacheId);
  } else {
    cacheMetadata.clear();
  }
};

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
const getCacheStats = () => {
  let totalSize = 0;
  let expiredCount = 0;

  for (const [, metadata] of cacheMetadata) {
    if (new Date() > metadata.expiresAt) {
      expiredCount++;
    } else {
      // Rough estimate: ~100 bytes per character for MP3
      totalSize += metadata.text.length * 100;
    }
  }

  return {
    totalCached: cacheMetadata.size - expiredCount,
    estimatedSizeBytes: totalSize,
    estimatedSizeMB: (totalSize / 1024 / 1024).toFixed(2),
  };
};

/**
 * Batch generate TTS for multiple texts (for performance)
 * @param {Array} items - [{ text: string, voiceId: string }]
 * @returns {Promise<Array>} Array of { audioBuffer, cacheId, ...}
 */
const batchGenerateTTS = async (items) => {
  try {
    const results = [];

    for (const item of items) {
      try {
        const result = await generateTTS(item.text, item.voiceId);
        results.push({ success: true, ...result });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          text: item.text,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Batch TTS Error:", error);
    throw error;
  }
};

/**
 * Stream TTS audio (for WebSocket/streaming endpoints)
 * Returns an object that can be piped to response
 * @param {string} text
 * @param {string} voiceId
 * @param {Object} options
 * @returns {Promise<Stream>}
 */
const streamTTS = async (text, voiceId = "Sophia", options = {}) => {
  try {
    const result = await generateTTS(text, voiceId, options);
    return result.audioBuffer; // This is already a stream from Polly
  } catch (error) {
    console.error("Stream TTS Error:", error);
    throw error;
  }
};

/**
 * Validate voice ID
 * @param {string} voiceId
 * @returns {boolean}
 */
const isValidVoiceId = (voiceId) => {
  const validVoices = [
    "Joanna",
    "Ivy",
    "Kimberly",
    "Salli",
    "Kendra",
    "Matthew",
    "Justin",
    "Liam",
    "Joey",
    "Kevin",
    "Sophia",
    "Rohan",
    "Marcus",
    "Emma",
  ];
  return validVoices.includes(voiceId);
};

module.exports = {
  generateTTS,
  streamTTS,
  batchGenerateTTS,
  getCacheMetadata,
  clearCache,
  getCacheStats,
  getPollyVoiceId,
  cleanTextForPolly,
  isValidVoiceId,
  generateCacheId,
  estimateDuration,
};
