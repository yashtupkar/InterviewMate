import React from "react";
import { FiMic, FiMicOff, FiPhoneOff } from "react-icons/fi";

const GDControlBar = ({ toggleMute, isMuted, endSession, isEnding, isConcludingPhase }) => {
  return (
    <div className="absolute -top-4 w-fit left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 bg-zinc-900/60 backdrop-blur-2xl p-2 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:animate-scan pointer-events-none opacity-50" />
      
      <button
        onClick={toggleMute}
        className={`px-4 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden z-10 ${
          isMuted
            ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            : "bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10"
        }`}
      >
        {isMuted ? (
          <FiMicOff className="text-md drop-shadow-md" />
        ) : (
          <FiMic className="text-md" />
        )}
        <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline drop-shadow-md">
          {isMuted ? "Unmute" : "Mute"}
        </span>
      </button>

      <button
        onClick={endSession}
        disabled={isEnding}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all active:scale-95 shadow-xl font-bold relative overflow-hidden z-10 ${
          isConcludingPhase
            ? "bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse border-2 border-red-400"
            : "bg-[#bef264] hover:bg-[#bef264]/90 text-black shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:shadow-[0_0_30px_rgba(190,242,100,0.4)]"
        }`}
      >
        <FiPhoneOff className="text-md" />
        <span className="text-sm  ">
          {isConcludingPhase ? "Wrap up Now" : "Conclude Discussion"}
        </span>
      </button>
    </div>
  );
};

export default GDControlBar;
