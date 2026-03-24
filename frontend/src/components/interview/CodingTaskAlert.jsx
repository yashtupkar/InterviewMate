import React from "react";
import { FiCode, FiZap } from "react-icons/fi";

const CodingTaskAlert = ({
  codingPopupTask,
  handleAttemptChallenge,
  handleSkipChallenge,
}) => {
  if (!codingPopupTask) return null;

  return (
    <div className="relative rounded-[24px] border border-primary/20 bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.3)] animate-in slide-in-from-top-4 duration-500 group">
      {/* Animated progress bar at top */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-zinc-800">
        <div className="h-full bg-gradient-to-r from-primary via-[#a3e14d] to-primary w-full animate-shimmer" />
      </div>

      <div className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <FiCode size={18} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary/80">
                  Coding Task
                </span>
                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  Active
                </span>
              </div>
              <h4 className="text-sm md:text-base font-black text-white tracking-tight leading-tight">
                {codingPopupTask.title || "Technical Assessment"}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {codingPopupTask.timeLimit && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/50 border border-white/5 text-zinc-400">
                <FiZap size={11} className="text-amber-400" />
                <span className="text-[9px] font-black uppercase tracking-widest tabular-nums">
                  {Math.floor(codingPopupTask.timeLimit / 60)}m
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-950/40 rounded-xl p-3 border border-white/5 mb-4">
          <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed line-clamp-2 font-medium">
            {codingPopupTask.question}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAttemptChallenge}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-[#a3e14d] text-black text-[10px] font-black rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            Attempt
          </button>
          <button
            onClick={handleSkipChallenge}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold rounded-lg border border-white/5 transition-all active:scale-[0.98]"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodingTaskAlert;
