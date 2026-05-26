import { useEffect } from "react";
import { useProctoring } from "../ProctoringProvider";
import WebcamMonitor from "./WebcamMonitor";
import ScreenMonitor from "./ScreenMonitor";
import CheatingScoreCard from "./CheatingScoreCard";
import ViolationLogger from "./ViolationLogger";
import FaceTracker from "./FaceTracker";
import EyeTracker from "./EyeTracker";
import ObjectDetector from "./ObjectDetector";

const ProctoringPanel = () => {
  const {
    startProctoring,
    isReadyToStart,
    isProctoringActive,
    permissionError,
    riskLevel,
    suspicionScore,
    focusPercentage,
    attentionScore,
  } = useProctoring();

  useEffect(() => {
    if (isProctoringActive) {
      document.body.classList.add("overflow-hidden");
      return () => document.body.classList.remove("overflow-hidden");
    }
  }, [isProctoringActive]);

  return (
    <div className="fixed right-4 top-24 z-50 w-full max-w-sm max-h-[calc(100vh-140px)] rounded-3xl border border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl text-white overflow-hidden flex flex-col">
      <div className="px-5 py-5 border-b border-white/10 bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-emerald-300 font-semibold">
              AI Proctoring
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Live Monitoring Panel
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-emerald-200">
            {riskLevel}
          </span>
        </div>
        <p className="mt-3 text-sm text-zinc-400 leading-6">
          Real-time webcam, screen, and attention monitoring keeps the session
          secure and audit-ready.
        </p>
      </div>

      <div className="p-5 space-y-4 overflow-y-auto flex-1">
        <WebcamMonitor />
        <ScreenMonitor />
        <CheatingScoreCard />

        {!isProctoringActive && (
          <button
            onClick={startProctoring}
            disabled={!isReadyToStart}
            className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-white/20"
          >
            {isReadyToStart
              ? "Start Proctoring"
              : "Complete Camera + Screen Setup"}
          </button>
        )}

        {permissionError && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-200">
            {permissionError}
          </div>
        )}

        <div className="border-t border-white/10 pt-4">
          <ViolationLogger />
        </div>
      </div>

      {isProctoringActive && (
        <div className="sr-only">
          <FaceTracker />
          <EyeTracker />
          <ObjectDetector />
        </div>
      )}
    </div>
  );
};

export default ProctoringPanel;
