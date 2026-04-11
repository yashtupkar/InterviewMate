import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./MicTest.css";

const SpeechRecognitionAPI =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function MicTest() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const restartTimerRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  const speechRecognitionSupported = useMemo(
    () => Boolean(SpeechRecognitionAPI),
    [],
  );

  const stopVolumeMonitor = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setVolume(0);
  }, []);

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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

  const startVolumeMonitor = useCallback((stream) => {
    const AudioContextAPI = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextAPI) return;

    const audioContext = new AudioContextAPI();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(data);
      const avg = data.reduce((sum, value) => sum + value, 0) / data.length;
      setVolume(Math.min(100, Math.round((avg / 255) * 140)));
      rafRef.current = requestAnimationFrame(update);
    };

    update();
  }, []);

  const stopListening = useCallback(() => {
    stopRequestedRef.current = true;
    setIsListening(false);
    isListeningRef.current = false;
    setInterimTranscript("");

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    stopVolumeMonitor();
    stopMediaStream();
  }, [stopMediaStream, stopVolumeMonitor]);

  const startListening = useCallback(async () => {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Your browser does not support microphone access.");
      return;
    }

    try {
      stopListening();
      stopRequestedRef.current = false;
      stopMediaStream();
      stopVolumeMonitor();

      const baseAudioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
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
        // Some Android devices reject exact device constraints.
        stream = await navigator.mediaDevices.getUserMedia({
          audio: baseAudioConstraints,
        });
      }

      streamRef.current = stream;
      startVolumeMonitor(stream);
      await refreshDevices();

      if (!speechRecognitionSupported) {
        isListeningRef.current = true;
        setIsListening(true);
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalPart = "";
        let interimPart = "";

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result.isFinal) {
            finalPart += `${result[0].transcript} `;
          } else {
            interimPart += result[0].transcript;
          }
        }

        if (finalPart) {
          setFinalTranscript((prev) => `${prev}${finalPart}`.trim());
        }

        setInterimTranscript(interimPart);
      };

      recognition.onerror = (event) => {
        if (["aborted", "no-speech"].includes(event.error)) {
          return;
        }

        if (event.error === "not-allowed") {
          setError("Microphone permission denied. Please allow mic access.");
          stopListening();
          return;
        }

        if (event.error === "audio-capture") {
          setError("No active microphone input detected on this device.");
          return;
        }

        setError(`Speech recognition error: ${event.error}`);
      };

      recognition.onend = () => {
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
              // Ignore restart failures from rapid state changes.
            }
          }, 100);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setError(
        "Unable to access this microphone. Please allow permission or choose another device.",
      );
      stopListening();
    }
  }, [
    refreshDevices,
    selectedDeviceId,
    speechRecognitionSupported,
    startVolumeMonitor,
    stopListening,
    stopMediaStream,
    stopVolumeMonitor,
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

        <div className="mic-transcript-box">
          {transcriptText ||
            "Your transcript will appear here while you speak..."}
        </div>
      </div>
    </div>
  );
}

export default MicTest;
