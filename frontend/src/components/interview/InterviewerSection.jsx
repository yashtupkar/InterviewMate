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
  handleExitSession,
}) => {
  return (
    <div
      className={`relative aspect-video bg-zinc-900/40 rounded-[28px] overflow-hidden border border-white/5 transition-all duration-700 ${activeCodingTask ? "scale-95 blur-xl" : "scale-100 blur-0 shadow-[0_0_50px_rgba(0,0,0,0.3)]"}`}
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {!activeCodingTask && !hasCallEnded && (
          <div className="absolute inset-0 bg-primary/5 blur-[100px] animate-pulse-slow pointer-events-none" />
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
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interviewer View / Speaker Indicator */}
        <div
          className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ${activeCodingTask ? "scale-75" : "scale-100"}`}
        >
          {!isUserFocus && (
            <div className="relative flex items-center justify-center">
              {/* Pulsing circles behind the avatar */}
              {isAgentSpeaking && (
                <>
                  <div className="absolute w-40 h-40 rounded-full bg-primary/20 animate-ping opacity-20" />
                  <div className="absolute w-32 h-32 rounded-full bg-primary/30 animate-pulse opacity-30" />
                </>
              )}

              <div
                ref={agentVolumeCircleRef}
                className={`absolute inset-0 rounded-full bg-primary/10 transition-transform duration-75 ease-out pointer-events-none ${isAgentSpeaking ? "opacity-100" : "opacity-0"}`}
                style={{ transform: "scale(1.15)" }}
              />

              <div
                className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 transition-all duration-500 ${isAgentSpeaking ? "bg-gradient-to-tr from-primary to-blue-500 shadow-[0_0_30px_rgba(190,242,100,0.3)]" : "bg-zinc-800/50 border border-white/10"}`}
              >
                <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden relative">
                  <img
                    src={getAgentImage(agentName)}
                    alt={agentName}
                    className={`w-full h-full object-cover transition-transform duration-700 ${isAgentSpeaking ? "scale-110" : "scale-100"}`}
                  />
                  {isAgentSpeaking && (
                    <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          )}
          {isUserFocus && isVideoOn && (
            <div className="w-full h-full p-2">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-2xl shadow-2xl border border-white/5"
              />
            </div>
          )}
        </div>

        <div className="absolute top-4 left-4 z-20">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-xl transition-all duration-300 ${isAgentSpeaking ? "bg-primary/10 border-primary/20" : "bg-black/40"}`}
          >
            {isAgentSpeaking && (
              <div className="flex gap-0.5 items-end h-2.5">
                <div className="w-0.5 h-full bg-primary animate-[music-bar_0.8s_ease-in-out_infinite]" />
                <div className="w-0.5 h-2/3 bg-primary animate-[music-bar_1s_ease-in-out_infinite]" />
                <div className="w-0.5 h-full bg-primary animate-[music-bar_1.2s_ease-in-out_infinite]" />
              </div>
            )}
            <span
              className={`text-[9px] font-bold uppercase tracking-[0.1em] ${isAgentSpeaking ? "text-primary" : "text-white"}`}
            >
              {isAgentSpeaking
                ? `${agentName} Speaking`
                : isAiThinking
                  ? "Thinking..."
                  : agentName}
            </span>
          </div>
        </div>
      </div>

      {/* Picture-in-Picture Mini View */}
      <button
        onClick={toggleVideoFocus}
        className="absolute bottom-4 right-4 z-30 group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
        <div className="relative aspect-video w-40 md:w-48 bg-zinc-900 rounded-xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 group-hover:scale-[1.02] active:scale-95">
          {isUserFocus ? (
            <div className="w-full h-full flex items-center justify-center bg-zinc-950/50">
              <div className="relative w-12 h-12 rounded-full p-0.5 bg-zinc-800 border border-white/10 overflow-hidden">
                <img
                  src={getAgentImage(agentName)}
                  alt={agentName}
                  className="w-full h-full object-cover"
                />
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
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600">
              <FiUser className="text-2xl" />
            </div>
          )}
          <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
            <div
              className={`w-1 h-1 rounded-full ${isVideoOn ? "bg-emerald-500" : "bg-zinc-600"}`}
            />
            <span className="text-[8px] font-bold text-white uppercase tracking-wider">
              {isUserFocus ? agentName : "You"}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default InterviewerSection;
