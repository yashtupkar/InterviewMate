import { useEffect, useRef } from "react";
import { useProctoring } from "../ProctoringProvider";

const WebcamMonitor = () => {
  const {
    webcamVideoRef,
    webcamStatus,
    requestWebcam,
    faceStatus,
    logViolation,
  } = useProctoring();
  const statusColor = webcamStatus === "active" ? "bg-emerald-500" : webcamStatus === "denied" ? "bg-red-500" : "bg-amber-400";

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Webcam</p>
          <h3 className="mt-2 text-sm font-semibold text-white">Live face monitoring</h3>
        </div>
        <span className={`rounded-full px-2 py-1 text-[11px] text-white ${statusColor}`}>
          {webcamStatus}
        </span>
      </div>

      <div className="mt-4 rounded-3xl overflow-hidden border border-white/10 bg-black/20">
        <video
          ref={webcamVideoRef}
          autoPlay
          muted
          playsInline
          className="h-44 w-full object-cover bg-slate-900"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>Face status</span>
          <span className="font-semibold text-white">{faceStatus}</span>
        </div>
        <button
          onClick={async () => {
            const stream = await requestWebcam();
            if (!stream) logViolation("webcam-disabled", "Webcam permission was refused.");
          }}
          className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          Re-request webcam
        </button>
      </div>
    </div>
  );
};

export default WebcamMonitor;
