import React from "react";
import { FiMic, FiActivity, FiCpu } from "react-icons/fi";

const GDStarterModal = ({ showStarterModal, countdown, topic }) => {
  if (!showStarterModal) return null;

  // Status message based on countdown time
  let statusMessage = "Initializing microphone...";
  let statusIcon = <FiMic className="animate-bounce text-[#bef264]" />;
  
  if (countdown <= 3 && countdown > 1) {
    statusMessage = "Connecting to AI agents...";
    statusIcon = <FiCpu className="animate-spin text-emerald-400" />;
  } else if (countdown <= 1) {
    statusMessage = "Synchronizing audio streams... Ready!";
    statusIcon = <FiActivity className="animate-pulse text-indigo-400" />;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex items-center justify-center p-6 select-none animate-fadeIn">
      <div className="bg-zinc-950 border border-[#bef264]/20 rounded-[2.5rem] p-10 max-w-lg w-full text-center shadow-[0_0_100px_rgba(190,242,100,0.08)] relative overflow-hidden transition-all duration-500">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#bef264]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#bef264]/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#bef264]/10 border border-[#bef264]/20 text-[#bef264] text-xs font-black uppercase tracking-widest mb-8 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#bef264] animate-ping" />
            Connecting
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">
            Discussion Starting Soon
          </h2>
          <p className="text-zinc-500 text-xs font-semibold mb-8 max-w-sm italic line-clamp-2">
            "{topic}"
          </p>

          {/* Large Countdown Circle */}
          <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-25" />
            
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-white/5"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={402}
                strokeDashoffset={402 - (countdown / 5) * 402}
                className="text-[#bef264] transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-black text-white tabular-nums tracking-tighter drop-shadow-md">
                {countdown}
              </span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 max-w-xs w-full justify-center">
            {statusIcon}
            <span className="text-zinc-300 text-xs font-black tracking-wide uppercase">
              {statusMessage}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDStarterModal;
