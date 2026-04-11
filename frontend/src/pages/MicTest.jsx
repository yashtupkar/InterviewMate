import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppContext } from "../context/AppContext";
import "./MicTest.css";

const SpeechRecognitionAPI =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const MOBILE_REGEX = /Android|iPhone|iPad|iPod|Mobile/i;

function MicTest() {
  const { backend_URL } = useContext(AppContext);

  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [displayTranscript, setDisplayTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState("");
  const [browserSupported, setBrowserSupported] = useState(true);
  const [sttEngine, setSttEngine] = useState("web-speech");
  const [isFallbackActive, setIsFallbackActive] = useState(false);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const restartTimerRef = useRef(null);

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const deepgramQueueRef = useRef(Promise.resolve());
  const noSpeechCountRef = useRef(0);
  const lastDeepgramChunkRef = useRef("");

  const finalSentencesRef = useRef([]);
  const currentInterimRef = useRef("");

  const speechRecognitionSupported = useMemo(
    () => Boolean(SpeechRecognitionAPI),
    [],
  );

  const isMobileDevice = useMemo(
    () => MOBILE_REGEX.test(navigator.userAgent || ""),
    [],
  );

  const buildDisplayTranscript = useCallback(() => {
    const committed = finalSentencesRef.current.join(" ").trim();
    const interim = (currentInterimRef.current || "").trim();
    const combined = `${committed} ${interim}`.trim();
    setDisplayTranscript(combined);
  }, []);

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

  const cleanupDeepgramRecorder = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;

    try {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    } catch {
      // Ignore recorder stop race conditions.
    }
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
      // Non-critical: keep page usable even if listing fails.
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

  const appendCommittedText = useCallback(
    (text) => {
      const normalized = (text || "").trim();
      if (!normalized) return;
      finalSentencesRef.current.push(normalized);
      buildDisplayTranscript();
    },
    [buildDisplayTranscript],
  );

  const transcribeChunkWithDeepgram = useCallback(
    async (audioChunk) => {
      if (!audioChunk || audioChunk.size === 0) return;

      if (!backend_URL) {
        throw new Error("Backend URL is missing for fallback transcription.");
      }

      const formData = new FormData();
      formData.append("audio", audioChunk, "chunk.webm");
      formData.append("language", "en-US");

      const response = await fetch(`${backend_URL}/api/stt/transcribe`, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Cloud transcription failed.");
      }

      const transcript = (payload.text || "").trim();
      if (!transcript || transcript === lastDeepgramChunkRef.current) return;

      lastDeepgramChunkRef.current = transcript;
      currentInterimRef.current = "";
      appendCommittedText(transcript);
    },
    [appendCommittedText, backend_URL],
  );

  const queueDeepgramChunk = useCallback(
    (audioChunk) => {
      deepgramQueueRef.current = deepgramQueueRef.current
        .then(() => transcribeChunkWithDeepgram(audioChunk))
        .catch((err) => {
          if (!stopRequestedRef.current) {
            setError(err.message || "Deepgram fallback request failed.");
          }
        });
    },
    [transcribeChunkWithDeepgram],
  );

  const startDeepgramRecorder = useCallback(
    (stream) => {
      if (!window.MediaRecorder) {
        setError("MediaRecorder is not supported in this browser.");
        return false;
      }

      cleanupDeepgramRecorder();

      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];

      const supportedType = preferredTypes.find((type) =>
        MediaRecorder.isTypeSupported(type),
      );

      let recorder;
      try {
        recorder = supportedType
          ? new MediaRecorder(stream, { mimeType: supportedType })
          : new MediaRecorder(stream);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (event) => {
        if (
          stopRequestedRef.current ||
          !isListeningRef.current ||
          !event.data ||
          event.data.size === 0
        ) {
          return;
        }

        queueDeepgramChunk(event.data);
      };

      recorder.onerror = () => {
        if (!stopRequestedRef.current) {
          setError("Could not capture audio for Deepgram fallback.");
        }
      };

      mediaRecorderRef.current = recorder;

      try {
        recorder.start(2500);
      } catch {
        setError("Unable to start fallback recorder on this device.");
        return false;
      }

      setSttEngine("deepgram");
      setIsFallbackActive(true);
      setBrowserSupported(true);
      isListeningRef.current = true;
      setIsListening(true);
      currentInterimRef.current = "Using Deepgram fallback...";
      buildDisplayTranscript();

      return true;
    },
    [buildDisplayTranscript, cleanupDeepgramRecorder, queueDeepgramChunk],
  );

  const switchToDeepgramFallback = useCallback(
    (reason) => {
      if (
        stopRequestedRef.current ||
        !streamRef.current ||
        (mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording")
      ) {
        return;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch {
          // Ignore stop race conditions.
        }
        recognitionRef.current = null;
      }

      noSpeechCountRef.current = 0;
      if (reason) {
        setError(`Switched to Deepgram fallback: ${reason}.`);
      }
      startDeepgramRecorder(streamRef.current);
    },
    [startDeepgramRecorder],
  );

  const stopListening = useCallback(() => {
    stopRequestedRef.current = true;
    isListeningRef.current = false;
    setIsListening(false);

    currentInterimRef.current = "";
    buildDisplayTranscript();

    noSpeechCountRef.current = 0;
    setIsFallbackActive(false);

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
      } catch {
        // Ignore abort race conditions.
      }
      recognitionRef.current = null;
    }

    cleanupDeepgramRecorder();
    stopVolumeMonitor();
    stopMediaStream();

    setSttEngine(
      isMobileDevice || !speechRecognitionSupported ? "deepgram" : "web-speech",
    );
  }, [
    buildDisplayTranscript,
    cleanupDeepgramRecorder,
    isMobileDevice,
    speechRecognitionSupported,
    stopMediaStream,
    stopVolumeMonitor,
  ]);

  const startWebSpeech = useCallback(() => {
    if (!speechRecognitionSupported) return false;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      noSpeechCountRef.current = 0;
      isListeningRef.current = true;
      setIsListening(true);
      setError("");
      setSttEngine("web-speech");
      setIsFallbackActive(false);
      setBrowserSupported(true);
    };

    recognition.onresult = (event) => {
      if (!recognition._processedFinalIndices) {
        recognition._processedFinalIndices = new Set();
      }

      let newFinals = "";
      for (let i = 0; i < event.results.length; i += 1) {
        if (
          event.results[i].isFinal &&
          !recognition._processedFinalIndices.has(i)
        ) {
          recognition._processedFinalIndices.add(i);
          newFinals += `${event.results[i][0].transcript} `;
        }
      }

      if (newFinals.trim()) {
        finalSentencesRef.current.push(newFinals.trim());
      }

      let latestInterim = "";
      for (let i = event.results.length - 1; i >= 0; i -= 1) {
        if (!event.results[i].isFinal) {
          latestInterim = event.results[i][0].transcript;
          break;
        }
      }

      currentInterimRef.current = latestInterim;
      buildDisplayTranscript();
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;

      if (event.error === "no-speech") {
        noSpeechCountRef.current += 1;
        if (noSpeechCountRef.current >= 3) {
          switchToDeepgramFallback("repeated no-speech");
        }
        return;
      }

      if (event.error === "not-allowed") {
        setError("Microphone permission denied. Please allow mic access.");
        stopListening();
        return;
      }

      if (
        ["audio-capture", "network", "service-not-allowed"].includes(
          event.error,
        )
      ) {
        switchToDeepgramFallback(event.error);
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
              !stopRequestedRef.current &&
              isListeningRef.current &&
              recognitionRef.current
            ) {
              recognitionRef.current.start();
            }
          } catch {
            // Ignore rapid restart failures.
          }
        }, 150);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      return true;
    } catch {
      return false;
    }
  }, [
    buildDisplayTranscript,
    speechRecognitionSupported,
    stopListening,
    switchToDeepgramFallback,
  ]);

  const startListening = useCallback(async () => {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setBrowserSupported(false);
      setError("Your browser does not support microphone access.");
      return;
    }

    stopListening();
    await new Promise((resolve) => setTimeout(resolve, 120));

    stopRequestedRef.current = false;
    finalSentencesRef.current = [];
    currentInterimRef.current = "";
    lastDeepgramChunkRef.current = "";
    noSpeechCountRef.current = 0;
    setDisplayTranscript("");

    const baseAudioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    try {
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
      startVolumeMonitor(stream);
      await refreshDevices();

      const preferDeepgram = isMobileDevice || !speechRecognitionSupported;
      if (preferDeepgram) {
        const started = startDeepgramRecorder(stream);
        if (!started) {
          setBrowserSupported(false);
          setError(
            "No supported transcription engine available on this device.",
          );
          stopListening();
        }
        return;
      }

      const startedWebSpeech = startWebSpeech();
      if (!startedWebSpeech) {
        const startedFallback = startDeepgramRecorder(stream);
        if (!startedFallback) {
          setBrowserSupported(false);
          setError("Failed to start speech recognition. Please try again.");
          stopListening();
        }
      }
    } catch {
      setError(
        "Unable to access this microphone. Please allow permission or choose another device.",
      );
      stopListening();
    }
  }, [
    isMobileDevice,
    refreshDevices,
    selectedDeviceId,
    speechRecognitionSupported,
    startDeepgramRecorder,
    startVolumeMonitor,
    startWebSpeech,
    stopListening,
  ]);

  const clearTranscript = useCallback(() => {
    finalSentencesRef.current = [];
    currentInterimRef.current = "";
    setDisplayTranscript("");
  }, []);

  useEffect(() => {
    if (!speechRecognitionSupported && !window.MediaRecorder) {
      setBrowserSupported(false);
    }

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
  }, [refreshDevices, speechRecognitionSupported, stopListening]);

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
          <p className="mic-engine-tag">
            Engine:{" "}
            {sttEngine === "deepgram"
              ? "Deepgram (fallback)"
              : "Web Speech API"}
          </p>
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

        <div className="mic-volume-wrap">
          <span>Input level</span>
          <div className="mic-volume-track" aria-hidden="true">
            <div className="mic-volume-fill" style={{ width: `${volume}%` }} />
          </div>
        </div>

        {error && <p className="mic-error">{error}</p>}

        {isFallbackActive && (
          <p className="mic-note">
            Mobile-safe fallback is active. Transcript may appear in short
            chunks.
          </p>
        )}

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
