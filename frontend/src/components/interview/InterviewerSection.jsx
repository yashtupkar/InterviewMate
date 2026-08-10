import React from "react";
import { FiUser, FiVideo } from "react-icons/fi";
import { Orb } from "orb-ui";

import { IoSparkles } from "react-icons/io5";

const InterviewerSection = ({
  activeCodingTask,
  hasCallEnded,
  isAgentSpeaking,
  isAiThinking,
  isUserSpeaking,
  isUserFocus,
  isVideoOn,
  callStatus,
  connectionStatus,
  transcriptCount,
  userAvatar,
  agentName,
  getAgentImage,
  getAgentVideo,
  agentVisualState,
  enableLoopedVideoAvatar,
  localVideoRef,
  agentVolumeCircleRef,
  toggleVideoFocus,
  agentAnimations,
}) => {
  const isConnecting =
    connectionStatus !== "Connected" ||
    callStatus === "loading" ||
    callStatus === "connecting";

  // Determine current display state text and color
  let statusText = "Standby...";
  let statusColor = "bg-zinc-500";
  let statusBg = "bg-zinc-500/10 text-zinc-400";

  if (isConnecting) {
    statusText = "Connecting...";
    statusColor = "bg-blue-500";
    statusBg = "bg-blue-500/10 text-blue-400";
  } else if (isAgentSpeaking) {
    statusText = "Speaking...";
    statusColor = "bg-blue-500";
    statusBg = "bg-blue-500/10 text-blue-400";
  } else if (isAiThinking) {
    statusText = "Thinking...";
    statusColor = "bg-amber-500";
    statusBg = "bg-amber-500/10 text-amber-400";
  } else if (isUserSpeaking) {
    statusText = "Listening...";
    statusColor = "bg-green-500";
    statusBg = "bg-green-500/10 text-green-400";
  } else if (callStatus === "active") {
    statusText = "Listening...";
    statusColor = "bg-green-500";
    statusBg = "bg-green-500/10 text-green-400";
  }

  return (
    <div className="w-full h-full p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 place-content-center overflow-hidden">
      
      {/* ── AI Card ── */}
      <div className={`relative w-full aspect-square md:aspect-[1.1/1] max-h-[55vh] flex flex-col items-center justify-center bg-zinc-900 rounded-3xl overflow-hidden transition-all duration-500 mx-auto ${
        isAgentSpeaking 
          ? "border border-primary/50 shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)]" 
          : "border border-white/5 shadow-2xl"
      }`}>
        
        {/* Top Left Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-xl border transition-colors ${isAgentSpeaking ? 'border-primary/30' : 'border-white/10'} shadow-lg`}>
            {isAgentSpeaking ? (
              <div className="flex gap-0.5 items-end h-3 mr-0.5">
                <div className="w-[2px] h-full bg-primary rounded-sm animate-[music-bar_0.8s_ease-in-out_infinite]" />
                <div className="w-[2px] h-2/3 bg-primary rounded-sm animate-[music-bar_1s_ease-in-out_infinite]" />
                <div className="w-[2px] h-full bg-primary rounded-sm animate-[music-bar_1.2s_ease-in-out_infinite]" />
              </div>
            ) : (
              <IoSparkles className="text-primary w-3.5 h-3.5" />
            )}
            <span className="text-xs font-medium text-white tracking-wide">{agentName}</span>
          </div>
        </div>

        {/* Center Content: Orb with Custom Dynamic Animations */}
        <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${activeCodingTask ? "scale-75 opacity-50" : "scale-100 opacity-100"}`}>
          <div className={`transition-transform duration-[1000ms] ease-in-out ${isAgentSpeaking || isAiThinking ? "scale-100" : "scale-[0.60]"}`}>
            <div className={`w-[180px] h-[180px] md:w-[220px] md:h-[220px] relative flex items-center justify-center transition-all duration-500 rounded-full
              ${isAgentSpeaking ? "animate-organic-scale shadow-[0_0_60px_rgba(var(--primary),0.4)]" : ""}
              ${isAiThinking ? " animate-spin" : ""}
              ${!isAgentSpeaking && !isAiThinking && isUserSpeaking ? "grayscale-[20%]" : ""}
            `}>
              <Orb 
                state={isConnecting ? "connecting" : isAgentSpeaking ? "speaking" : isAiThinking ? "thinking" : "listening"} 
                theme="cloud" 
                size={320} 
                interactive={false} 
                style={{ '--orb-ui-cloud-control-surround': 'transparent' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── User Card ── */}
      <div className={`relative w-full aspect-square md:aspect-[1.1/1] max-h-[55vh] bg-zinc-900 rounded-3xl overflow-hidden transition-all duration-500 flex flex-col items-center justify-center mx-auto ${
        isUserSpeaking 
          ? "border border-primary/50 shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)]" 
          : "border border-white/5 shadow-2xl"
      }`}>
        {isVideoOn ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror absolute inset-0 rounded-3xl"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 absolute inset-0">
            {userAvatar ? (
              <img src={userAvatar} alt="You" className="w-36 h-36 rounded-full object-cover mb-3  shadow-[0_0_20px_rgba(var(--primary),0.2)]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-3">
                <FiUser className="w-8 h-8 text-primary" />
              </div>
            )}
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-bold">Camera Off</span>
          </div>
        )}
        
        {/* User Badge & Audio Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg z-20">
          {isUserSpeaking ? (
            <div className="flex gap-0.5 items-end h-3 mr-0.5">
              <div className="w-[2px] h-full bg-primary rounded-sm animate-[music-bar_0.8s_ease-in-out_infinite]" />
              <div className="w-[2px] h-2/3 bg-primary rounded-sm animate-[music-bar_1s_ease-in-out_infinite]" />
              <div className="w-[2px] h-full bg-primary rounded-sm animate-[music-bar_1.2s_ease-in-out_infinite]" />
            </div>
          ) : (
            <div className={`w-1.5 h-1.5 rounded-full ${isVideoOn ? "bg-primary" : "bg-red-500"}`} />
          )}
          <span className="text-xs text-white font-medium tracking-wide">You</span>
        </div>
      </div>

    </div>
  );
};

export default InterviewerSection;
