import { useCallback, useEffect, useMemo, useState, useContext } from "react";
import "./MicTest.css";
import { useAuth, useUser } from "@clerk/clerk-react";
import { AppContext } from "../context/AppContext";
import { useDeepgramSTT } from "../hooks/useDeepgramSTT";

function MicTest() {
  const { backend_URL } = useContext(AppContext);
  const { getToken } = useAuth();
  const { user } = useUser();
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  // Consume our unified reusable STT hook
  const {
    isListening,
    volume,
    error,
    finalTranscript,
    interimTranscript,
    startSTT,
    stopSTT,
    clearTranscript
  } = useDeepgramSTT({
    backendUrl: backend_URL,
    getToken,
    model: "nova-3",
    language: "en-IN",
    keywords: [
      user?.fullName,
      user?.firstName,
      user?.lastName,
      user?.primaryEmailAddress?.emailAddress,
      "tupkar",
      "Chhindwara",
      "Sausar",
      "Madhya Pradesh",
      "PlaceMateAI",
    ]
      .filter(Boolean)
      .flatMap((item) => (typeof item === "string" ? item.split(/[\s@.]+/) : []))
      .filter((word) => word.length > 0),
    onTranscript: ({ transcript, isFinal, confidence }) => {
      // Keep logging details for developers/debugging
      console.log(
        `[STT:MicTest:DG] Transcript received: "${transcript}" | Confidence: ${confidence.toFixed(4)} | IsFinal: ${isFinal}`
      );
    },
    onSpeechStarted: () => {
      console.log("%c[STT:MicTest:VAD] Speech STARTED detected by Deepgram VAD", "color: #22c55e; font-weight: bold;");
    },
    onUtteranceEnd: () => {
      console.log("%c[STT:MicTest:VAD] Speech ENDED (Utterance concluded) detected by Deepgram VAD", "color: #f59e0b; font-weight: bold;");
    }
  });

  const speechRecognitionSupported = useMemo(
    () => Boolean(window.AudioContext || window.webkitAudioContext),
    [],
  );

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
      console.warn("Could not load microphone devices.");
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    refreshDevices();
    navigator.mediaDevices?.addEventListener("devicechange", refreshDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener("devicechange", refreshDevices);
    };
  }, [refreshDevices]);

  const transcriptText = `${finalTranscript} ${interimTranscript}`.trim();

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
            <span className={isListening ? "mic-live-dot active" : "mic-live-dot"}>
              {isListening ? "Listening" : "Idle"}
            </span>
          </div>
          <div className="mic-transcript-box">
            {transcriptText ||
              (isListening
                ? "Speak now. Your words will appear here in real time."
                : "Start the test to show your live transcript here.")}
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
              onClick={() => startSTT()}
              disabled={isListening}
            >
              Start Test
            </button>
            <button
              type="button"
              onClick={stopSTT}
              disabled={!isListening}
            >
              Stop
            </button>
            <button type="button" onClick={clearTranscript}>
              Clear
            </button>
          </div>
        </div>

        <div className="mic-volume-wrap">
          <span>Input level</span>
          <div className="mic-volume-track" aria-hidden="true">
            <div className="mic-volume-fill" style={{ width: `${volume}%` }} />
          </div>
        </div>

        {error && <p className="mic-error">{error}</p>}

        {!speechRecognitionSupported && (
          <p className="mic-note">
            Live transcript is not supported in this browser. Use Chrome or Edge
            for speech-to-text.
          </p>
        )}
      </div>
    </div>
  );
}

export default MicTest;
