import React from "react";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from "react-icons/fi";

const ControlBar = ({
  isUserSpeaking,
  isAgentSpeaking,
  isAiThinking,
  callStatus,
  isMuted,
  isVideoOn,
  toggleMute,
  toggleVideo,
  handleEndCall
}) => {
  return (
    <div className="absolute bottom-5 z-20 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
      {isUserSpeaking && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            Listening
          </span>
        </div>
      )}
      {!isUserSpeaking &&
        !isAgentSpeaking &&
        isAiThinking &&
        callStatus === "active" && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500/10 backdrop-blur-md border border-amber-500/20 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              Thinking...
            </span>
          </div>
        )}
      {!isUserSpeaking &&
        !isAgentSpeaking &&
        !isAiThinking &&
        callStatus === "active" && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500/10 backdrop-blur-md border border-blue-500/20 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              Your Turn
            </span>
          </div>
        )}
      <button
        onClick={toggleMute}
        className={`p-3 cursor-pointer rounded-xl transition-all ${isMuted ? "bg-red-500 text-white" : "bg-zinc-900/70 hover:bg-zinc-800 text-white"}`}
      >
        {isMuted ? <FiMicOff size={18} /> : <FiMic size={18} />}
      </button>
      <button
        onClick={toggleVideo}
        className={`p-3 cursor-pointer rounded-xl transition-all ${!isVideoOn ? "bg-red-500 text-white" : "bg-zinc-900/70 hover:bg-zinc-800 text-white"}`}
      >
        {!isVideoOn ? <FiVideoOff size={18} /> : <FiVideo size={18} />}
      </button>

      <button
        onClick={handleEndCall}
        className="p-3 bg-red-600 cursor-pointer hover:bg-red-500 text-white rounded-xl shadow-lg transition-all active:scale-95"
      >
        <FiPhoneOff size={18} />
      </button>
    </div>
  );
};

export default ControlBar;
