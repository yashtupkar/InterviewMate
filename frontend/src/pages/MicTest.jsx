import { useCallback, useEffect, useRef, useState } from "react";
import "./MicTest.css";

function MicTest() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [displayTranscript, setDisplayTranscript] = useState("");
  const [error, setError] = useState("");
  const [browserSupported, setBrowserSupported] = useState(true);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const restartTimerRef = useRef(null);

  // ✅ All transcript state lives here — persists across recognition restarts
  // finalSentences: array of confirmed, fully-processed strings (never re-processed)
  // currentInterim: the live partial string being spoken right now
  const finalSentencesRef = useRef([]);
  const currentInterimRef = useRef("");

  const getSpeechRecognition = useCallback(() => {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter((d) => d.kind === "audioinput");
      setDevices(audioInputs);
      if (audioInputs.length === 0) {
        setSelectedDeviceId("");
        return;
      }
      const stillAvailable = audioInputs.some(
        (input) => input.deviceId === selectedDeviceId,
      );
      if (!selectedDeviceId || !stillAvailable) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
    } catch {
      /* non-critical */
    }
  }, [selectedDeviceId]);

  const stopListening = useCallback(() => {
    stopRequestedRef.current = true;
    isListeningRef.current = false;
    setIsListening(false);

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, []);

  // ✅ Attach a fresh recognition session WITHOUT touching finalSentencesRef
  // Called both on first start and on every auto-restart
  const attachRecognition = useCallback(
    (SR) => {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        // ✅ Each new session starts its own result-index tracking from 0
        // We do NOT clear finalSentencesRef — those are already committed sentences
        isListeningRef.current = true;
        setIsListening(true);
        setError("");
      };

      recognition.onresult = (event) => {
        // ✅ CORE FIX: On every new recognition session, result indices restart from 0.
        // So we CANNOT use resultIndex to avoid reprocessing across sessions.
        // Instead we use a per-session Set to track which indices we've already
        // committed as final in THIS session only.
        // finalSentencesRef holds everything committed from ALL past sessions.

        if (!recognition._processedFinalIndices) {
          recognition._processedFinalIndices = new Set();
        }

        let newFinals = "";

        for (let i = 0; i < event.results.length; i++) {
          if (
            event.results[i].isFinal &&
            !recognition._processedFinalIndices.has(i)
          ) {
            // ✅ Mark this index as processed for THIS session — will never add it again
            recognition._processedFinalIndices.add(i);
            newFinals += event.results[i][0].transcript + " ";
          }
        }

        if (newFinals) {
          finalSentencesRef.current.push(newFinals.trim());
        }

        // ✅ Only the latest non-final result is the live interim
        let latestInterim = "";
        for (let i = event.results.length - 1; i >= 0; i--) {
          if (!event.results[i].isFinal) {
            latestInterim = event.results[i][0].transcript;
            break;
          }
        }
        currentInterimRef.current = latestInterim;

        // ✅ Build display: all committed sentences + current interim
        const committed = finalSentencesRef.current.join(" ");
        const display = (committed + " " + latestInterim).trim();
        setDisplayTranscript(display);
      };

      recognition.onerror = (event) => {
        // Non-fatal — will auto-restart via onend
        if (["aborted", "no-speech", "network"].includes(event.error)) return;

        if (event.error === "not-allowed") {
          setError("Microphone permission denied. Please allow mic access.");
          stopListening();
          return;
        }
        if (event.error === "audio-capture") {
          setError("No microphone detected. Please connect a microphone.");
          return;
        }
        setError(`Speech recognition error: ${event.error}`);
      };

      recognition.onend = () => {
        // ✅ On unexpected end (very common on Android), restart recognition.
        // finalSentencesRef is preserved — new session picks up from where we left off.
        // Each new session gets its own _processedFinalIndices Set starting fresh.
        if (
          !stopRequestedRef.current &&
          isListeningRef.current &&
          recognitionRef.current
        ) {
          restartTimerRef.current = setTimeout(() => {
            try {
              if (
                !stopRequestedRef.current &&
                isListeningRef.current &&
                recognitionRef.current
              ) {
                recognitionRef.current.start();
              }
            } catch {
              /* ignore rapid restart failures */
            }
          }, 150);
        }
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch (e) {
        setError("Failed to start speech recognition. Please try again.");
      }
    },
    [stopListening],
  );

  const startListening = useCallback(async () => {
    setError("");

    const SR = getSpeechRecognition();
    if (!SR) {
      setBrowserSupported(false);
      setError(
        "Speech recognition not supported. Use Chrome on Android or Safari on iOS.",
      );
      return;
    }

    // Clean stop before restarting
    stopListening();
    await new Promise((r) => setTimeout(r, 150));

    stopRequestedRef.current = false;

    // ✅ Full reset of transcript state on new session start
    finalSentencesRef.current = [];
    currentInterimRef.current = "";
    setDisplayTranscript("");

    // Request mic permission explicitly upfront
    // Required on iOS Safari and many Android browsers before SR will work
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release immediately — SpeechRecognition manages mic itself
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setError(
        "Microphone permission denied. Please allow microphone access and try again.",
      );
      return;
    }

    await refreshDevices();
    attachRecognition(SR);
  }, [getSpeechRecognition, refreshDevices, stopListening, attachRecognition]);

  const clearTranscript = useCallback(() => {
    finalSentencesRef.current = [];
    currentInterimRef.current = "";
    setDisplayTranscript("");
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setBrowserSupported(false);
    refreshDevices();
    const handleDeviceChange = () => refreshDevices();
    navigator.mediaDevices?.addEventListener(
      "devicechange",
      handleDeviceChange,
    );
    return () => {
      navigator.mediaDevices?.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
      stopListening();
    };
  }, []);

  return (
    <div className="mic-test-page">
      <div className="mic-test-card">
        <h1>Microphone Test</h1>
        <p className="mic-test-subtitle">
          Select a device, start listening, and verify live transcript updates.
        </p>

        <div className="mic-transcript-panel">
          <div className="mic-transcript-panel-header">
            <span>Live transcript</span>
            <span
              className={isListening ? "mic-live-dot active" : "mic-live-dot"}
            >
              {isListening ? "Listening" : "Idle"}
            </span>
          </div>
          <div className="mic-transcript-box">
            {displayTranscript
              ? displayTranscript
              : isListening
                ? "Speak now. Your words will appear here in real time."
                : "Start the test to show your live transcript here."}
          </div>
        </div>

        <div className="mic-test-controls">
          <label htmlFor="mic-device">Microphone device</label>
          <select
            id="mic-device"
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            disabled={isListening}
          >
            {devices.length === 0 && (
              <option value="">No microphone found</option>
            )}
            {devices.map((device, index) => (
              <option key={device.deviceId || index} value={device.deviceId}>
                {device.label || `Microphone ${index + 1}`}
              </option>
            ))}
          </select>

          <div className="mic-test-buttons">
            <button
              type="button"
              onClick={startListening}
              disabled={isListening}
            >
              Start Test
            </button>
            <button
              type="button"
              onClick={stopListening}
              disabled={!isListening}
            >
              Stop
            </button>
            <button type="button" onClick={clearTranscript}>
              Clear
            </button>
          </div>
        </div>

        {error && <p className="mic-error">{error}</p>}

        {!browserSupported && (
          <p className="mic-note">
            Live transcript is not supported in this browser. Please use Chrome
            on Android or Safari on iOS.
          </p>
        )}
      </div>
    </div>
  );
}

export default MicTest;
