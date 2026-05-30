const { Communicate } = require("edge-tts-universal");
const crypto = require("crypto");
const { Readable } = require("stream");

// Voice mapping for agents to Edge Neural voices
const VOICE_MAPPING = {
  // Agent mappings
  sophia: "en-US-AriaNeural", // Female - Professional
  rohan: "en-US-GuyNeural", // Male - Professional
  marcus: "en-US-ChristopherNeural", // Male - Bold/Direct
  emma: "en-US-AvaNeural", // Female - Creative/Friendly
  drew: "en-US-AndrewNeural", // Male - Deep/Solid
  rachel: "en-US-EmmaNeural", // Female - Clear/Articulate

  // Backward compatibility Polly mappings
  joanna: "en-US-AriaNeural",
  matthew: "en-US-GuyNeural",
  liam: "en-US-ChristopherNeural",
  ivy: "en-US-AvaNeural",
  joey: "en-US-ChristopherNeural",
  justin: "en-US-AndrewNeural",
  kimberly: "en-US-EmmaNeural",
  kendra: "en-US-AvaNeural",
  salli: "en-US-EmmaNeural",
  kevin: "en-US-GuyNeural",

  // Fallback defaults
  default_female: "en-US-AriaNeural",
  default_male: "en-US-GuyNeural",
};

// Cache metadata
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
 * Get Edge voice ID from agent name, custom voice or legacy Polly ID
 * @param {string} voiceId - Agent name or voice ID
 * @returns {string} Edge neural voice ID
 */
const getEdgeVoiceId = (voiceId) => {
  if (!voiceId) return VOICE_MAPPING.default_female;

  const mapped = VOICE_MAPPING[voiceId.toLowerCase()];
  if (mapped) return mapped;

  // If it's already a valid Edge neural voice, use it
  if (voiceId.endsWith("Neural")) return voiceId;

  // Fallback to default
  return VOICE_MAPPING.default_female;
};

/**
 * Clean text for TTS (remove special characters that TTS engines don't handle well)
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
 * Generate TTS audio from text using Edge-TTS
 * @param {string} text - Text to convert to speech
 * @param {string} voiceId - Voice ID (agent name or Edge neural voice)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} { audioBuffer, cacheId, duration, format }
 */
const generateTTS = async (text, voiceId = "Sophia", options = {}) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    const cleanedText = cleanTextForPolly(text);
    const edgeVoiceId = getEdgeVoiceId(voiceId);
    const cacheId = generateCacheId(cleanedText, edgeVoiceId);

    // Store cache metadata
    cacheMetadata.set(cacheId, {
      text: cleanedText,
      voiceId: edgeVoiceId,
      createdAt: new Date(),
      expiresAt: new Date(
        Date.now() + (process.env.AUDIO_CACHE_TTL || 2592000) * 1000,
      ),
    });

    // Synthesize speech using edge-tts-universal Communicate
    const communicate = new Communicate(cleanedText, {
      voice: edgeVoiceId,
      rate: options.rate || "+0%",
      pitch: options.pitch || "+0Hz",
      volume: options.volume || "+0%",
    });

    const audioChunks = [];
    for await (const chunk of communicate.stream()) {
      if (chunk.type === "audio" && chunk.data) {
        audioChunks.push(chunk.data);
      }
    }

    if (audioChunks.length === 0) {
      throw new Error("No audio chunks received from Edge-TTS");
    }

    const audioBuffer = Buffer.concat(audioChunks);

    return {
      audioBuffer,
      cacheId,
      voiceId: edgeVoiceId,
      format: "mp3",
      contentType: "audio/mpeg",
      duration: estimateDuration(cleanedText), // Rough estimate
    };
  } catch (error) {
    console.error("Edge-TTS Service Error:", error);
    throw error;
  }
};

/**
 * Estimate audio duration based on text length
 * Rough estimate: average 2.5 words per second
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
 * Clear cache
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
    console.error("Batch Edge-TTS Error:", error);
    throw error;
  }
};

/**
 * Stream TTS audio (for WebSocket/streaming endpoints)
 * Returns a Readable stream
 * @param {string} text
 * @param {string} voiceId
 * @param {Object} options
 * @returns {Promise<Readable>}
 */
const streamTTS = async (text, voiceId = "Sophia", options = {}) => {
  try {
    const cleanedText = cleanTextForPolly(text);
    const edgeVoiceId = getEdgeVoiceId(voiceId);

    const communicate = new Communicate(cleanedText, {
      voice: edgeVoiceId,
      rate: options.rate || "+0%",
      pitch: options.pitch || "+0Hz",
      volume: options.volume || "+0%",
    });

    // Create an async generator that yields chunks in real-time as they arrive
    async function* generator() {
      for await (const chunk of communicate.stream()) {
        if (chunk.type === "audio" && chunk.data) {
          yield chunk.data;
        }
      }
    }

    return Readable.from(generator());
  } catch (error) {
    console.error("Stream Edge-TTS Error:", error);
    throw error;
  }
};

/**
 * Validate voice ID
 * @param {string} voiceId
 * @returns {boolean}
 */
const isValidVoiceId = (voiceId) => {
  if (!voiceId) return true;
  const normalized = voiceId.toLowerCase();
  return VOICE_MAPPING.hasOwnProperty(normalized) || voiceId.endsWith("Neural");
};

module.exports = {
  generateTTS,
  streamTTS,
  batchGenerateTTS,
  getCacheMetadata,
  clearCache,
  getCacheStats,
  getEdgeVoiceId,
  cleanTextForPolly, // exported with old name for compatibility
  isValidVoiceId,
  generateCacheId,
  estimateDuration,
};
