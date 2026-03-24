import React from "react";
import { FiClock, FiStar, FiUser, FiZap, FiMoreVertical } from "react-icons/fi";

const SessionOverviewCards = ({
  timeLeft,
  displayInterviewData,
  agentName,
  formatDuration
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between py-2 border-b border-white/5">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
          <div className="w-1 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(190,242,100,0.4)]" />
          Intelligence
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Time Remaining Card */}
        <div className="group bg-zinc-900/40 backdrop-blur-sm p-3 rounded-xl border border-white/5 transition-all duration-300 hover:border-primary/20 hover:bg-zinc-800/40">
          <div className="flex items-center gap-2 mb-1">
            <FiClock size={11} className="text-primary" />
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Time</span>
          </div>
          <p className="text-sm font-black text-white tracking-tight">
            {formatDuration(timeLeft)}
          </p>
        </div>

        {/* Interview Details Card */}
        <div className="group bg-zinc-900/40 backdrop-blur-sm p-3 rounded-xl border border-white/5 transition-all duration-300 hover:border-primary/20 hover:bg-zinc-800/40">
          <div className="flex items-center gap-2 mb-1">
            <FiStar size={11} className="text-blue-400" />
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Role</span>
          </div>
          <p className="text-[11px] font-bold text-white truncate tracking-tight">
            {displayInterviewData.role}
          </p>
        </div>

        {/* Interviewer Card */}
        <div className="group bg-zinc-900/40 backdrop-blur-sm p-3 rounded-xl border border-white/5 transition-all duration-300 hover:border-primary/20 hover:bg-zinc-800/40">
          <div className="flex items-center gap-2 mb-1">
            <FiUser size={11} className="text-purple-400" />
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Agent</span>
          </div>
          <p className="text-[11px] font-bold text-white truncate tracking-tight">
            {agentName}
          </p>
        </div>

        {/* Performance Tracking Card */}
        <div className="group bg-zinc-900/40 backdrop-blur-sm p-3 rounded-xl border border-white/5 transition-all duration-300 hover:border-primary/20 hover:bg-zinc-800/40">
          <div className="flex items-center gap-2 mb-1">
            <FiZap size={11} className="text-amber-400" />
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Metrics</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-primary w-[65%] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionOverviewCards;
