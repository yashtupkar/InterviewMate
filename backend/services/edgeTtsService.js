const crypto = require("crypto");
const WebSocket = require("ws");
const pollyService = require("./pollyService");
const axios = require("axios");

const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const CHROMIUM_FULL_VERSION = "143.0.3650.75";
const WINDOWS_FILE_TIME_EPOCH = 11644473600n;

function generateSecMsGecToken() {
  const ticks =
    BigInt(Math.floor(Date.now() / 1000) + Number(WINDOWS_FILE_TIME_EPOCH)) *
    10000000n;
  const roundedTicks = ticks - (ticks % 3000000000n);
  const strToHash = `${roundedTicks}${TRUSTED_CLIENT_TOKEN}`;
  const hash = crypto.createHash("sha256");
  hash.update(strToHash, "ascii");
  return hash.digest("hex").toUpperCase();
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return c;
    }
  });
}

const VOICE_MAPPING = {
  sophia: "en-US-JennyNeural",
  rohan: "en-US-GuyNeural",
  marcus: "en-US-ChristopherNeural",
  emma: "en-US-AriaNeural",
  drew: "en-US-ChristopherNeural",
  rachel: "en-US-SaraNeural",
  default_female: "en-US-JennyNeural",
  default_male: "en-US-GuyNeural",
};

const cacheMetadata = new Map();

const generateCacheId = (text, voiceId) => {
  const hash = crypto
    .createHash("sha256")
    .update(`${text}:${voiceId}`)
    .digest("hex");
  return `audio_${hash.substring(0, 16)}`;
};

const getEdgeVoiceId = (voiceId) => {
  if (!voiceId) return VOICE_MAPPING.default_female;

  const mapped = VOICE_MAPPING[voiceId.toLowerCase()];
  if (mapped) return mapped;

  return voiceId;
};

const cleanTextForTTS = (text) => {
  if (!text) return "";

  let cleaned = text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/\*/g, "")
    .replace(/_/g, "")
    .replace(/##/g, "")
    .replace(/#+\s/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/[-*]\s/g, "")
    .replace(/^\d+\.\s/gm, "");

  cleaned = cleaned.replace(/\s+/g, " ").trim();
  cleaned = cleaned.replace(/([.!?])\1{2,}/g, "$1");

  return cleaned;
};

const generateTTS = async (text, voiceId = "Sophia", options = {}) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    const cleanedText = cleanTextForTTS(text);
    const edgeVoiceId = getEdgeVoiceId(voiceId);
    const cacheId = generateCacheId(cleanedText, edgeVoiceId);

    cacheMetadata.set(cacheId, {
      text: cleanedText,
      voiceId: edgeVoiceId,
      createdAt: new Date(),
      expiresAt: new Date(
        Date.now() + (process.env.AUDIO_CACHE_TTL || 2592000) * 1000,
      ),
    });

    try {
      const audioBuffer = await synthesizeToBuffer(cleanedText, edgeVoiceId);

      return {
        audioBuffer,
        cacheId,
        voiceId: edgeVoiceId,
        format: "mp3",
        contentType: "audio/mpeg",
        duration: estimateDuration(cleanedText),
      };
    } catch (edgeErr) {
      console.warn(
        "Edge TTS failed, falling back to Polly:",
        edgeErr.message || edgeErr,
      );
      try {
        const pollyResult = await pollyService.generateTTS(
          cleanedText,
          edgeVoiceId,
        );
        return {
          audioBuffer: pollyResult.audioBuffer,
          cacheId,
          voiceId: pollyResult.voiceId,
          format: pollyResult.format || "mp3",
          contentType: pollyResult.contentType || "audio/mpeg",
          duration: pollyResult.duration || estimateDuration(cleanedText),
          _fallback: "polly",
        };
      } catch (pollyErr) {
        console.error("Polly fallback also failed:", pollyErr);
        throw pollyErr;
      }
    }
  } catch (error) {
    console.error("Edge TTS Error:", error);
    throw error;
  }
};

const synthesizeToBuffer = (text, voiceId) => {
  return new Promise((resolve, reject) => {
    const url = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${generateSecMsGecToken()}&Sec-MS-GEC-Version=1-${CHROMIUM_FULL_VERSION}`;

    const ws = new WebSocket(url, {
      headers: {
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_FULL_VERSION.split(".")[0]}.0.0.0 Safari/537.36 Edg/${CHROMIUM_FULL_VERSION.split(".")[0]}.0.0.0`,
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        Origin: "https://www.bing.com",
      },
      rejectUnauthorized: false,
    });

    const audioChunks = [];
    const requestId = crypto.randomBytes(16).toString("hex");
    let timeout;

    // Ensure node returns Buffers for binary messages
    ws.binaryType = "nodebuffer";

    ws.on("open", () => {
      // Increase timeout for slower responses
      timeout = setTimeout(() => {
        try {
          ws.terminate();
        } catch (e) {
          // ignore
        }
        reject(new Error("Edge TTS timed out"));
      }, 30000);

      // Send config
      const configPayload = JSON.stringify({
        context: {
          synthesis: {
            audio: {
              metadataoptions: {
                sentenceBoundaryEnabled: "false",
                wordBoundaryEnabled: "false",
              },
              outputFormat: "audio-24khz-48kbitrate-mono-mp3",
            },
          },
        },
      });

      ws.send(
        `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n${configPayload}`,
      );

      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US"><voice name="${voiceId}"><prosody rate="default" pitch="default" volume="default">${escapeXml(
        text,
      )}</prosody></voice></speak>`;

      ws.send(
        `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`,
      );
    });

    ws.on("message", (data, isBinary) => {
      try {
        if (isBinary) {
          const separator = Buffer.from("Path:audio\r\n");
          const index = data.indexOf(separator);
          const start = index >= 0 ? index + separator.length : 0;
          const audioData = data.subarray(start);
          audioChunks.push(audioData);
          return;
        }

        const message = data.toString();

        // Check for end marker
        if (message.includes("Path:turn.end") || message.includes("turn.end")) {
          try {
            ws.terminate();
          } catch (e) {}
          if (timeout) clearTimeout(timeout);
          if (audioChunks.length > 0) {
            return resolve(Buffer.concat(audioChunks));
          }
          return reject(new Error("Edge TTS returned no audio"));
        }

        // Check for explicit error messages
        if (
          message.toLowerCase().includes("error") ||
          message.toLowerCase().includes("status")
        ) {
          // try parse JSON substring
          const jsonStart = message.indexOf("{");
          if (jsonStart !== -1) {
            try {
              const obj = JSON.parse(message.substring(jsonStart));
              if (obj && obj.status && obj.status.message) {
                return reject(
                  new Error(`Edge TTS error: ${obj.status.message}`),
                );
              }
            } catch (e) {
              // fallthrough - not JSON
            }
          }
        }
      } catch (err) {
        if (timeout) clearTimeout(timeout);
        return reject(err);
      }
    });

    ws.on("error", (error) => {
      if (timeout) clearTimeout(timeout);
      reject(new Error(`WebSocket error: ${error.message || error}`));
    });

    ws.on("close", (code, reason) => {
      if (timeout) clearTimeout(timeout);
      if (audioChunks.length === 0) {
        reject(
          new Error(`Connection closed without audio: ${code} - ${reason}`),
        );
      }
    });
  });
};

const estimateDuration = (text) => {
  const wordCount = text.split(/\s+/).length;
  const wordsPerSecond = 2.5;
  return Math.ceil(wordCount / wordsPerSecond);
};

const getCacheMetadata = (cacheId) => {
  const metadata = cacheMetadata.get(cacheId);
  if (!metadata) return null;
  if (new Date() > metadata.expiresAt) {
    cacheMetadata.delete(cacheId);
    return null;
  }
  return metadata;
};

const clearCache = (cacheId = null) => {
  if (cacheId) {
    cacheMetadata.delete(cacheId);
  } else {
    cacheMetadata.clear();
  }
};

const getCacheStats = () => {
  let totalSize = 0;
  let expiredCount = 0;

  for (const [, metadata] of cacheMetadata) {
    if (new Date() > metadata.expiresAt) {
      expiredCount++;
    } else {
      totalSize += metadata.text.length * 100;
    }
  }

  return {
    totalCached: cacheMetadata.size - expiredCount,
    estimatedSizeBytes: totalSize,
    estimatedSizeMB: (totalSize / 1024 / 1024).toFixed(2),
  };
};

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

const streamTTS = async (text, voiceId = "Sophia", options = {}) => {
  try {
    const result = await generateTTS(text, voiceId, options);
    return result.audioBuffer;
  } catch (error) {
    console.error("Stream TTS Error:", error);
    throw error;
  }
};

const isValidVoiceId = (voiceId) => {
  return typeof voiceId === "string" && voiceId.trim().length > 0;
};

const getAvailableVoices = async () => {
  try {
    const url = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=${TRUSTED_CLIENT_TOKEN}`;
    const resp = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
      timeout: 15000,
    });
    return resp.data;
  } catch (error) {
    console.error("Get Voices Error:", error?.message || error);
    throw error;
  }
};

module.exports = {
  generateTTS,
  streamTTS,
  batchGenerateTTS,
  getCacheMetadata,
  clearCache,
  getCacheStats,
  getEdgeVoiceId,
  cleanTextForTTS,
  isValidVoiceId,
  generateCacheId,
  estimateDuration,
  getAvailableVoices,
};
