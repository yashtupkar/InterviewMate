import React from "react";
import { FiMessageSquare, FiInfo } from "react-icons/fi";

const TranscriptView = ({
  transcript,
  user,
  agentName,
  getAgentImage,
  connectionStatus,
  transcriptEndRef,
}) => {
  return (
    <div className="flex flex-col bg-zinc-900/40 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.3)] h-[660px]">
      <div className="p-4 flex items-center justify-between bg-zinc-800/30 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <FiMessageSquare className="text-primary w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">
              Transcript
            </h3>
            <div className="flex items-center gap-1.5 opacity-60">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <p className="text-[8px] text-zinc-400 font-medium uppercase tracking-wider">
                Auto-scrolling
              </p>
            </div>
          </div>
        </div>
        <div className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
            {connectionStatus}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent hover:scrollbar-thumb-zinc-700 transition-colors">
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <FiMessageSquare size={20} />
            </div>
            <p className="text-[11px] font-medium">
              Messages will appear here.
            </p>
          </div>
        ) : (
          transcript.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.isAgent ? "items-start" : "items-end"} group animate-in fade-in slide-in-from-bottom-2 duration-500`}
            >
              <div
                className={`flex items-center gap-2 mb-1.5 ${msg.isAgent ? "" : "flex-row-reverse"}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center overflow-hidden shadow-lg transition-transform group-hover:scale-105 ${msg.isAgent ? "bg-zinc-800 border border-white/10" : "bg-gradient-to-tr from-primary to-[#a3e14d] border border-white/20"}`}
                >
                  {msg.isAgent ? (
                    <img
                      src={getAgentImage(agentName)}
                      alt="Agent"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] font-black text-black">
                      {user?.firstName?.[0] || "U"}
                    </span>
                  )}
                </div>
                <div
                  className={`flex flex-col ${msg.isAgent ? "items-start" : "items-end"}`}
                >
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.1em]">
                    {msg.speaker}
                  </span>
                </div>
              </div>
              <div
                className={`relative p-3 rounded-2xl text-[12px] leading-relaxed max-w-[90%] shadow-lg transition-all ${
                  msg.isAgent
                    ? "bg-zinc-800/80 text-zinc-100 rounded-tl-none border border-white/5"
                    : "bg-gradient-to-br from-primary to-[#a3e14d] text-black font-semibold rounded-tr-none shadow-primary/10"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={transcriptEndRef} />
      </div>

      <div className="p-3 border-t border-white/5 bg-zinc-900/50 flex items-center gap-2 text-[9px] text-zinc-500">
        <FiInfo size={12} className="text-primary/60" />
        <p className="font-medium leading-tight">AI-generated transcript.</p>
      </div>
    </div>
  );
};

export default TranscriptView;
