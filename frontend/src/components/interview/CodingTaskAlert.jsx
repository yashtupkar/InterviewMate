import React from "react";
import { FiCode, FiZap } from "react-icons/fi";

const CodingTaskAlert = ({
  codingPopupTask,
  handleAttemptChallenge,
  handleSkipChallenge
}) => {
  if (!codingPopupTask) return null;

  return (
    <div className="rounded-2xl border border-primary/30 bg-[#141417] overflow-hidden shadow-lg shadow-primary/5 animate-in slide-in-from-top-2 duration-300">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/50 to-primary" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <FiCode size={15} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Coding challenge</p>
              <p className="text-[13px] font-black text-white truncate">{codingPopupTask.title || "Coding Task"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {codingPopupTask.timeLimit && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 border border-white/10 text-zinc-400">
                ⏱ {Math.floor(codingPopupTask.timeLimit / 60)}m
              </span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mb-3">
          {codingPopupTask.question}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAttemptChallenge}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-[#a3e14d] text-black text-[11px] font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <FiZap size={12} /> Attempt
          </button>
          <button
            onClick={handleSkipChallenge}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold rounded-xl border border-white/5 transition-all active:scale-95"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodingTaskAlert;
