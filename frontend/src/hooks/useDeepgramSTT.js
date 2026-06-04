import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { createPCMRecorder } from "../utils/pcmRecorder";

/**
 * Production-grade reusable hook to handle real-time Speech-to-Text streaming with Deepgram.
 * 
 * @param {Object} config
 * @param {string} config.backendUrl Backend application URL for fetching tokens
 * @param {Function} config.getToken Clerk or JWT secure token generator function
 * @param {string} config.model Deepgram model to use (default: 'nova-2')
 * @param {string} config.language ISO language code (default: 'en-IN')
 * @param {Array<string>} config.keywords Static vocab/boosting keywords list
 * @param {Function} config.onSpeechStarted Event handler for Deepgram VAD speech start
 * @param {Function} config.onUtteranceEnd Event handler for Deepgram VAD utterance completed
 * @param {Function} config.onTranscript Event handler for new transcript pieces: ({ transcript, isFinal, confidence })
 * @param {Function} config.onVolume Event handler for visual meter updates
 * @param {Function} config.onError Event handler for connection or hardware capture failures
 */
export function useDeepgramSTT({
  backendUrl,
  getToken,
  model = "nova-3",
  language = "en-IN",
  keywords = [],
  initialMuted = false,
  onSpeechStarted,
  onUtteranceEnd,
  onTranscript,
  onVolume,
  onError
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const socketRef = useRef(null);
  const pcmRecorderRef = useRef(null);
  const isListeningRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const streamRef = useRef(null);
  const mutedRef = useRef(initialMuted);

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  const stopSTT = useCallback(() => {
    stopRequestedRef.current = true;
    setIsListening(false);
    isListeningRef.current = false;
    setInterimTranscript("");
    setVolume(0);

    if (pcmRecorderRef.current) {
      try {
        pcmRecorderRef.current.stop();
      } catch (e) {
        console.error("[STT:Hook] Error stopping PCM recorder:", e);
      }
      pcmRecorderRef.current = null;
    }

    if (socketRef.current) {
      try {
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.close();
      } catch (e) {
        console.error("[STT:Hook] Error closing WebSocket:", e);
      }
      socketRef.current = null;
    }

    stopMediaStream();
  }, [stopMediaStream]);

  const startSTT = useCallback(async (dynamicKeywords = []) => {
    setError("");
    stopRequestedRef.current = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      const err = "Your browser does not support microphone access.";
      setError(err);
      onError?.(err);
      return;
    }

    try {
      stopSTT();
      stopRequestedRef.current = false;

      const baseAudioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: baseAudioConstraints,
      });

      streamRef.current = stream;

      // Retrieve temporary token from backend
      const tokenResp = await getToken();
      const res = await axios.post(
        `${backendUrl}/api/stt/token`,
        {},
        { headers: { Authorization: `Bearer ${tokenResp}` } }
      );

      const token = res.data.token;
      if (!token) {
        throw new Error("No token returned from backend");
      }

      // Build Deepgram WebSocket URL with query parameters
      const params = new URLSearchParams({
        encoding: "linear16",
        sample_rate: "16000",
        channels: "1",
        smart_format: "true",
        model: model,
        language: language,
        interim_results: "true",
        utterance_end_ms: "1000",
        vad_events: "true"
      });

      let wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

      // Combine static and dynamic keywords
      const allKeywords = [...(keywords || []), ...(dynamicKeywords || [])];
      const isNova3OrFlux = model && (model.includes("nova-3") || model.includes("flux"));
      allKeywords.forEach((term) => {
        if (isNova3OrFlux) {
          wsUrl += `&keyterm=${encodeURIComponent(term)}`;
        } else {
          wsUrl += `&keywords=${encodeURIComponent(term)}:2`;
        }
      });

      const ws = new WebSocket(wsUrl, ["token", token]);
      socketRef.current = ws;

      ws.onopen = async () => {
        isListeningRef.current = true;
        setIsListening(true);

        try {
          const recorder = await createPCMRecorder(
            stream,
            (pcm16Buffer) => {
              if (ws.readyState === WebSocket.OPEN && !mutedRef.current) {
                ws.send(pcm16Buffer);
              }
            },
            (vol) => {
              setVolume(vol);
              onVolume?.(vol);
            }
          );
          pcmRecorderRef.current = recorder;
        } catch (err) {
          console.error("[STT:Hook] Failed to start PCM Recorder:", err);
          setError("Failed to start PCM Recorder: " + err.message);
          onError?.(err.message);
          stopSTT();
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "SpeechStarted") {
          onSpeechStarted?.();
          return;
        } else if (data.type === "UtteranceEnd") {
          onUtteranceEnd?.();
          return;
        }

        const alternative = data.channel?.alternatives?.[0];
        const transcriptChunk = alternative?.transcript || "";
        const isFinal = data.is_final;
        const confidence = alternative?.confidence || 0;

        if (transcriptChunk.trim()) {
          onTranscript?.({ transcript: transcriptChunk, isFinal, confidence });

          if (isFinal) {
            setFinalTranscript((prev) => `${prev} ${transcriptChunk}`.trim());
            setInterimTranscript("");
          } else {
            setInterimTranscript(transcriptChunk);
          }
        }
      };

      ws.onerror = (err) => {
        console.error("[STT:Hook] Deepgram WebSocket error:", err);
      };

      ws.onclose = () => {
        if (!stopRequestedRef.current && isListeningRef.current) {
          console.log("[STT:Hook] Connection closed unexpectedly. Reconnecting in 1000ms...");
          setTimeout(() => startSTT(dynamicKeywords), 1000);
        }
      };

    } catch (err) {
      console.error("[STT:Hook] Deepgram STT connection error:", err);
      const errMsg = err.message || "Failed to initialize speech recognition.";
      setError(errMsg);
      onError?.(errMsg);
      stopSTT();
    }
  }, [backendUrl, getToken, model, language, keywords, onSpeechStarted, onUtteranceEnd, onTranscript, onVolume, onError, stopSTT]);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setIsMuted(next);
  }, []);

  const setMuted = useCallback((value) => {
    mutedRef.current = value;
    setIsMuted(value);
  }, []);

  const clearTranscript = useCallback(() => {
    setFinalTranscript("");
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      stopSTT();
    };
  }, [stopSTT]);

  const liveText = `${finalTranscript} ${interimTranscript}`.trim();

  return {
    isListening,
    isMuted,
    setMuted,
    volume,
    error,
    liveText,
    finalTranscript,
    interimTranscript,
    startSTT,
    stopSTT,
    toggleMute,
    clearTranscript
  };
}
