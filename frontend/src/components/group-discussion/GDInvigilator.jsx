import React from "react";
import { FiInfo } from "react-icons/fi";

const GDInvigilator = ({ invigilatorStatus, invigilatorMessage, invTimer }) => {
  return (
    <div
      className={`p-1 rounded-2xl transition-all duration-700 backdrop-blur-xl ${
        invigilatorStatus === "concluding"
          ? "bg-gradient-to-r from-red-600 to-orange-600 shadow-[0_0_50px_rgba(220,38,38,0.4)] scale-[1.02]"
          : invigilatorStatus === "active"
            ? "bg-zinc-800/80 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)]"
            : "bg-indigo-600/20 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
      }`}
    >
      <div
        className={`px-6 py-4 rounded-2xl flex items-center gap-5 relative overflow-hidden ${
          invigilatorStatus === "concluding"
            ? "bg-zinc-950/40"
            : "bg-transparent"
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xl ${
            invigilatorStatus === "concluding"
              ? "bg-white text-red-600 animate-pulse"
              : invigilatorStatus === "active"
                ? "bg-emerald-500 text-white"
                : "bg-indigo-500 text-white"
          }`}
        >
          <FiInfo size={28} />
        </div>

        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md shadow-sm ${
                invigilatorStatus === "concluding"
                  ? "bg-red-500 text-white"
                  : invigilatorStatus === "active"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              }`}
            >
              {invigilatorStatus === "start"
                ? "Session Guide"
                : invigilatorStatus === "active"
                  ? "Live Monitoring"
                  : "URGENT NOTICE"}
            </span>
          </div>
          <h2
            className={`text-[15px] md:text-[17px] font-black leading-tight truncate drop-shadow-md ${
              invigilatorStatus === "concluding" ? "text-white" : "text-zinc-100"
            }`}
          >
            {invigilatorMessage}
          </h2>
        </div>

        {invigilatorStatus === "concluding" ? (
          <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-inner z-10">
            <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
              Ends In
            </span>
            <span className="text-2xl font-black text-white tabular-nums drop-shadow-md">
              00:{String(invTimer).padStart(2, "0")}
            </span>
          </div>
        ) : invigilatorStatus === "active" ? (
          <div className="flex gap-1.5 px-4 py-4 z-10">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-6 bg-emerald-500/60 rounded-full animate-sound-bar"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : null}

        {/* Background scanning effect for active/start status */}
        {invigilatorStatus !== "concluding" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-100%] animate-scan" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GDInvigilator;
