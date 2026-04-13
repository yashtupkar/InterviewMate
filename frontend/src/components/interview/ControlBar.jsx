import React from "react";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
} from "react-icons/fi";

const ControlBar = ({
  isUserSpeaking,
  isAgentSpeaking,
  isAiThinking,
  callStatus,
  isMuted,
  isVideoOn,
  toggleMute,
  toggleVideo,
  handleEndCall,
}) => {
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-between gap-2 sm:gap-3 w-[calc(100%-1rem)] sm:w-auto bg-zinc-900/60 backdrop-blur-2xl p-2 px-3 sm:px-4 rounded-[18px] sm:rounded-[20px] border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/20">
      {/* Dynamic Status Indicator */}
      <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-white/10 mr-1 shrink-0">
        {isUserSpeaking ? (
          <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-full border border-primary/20 animate-in fade-in zoom-in duration-300">
            <div className="relative flex items-center justify-center w-1.5 h-1.5">
              <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
              <div className="relative w-1.5 h-1.5 bg-primary rounded-full" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-primary uppercase tracking-widest">
              Listening
            </span>
          </div>
        ) : isAiThinking ? (
          <div className="flex items-center gap-2 px-2 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 animate-in fade-in zoom-in duration-300">
            <div className="flex gap-0.5">
              <div className="w-1 h-1 bg-amber-400 rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-amber-400 uppercase tracking-widest">
              Thinking
            </span>
          </div>
        ) : isAgentSpeaking ? (
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 animate-in fade-in zoom-in duration-300">
            <div className="flex gap-0.5 items-end h-1.5">
              <div className="w-0.5 h-full bg-blue-400 animate-pulse" />
              <div className="w-0.5 h-2/3 bg-blue-400 animate-pulse delay-75" />
              <div className="w-0.5 h-full bg-blue-400 animate-pulse delay-150" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-blue-400 uppercase tracking-widest">
              Speaking
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-2 py-1 bg-zinc-800/50 rounded-full border border-white/5 opacity-60">
            <div className="w-1 h-1 bg-zinc-500 rounded-full" />
            <span className="text-[8px] sm:text-[9px] font-black text-zinc-500 uppercase tracking-widest">
              Standby
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={toggleMute}
          className={`group relative p-2.5 rounded-xl transition-all duration-300 active:scale-90 ${isMuted ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-zinc-800/50 hover:bg-zinc-700/50 text-white border border-white/5"}`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <FiMicOff size={16} /> : <FiMic size={16} />}
          <div
            className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10`}
          >
            {isMuted ? "Unmute Mic" : "Mute Mic"}
          </div>
        </button>

        <button
          onClick={toggleVideo}
          className={`group relative p-2.5 rounded-xl transition-all duration-300 active:scale-90 ${!isVideoOn ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-zinc-800/50 hover:bg-zinc-700/50 text-white border border-white/5"}`}
          title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
        >
          {!isVideoOn ? <FiVideoOff size={16} /> : <FiVideo size={16} />}
          <div
            className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10`}
          >
            {!isVideoOn ? "Start Video" : "Stop Video"}
          </div>
        </button>

        <button
          onClick={handleEndCall}
          className="group relative p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-900/20 transition-all duration-300 active:scale-90 active:rotate-12 border border-red-400/20"
          title="End Interview"
        >
          <FiPhoneOff size={16} />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-red-600 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-red-400/20">
            End Session
          </div>
        </button>
      </div>
    </div>
  );
};

export default ControlBar;
