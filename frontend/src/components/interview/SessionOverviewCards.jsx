import React from "react";
import { FiClock, FiLayers, FiStar, FiUser } from "react-icons/fi";

const SessionOverviewCards = ({
  timeLeft,
  displayInterviewData,
  agentName,
  formatDuration,
}) => {
  const remainingMins = Math.max(1, Math.ceil(timeLeft / 60));
  const level = displayInterviewData?.level || "General";
  const interviewType = displayInterviewData?.interviewType || "Technical";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between py-2 border-b border-white/5">
        <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.15em] flex items-center gap-2">
          <div className="w-1 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(190,242,100,0.4)]" />
          Session Overview
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
            Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="group bg-primary text-black p-3 rounded-xl border border-primary shadow-[0_14px_40px_rgba(190,242,100,0.22)] transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center gap-2 mb-1">
            <FiClock size={11} className="text-black/80" />
            <span className="text-[8px] font-black text-black/70 uppercase tracking-wider">
              Time Left
            </span>
          </div>
          <p className="text-sm font-black text-black tracking-tight">
            {formatDuration(timeLeft)}
          </p>
          <p className="text-[9px] font-bold text-black/65 mt-1">
            {remainingMins} min remaining
          </p>
        </div>

        <div className="group bg-primary/90 text-black p-3 rounded-xl border border-primary/90 shadow-[0_10px_30px_rgba(190,242,100,0.2)] transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center gap-2 mb-1">
            <FiStar size={11} className="text-black/80" />
            <span className="text-[8px] font-black text-black/70 uppercase tracking-wider">
              Role
            </span>
          </div>
          <p className="text-[11px] font-black text-black truncate tracking-tight">
            {displayInterviewData.role}
          </p>
          <p className="text-[9px] font-bold text-black/65 mt-1 truncate">
            {level} level
          </p>
        </div>

        <div className="group bg-zinc-900/60 backdrop-blur-sm p-3 rounded-xl border border-white/10 transition-all duration-300 hover:border-primary/25 hover:bg-zinc-800/50">
          <div className="flex items-center gap-2 mb-1">
            <FiUser size={11} className="text-primary" />
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">
              Interviewer
            </span>
          </div>
          <p className="text-[11px] font-bold text-white truncate tracking-tight">
            {agentName}
          </p>
          <p className="text-[9px] font-semibold text-zinc-500 mt-1 truncate">
            AI Interview Agent
          </p>
        </div>

        <div className="group bg-zinc-900/60 backdrop-blur-sm p-3 rounded-xl border border-white/10 transition-all duration-300 hover:border-primary/25 hover:bg-zinc-800/50">
          <div className="flex items-center gap-2 mb-1">
            <FiLayers size={11} className="text-primary" />
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">
              Interview Type
            </span>
          </div>
          <p className="text-[11px] font-bold text-white truncate tracking-tight capitalize">
            {interviewType}
          </p>
          <p className="text-[9px] font-semibold text-zinc-500 mt-1">
            Live assessment mode
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionOverviewCards;
