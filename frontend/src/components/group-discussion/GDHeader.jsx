import React from "react";
import { FiMessageSquare, FiClock, FiMic, FiMicOff } from "react-icons/fi";

const GDHeader = ({ topic, duration, isMuted }) => {
  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <header className="px-4 md:px-6 py-3 flex items-center justify-between bg-zinc-950/80 border-b dark:border-white/5 border-black/5 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="p-2 dark:bg-zinc-900/70 bg-gray-100/70 rounded-xl border border-[#bef264]/20 shadow-md">
          <FiMessageSquare className="text-[#bef264]" size={18} />
        </div>
        <div>
          <h1 className="text-sm md:text-lg font-bold dark:text-white text-black tracking-tight truncate max-w-[160px] md:max-w-none">
            {topic}
          </h1>
          <p className="text-[10px] md:text-[11px] dark:text-zinc-500 text-gray-500 font-medium">
            Group Discussion • Level Professional
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-zinc-900 bg-gray-50 border dark:border-white/5 border-black/5 shadow-inner">
          <FiClock className="text-[#bef264]" size={12} />
          <span className="text-[10px] font-mono font-semibold dark:text-zinc-300 text-gray-700">
            {fmt(duration)}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-zinc-900 bg-gray-50 border dark:border-white/5 border-black/5 text-[10px] font-semibold dark:text-zinc-300 text-gray-700 shadow-inner">
          {isMuted ? (
            <FiMicOff size={12} className="text-red-400 drop-shadow-md" />
          ) : (
            <FiMic size={12} className="text-emerald-400 drop-shadow-md" />
          )}
          <span>{isMuted ? "Mic Off" : "Mic On"}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 font-bold text-[10px] dark:bg-zinc-900 bg-gray-50 dark:text-zinc-300 text-gray-700 rounded-lg border dark:border-white/5 border-black/5 shadow-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          Live
        </div>
      </div>
    </header>
  );
};

export default GDHeader;
