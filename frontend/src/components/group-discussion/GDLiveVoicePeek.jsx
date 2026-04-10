import React from "react";
import { FiMic, FiHeadphones, FiMessageCircle } from "react-icons/fi";

const GDLiveVoicePeek = ({ liveText, isUserSpeaking, speakingAgent }) => {
  // Determine state
  let state = "open"; // default open floor
  if (isUserSpeaking) state = "speaking";
  else if (speakingAgent) state = "listening";

  return (
    <div className={`transition-all duration-500 mb-4 transform hover:scale-[1.01] `}>
      <div className={`dark:bg-zinc-900/80 bg-white/90 p-4 rounded-2xl border ${state === 'speaking' ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.15)]' : state === 'listening' ? 'border-indigo-500' : 'dark:border-white/5 border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)]'} flex items-center gap-4 backdrop-blur-xl relative overflow-hidden transition-all duration-500`}>
        
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-all duration-500 ${state === 'speaking' ? 'bg-emerald-500/20 scale-150' : state === 'listening' ? 'bg-indigo-500/10' : 'bg-zinc-500/10'}`} />
        
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-all duration-500 ${state === 'speaking' ? 'bg-emerald-500 border-emerald-500/40 text-white' : state === 'listening' ? 'bg-indigo-500 border-indigo-500/20 text-white border' : 'bg-purple-800 border-purple-800/50 text-white border'}`}>
          {state === 'speaking' && <FiMic className="drop-shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse" size={20} />}
          {state === 'listening' && <FiHeadphones size={20} />}
          {state === 'open' && <FiMessageCircle className="animate-pulse" size={20} />}
        </div>

        <div className="flex-1 relative z-10 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <p className={`text-[10px] font-black uppercase tracking-widest drop-shadow-sm transition-colors duration-500 ${state === 'speaking' ? 'text-emerald-400' : state === 'listening' ? 'text-indigo-400' : 'text-zinc-400'}`}>
              {state === 'speaking' ? "Live Voice Processing" : state === 'listening' ? "Listen & Prepare" : "Floor Open"}
            </p>
            {state === 'speaking' && (
               <div className="flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-3 bg-emerald-400 rounded-full animate-sound-bar"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>
          <p className={`text-[14px] italic font-medium leading-snug transition-colors duration-500  ${state === 'speaking' ? 'dark:text-zinc-200 text-gray-800' : 'text-zinc-500'}`}>
            {state === 'speaking' ? 
               (liveText ? `"${liveText}"` : "Listening...") : 
             state === 'listening' ? 
               `${speakingAgent} is speaking... Formulate your points.` : 
               "Mic is open! Speak now to add your points."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default GDLiveVoicePeek;
