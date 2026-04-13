import React from "react";
import { FiClock, FiCode, FiZap } from "react-icons/fi";

const CodingTaskAlert = ({
  codingPopupTask,
  handleAttemptChallenge,
  handleSkipChallenge,
  isActionDisabled = false,
  disabledReason = "",
}) => {
  if (!codingPopupTask) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/70 bg-primary shadow-[0_18px_50px_rgba(190,242,100,0.25)] animate-in slide-in-from-top-3 duration-300 group">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-black/40 via-black/20 to-black/40 opacity-80" />
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-black/10 blur-3xl" />

      <div className="relative p-3 sm:p-3.5">
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="flex p-2 items-center justify-center rounded-lg border border-black/15 bg-black/10 text-black shadow-inner shadow-black/10 shrink-0">
              <FiCode size={15} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[8px] font-black uppercase tracking-[0.16em] text-black/75">
                  Coding Task
                </span>
                <span className="h-1 w-1 rounded-full bg-black/40" />
                <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-black/60">
                  Active
                </span>
              </div>

              <h4 className="truncate text-[14px] sm:text-[15px] font-black text-black tracking-tight leading-tight">
                {codingPopupTask.title || "Technical Assessment"}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {codingPopupTask.timeLimit && (
              <div className="flex items-center gap-1 rounded-full border border-black/15 bg-white/35 px-2 py-0.5 text-black/80 shadow-sm shadow-black/10">
                <FiClock size={12} className="text-black/70" />
                <span className="text-[10px] font-black uppercase tracking-[0.14em] tabular-nums text-black/80">
                  {Math.max(1, Math.floor(codingPopupTask.timeLimit / 60))}min
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-2.5 rounded-lg border border-black/10 bg-white/45 px-2.5 py-2 shadow-inner shadow-white/20">
          <p className="mb-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-black/55">
            Question
          </p>
          <p className="text-[12px] sm:text-[13px] leading-relaxed text-black/85 font-semibold line-clamp-2">
            {codingPopupTask.question}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-1.5">
          <button
            onClick={() => {
              if (isActionDisabled) return;
              handleAttemptChallenge();
            }}
            disabled={isActionDisabled}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.12em] transition-all ${
              isActionDisabled
                ? "cursor-not-allowed border border-black/10 bg-black/15 text-black/40"
                : "border border-black/20 bg-black text-primary shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:bg-black/90 active:scale-[0.99]"
            }`}
          >
            Attempt
          </button>

          <button
            onClick={() => {
              if (isActionDisabled) return;
              handleSkipChallenge();
            }}
            disabled={isActionDisabled}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.12em] transition-all ${
              isActionDisabled
                ? "cursor-not-allowed border border-black/10 bg-black/10 text-black/35"
                : "border border-black/20 bg-black/10 text-black/80 hover:bg-black/20 hover:text-black active:scale-[0.99]"
            }`}
          >
            Skip
          </button>
        </div>

        {isActionDisabled && disabledReason && (
          <p className="mt-1.5 text-[9px] leading-snug text-black/55">
            {disabledReason}
          </p>
        )}
      </div>
    </div>
  );
};

export default CodingTaskAlert;
