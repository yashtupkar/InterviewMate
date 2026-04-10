import React from "react";
import { FiMessageSquare, FiLoader, FiUser } from "react-icons/fi";

const GDTranscriptView = ({ transcript, isThinking, user, AGENT_IMAGES, endRef }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-900/40 rounded-2xl border dark:border-white/5 border-black/5 overflow-hidden backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.2)]">
      {/* Discussion Header */}
      <div className="px-6 py-5 border-b dark:border-white/5 border-black/5 flex items-center justify-between dark:bg-zinc-900/60 bg-gray-100/60 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse shadow-[0_0_15px_var(--[#bef264])]" />
          <p className="text-[11px] font-black text-white uppercase tracking-widest drop-shadow-md">
            Discussion Log
          </p>
        </div>
        {isThinking && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
              AI Processing
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-3.5 bg-[#bef264]/60 rounded-full animate-sound-bar"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scrolling List */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar min-h-0 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#bef264]/5 to-transparent pointer-events-none opacity-20" />
        
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 relative z-10">
            <FiMessageSquare size={48} className="mb-4 text-zinc-500 drop-shadow-lg" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Floor initializing...
            </p>
          </div>
        ) : (
          transcript.map((entry) => {
            const isUser = entry.role === "user";
            const color = isUser ? "#22c55e" : entry.color;
            return (
              <div
                key={entry.id}
                className={`flex gap-3 relative z-10 translate-y-0 opacity-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs font-black text-white shadow-lg overflow-hidden"
                  style={{
                    background: `${color}`,
                    border: `2px solid ${color}66`,
                  }}
                >
                  {isUser ? (
                    user?.imageUrl ? (
                      <img src={user.imageUrl} alt="You" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser size={16} />
                    )
                  ) : AGENT_IMAGES[entry.speaker] ? (
                    <img src={AGENT_IMAGES[entry.speaker]} alt={entry.speaker} className="w-full h-full object-cover" />
                  ) : (
                    entry.speaker[0]
                  )}
                </div>
                <div className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"} max-w-[85%]`}>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 drop-shadow-sm">
                    {entry.speaker}
                  </span>
                  <div
                    className={`px-5 py-3.5 rounded-[1.25rem] text-[14px] leading-relaxed shadow-lg backdrop-blur-md ${
                      isUser ? "rounded-tr-sm bg-zinc-800/90 text-zinc-100" : "rounded-tl-sm text-zinc-200"
                    }`}
                    style={
                      !isUser
                        ? {
                            background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                            border: `1px solid ${color}40`,
                          }
                        : {
                            border: "1px solid rgba(255,255,255,0.08)",
                          }
                    }
                  >
                    {entry.text}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isThinking && (
          <div className="flex gap-3 animate-in fade-in zoom-in duration-300 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-[#bef264]/10 border-2 border-[#bef264]/30 flex items-center justify-center shadow-[0_0_20px_rgba(190,242,100,0.1)]">
              <FiLoader className="animate-spin text-[#bef264]" size={16} />
            </div>
            <div className="px-5 py-4 rounded-[1.25rem] bg-white/5 border border-white/10 rounded-tl-sm w-16 flex items-center justify-center backdrop-blur-md">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#bef264]/80 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#bef264]/80 animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#bef264]/80 animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} className="h-10 shrink-0" />
      </div>
    </div>
  );
};

export default GDTranscriptView;
