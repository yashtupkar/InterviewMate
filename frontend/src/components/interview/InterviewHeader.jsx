import React from "react";
import { FiArrowRight, FiClock, FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const InterviewHeader = ({ 
  displayInterviewData, 
  timeLeft, 
  connectionStatus, 
  interviewDuration, 
  isMuted, 
  isVideoOn,
  formatDuration 
}) => {
  const navigate = useNavigate();

  return (
    <header className="px-4 md:px-6 py-3 flex items-center justify-between bg-zinc-950/80 border-b border-white/5 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => navigate("/dashboard/setup")}
          className="p-2 bg-zinc-900/70 hover:bg-zinc-800 cursor-pointer rounded-xl transition-colors text-zinc-400 hover:text-white"
        >
          <FiArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h1 className="text-sm md:text-lg font-semibold text-white tracking-tight truncate max-w-[160px] md:max-w-none">
            {displayInterviewData.role}
          </h1>
          <p className="text-[10px] md:text-[11px] text-primary font-black uppercase tracking-[0.2em]">
            {displayInterviewData.interviewType} • Custom AI Engine
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 shadow-inner">
          <div className="flex items-center gap-1.5 border-r border-white/10 pr-2">
            <FiClock className={`text-[10px] ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
            <span className={`text-[10px] font-mono font-bold tabular-nums ${timeLeft < 60 ? 'text-red-500' : 'text-zinc-200'}`}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-agent-emerald animate-pulse' : 'bg-red-500'}`}
            />
            <span className="text-[10px] font-mono font-semibold text-zinc-500">
              {formatDuration(interviewDuration)}
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-[10px] font-semibold text-zinc-300">
          {isMuted ? <FiMicOff size={12} /> : <FiMic size={12} />}
          <span>{isMuted ? "Mic Off" : "Mic On"}</span>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-[10px] font-semibold text-zinc-300">
          {isVideoOn ? <FiVideo size={12} /> : <FiVideoOff size={12} />}
          <span>{isVideoOn ? "Cam On" : "Cam Off"}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 font-bold text-[10px] bg-zinc-900 text-zinc-300 rounded-lg border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {connectionStatus}
        </div>
      </div>
    </header>
  );
};

export default InterviewHeader;
