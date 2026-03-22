import React from "react";
import { FiClock, FiStar, FiUser, FiZap, FiMoreVertical } from "react-icons/fi";

const SessionOverviewCards = ({
  timeLeft,
  displayInterviewData,
  agentName,
  formatDuration
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-2 border-b border-white/5">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-1 h-3 bg-primary rounded-full" />
          Session Overview
        </h3>
        <button className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors">
          <FiMoreVertical size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-900/60 px-4 py-3 rounded-2xl border border-white/5 flex flex-col gap-1">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-1.5">
            <FiClock size={10} className="text-primary" /> Remaining
          </span>
          <p className="text-[11px] font-semibold text-white">
            {formatDuration(timeLeft)}
          </p>
        </div>
        <div className="bg-zinc-900/60 px-4 py-3 rounded-2xl border border-white/5 flex flex-col gap-1">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-1.5">
            <FiStar size={10} className="text-primary" /> Interview
          </span>
          <p className="text-[11px] font-semibold text-white uppercase truncate">
            {displayInterviewData.interviewType} • {displayInterviewData.role}
          </p>
        </div>
        <div className="bg-zinc-900/60 px-4 py-3 rounded-2xl border border-white/5 flex flex-col gap-1">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-1.5">
            <FiUser size={10} className="text-primary" /> Interviewer
          </span>
          <p className="text-[11px] font-semibold text-white truncate">
            {agentName}
          </p>
        </div>
        <div className="bg-zinc-900/60 px-4 py-3 rounded-2xl border border-white/5 flex flex-col gap-1">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-1.5">
            <FiZap size={10} className="text-primary" /> Status
          </span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] font-semibold text-emerald-500 uppercase">
              Live Session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionOverviewCards;
