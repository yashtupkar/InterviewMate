import React, { useRef, useEffect } from "react";
import { useCustomInterview } from "../hooks/useCustomInterview";
import CodingSpace from "../components/CodingSpace";
import { FiBarChart2 } from "react-icons/fi";

// Components
import InterviewHeader from "../components/interview/InterviewHeader";
import InterviewerSection from "../components/interview/InterviewerSection";
import ControlBar from "../components/interview/ControlBar";
import SessionOverviewCards from "../components/interview/SessionOverviewCards";
import TranscriptView from "../components/interview/TranscriptView";
import CodingTaskAlert from "../components/interview/CodingTaskAlert";

const CustomInterviewSession = () => {
  const { state, refs, actions } = useCustomInterview();
  const transcriptEndRef = useRef(null);

  const {
    timeLeft,
    isMuted,
    isVideoOn,
    isAgentSpeaking,
    isUserSpeaking,
    isAiThinking,
    hasCallEnded,
    activeCodingTask,
    codingPopupTask,
    isProcessing,
    connectionStatus,
    isUserFocus,
    userName,
    agentName,
    displayInterviewData,
    interviewDuration,
    transcript,
    callStatus,
    user,
  } = state;

  const { localVideoRef, agentVolumeCircleRef } = refs;
  const {
    toggleMute,
    toggleVideo,
    toggleVideoFocus,
    handleEndCall,
    handleGenerateReport,
    handleAttemptChallenge,
    handleSkipChallenge,
    handleCodingSubmit,
    formatDuration,
    resetInterview,
    handleSaveAndExit,
  } = actions;

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [transcript]);

  const agentImages = {
    Rohan: "/assets/interviewers/male1.png",
    Sophia: "/assets/interviewers/female1.png",
    Marcus: "/assets/interviewers/male2.png",
    Emma: "/assets/interviewers/female2.png",
    Elliot: "/assets/interviewers/male3.png",
    Rachel: "/assets/interviewers/female1.png",
    Drew: "/assets/interviewers/male1.png",
    Clyde: "/assets/interviewers/male2.png",
    Mimi: "/assets/interviewers/female2.png",
    Fin: "/assets/interviewers/male3.png",
    Nicole: "/assets/interviewers/female1.png",
  };

  const getAgentImage = (name) =>
    agentImages[name] || "/assets/interviewers/male1.png";

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans overflow-hidden relative">
      {/* ── Mesh Background Effects ───────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse-slow delay-700" />
      </div>

      {/* ── Full-Screen CodingSpace (after Attempt clicked) ───────────────── */}
      {activeCodingTask && (
        <div className="fixed inset-0 z-[120] flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <CodingSpace
            task={activeCodingTask}
            disableCopyPaste={false}
            showTimer={true}
            onSubmit={handleCodingSubmit}
          />
        </div>
      )}

      <div className="h-full flex flex-col min-h-screen relative z-10">
        <InterviewHeader
          displayInterviewData={displayInterviewData}
          timeLeft={timeLeft}
          connectionStatus={connectionStatus}
          interviewDuration={interviewDuration}
          isMuted={isMuted}
          isVideoOn={isVideoOn}
          formatDuration={formatDuration}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6">
          <div className="flex flex-col gap-4 min-w-0">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-[28px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <InterviewerSection
                activeCodingTask={activeCodingTask}
                hasCallEnded={hasCallEnded}
                isProcessing={isProcessing}
                isAgentSpeaking={isAgentSpeaking}
                isAiThinking={isAiThinking}
                isUserFocus={isUserFocus}
                isVideoOn={isVideoOn}
                agentName={agentName}
                getAgentImage={getAgentImage}
                localVideoRef={localVideoRef}
                agentVolumeCircleRef={agentVolumeCircleRef}
                toggleVideoFocus={toggleVideoFocus}
                handleGenerateReport={handleGenerateReport}
                handleExitSession={handleSaveAndExit}
              />
            </div>

            <div className="relative h-14">
              <ControlBar
                isUserSpeaking={isUserSpeaking}
                isAgentSpeaking={isAgentSpeaking}
                isAiThinking={isAiThinking}
                callStatus={callStatus}
                isMuted={isMuted}
                isVideoOn={isVideoOn}
                toggleMute={toggleMute}
                toggleVideo={toggleVideo}
                handleEndCall={handleEndCall}
              />
            </div>

            {isProcessing && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50">
                <div className="text-center w-full max-w-sm px-6">
                  <FiBarChart2 className="w-10 h-10 text-primary animate-pulse mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">
                    Finalizing Analysis
                  </h2>
                  <p className="text-zinc-500 text-xs leading-relaxed px-4 mb-6">
                    Constructing your performance metrics and behavioral
                    insights...
                  </p>
                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full animate-progress"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {codingPopupTask && !activeCodingTask && (
                <CodingTaskAlert
                  codingPopupTask={codingPopupTask}
                  handleAttemptChallenge={handleAttemptChallenge}
                  handleSkipChallenge={handleSkipChallenge}
                />
              )}
              <SessionOverviewCards
                timeLeft={timeLeft}
                displayInterviewData={displayInterviewData}
                agentName={agentName}
                formatDuration={formatDuration}
              />
            </div>
          </div>

          <aside className="flex flex-col min-w-0 h-full">
            <TranscriptView
              transcript={transcript}
              user={user}
              agentName={agentName}
              getAgentImage={getAgentImage}
              connectionStatus={connectionStatus}
              transcriptEndRef={transcriptEndRef}
            />
          </aside>
        </main>
      </div>
    </div>
  );
};

export default CustomInterviewSession;
