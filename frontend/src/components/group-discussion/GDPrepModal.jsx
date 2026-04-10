import React from "react";
import { FiClock } from "react-icons/fi";

const GDPrepModal = ({ showPrepModal, prepCountdown, topic, handlePrepEnd }) => {
  if (!showPrepModal) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-[#bef264]/20 rounded-[2.5rem] p-10 max-w-2xl w-full text-center shadow-[0_0_80px_rgba(190,242,100,0.1)] relative overflow-hidden transition-all transform hover:scale-[1.01] duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#bef264]/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#bef264]/5 rounded-full blur-3xl -ml-20 -mb-20" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#bef264]/10 border border-[#bef264]/20 text-[#bef264] text-xs font-black uppercase tracking-widest mb-6 shadow-inner">
            <FiClock className="animate-pulse" />
            Preparation Phase
          </div>

          <h2 className="text-2xl md:text-4xl font-black text-white mb-4 tracking-tight leading-loose drop-shadow-lg">
            Prepare for: <span className="text-[#bef264] italic">"{topic}"</span>
          </h2>

          <p className="text-zinc-400 text-sm mb-12 font-medium leading-relaxed max-w-md mx-auto">
            You have 1 minute to collect your thoughts and prepare your points.
            The GD will start automatically when the timer ends.
          </p>

          <div className="relative w-48 h-48 mx-auto mb-10">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/5"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={553}
                strokeDashoffset={553 - (prepCountdown / 60) * 553}
                className="text-[#bef264] transition-all duration-1000 ease-linear drop-shadow-lg"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white tabular-nums drop-shadow-md">
                0:{String(prepCountdown).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-black text-[#bef264] uppercase tracking-widest mt-1 opacity-80">
                Seconds Left
              </span>
            </div>
          </div>

          <button
            onClick={handlePrepEnd}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl transition-all text-xs font-black uppercase tracking-widest active:scale-95 shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Skip & Start Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default GDPrepModal;
