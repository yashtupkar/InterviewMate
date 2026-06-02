import { useState, useCallback, useRef, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { AppContext } from "../context/AppContext";
import { getAudioPlayer } from "../utils/audioPlayer";
import * as audioCache from "../utils/audioCache";
import { getVoiceIdFromAgent } from "../constants/edgeVoices";
import {
  shouldUseBrowserNativeTTS,
  logTTSBackendSelection,
} from "../utils/browserDetection";

/**
 * Custom Hook for Hybrid Edge-TTS Integration
 * Strategy:
 * - Chrome: Use browser native speech (Web Speech API - fast, free)
 * - All other browsers: Use Edge-TTS via backend (consistent, premium neural voices)
 *
 * Usage:
 * const { speakText, stopSpeaking, isPlaying } = useEdgeTTS();
 * await speakText("Hello world", "Sophia");
 */
export const useEdgeTTS = () => {
  const { backend_URL } = useContext(AppContext);
  const { getToken } = useAuth();

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

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnd = () => setIsPlaying(false);
    const handleError = (err) => {
      setError(err?.message || "Audio playback error");
      setIsPlaying(false);
    };

    // Setup player event listeners
    if (playerRef.current) {
      playerRef.current.on("onPlay", handlePlay);
      playerRef.current.on("onPause", handlePause);
      playerRef.current.on("onEnd", handleEnd);
      playerRef.current.on("onError", handleError);
    }

    // Initialize audio cache
    audioCache.initDB().catch((err) => {
      console.warn("Audio cache initialization failed:", err);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.off("onPlay", handlePlay);
        playerRef.current.off("onPause", handlePause);
        playerRef.current.off("onEnd", handleEnd);
        playerRef.current.off("onError", handleError);
      }
      // Cancel any ongoing speech synthesis
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Chrome loads voices lazily. Prime and wait once so first click uses the intended voice.
  useEffect(() => {
    if (!ttsBehaviorRef.useBrowserNative || typeof window === "undefined" || !window.speechSynthesis) {
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
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.removeEventListener(
            "voiceschanged",
            handleVoicesChanged,
          );
          resolve(window.speechSynthesis.getVoices());
        } else {
          resolve([]);
        }
      }, 1500);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [ttsBehaviorRef.useBrowserNative]);

  const getReadyBrowserVoices = useCallback(async () => {
    if (!ttsBehaviorRef.useBrowserNative || typeof window === "undefined" || !window.speechSynthesis) {
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
   * Fetch audio from Edge-TTS API
   * @private
   */
  const fetchAudioFromEdgeTTS = useCallback(
    async (text, voiceId, silent = false) => {
      try {
        if (!silent) {
          setIsLoading(true);
          setError(null);
        }

        const token = await getToken();
        if (!token) {
          throw new Error("No authentication token available. Please sign in again.");
        }

        const payload = {
          text: text.trim(),
          voiceId: voiceId || "en-US-AriaNeural",
          engine: "neural",
        };

        const response = await axios.post(
          `${backend_URL}/api/tts/generate`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: abortControllerRef.current?.signal,
            timeout: 30000, // 30 second timeout
          },
        );

        if (response.data.success) {
          if (!silent) {
            setIsLoading(false);
          }
          return response.data;
        } else {
          throw new Error(
            response.data.message || "Unknown error from TTS API",
          );
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }
        console.error("Edge-TTS API error:", err.response?.data || err.message);
        if (!silent) {
          setError(err.response?.data?.message || err.message);
          setIsLoading(false);
        }
        throw err;
      }
    },
    [backend_URL, getToken],
  );

  /**
   * Fetch streaming ticket from Edge-TTS API
   * @private
   */
  const fetchTicketFromEdgeTTS = useCallback(
    async (text, voiceId) => {
      try {
        setIsLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error("No authentication token available. Please sign in again.");
        }

        const payload = {
          text: text.trim(),
          voiceId: voiceId || "Sophia",
          engine: "neural",
        };

        const response = await axios.post(
          `${backend_URL}/api/tts/ticket`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: abortControllerRef.current?.signal,
            timeout: 10000, // 10 second timeout for ticket
          },
        );

        if (response.data.success) {
          setIsLoading(false);
          return response.data.ticketId;
        } else {
          throw new Error(
            response.data.message || "Unknown error from TTS ticket API",
          );
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }
        console.error("Edge-TTS ticket API error:", err.response?.data || err.message);
        setError(err.response?.data?.message || err.message);
        setIsLoading(false);
        throw err;
      }
    },
    [backend_URL, getToken],
  );

  /**
   * Use browser native TTS (for Chrome)
   * Maps agent names to browser voices
   * @private
   */
  const useBrowserNativeTTS = useCallback((text, agentName) => {
    return new Promise((resolve, reject) => {
      try {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          throw new Error("Speech synthesis not supported in this environment");
        }

        // Only cancel if something is actually pending or speaking
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
      if (typeof window === "undefined" || !window.speechSynthesis) {
        throw new Error("Speech synthesis not supported");
      }

      // Voice mapping for browser native TTS with unique pitch and speed for each agent
      const voiceConfig = {
        Sophia: {
          gender: "female",
          pitch: 1.0,
          keywords: ["Google US English", "Samantha", "Female"],
        },
        Rohan: {
          gender: "male",
          pitch: 1.15, // Refined/intellectual tone
          rate: 1.05, // Swift/analytical pace
          keywords: [
            "Google UK English Male",
            "Microsoft David",
            "David",
            "Google US English Male",
            "Alex",
            "Male",
          ],
        },
        Marcus: {
          gender: "male",
          pitch: 0.85, // Bold/deeper voice
          rate: 0.95, // Deliberate/commanding pace
          keywords: ["Google UK English Male", "Daniel", "David", "Male"],
        },
        Emma: {
          gender: "female",
          pitch: 1.25, // Energetic/creative tone
          keywords: ["Google UK English Female", "Google UK English", "Samantha", "Female"],
        },
        Drew: {
          gender: "male",
          pitch: 1.1,
          rate: 0.9, // Slower and deliberate
          keywords: [
            "Google India English Male",
            "Google IN English Male",
            "Microsoft David",
            "Male",
          ],
        },
        Rachel: {
          gender: "female",
          pitch: 0.8,
          keywords: ["Google US English", "Samantha", "Female"],
        },
      };

      const config = voiceConfig[agentName] || {
        gender: "female",
        pitch: 1.0,
        rate: 1.0,
        keywords: [agentName, "Google US English"],
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
      utterance.rate = validRate;
      utterance.pitch = validPitch;
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

        // 2. Fetch from Edge-TTS API
        const ttsResponse = await fetchAudioFromEdgeTTS(text, voiceId);

        if (!ttsResponse) {
          throw new Error("Failed to fetch audio from Edge-TTS backend");
        }

        // 3. Cache the audio (non-blocking)
        try {
          const audioBlob = audioCache.base64ToBlob(ttsResponse.audioBase64);
          await audioCache.saveAudio(
            ttsResponse.cacheId,
            text,
            ttsResponse.voiceId,
            audioBlob,
          );
        } catch (cacheErr) {
          console.warn(
            "Failed to cache audio (will still play):",
            cacheErr.message,
          );
        }

        return {
          ...ttsResponse,
          fromCache: false,
        };
      } catch (err) {
        console.error("Error getting Edge-TTS audio:", err);
        throw err;
      }
    },
    [fetchAudioFromEdgeTTS],
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
          const timeSinceLastSpeak = Date.now() - lastSpeakTimeRef.current;
          if (timeSinceLastSpeak < 100) {
            await new Promise((resolve) =>
              setTimeout(resolve, 100 - timeSinceLastSpeak),
            );
          }

          lastSpeakTimeRef.current = Date.now();

          // 1. Check local IndexedDB cache first
          const cachedAudio = await audioCache.getAudioByTextAndVoice(
            text,
            voiceId,
          );

          if (cachedAudio) {
            const base64 = await audioCache.blobToBase64(cachedAudio.audio);
            await playerRef.current.play(base64, { volume: 1.0 });
          } else {
            // 2. Cache miss: fetch a streaming ticket first for low-latency streaming
            const ticketId = await fetchTicketFromEdgeTTS(text, voiceId);

            if (ticketId) {
              const streamUrl = `${backend_URL}/api/tts/stream-ticket/${ticketId}`;

              // Start background generation and caching (non-blocking, silent)
              fetchAudioFromEdgeTTS(text, voiceId, true)
                .then(async (ttsResponse) => {
                  if (ttsResponse && ttsResponse.audioBase64) {
                    const audioBlob = audioCache.base64ToBlob(ttsResponse.audioBase64);
                    await audioCache.saveAudio(
                      ttsResponse.cacheId,
                      text,
                      ttsResponse.voiceId,
                      audioBlob,
                    );
                  }
                })
                .catch((cacheErr) => {
                  console.warn("Background audio generation/caching failed:", cacheErr);
                });

              // Stream using HTML5 audio via public ticket-based URL
              await playerRef.current.playFromUrl(streamUrl, { volume: 1.0 });
            } else {
              throw new Error("Failed to generate stream ticket");
            }
          }

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
  }, [fetchAudioFromEdgeTTS, fetchTicketFromEdgeTTS, backend_URL]);

  /**
   * Main speak function - Hybrid approach
   * Uses browser native TTS for Chrome
   * Falls back to Edge-TTS via backend for other browsers/devices
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
            // Use Edge-TTS backend service
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
   */
  const stopSpeaking = useCallback(() => {
    // Stop browser native TTS
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;

    // Stop audio player
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
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }

    // Pause audio player
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
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }

    // Resume audio player
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
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available. Please sign in again.");
      }
      const response = await axios.get(`${backend_URL}/api/tts/voices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.voices;
    } catch (err) {
      console.error("Error fetching voices:", err);
      throw err;
    }
  }, [backend_URL, getToken]);

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
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    isPlaying,
    isLoading,
    error,
    currentVoiceId,
    setVolume,
    getAvailableVoices,
    clearCache,
    getCacheStats,
  };
};

export default useEdgeTTS;
