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
  const committedFinalTextRef = useRef("");

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
      const selectedStillAvailable = audioInputs.some(
        (input) => input.deviceId === selectedDeviceId,
      );
      if (!selectedDeviceId || !selectedStillAvailable) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
    } catch {
      // Device listing failed silently — not critical
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

  const startListening = useCallback(async () => {
    setError("");

    const SR = getSpeechRecognition();
    if (!SR) {
      setBrowserSupported(false);
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome on Android or Safari on iOS.",
      );
      return;
    }

    // Clean stop before restarting
    stopListening();
    await new Promise((r) => setTimeout(r, 150));

    stopRequestedRef.current = false;
    committedFinalTextRef.current = "";
    setDisplayTranscript("");

    // Request mic permission explicitly before starting recognition
    // Required on iOS Safari and many Android browsers
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately release the stream — STT manages mic on its own
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setError(
        "Microphone permission denied. Please allow microphone access and try again.",
      );
      return;
    }

    // Enumerate devices now that permission is granted
    await refreshDevices();

    // Always create a fresh instance — reusing causes silent failures on mobile
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      committedFinalTextRef.current = "";
      isListeningRef.current = true;
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      // Only process NEW results from e.resultIndex
      // Starting from 0 causes every word to repeat on each new event (Android bug)
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          committedFinalTextRef.current += event.results[i][0].transcript + " ";
        }
      }

      // Only grab the latest interim chunk
      let latestInterim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) {
          latestInterim += event.results[i][0].transcript;
        }
      }

      // Display = confirmed finals + live interim
      const display = (committedFinalTextRef.current + latestInterim).trim();
      if (display) {
        setDisplayTranscript(display);
      }
    };

    recognition.onerror = (event) => {
      // Non-fatal — will auto-restart via onend
      if (["aborted", "no-speech", "network"].includes(event.error)) return;

      committedFinalTextRef.current = "";

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
      // Do NOT reset committedFinalTextRef here —
      // mobile restarts recognition constantly mid-sentence,
      // resetting would wipe in-progress speech.
      // Only reset on explicit stopListening() or new session start.

      if (
        !stopRequestedRef.current &&
        isListeningRef.current &&
        recognitionRef.current
      ) {
        restartTimerRef.current = setTimeout(() => {
          try {
            if (
              recognitionRef.current &&
              isListeningRef.current &&
              !stopRequestedRef.current
            ) {
              recognitionRef.current.start();
            }
          } catch {
            // Ignore restart failures
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
  }, [getSpeechRecognition, refreshDevices, stopListening]);

  const clearTranscript = useCallback(() => {
    committedFinalTextRef.current = "";
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
