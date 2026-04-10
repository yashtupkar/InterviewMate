import { useState, useCallback, useRef, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AppContext } from "../context/AppContext";
import { getAudioPlayer } from "../utils/audioPlayer";
import * as audioCache from "../utils/audioCache";
import { getVoiceIdFromAgent } from "../constants/voices";
import {
  shouldUseBrowserNativeTTS,
  logTTSBackendSelection,
} from "../utils/browserDetection";

/**
 * Custom Hook for Hybrid TTS Integration
 * Strategy:
 * - Chrome Desktop: Use browser native TTS (fast, free)
 * - All other browsers: Use AWS Polly (consistent, reliable)
 *
 * Usage:
 * const { speakText, stopSpeaking, isPlaying } = usePollyTTS();
 * await speakText("Hello world", "Sophia", { engine: "neural" });
 */
export const usePollyTTS = () => {
  const { backend_URL } = useContext(AppContext);

  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVoiceId, setCurrentVoiceId] = useState(null);
  const [ttsBehaviorRef] = useState(() => ({
    useBrowserNative: shouldUseBrowserNativeTTS(),
  }));

  const playerRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isProcessingQueue = useRef(false);
  const lastSpeakTimeRef = useRef(0);
  const abortControllerRef = useRef(null);
  const utteranceRef = useRef(null);
  const availableVoicesRef = useRef([]);
  const voicesReadyPromiseRef = useRef(null);

  // Initialize audio player
  useEffect(() => {
    logTTSBackendSelection();

    playerRef.current = getAudioPlayer();

    // Setup player event listeners
    if (playerRef.current) {
      playerRef.current.on("onPlay", () => setIsPlaying(true));
      playerRef.current.on("onPause", () => setIsPlaying(false));
      playerRef.current.on("onEnd", () => setIsPlaying(false));
      playerRef.current.on("onError", (err) => {
        setError(err?.message || "Audio playback error");
        setIsPlaying(false);
      });
    }

    // Initialize audio cache
    audioCache.initDB().catch((err) => {
      console.warn("Audio cache initialization failed:", err);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      // Cancel any ongoing speech synthesis
      window.speechSynthesis.cancel();
    };
  }, []);

  // Chrome loads voices lazily. Prime and wait once so first click uses the intended voice.
  useEffect(() => {
    if (!ttsBehaviorRef.useBrowserNative || typeof window === "undefined") {
      return;
    }

    let timeoutId;

    const hydrateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        availableVoicesRef.current = voices;
        return true;
      }
      return false;
    };

    voicesReadyPromiseRef.current = new Promise((resolve) => {
      if (hydrateVoices()) {
        resolve(availableVoicesRef.current);
        return;
      }

      const handleVoicesChanged = () => {
        if (hydrateVoices()) {
          window.speechSynthesis.removeEventListener(
            "voiceschanged",
            handleVoicesChanged,
          );
          clearTimeout(timeoutId);
          resolve(availableVoicesRef.current);
        }
      };

      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

      timeoutId = setTimeout(() => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged,
        );
        // Proceed even if no voices are available yet; this avoids a hard lock.
        resolve(window.speechSynthesis.getVoices());
      }, 1500);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [ttsBehaviorRef.useBrowserNative]);

  const getReadyBrowserVoices = useCallback(async () => {
    if (!ttsBehaviorRef.useBrowserNative) {
      return [];
    }

    if (availableVoicesRef.current.length > 0) {
      return availableVoicesRef.current;
    }

    if (voicesReadyPromiseRef.current) {
      const voices = await voicesReadyPromiseRef.current;
      if (voices?.length) {
        availableVoicesRef.current = voices;
      }
      return voices || [];
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices?.length) {
      availableVoicesRef.current = voices;
    }
    return voices || [];
  }, [ttsBehaviorRef.useBrowserNative]);

  /**
   * Fetch audio from Polly API
   * @private
   */
  const fetchAudioFromPolly = useCallback(
    async (text, voiceId) => {
      try {
        setIsLoading(true);
        setError(null);

        const payload = {
          text: text.trim(),
          voiceId: voiceId || "Sophia",
          engine: "neural",
        };

        const response = await axios.post(
          `${backend_URL}/api/tts/generate`,
          payload,
          {
            signal: abortControllerRef.current?.signal,
            timeout: 30000, // 30 second timeout
          },
        );

        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(
            response.data.message || "Unknown error from TTS API",
          );
        }
      } catch (err) {
        console.error("Polly TTS error:", err.response?.data || err.message);
        setError(err.response?.data?.message || err.message);
        setIsLoading(false);
        throw err;
      }
    },
    [backend_URL],
  );

  /**
   * Use browser native TTS (for Chrome Desktop)
   * Maps agent names to browser voices
   * @private
   */
  const useBrowserNativeTTS = useCallback((text, agentName) => {
    return new Promise((resolve, reject) => {
      try {
        // Only cancel if something is actually pending or playing
        if (window.speechSynthesis.pending || window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          // Small delay to let cancel complete
          setTimeout(() => {
            speakWithNativeTTS(text, agentName, resolve, reject);
          }, 50);
        } else {
          speakWithNativeTTS(text, agentName, resolve, reject);
        }
      } catch (err) {
        console.error("Browser native TTS error:", err);
        setError(err.message);
        reject(err);
      }
    });
  }, []);

  /**
   * Helper to speak with native TTS
   * @private
   */
  const speakWithNativeTTS = useCallback(async (text, agentName, resolve, reject) => {
    try {
      // Voice mapping for browser native TTS with unique pitch and speed for each agent
      const voiceConfig = {
        Sophia: {
          gender: "female",
          pitch: 1.0, // Higher pitched female
          // Slightly faster
          keywords: ["Google US English", "Samantha", "Female"],
        },
        Rohan: {
          gender: "male",
          pitch: 1.1, // Higher pitched male
          rate: 1.0, // Slightly slower
          keywords: ["Google UK English Male", "David", "Male"],
        },
        Marcus: {
          gender: "male",
          pitch: 0.9, // Lower pitched male
          rate: 1.0, // Normal speed
          keywords: ["Google UK English Male", "David", "Male"],
        },
        Emma: {
          gender: "female",
          pitch: 1.3, // Neutral female
          // Fast
          keywords: ["Google US English", "Samantha", "Female"],
        },
        Drew: {
          gender: "male",
          pitch: 1.2, // Medium-high pitched male
          rate: 0.9, // Slower
          keywords: ["Google UK English Male", "David", "Male"],
        },
        Rachel: {
          gender: "female",
          pitch: 0.8, // Lower pitched female
          // Slightly faster
          keywords: ["Google US English", "Samantha", "Female"],
        },
      };

      const config = voiceConfig[agentName] || {
        gender: "female",
        pitch: 1.0,
        rate: 1.0,
        keywords: ["Google US English"],
      };

      // Validate rate and pitch are finite numbers
      const validRate =
        typeof config.rate === "number" && isFinite(config.rate)
          ? config.rate
          : 1.0;
      const validPitch =
        typeof config.pitch === "number" && isFinite(config.pitch)
          ? config.pitch
          : 1.0;

      const voices = await getReadyBrowserVoices();
      let selectedVoice = null;

      // Try to find voice by keywords
      for (const keyword of config.keywords) {
        selectedVoice = voices.find(
          (v) => v.name.includes(keyword) && v.lang.includes("en"),
        );
        if (selectedVoice) break;
      }

      // Fallback to first English voice
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.includes("en"));
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = validRate; // Use validated rate
      utterance.pitch = validPitch; // Use validated pitch
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsPlaying(true);
        setError(null);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        utteranceRef.current = null;
        resolve(true);
      };

      utterance.onerror = (event) => {
        // Only reject on actual errors, not on interrupts during normal flow
        if (event.error !== "interrupted") {
          setIsPlaying(false);
          utteranceRef.current = null;
          const errorMsg = `Speech synthesis error: ${event.error}`;
          setError(errorMsg);
          reject(new Error(errorMsg));
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Browser native TTS error:", err);
      setError(err.message);
      reject(err);
    }
  }, [getReadyBrowserVoices]);

  /**
   * Get or generate audio
   * @private
   */
  const getOrGenerateAudio = useCallback(
    async (text, voiceId) => {
      try {
        // 1. Check local cache first
        const cacheKey = `${text}:${voiceId}`;
        const cachedAudio = await audioCache.getAudioByTextAndVoice(
          text,
          voiceId,
        );

        if (cachedAudio) {
          return {
            audioBase64: await audioCache.blobToBase64(cachedAudio.audio),
            cacheId: cachedAudio.cacheId,
            fromCache: true,
          };
        }

        // 2. Fetch from Polly API
        const pollyResponse = await fetchAudioFromPolly(text, voiceId);

        if (!pollyResponse) {
          throw new Error("Failed to fetch audio from Polly");
        }

        // 3. Cache the audio (non-blocking - don't fail if cache fails)
        try {
          const audioBlob = audioCache.base64ToBlob(pollyResponse.audioBase64);
          await audioCache.saveAudio(
            pollyResponse.cacheId,
            text,
            pollyResponse.voiceId,
            audioBlob,
          );
        } catch (cacheErr) {
          console.warn(
            "Failed to cache audio (will still play):",
            cacheErr.message,
          );
          // Don't throw - audio can still play without cache
        }

        return {
          ...pollyResponse,
          fromCache: false,
        };
      } catch (err) {
        console.error("Error getting audio:", err);
        throw err;
      }
    },
    [fetchAudioFromPolly],
  );

  /**
   * Process audio queue
   * @private
   */
  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current || audioQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;

    try {
      while (audioQueueRef.current.length > 0) {
        const { text, voiceId, onComplete, onError } =
          audioQueueRef.current.shift();

        try {
          // Rate limiting: minimum 100ms between requests
          const timeSinceLastSpeak = Date.now() - lastSpeakTimeRef.current;
          if (timeSinceLastSpeak < 100) {
            await new Promise((resolve) =>
              setTimeout(resolve, 100 - timeSinceLastSpeak),
            );
          }

          lastSpeakTimeRef.current = Date.now();

          // Get or generate audio
          const audioData = await getOrGenerateAudio(text, voiceId);

          // Play audio
          await playerRef.current.play(audioData.audioBase64, {
            volume: 1.0,
          });

          setIsPlaying(false);
          onComplete?.();
        } catch (err) {
          console.error("Queue processing error:", err);
          setError(err.message);
          onError?.(err);
        }
      }
    } finally {
      isProcessingQueue.current = false;
    }
  }, [getOrGenerateAudio]);

  /**
   * Main speak function - Hybrid approach
   * Uses browser native TTS for Chrome Desktop
   * Falls back to AWS Polly for other browsers/devices
   */
  const speakText = useCallback(
    (text, voiceId = "Sophia", options = {}) => {
      return new Promise((resolve, reject) => {
        try {
          if (!text || text.trim().length === 0) {
            throw new Error("Text cannot be empty");
          }

          if (text.length > 3000) {
            throw new Error("Text exceeds maximum length of 3000 characters");
          }

          setError(null);

          // Resolve agent name to voice ID if needed
          const agentNames = [
            "Sophia",
            "Rohan",
            "Marcus",
            "Emma",
            "Drew",
            "Rachel",
          ];
          const isAgentName = agentNames.includes(voiceId);
          const resolvedVoiceId = isAgentName
            ? getVoiceIdFromAgent(voiceId)
            : voiceId;

          setCurrentVoiceId(resolvedVoiceId);

          // Use browser native TTS if available and enabled
          if (ttsBehaviorRef.useBrowserNative) {
            useBrowserNativeTTS(text, voiceId)
              .then(() => {
                options.onComplete?.();
                resolve(true);
              })
              .catch((err) => {
                options.onError?.(err);
                reject(err);
              });
          } else {
            // Use AWS Polly (original queue-based approach)
            // Add to queue with promise callbacks
            audioQueueRef.current.push({
              text,
              voiceId: resolvedVoiceId,
              onComplete: () => {
                options.onComplete?.();
                resolve(true);
              },
              onError: (err) => {
                options.onError?.(err);
                reject(err);
              },
            });

            // Process queue
            processQueue().catch(reject);
          }
        } catch (err) {
          console.error("Speak error:", err);
          setError(err.message);
          options.onError?.(err);
          reject(err);
        }
      });
    },
    [useBrowserNativeTTS, processQueue],
  );

  /**
   * Stop speaking immediately
   * Works for both browser native and Polly
   */
  const stopSpeaking = useCallback(() => {
    // Stop browser native TTS
    window.speechSynthesis.cancel();
    utteranceRef.current = null;

    // Stop Polly audio
    if (playerRef.current) {
      playerRef.current.stop();
    }

    // Cancel pending request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    // Clear queue
    audioQueueRef.current = [];
    isProcessingQueue.current = false;

    setIsPlaying(false);
    setError(null);
  }, []);

  /**
   * Pause speaking
   */
  const pauseSpeaking = useCallback(() => {
    // Pause browser native TTS
    window.speechSynthesis.pause();

    // Pause Polly audio
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  /**
   * Resume speaking
   */
  const resumeSpeaking = useCallback(() => {
    // Resume browser native TTS
    window.speechSynthesis.resume();

    // Resume Polly audio
    if (playerRef.current && !playerRef.current.getIsPlaying()) {
      playerRef.current.resume();
      setIsPlaying(true);
    }
  }, []);

  /**
   * Set volume (0.0 - 1.0)
   */
  const setVolume = useCallback((volume) => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, []);

  /**
   * Get available voices
   */
  const getAvailableVoices = useCallback(async () => {
    try {
      const response = await axios.get(`${backend_URL}/api/tts/voices`);
      return response.data.voices;
    } catch (err) {
      console.error("Error fetching voices:", err);
      throw err;
    }
  }, [backend_URL]);

  /**
   * Clear audio cache
   */
  const clearCache = useCallback(async () => {
    try {
      await audioCache.clearAllCache();
    } catch (err) {
      console.error("Error clearing cache:", err);
    }
  }, []);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(async () => {
    try {
      return await audioCache.getCacheSize();
    } catch (err) {
      console.error("Error getting cache stats:", err);
      return null;
    }
  }, []);

  return {
    // Core functions
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,

    // State
    isPlaying,
    isLoading,
    error,
    currentVoiceId,

    // Settings
    setVolume,

    // Utilities
    getAvailableVoices,
    clearCache,
    getCacheStats,
  };
};

export default usePollyTTS;
