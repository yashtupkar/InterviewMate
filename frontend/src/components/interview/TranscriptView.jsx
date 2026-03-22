import React from "react";
import { FiMessageSquare, FiInfo } from "react-icons/fi";

const TranscriptView = ({
  transcript,
  user,
  agentName,
  getAgentImage,
  connectionStatus,
  transcriptEndRef
}) => {
  return (
    <div className="flex flex-col bg-zinc-900/60 rounded-2xl border border-white/5 overflow-hidden shadow-2xl h-[640px]">
      <div className="p-3 flex items-center gap-2 bg-zinc-900 border-b border-white/5">
        <div className="flex-1 flex gap-1">
          <button className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 text-white text-[10px] font-bold shadow-md">
            Live Transcript
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800/80 text-zinc-400 text-[10px] font-semibold border border-white/5">
          <FiMessageSquare size={12} />
          Auto-scroll
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {transcript.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.isAgent ? 'items-start' : 'items-end'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex items-center gap-2 mb-1.5 ${msg.isAgent ? '' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden ${msg.isAgent ? 'bg-zinc-800 border border-white/10' : 'bg-primary text-black'}`}>
                {msg.isAgent ? (
                  <img src={getAgentImage(agentName)} alt="Agent" className="w-full h-full object-cover" />
                ) : (
                  user?.firstName?.[0] || 'U'
                )}
              </div>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                {msg.speaker} • {msg.timestamp}
              </span>
            </div>
            <div className={`p-3 rounded-2xl text-[13px] leading-relaxed max-w-[85%] shadow-sm transition-all ${msg.isAgent ? 'bg-zinc-800/80 text-white rounded-tl-none border border-white/5' : 'bg-primary text-black font-semibold rounded-tr-none shadow-lg shadow-primary/5'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>
      
      <div className="p-3 border-t border-white/5 bg-zinc-900/80 flex items-center justify-between text-[10px] text-zinc-400">
        <span className="flex items-center gap-2">
          <FiInfo size={12} />
          Transcript updates live as you speak
        </span>
        <span className="flex items-center gap-2 text-primary font-black uppercase tracking-widest">
          {connectionStatus}
        </span>
      </div>
    </div>
  );
};

export default TranscriptView;
