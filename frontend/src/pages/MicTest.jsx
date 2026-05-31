import { useCallback, useEffect, useMemo, useRef, useState, useContext } from "react";
import "./MicTest.css";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import { createPCMRecorder } from "../utils/pcmRecorder";

function MicTest() {
  const { backend_URL } = useContext(AppContext);
  const { getToken } = useAuth();
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const pcmRecorderRef = useRef(null);
  const isListeningRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const streamRef = useRef(null);

  const speechRecognitionSupported = useMemo(
    () => Boolean(window.AudioContext || window.webkitAudioContext),
    [],
  );

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      console.log("[STT:MicTest] Disabling microphone track and stopping stream.");
      streamRef.current.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setError("Your browser does not support microphone device listing.");
      return;
    }

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
      setError("Could not load microphone devices.");
    }
  }, [selectedDeviceId]);

  const stopListening = useCallback(() => {
    console.log("[STT:MicTest] Stop listening requested. Cleaning up resources...");
    stopRequestedRef.current = true;
    setIsListening(false);
    isListeningRef.current = false;
    setInterimTranscript("");
    setVolume(0);

    if (pcmRecorderRef.current) {
      try {
        pcmRecorderRef.current.stop();
      } catch (e) {
        console.error("[STT:MicTest] Error stopping PCM recorder:", e);
      }
      pcmRecorderRef.current = null;
    }

    if (socketRef.current) {
      try {
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.close();
        console.log("[STT:WS] Deepgram WebSocket connection closed cleanly.");
      } catch (e) {
        console.error("[STT:MicTest] Error closing WebSocket:", e);
      }
      socketRef.current = null;
    }

    stopMediaStream();
  }, [stopMediaStream]);

  const startListening = useCallback(async () => {
    setError("");
    console.log("[STT:MicTest] Start listening requested. Requesting mic access...");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Your browser does not support microphone access.");
      return;
    }

    try {
      stopListening();
      stopRequestedRef.current = false;

      const baseAudioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: selectedDeviceId
            ? {
                ...baseAudioConstraints,
                deviceId: { exact: selectedDeviceId },
              }
            : baseAudioConstraints,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: baseAudioConstraints,
        });
      }

      streamRef.current = stream;
      await refreshDevices();

      // Fetch temporary token securely from backend
      console.log("[STT:MicTest] Fetching Deepgram token from backend...");
      const tokenResp = await getToken();
      const res = await axios.post(
        `${backend_URL}/api/stt/token`,
        {},
        { headers: { Authorization: `Bearer ${tokenResp}` } }
      );

      const token = res.data.token;
      if (!token) {
        throw new Error("Failed to get temporary token from backend");
      }
      console.log("[STT:MicTest] Deepgram token retrieved successfully.");

      console.log("[STT:MicTest] Initializing WebSocket connection to Deepgram (PCM16 config)...");
      const wsUrl = "wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1&smart_format=true&model=nova-2&language=en-US&interim_results=true&utterance_end_ms=1000&vad_events=true";
      const ws = new WebSocket(wsUrl, ["token", token]);
      socketRef.current = ws;

      ws.onopen = async () => {
        console.log("%c[STT:WS] Deepgram WebSocket connection opened successfully!", "color: green; font-weight: bold;");
        isListeningRef.current = true;
        setIsListening(true);

        try {
          // Initialize our custom downsampling PCM recorder
          const recorder = await createPCMRecorder(
            stream,
            (pcm16Buffer) => {
              if (ws.readyState === WebSocket.OPEN) {
                // Sent raw binary bytes over WebSocket
                ws.send(pcm16Buffer);
              }
            },
            (vol) => {
              setVolume(vol);
            }
          );
          pcmRecorderRef.current = recorder;
          console.log("[STT:MicTest] PCM Recorder successfully started capturing and streaming.");
        } catch (err) {
          console.error("[STT:MicTest] Failed to initialize PCM Recorder:", err);
          setError("Failed to start PCM Recorder: " + err.message);
          stopListening();
        }
      };

      ws.onmessage = (message) => {
        const received = JSON.parse(message.data);
        
        // Detailed Logging for speech start/end events from VAD
        if (received.type === "SpeechStarted") {
          console.log("%c[STT:VAD] Speech STARTED detected by Deepgram VAD", "color: #22c55e; font-weight: bold;");
          return;
        } else if (received.type === "UtteranceEnd") {
          console.log("%c[STT:VAD] Speech ENDED (Utterance concluded) detected by Deepgram VAD", "color: #f59e0b; font-weight: bold;");
          return;
        }

        // Standard Transcription channel logging
        const alternative = received.channel?.alternatives?.[0];
        const transcriptChunk = alternative?.transcript || "";
        const isFinal = received.is_final;

        if (transcriptChunk.trim()) {
          console.log(
            `[STT:DG] Transcript received: "${transcriptChunk}" | Confidence: ${(alternative?.confidence || 0).toFixed(4)} | IsFinal: ${isFinal}`
          );
          if (isFinal) {
            setFinalTranscript((prev) => `${prev} ${transcriptChunk}`.trim());
            setInterimTranscript("");
          } else {
            setInterimTranscript(transcriptChunk);
          }
        }
      };

      ws.onerror = (err) => {
        console.error("[STT:WS] Deepgram WebSocket error:", err);
      };

      ws.onclose = (event) => {
        console.log(`[STT:WS] Deepgram WebSocket closed. code: ${event.code}, reason: ${event.reason}`);
        if (!stopRequestedRef.current && isListeningRef.current) {
          console.log("[STT:WS] Connection closed unexpectedly. Re-connecting in 1000ms...");
          setTimeout(startListening, 1000);
        }
      };

    } catch (err) {
      console.error("[STT:MicTest] Deepgram initialization error:", err);
      setError("Unable to access microphone or connect to transcription service. Please check permissions.");
      stopListening();
    }
  }, [
    refreshDevices,
    selectedDeviceId,
    stopListening,
    stopMediaStream,
    getToken,
    backend_URL,
  ]);

  const clearTranscript = useCallback(() => {
    setFinalTranscript("");
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    refreshDevices();

    const handleDeviceChange = () => {
      refreshDevices();
    };

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
  }, [refreshDevices, stopListening]);

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
