import React from "react";
import { FiCheckCircle, FiUser } from "react-icons/fi";

const InterviewerSection = ({
  activeCodingTask,
  hasCallEnded,
  isProcessing,
  isAgentSpeaking,
  isAiThinking,
  isUserFocus,
  isVideoOn,
  agentName,
  getAgentImage,
  localVideoRef,
  agentVolumeCircleRef,
  toggleVideoFocus,
  handleGenerateReport,
  handleExitSession
}) => {
  return (
    <div className={`relative aspect-video bg-zinc-900/40 rounded-[28px] overflow-hidden border border-white/5 transition-all duration-700 ${activeCodingTask ? 'scale-95 blur-xl' : 'scale-100 blur-0 shadow-[0_0_60px_rgba(24,24,27,0.7)]'}`}>
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {!activeCodingTask && !hasCallEnded && (
          <div className="absolute inset-0 bg-primary/5 blur-[90px] animate-pulse-slow pointer-events-none" />
        )}
        
        {hasCallEnded && !isProcessing && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-40">
            <div className="text-center w-full max-w-sm px-6">
              <FiCheckCircle className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
                Interview Finished!
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed mb-6 font-medium">
                You've completed the interview session. Ready for analysis?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleGenerateReport()}
                  className="flex-1 bg-primary hover:bg-[#a3e14d] text-black font-black text-xs py-3 rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
                >
                  Generate Detailed Report
                </button>
                <button
                  onClick={handleExitSession}
                  className="flex-1 bg-zinc-950/80 hover:bg-zinc-900 text-white font-bold text-xs py-3 rounded-2xl border border-white/10 transition-all active:scale-[0.98]"
                >
                  Exit Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interviewer View / Speaker Indicator */}
        <div className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ${activeCodingTask ? 'scale-75' : 'scale-100'}`}>
          {!isUserFocus && (
            <div className="relative flex items-center justify-center">
              <div
                ref={agentVolumeCircleRef}
                className={`absolute inset-0 rounded-full bg-primary/20 transition-transform duration-75 ease-out pointer-events-none ${isAgentSpeaking ? "opacity-100" : "opacity-0"}`}
                style={{ transform: "scale(1)" }}
              />
              <div
                className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-zinc-900/80 border ${isAgentSpeaking ? "border-primary shadow-[0_0_30px_rgba(190,242,100,0.6)]" : "border-white/10"} shadow-2xl backdrop-blur-md flex items-center justify-center overflow-hidden z-10 transition-all duration-300`}
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-primary/20 border border-white/10 shadow-2xl backdrop-blur-md flex items-center justify-center overflow-hidden">
                  <img
                    src={getAgentImage(agentName)}
                    alt={agentName}
                    className={`w-full h-full object-cover transition-transform duration-500 ${isAgentSpeaking ? 'scale-110' : 'scale-100'}`}
                  />
                </div>
              </div>
            </div>
          )}
          {isUserFocus && isVideoOn && (
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-[28px]" />
          )}
        </div>

        <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-[10px] font-bold text-white uppercase tracking-wider">
            {isAgentSpeaking ? `${agentName} is speaking...` : isAiThinking ? "AI is thinking..." : "Interviewer"}
          </div>
        </div>
      </div>

      <button
        onClick={toggleVideoFocus}
        className="absolute bottom-4 z-20 right-4 aspect-[16/10] bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl transition-transform hover:scale-105 w-52 md:w-50"
      >
        {isUserFocus ? (
          <div className="w-full h-full flex items-center justify-center bg-zinc-950/50">
            <div className="relative flex items-center justify-center">
              <div
                ref={agentVolumeCircleRef}
                className={`absolute inset-0 rounded-full bg-primary/20 transition-transform duration-75 ease-out pointer-events-none ${isAgentSpeaking ? "opacity-100" : "opacity-0"}`}
                style={{ transform: "scale(1)" }}
              />
              <div
                className={`relative w-16 h-16 rounded-full border-2 ${isAgentSpeaking ? 'border-primary shadow-[0_0_15px_rgba(190,242,100,0.5)]' : 'border-white/10'} bg-zinc-900/80 overflow-hidden transition-all duration-300 z-10`}
              >
                <div className="w-14 h-14 rounded-full bg-primary/20 border border-white/10 flex items-center justify-center overflow-hidden">
                  <img
                    src={getAgentImage(agentName)}
                    alt={agentName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : isVideoOn ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/80 text-zinc-400">
            <FiUser className="text-4xl text-zinc-600" />
          </div>
        )}
        <div className="absolute top-2 left-2 rounded-full ml-2">
          <span className="text-[9px] font-semibold text-white tracking-tighter">
            {isUserFocus ? agentName : "You"}
          </span>
        </div>
      </button>
    </div>
  );
};

export default InterviewerSection;
