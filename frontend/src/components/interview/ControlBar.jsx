import React from "react";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiVolume2,
  FiVolumeX,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";

const ControlBar = ({
  isMuted,
  isVideoOn,
  toggleMute,
  toggleVideo,
  handleEndCall,
  isUserSpeaking,
  isAgentSpeaking,
  isAiThinking,
  callStatus,
}) => {
  let statusText = "Standby...";
  let statusColor = "bg-zinc-500";
  let statusBg = "bg-zinc-500/20 text-zinc-400 border-white/10";

  if (callStatus === "connecting" || callStatus === "loading") {
    statusText = "Connecting...";
    statusColor = "bg-blue-500";
    statusBg = "bg-blue-500/20 text-blue-300 border-blue-500/30";
  } else if (isAgentSpeaking) {
    statusText = "Agent Speaking...";
    statusColor = "bg-sky-500";
    statusBg = "bg-sky-500/20 text-sky-300 border-sky-500/30";
  } else if (isAiThinking) {
    statusText = "Thinking...";
    statusColor = "bg-amber-500";
    statusBg = "bg-amber-500/20 text-amber-300 border-amber-500/30";
  } else if (isUserSpeaking) {
    statusText = "Listening...";
    statusColor = "bg-emerald-500";
    statusBg = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  } else if (callStatus === "active") {
    statusText = "Waiting...";
    statusColor = "bg-zinc-400";
    statusBg = "bg-zinc-500/20 text-zinc-300 border-white/10";
  }

  const isPulse = isAgentSpeaking || isAiThinking || isUserSpeaking || callStatus === "connecting";

  return (
    <div className="relative flex items-center justify-center w-full h-full gap-3 md:gap-4">
      
      {/* Floating Status Indicator */}
      <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-20">
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md shadow-lg ${statusBg}`}>
          <div className={`w-2 h-2 rounded-full ${statusColor} ${isPulse ? "animate-pulse" : ""}`} />
          <span className="text-[11px] font-semibold tracking-wide uppercase">{statusText}</span>
        </div>
      </div>

      {/* Mic Control */}
      <button
        onClick={toggleMute}
        title={isMuted ? "Turn on microphone" : "Turn off microphone"}
        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-colors border ${
          isMuted 
            ? "bg-red-500 text-white border-red-500 hover:bg-red-600" 
            : "bg-zinc-900 text-zinc-100 border-white/5 hover:bg-zinc-800"
        }`}
      >
        {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
      </button>

      {/* Cam Control */}
      <button
        onClick={toggleVideo}
        title={!isVideoOn ? "Turn on camera" : "Turn off camera"}
        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-colors border ${
          !isVideoOn 
            ? "bg-red-500 text-white border-red-500 hover:bg-red-600" 
            : "bg-zinc-900 text-zinc-100 border-white/5 hover:bg-zinc-800"
        }`}
      >
        {!isVideoOn ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
      </button>

      {/* End Call */}
      <button
        onClick={handleEndCall}
        title="Leave call"
        className="w-14 h-10 md:w-16 md:h-12 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
      >
        <FiPhoneOff size={22} />
      </button>
    </div>
  );
};

export default ControlBar;
