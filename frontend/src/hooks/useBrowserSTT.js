import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Reusable hook to handle real-time Speech-to-Text using the browser's native Web Speech API.
 * 
 * @param {Object} config
 * @param {string} config.language ISO language code (default: 'en-IN')
 * @param {Function} config.onSpeechStarted Event handler for speech start
 * @param {Function} config.onUtteranceEnd Event handler for utterance completed
 * @param {Function} config.onTranscript Event handler for new transcript pieces: ({ transcript, isFinal, confidence })
 * @param {Function} config.onError Event handler for hardware capture or permission failures
 */
export function useBrowserSTT({
  language = "en-IN",
  onSpeechStarted,
  onUtteranceEnd,
  onTranscript,
  onError
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const mutedRef = useRef(false);
  const speechStartedRef = useRef(false);

  const stopSTT = useCallback(() => {
    stopRequestedRef.current = true;
    setIsListening(false);
    isListeningRef.current = false;
    setInterimTranscript("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onspeechstart = null;
        recognitionRef.current.onspeechend = null;
        recognitionRef.current.abort();
      } catch (e) {
        console.error("[STT:Browser] Error stopping SpeechRecognition:", e);
      }
      recognitionRef.current = null;
    }
  }, []);

  const startSTT = useCallback(() => {
    setError("");
    stopRequestedRef.current = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const err = "Your browser does not support Speech Recognition.";
      setError(err);
      onError?.(err);
      return;
    }

    try {
      stopSTT();
      stopRequestedRef.current = false;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onspeechstart = () => {
        if (mutedRef.current) return;
        if (!speechStartedRef.current) {
          speechStartedRef.current = true;
          onSpeechStarted?.();
        }
      };

      recognition.onspeechend = () => {
        if (mutedRef.current) return;
        speechStartedRef.current = false;
        onUtteranceEnd?.();
      };

      recognition.onresult = (event) => {
        if (mutedRef.current) return;

        let interimText = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcriptChunk = result[0].transcript;
          const isFinal = result.isFinal;
          const confidence = result[0].confidence;

          if (isFinal) {
            finalChunk += transcriptChunk;
            onTranscript?.({ transcript: transcriptChunk, isFinal: true, confidence });
          } else {
            interimText += transcriptChunk;
            onTranscript?.({ transcript: transcriptChunk, isFinal: false, confidence });
          }
        }

        if (finalChunk) {
          setFinalTranscript((prev) => `${prev} ${finalChunk}`.trim());
          setInterimTranscript(interimText);
        } else {
          setInterimTranscript(interimText);
        }
      };

      recognition.onerror = (event) => {
        console.warn("[STT:Browser] SpeechRecognition error event:", event.error);
        if (event.error === "not-allowed") {
          const err = "Microphone access blocked.";
          setError(err);
          onError?.(err);
          stopSTT();
        } else if (event.error === "network") {
          console.warn("[STT:Browser] Network error in SpeechRecognition.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
        // If not explicitly requested to stop, restart it to keep listening continuously
        if (!stopRequestedRef.current) {
          console.log("[STT:Browser] Recognition ended, restarting in 300ms...");
          setTimeout(() => {
            if (!stopRequestedRef.current && recognitionRef.current === recognition) {
              try {
                recognition.start();
              } catch (e) {
                console.error("[STT:Browser] Failed to restart recognition:", e);
              }
            }
          }, 300);
        }
      };

      recognition.start();
    } catch (err) {
      console.error("[STT:Browser] SpeechRecognition initialization error:", err);
      setError(err.message);
      onError?.(err.message);
      stopSTT();
    }
  }, [language, onSpeechStarted, onUtteranceEnd, onTranscript, onError, stopSTT]);

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
    volume: 0,
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
