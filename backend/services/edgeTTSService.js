/**
 * Azure Neural TTS Service
 * Uses Microsoft Cognitive Services Speech SDK to synthesize speech.
 * Drop-in replacement for the former edge-tts-universal implementation.
 *
 * Required env vars:
 *   AZURE_SPEECH_KEY    — Azure Speech resource key
 *   AZURE_SPEECH_REGION — Azure region, e.g. "eastus"
 */

const axios = require("axios");
const crypto = require("crypto");
const { Readable } = require("stream");
const ttsHelper = require("../utils/ttsHelper");

// ---------------------------------------------------------------------------
// ✏️  CHANGE VOICE HERE — AI interviewer agent voices (en-US Neural)
// ---------------------------------------------------------------------------
const AGENT_FEMALE_VOICE = "en-US-JennyNeural"; // default female agent
const AGENT_MALE_VOICE   = "en-US-GuyNeural";   // default male agent

// ✏️  CHANGE VOICE HERE — Indian-English fallback voices (en-IN Neural)
const INDIAN_FEMALE_VOICE = "en-IN-NeerjaNeural";
const INDIAN_MALE_VOICE   = "en-IN-PrabhatNeural";

// ---------------------------------------------------------------------------
// Voice mapping  (agent name / legacy Polly alias → Azure Neural voice ID)
// ---------------------------------------------------------------------------
const VOICE_MAPPING = {
  // Agent mappings
  sophia:  "en-US-AvaNeural",        // Female - Professional/Empathetic
  rohan:   AGENT_MALE_VOICE,         // Male   - Analytical
  marcus:  "en-US-ChristopherNeural",// Male   - Bold/Direct
  emma:    "en-US-AmandaMultilingualNeural", // Female - Creative/Friendly
  drew:    "en-US-AndrewNeural",     // Male   - Deep/Solid
  rachel:  "en-US-EmmaNeural",       // Female - Clear/Articulate

  // Backward-compatibility Polly aliases
  joanna:   "en-US-AriaNeural",
  matthew:  AGENT_MALE_VOICE,
  liam:     "en-US-ChristopherNeural",
  ivy:      "en-US-AvaNeural",
  joey:     "en-US-ChristopherNeural",
  justin:   "en-US-AndrewNeural",
  kimberly: "en-US-EmmaNeural",
  kendra:   "en-US-AvaNeural",
  salli:    "en-US-EmmaNeural",
  kevin:    AGENT_MALE_VOICE,

  // Defaults
  default_female: AGENT_FEMALE_VOICE,
  default_male:   AGENT_MALE_VOICE,
};

// ---------------------------------------------------------------------------
// Audio cache  — stores { audioBuffer, metadata }  keyed by cacheId
// ---------------------------------------------------------------------------
const audioCache = new Map(); // cacheId → { audioBuffer, text, voiceId, createdAt, expiresAt }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a stable cache key from text + voiceId.
 * @param {string} text
 * @param {string} voiceId
 * @returns {string}
 */
const generateCacheId = (text, voiceId) => {
  const hash = crypto
    .createHash("sha256")
    .update(`${text}:${voiceId}`)
    .digest("hex");
  return `audio_${hash.substring(0, 16)}`;
};

/**
 * Resolve an agent name or legacy Polly ID to an Azure Neural voice ID.
 * @param {string} voiceId
 * @returns {string}
 */
const getEdgeVoiceId = (voiceId) => {
  if (!voiceId) return VOICE_MAPPING.default_female;

  const mapped = VOICE_MAPPING[voiceId.toLowerCase()];
  if (mapped) return mapped;

  // Already a valid Neural voice name (e.g. "en-US-JennyNeural")
  if (voiceId.endsWith("Neural")) return voiceId;

  return VOICE_MAPPING.default_female;
};

/**
 * Strip markdown and normalise whitespace so TTS engines receive clean prose.
 * Exported with legacy name for backward-compatibility.
 * @param {string} text
 * @returns {string}
 */
const cleanTextForPolly = (text) => {
  if (!text) return "";

  let cleaned = text
    .replace(/\*\*/g, "")       // Bold
    .replace(/__/g, "")         // Bold alternate
    .replace(/\*/g, "")         // Italic
    .replace(/_/g, "")          // Italic alternate
    .replace(/##/g, "")         // Headings
    .replace(/#+\s/g, "")       // All headings
    .replace(/`/g, "")          // Code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/[-*]\s/g, "")     // Bullet points
    .replace(/^\d+\.\s/gm, ""); // Numbered lists

  cleaned = cleaned.replace(/\s+/g, " ").trim();
  cleaned = cleaned.replace(/([.!?])\1{2,}/g, "$1");

  return cleaned;
};

/**
 * Estimate audio duration (rough: ~2.5 words/sec).
 * @param {string} text
 * @returns {number} seconds
 */
const estimateDuration = (text) => {
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 2.5);
};

/**
 * Check if a cached entry is still valid.
 * @param {{ expiresAt: Date }} entry
 * @returns {boolean}
 */
const isCacheValid = (entry) => entry && new Date() < entry.expiresAt;

// ---------------------------------------------------------------------------
// Azure Speech SDK factory
// ---------------------------------------------------------------------------

// Step 1: Get auth token (cache it for 9 min, tokens expire at 10 min)
let tokenCache = { token: null, expiresAt: 0 };
const getAzureToken = async () => {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) return tokenCache.token;
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    throw new Error(
      "Azure TTS credentials missing. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env"
    );
  }

  const resp = await axios.post(
    `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
    null,
    { headers: { "Ocp-Apim-Subscription-Key": key } }
  );
  tokenCache = { token: resp.data, expiresAt: Date.now() + 9 * 60 * 1000 };
  return resp.data;
};

/**
 * Core synthesis function — calls Azure REST API and returns a Buffer.
 * @param {string} text     — cleaned plain text
 * @param {string} voiceId  — Azure Neural voice name
 * @returns {Promise<Buffer>}
 */
const synthesizeToBuffer = async (text, voiceId) => {
  // QUALITY FIX: use ttsHelper configurations for premium audio output
  const token = await getAzureToken();
  const region = process.env.AZURE_SPEECH_REGION;
  const config = ttsHelper.getSpeechConfig();
  const ssml = ttsHelper.buildSSML(text, voiceId);

  const resp = await axios.post(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    ssml,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": config.contentType,
        "X-Microsoft-OutputFormat": config.outputFormat,
        "User-Agent": config.userAgent,
      },
      responseType: "arraybuffer",
      timeout: 15000,
    }
  );

  return Buffer.from(resp.data);
};

// ---------------------------------------------------------------------------
// Public API  (same signatures as the old edgeTTSService)
// ---------------------------------------------------------------------------

/**
 * Generate TTS audio from text using Azure Neural TTS.
 * Checks the in-process audio cache first — identical text+voice hits never
 * reach Azure again, saving API characters.
 *
 * @param {string} text
 * @param {string} voiceId — agent name or Azure Neural voice ID
 * @param {Object} options
 * @returns {Promise<{ audioBuffer, cacheId, voiceId, format, contentType, duration }>}
 */
const generateTTS = async (text, voiceId = "Sophia", options = {}) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    const cleanedText  = cleanTextForPolly(text);
    const azureVoiceId = getEdgeVoiceId(voiceId);
    const cacheId      = generateCacheId(cleanedText, azureVoiceId);

    // ── Cache hit ───────────────────────────────────────────────────────────
    const cached = audioCache.get(cacheId);
    if (isCacheValid(cached)) {
      return {
        audioBuffer:  cached.audioBuffer,
        cacheId,
        voiceId:      azureVoiceId,
        format:       "mp3",
        contentType:  "audio/mpeg",
        duration:     estimateDuration(cleanedText),
        fromCache:    true,
      };
    }

    // ── Azure call ──────────────────────────────────────────────────────────
    const audioBuffer = await synthesizeToBuffer(cleanedText, azureVoiceId);

    // Store full buffer in cache
    const ttl = Number(process.env.AUDIO_CACHE_TTL) || 2592000; // 30 days default
    audioCache.set(cacheId, {
      audioBuffer,
      text:       cleanedText,
      voiceId:    azureVoiceId,
      createdAt:  new Date(),
      expiresAt:  new Date(Date.now() + ttl * 1000),
    });

    return {
      audioBuffer,
      cacheId,
      voiceId:     azureVoiceId,
      format:      "mp3",
      contentType: "audio/mpeg",
      duration:    estimateDuration(cleanedText),
      fromCache:   false,
    };
  } catch (error) {
    console.error("Azure TTS Service Error:", error);
    throw error;
  }
};

/**
 * Stream TTS audio as a Node.js Readable stream.
 * Generates the full buffer first (Azure SDK) then wraps it in a Readable.
 *
 * @param {string} text
 * @param {string} voiceId
 * @param {Object} options
 * @returns {Promise<Readable>}
 */
const streamTTS = async (text, voiceId = "Sophia", options = {}) => {
  try {
    const cleanedText  = cleanTextForPolly(text);
    const azureVoiceId = getEdgeVoiceId(voiceId);
    const cacheId      = generateCacheId(cleanedText, azureVoiceId);

    // Use cached buffer if available
    let audioBuffer;
    const cached = audioCache.get(cacheId);
    if (isCacheValid(cached)) {
      audioBuffer = cached.audioBuffer;
    } else {
      audioBuffer = await synthesizeToBuffer(cleanedText, azureVoiceId);

      const ttl = Number(process.env.AUDIO_CACHE_TTL) || 2592000;
      audioCache.set(cacheId, {
        audioBuffer,
        text:      cleanedText,
        voiceId:   azureVoiceId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + ttl * 1000),
      });
    }

    return Readable.from(audioBuffer);
  } catch (error) {
    console.error("Azure TTS Stream Error:", error);
    throw error;
  }
};

/**
 * Batch generate TTS for multiple items sequentially.
 * @param {Array<{ text: string, voiceId: string }>} items
 * @returns {Promise<Array>}
 */
const batchGenerateTTS = async (items) => {
  try {
    const results = [];
    for (const item of items) {
      try {
        const result = await generateTTS(item.text, item.voiceId);
        results.push({ success: true, ...result });
      } catch (error) {
        results.push({ success: false, error: error.message, text: item.text });
      }
    }
    return results;
  } catch (error) {
    console.error("Batch Azure TTS Error:", error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Cache management
// ---------------------------------------------------------------------------

/**
 * Get cache metadata for a specific cacheId (excludes audio buffer).
 * @param {string} cacheId
 * @returns {Object|null}
 */
const getCacheMetadata = (cacheId) => {
  const entry = audioCache.get(cacheId);
  if (!entry) return null;

  if (!isCacheValid(entry)) {
    audioCache.delete(cacheId);
    return null;
  }

  const { audioBuffer: _buf, ...metadata } = entry; // omit the buffer
  return metadata;
};

/**
 * Clear a specific cache entry or all entries.
 * @param {string|null} cacheId — pass null to clear everything
 */
const clearCache = (cacheId = null) => {
  if (cacheId) {
    audioCache.delete(cacheId);
  } else {
    audioCache.clear();
  }
};

/**
 * Get cache statistics.
 * @returns {{ totalCached, estimatedSizeBytes, estimatedSizeMB }}
 */
const getCacheStats = () => {
  let totalSize    = 0;
  let expiredCount = 0;

  for (const [, entry] of audioCache) {
    if (!isCacheValid(entry)) {
      expiredCount++;
    } else {
      totalSize += entry.audioBuffer?.length || 0;
    }
  }

  return {
    totalCached:       audioCache.size - expiredCount,
    estimatedSizeBytes: totalSize,
    estimatedSizeMB:   (totalSize / 1024 / 1024).toFixed(2),
  };
};

/**
 * Validate a voice ID.
 * @param {string} voiceId
 * @returns {boolean}
 */
const isValidVoiceId = (voiceId) => {
  if (!voiceId) return true;
  const normalized = voiceId.toLowerCase();
  return Object.prototype.hasOwnProperty.call(VOICE_MAPPING, normalized) ||
    voiceId.endsWith("Neural");
};

// ---------------------------------------------------------------------------
// Exports  (identical surface to the old edgeTTSService)
// ---------------------------------------------------------------------------
module.exports = {
  generateTTS,
  streamTTS,
  batchGenerateTTS,
  getCacheMetadata,
  clearCache,
  getCacheStats,
  getEdgeVoiceId,
  cleanTextForPolly,   // exported with original name for compatibility
  isValidVoiceId,
  generateCacheId,
  estimateDuration,
};
