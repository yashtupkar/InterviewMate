import React from "react";
import { FiArrowRight, FiClock, FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Logo from "../common/Logo";

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
    <header className="px-3 md:px-4 py-2 flex items-center justify-between bg-zinc-900 border-b border-white/5 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-2">
      
          <Logo size="34" className="cursor-pointer" onClick={() => navigate("/dashboard/setup")} />
        
        <div>
          <h1 className="text-sm md:text-lg font-semibold text-white tracking-tight truncate max-w-[160px] md:max-w-none">
            {displayInterviewData.role}
          </h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">
            {displayInterviewData.interviewType} 
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
       
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
          isMuted ? "bg-red-500 text-white border-red-500" : "bg-zinc-800 border border-white/5 text-zinc-300"
        }`}>
          {isMuted ? <FiMicOff size={12} /> : <FiMic size={12} />}
          <span>{isMuted ? "Mic Off" : "Mic On"}</span>
        </div>
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
          !isVideoOn ? "bg-red-500 text-white border-red-500" : "bg-white text-black border-transparent"
        }`}>
          {isVideoOn ? <FiVideo size={12} /> : <FiVideoOff size={12} />}
          <span>{isVideoOn ? "Cam On" : "Cam Off"}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white  ">
          <div className="flex items-center gap-1.5 border-r border-white/10 pr-2">
            <FiClock className={` ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-black'}`} />
            <span className={`text-xs  font-bold tabular-nums ${timeLeft < 60 ? 'text-red-500' : 'text-black'}`}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>

        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 font-bold text-xs  text-black rounded-lg bg-primary">
          {connectionStatus}
        </div>
      </div>
    </header>
  );
};

export default InterviewHeader;
