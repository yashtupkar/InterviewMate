import React, { useState, useEffect } from "react";
import {
  ProctoringProvider,
  useProctoring,
  FaceTracker,
  EyeTracker,
  ObjectDetector,
} from "../proctoring";
import {
  FiPlay,
  FiAlertCircle,
  FiEye,
  FiMonitor,
  FiVolume2,
  FiZap,
} from "react-icons/fi";
import toast from "react-hot-toast";

const ProctoringTestContent = () => {
  const {
    startProctoring,
    isProctoringActive,
    requestWebcam,
    requestScreenShare,
    logViolation,
    updateMetrics,
    suspicionScore,
    focusPercentage,
    attentionScore,
    violationLog,
    riskLevel,
    webcamVideoRef,
    faceStatus,
    warningPopup,
    hideWarning,
  } = useProctoring();

  const [simulationRunning, setSimulationRunning] = useState(false);
  const [focusSlider, setFocusSlider] = useState(100);
  const [attentionSlider, setAttentionSlider] = useState(100);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible" && isProctoringActive) {
        alert(
          "⚠️ You have switched tabs! This is a violation of proctoring rules.",
        );
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      window.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isProctoringActive]);

  const simulateViolations = async () => {
    const violations = [
      { type: "tab-switch", msg: "Tab switched detected" },
      { type: "fullscreen-exit", msg: "Exited fullscreen mode" },
      { type: "copy-paste", msg: "Copy-paste attempt blocked" },
      { type: "suspicious-movement", msg: "Suspicious eye movement detected" },
      { type: "multiple-face", msg: "Multiple faces detected in frame" },
      { type: "window-blur", msg: "Window lost focus" },
    ];

    setSimulationRunning(true);

    for (const violation of violations) {
      await new Promise((r) => setTimeout(r, 2000));
      logViolation(violation.type, violation.msg);
    }

    setSimulationRunning(false);
    toast.success("Violation simulation completed!");
  };

  const testWebcam = async () => {
    const stream = await requestWebcam();
    if (stream) {
      toast.success("Webcam test passed!");
    } else {
      toast.error("Webcam access denied");
    }
  };

  const testScreenShare = async () => {
    const stream = await requestScreenShare();
    if (stream) {
      toast.success("Screen sharing test passed!");
    } else {
      toast.error("Screen sharing denied");
    }
  };

  const triggerRandomViolation = () => {
    const randomViolations = [
      { type: "tab-switch", msg: "Candidate switched tabs" },
      { type: "multiple-face", msg: "Multiple faces detected" },
      { type: "developer-tools", msg: "Developer tools opened" },
      { type: "suspicious-movement", msg: "Suspicious head movement" },
    ];
    const random =
      randomViolations[Math.floor(Math.random() * randomViolations.length)];
    logViolation(random.type, random.msg);
    toast.success(`Logged: ${random.msg}`);
  };

  const getStatusBarColor = () => {
    if (
      faceStatus.toLowerCase().includes("no face") ||
      faceStatus.toLowerCase().includes("multiple")
    ) {
      return "bg-red-500/20 border-red-500/50 text-red-200";
    } else if (
      faceStatus.toLowerCase().includes("low") ||
      faceStatus.toLowerCase().includes("partial")
    ) {
      return "bg-yellow-500/20 border-yellow-500/50 text-yellow-200";
    } else {
      return "bg-emerald-500/20 border-emerald-500/50 text-emerald-200";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🎯 AI Proctoring Test Lab</h1>
          <p className="text-zinc-400">
            Real-time monitoring, violation detection, and attention tracking
          </p>
        </div>

        {/* Webcam Video */}
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 mb-8">
          <div className="flex justify-center">
            <video
              ref={webcamVideoRef}
              autoPlay
              muted
              playsInline
              className="rounded-2xl border border-white/20 w-full max-w-sm"
            />
          </div>
        </div>

        {/* Face Detection Status Bar */}
        <div
          className={`rounded-2xl border p-4 mb-8 flex items-center justify-center gap-3 ${getStatusBarColor()}`}
        >
          <FiAlertCircle size={20} />
          <span className="font-semibold">{faceStatus}</span>
        </div>

        {/* Quick Status */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-400 uppercase">Status</p>
            <p className="text-2xl font-bold mt-2">
              {isProctoringActive ? "🟢 Live" : "⚫ Idle"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-400 uppercase">Risk Level</p>
            <p className="text-2xl font-bold mt-2">{riskLevel}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-400 uppercase">Suspicion</p>
            <p className="text-2xl font-bold mt-2">{suspicionScore}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-400 uppercase">Events Logged</p>
            <p className="text-2xl font-bold mt-2">{violationLog.length}</p>
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Permission Tests */}
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiZap className="text-emerald-400" /> Permission Tests
            </h2>
            <div className="space-y-3">
              <button
                onClick={testWebcam}
                className="w-full rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 px-4 py-3 text-sm font-semibold border border-emerald-500/50 transition flex items-center justify-center gap-2"
              >
                <FiMonitor size={16} /> Test Webcam
              </button>
              <button
                onClick={testScreenShare}
                className="w-full rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 px-4 py-3 text-sm font-semibold border border-emerald-500/50 transition flex items-center justify-center gap-2"
              >
                <FiEye size={16} /> Test Screen Share
              </button>
              <button
                onClick={startProctoring}
                disabled={isProctoringActive}
                className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 px-4 py-3 text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <FiPlay size={16} /> Start Proctoring
              </button>
            </div>
          </div>

          {/* Violation Simulator */}
          <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiAlertCircle className="text-red-400" /> Violation Simulator
            </h2>
            <div className="space-y-3">
              <button
                onClick={simulateViolations}
                disabled={simulationRunning || !isProctoringActive}
                className="w-full rounded-2xl bg-red-500/20 hover:bg-red-500/30 disabled:bg-zinc-700 px-4 py-3 text-sm font-semibold border border-red-500/50 transition"
              >
                {simulationRunning ? "Simulating..." : "Run Violation Sequence"}
              </button>
              <button
                onClick={triggerRandomViolation}
                disabled={!isProctoringActive}
                className="w-full rounded-2xl bg-red-500/20 hover:bg-red-500/30 disabled:bg-zinc-700 px-4 py-3 text-sm font-semibold border border-red-500/50 transition"
              >
                Trigger Random Violation
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Sliders */}
        <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FiVolume2 className="text-cyan-400" /> Manual Metrics Control
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">
                  Focus Score: {focusSlider}%
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={focusSlider}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFocusSlider(val);
                  updateMetrics(val, attentionSlider);
                }}
                className="w-full h-2 bg-zinc-800 rounded-full cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">
                  Attention Score: {attentionSlider}%
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={attentionSlider}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setAttentionSlider(val);
                  updateMetrics(focusSlider, val);
                }}
                className="w-full h-2 bg-zinc-800 rounded-full cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Violation Log */}
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold mb-4">
            📋 Violation Log ({violationLog.length})
          </h2>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {violationLog.length === 0 ? (
              <p className="text-zinc-500 text-sm">
                No violations logged yet. Trigger some violations to see them
                here.
              </p>
            ) : (
              violationLog.map((event, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-white/5 p-3 border border-white/5 text-sm flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-200">
                      {event.eventType.replace(/-/g, " ")}
                    </p>
                    <p className="text-zinc-400">{event.message}</p>
                  </div>
                  <span className="text-xs text-zinc-500 whitespace-nowrap">
                    +{event.score}pts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Warning Popup */}
      {warningPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-red-500/50 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <FiAlertCircle className="text-red-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {warningPopup.title}
                  </h3>
                  <p className="text-zinc-400 mt-1">{warningPopup.message}</p>
                </div>
              </div>
            </div>
            <button
              onClick={hideWarning}
              className="w-full rounded-2xl bg-red-500 hover:bg-red-600 px-4 py-3 text-sm font-semibold text-white transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Detection Components */}
      {isProctoringActive && (
        <div className="sr-only">
          <FaceTracker />
          {/* <EyeTracker /> */}
          <ObjectDetector />
        </div>
      )}
    </div>
  );
};

const ProctoringTestPage = () => {
  return (
    <ProctoringProvider sessionId="test-session-001" userId="test-user">
      <ProctoringTestContent />
    </ProctoringProvider>
  );
};

export default ProctoringTestPage;
