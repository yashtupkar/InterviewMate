import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { AppContext } from "../context/AppContext";
import {
  getProctorEventScore,
  computeSuspicionRisk,
  buildProctorReport,
} from "./utils/proctoringEngine";

const ProctoringContext = createContext();

export const ProctoringProvider = ({ children, sessionId, userId }) => {
  const { backend_URL } = useContext(AppContext);
  const [webcamStatus, setWebcamStatus] = useState("pending");
  const [screenStatus, setScreenStatus] = useState("pending");
  const [faceStatus, setFaceStatus] = useState("waiting for detection");
  const [eyeStatus, setEyeStatus] = useState("initializing");
  const [focusPercentage, setFocusPercentage] = useState(100);
  const [attentionScore, setAttentionScore] = useState(100);
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [violationLog, setViolationLog] = useState([]);
  const [screenLogs, setScreenLogs] = useState([]);
  const [permissionError, setPermissionError] = useState(null);
  const [isProctoringActive, setIsProctoringActive] = useState(false);
  const [isReadyToStart, setIsReadyToStart] = useState(false);
  const [riskLevel, setRiskLevel] = useState("Low");
  const [isWebcamRequired, setIsWebcamRequired] = useState(true);
  const [isScreenShareRequired, setIsScreenShareRequired] = useState(true);
  const [warningPopup, setWarningPopup] = useState(null);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  const webcamStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const socketRef = useRef(null);
  const unloadRef = useRef(false);
  const tabLockKey = useMemo(
    () => `placemate_proctor_${sessionId || "default"}`,
    [sessionId],
  );

  const connectSocket = () => {
    if (!backend_URL) return;
    if (socketRef.current) return;

    const socket = io(backend_URL, {
      transports: ["websocket"],
      path: "/socket.io",
    });

    socket.on("connect", () => {
      socketRef.current = socket;
      sendProctorEvent("session-connected", "Proctoring socket connected");
    });

    socket.on("disconnect", () => {
      socketRef.current = null;
    });

    socket.on("connect_error", (err) => {
      console.error("Proctoring socket error:", err);
    });
  };

  const sendProctorEvent = (eventType, message, details = {}) => {
    const eventScore = getProctorEventScore(eventType);
    const payload = {
      sessionId,
      userId,
      eventType,
      message,
      details,
      score: eventScore,
      timestamp: new Date().toISOString(),
    };

    if (socketRef.current?.connected) {
      socketRef.current.emit("proctoring:event", payload);
    }

    setViolationLog((prev) => [payload, ...prev].slice(0, 30));
    if (eventScore > 0) {
      setSuspicionScore((prev) => Math.min(100, prev + eventScore));
    }
    if (eventType.startsWith("screen")) {
      setScreenLogs((prev) => [payload, ...prev].slice(0, 30));
    }
  };

  const logViolation = (eventType, message, details = {}) => {
    const score = getProctorEventScore(eventType);
    sendProctorEvent(eventType, message, details);
    return score;
  };

  const updateMetrics = (focusValue, attentionValue) => {
    setFocusPercentage(Math.max(0, Math.min(100, focusValue)));
    setAttentionScore(Math.max(0, Math.min(100, attentionValue)));
    const risk = computeSuspicionRisk(
      suspicionScore,
      focusValue,
      attentionValue,
    );
    setRiskLevel(risk);
  };

  const showWarning = (title, message) => {
    setWarningPopup({ title, message });
  };

  const hideWarning = () => {
    setWarningPopup(null);
  };

  const clearProctoring = () => {
    stopWebcam();
    stopScreenShare();
    setIsProctoringActive(false);
    setIsReadyToStart(false);
    setFaceStatus("waiting for detection");
    setEyeStatus("initializing");
    setPermissionError(null);
  };

  const requestWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      webcamStreamRef.current = stream;
      setWebcamStatus("active");
      setPermissionError(null);
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      setWebcamStatus("denied");
      setPermissionError(
        "Webcam access denied. Interview cannot continue without camera.",
      );
      console.error("Webcam request failed", err);
      return null;
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
    }
    setWebcamStatus("stopped");
  };

  const requestScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = stream;
      setScreenStatus("active");
      setPermissionError(null);
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        logViolation(
          "screen-share-stopped",
          "Screen sharing ended unexpectedly.",
        );
        setScreenStatus("stopped");
      });
      return stream;
    } catch (err) {
      setScreenStatus("denied");
      setPermissionError("Screen sharing is required to start the interview.");
      console.error("Screen share request failed", err);
      return null;
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setScreenStatus("stopped");
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible") {
      logViolation(
        "tab-switch",
        "Candidate switched tabs or minimized window.",
      );
    }
  };

  const handleFullscreenChange = () => {
    if (document.fullscreenElement === null) {
      logViolation(
        "fullscreen-exit",
        "Fullscreen mode exited during interview.",
      );
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    logViolation("right-click", "Right click was blocked during proctoring.");
  };

  const handleKeyDown = (event) => {
    const isCopy =
      (event.ctrlKey || event.metaKey) &&
      (event.key === "c" || event.key === "v" || event.key === "x");
    const isDevTools =
      event.key === "F12" ||
      ((event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        ["I", "J", "C"].includes(event.key.toUpperCase()));

    if (isCopy) {
      logViolation("copy-paste", "Copy or paste attempt detected.");
    }

    if (isDevTools) {
      logViolation(
        "developer-tools",
        "Developer tools or inspect mode was opened.",
      );
      setIsDevToolsOpen(true);
    }
  };

  const handleStorage = (event) => {
    if (
      event.key === tabLockKey &&
      event.newValue &&
      event.newValue !== event.oldValue
    ) {
      logViolation("multiple-tab", "Another interview tab was opened.");
      setIsReadyToStart(false);
    }
  };

  const initializeSecurityListeners = () => {
    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("blur", () => {
      logViolation("window-blur", "Interview window lost focus.");
    });
  };

  const cleanupSecurityListeners = () => {
    window.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("fullscreenchange", handleFullscreenChange);
    window.removeEventListener("contextmenu", handleContextMenu);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("blur", () => {
      logViolation("window-blur", "Interview window lost focus.");
    });
  };

  const markActiveTab = () => {
    try {
      localStorage.setItem(tabLockKey, String(Date.now()));
    } catch (error) {
      console.warn("Local storage unavailable", error);
    }
  };

  const releaseActiveTab = () => {
    try {
      localStorage.removeItem(tabLockKey);
    } catch (error) {
      console.warn("Local storage unavailable", error);
    }
  };

  useEffect(() => {
    connectSocket();
    initializeSecurityListeners();
    markActiveTab();

    return () => {
      unloadRef.current = true;
      cleanupSecurityListeners();
      releaseActiveTab();
      if (socketRef.current?.disconnect) {
        socketRef.current.disconnect();
      }
      stopWebcam();
      stopScreenShare();
    };
  }, []);

  useEffect(() => {
    const ready =
      webcamStatus === "active" &&
      screenStatus === "active" &&
      !permissionError;
    setIsReadyToStart(ready);
  }, [webcamStatus, screenStatus, permissionError]);

  useEffect(() => {
    setRiskLevel(
      computeSuspicionRisk(suspicionScore, focusPercentage, attentionScore),
    );
  }, [suspicionScore, focusPercentage, attentionScore]);

  const startProctoring = async () => {
    const webcam = await requestWebcam();
    const screen = await requestScreenShare();

    if (!webcam) {
      setIsWebcamRequired(true);
      return;
    }
    if (!screen) {
      setIsScreenShareRequired(true);
      return;
    }

    setIsProctoringActive(true);
    setFaceStatus("detecting face");
    setEyeStatus("tracking attention");
    sendProctorEvent("proctoring-start", "Proctoring session started.");
  };

  const proctoringReport = useMemo(() => {
    return buildProctorReport({
      sessionId,
      userId,
      totalViolations: violationLog.length,
      suspicionScore,
      focusPercentage,
      attentionScore,
      screenLogs,
      events: violationLog,
      startedAt: new Date().toISOString(),
    });
  }, [
    attentionScore,
    focusPercentage,
    sessionId,
    screenLogs,
    suspicionScore,
    userId,
    violationLog,
  ]);

  return (
    <ProctoringContext.Provider
      value={{
        webcamVideoRef,
        webcamStatus,
        screenStatus,
        faceStatus,
        eyeStatus,
        focusPercentage,
        attentionScore,
        suspicionScore,
        riskLevel,
        violationLog,
        screenLogs,
        permissionError,
        isProctoringActive,
        isReadyToStart,
        isWebcamRequired,
        isScreenShareRequired,
        startProctoring,
        requestWebcam,
        requestScreenShare,
        clearProctoring,
        logViolation,
        updateMetrics,
        setFaceStatus,
        setEyeStatus,
        proctoringReport,
        warningPopup,
        showWarning,
        hideWarning,
      }}
    >
      {children}
    </ProctoringContext.Provider>
  );
};

export const useProctoring = () => {
  const context = useContext(ProctoringContext);
  if (!context) {
    throw new Error("useProctoring must be used inside a ProctoringProvider");
  }
  return context;
};
