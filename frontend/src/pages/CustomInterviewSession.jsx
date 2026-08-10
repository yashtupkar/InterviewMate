import React, { useRef, useEffect, useMemo } from "react";
import { useCustomInterview } from "../hooks/useCustomInterview";
import { interviewAgents } from "../constants/agents";
import CodingSpace from "../components/CodingSpace";
import { FiBarChart2 } from "react-icons/fi";
import { Group, Panel, Separator } from "react-resizable-panels";
import ReloadSessionPrompt from "../components/interview/ReloadSessionPrompt";
import useInterviewReloadProtection from "../hooks/useInterviewReloadProtection";

// Components
import InterviewHeader from "../components/interview/InterviewHeader";
import InterviewerSection from "../components/interview/InterviewerSection";
import ControlBar from "../components/interview/ControlBar";
import SessionOverviewCards from "../components/interview/SessionOverviewCards";
import TranscriptView from "../components/interview/TranscriptView";
import CustomInterviewConfirmEndModal from "../components/interview/CustomInterviewConfirmEndModal";
import CustomInterviewEndedModal from "../components/interview/CustomInterviewEndedModal";

const getPreloadPriority = (agentVisualState) => {
  if (agentVisualState === "speaking") {
    return ["speaking", "idle", "listening", "thinking"];
  }

  if (agentVisualState === "listening") {
    return ["listening", "idle", "speaking", "thinking"];
  }

  if (agentVisualState === "thinking") {
    return ["thinking", "idle", "speaking", "listening"];
  }

  return ["idle", "thinking", "listening", "speaking"];
};

const collectAnimationSources = (animations, priorityStates) => {
  const sources = [];
  const seen = new Set();

  priorityStates.forEach((stateKey) => {
    const value = animations?.[stateKey];
    if (!value) return;

    const values = Array.isArray(value) ? value : [value];
    values.forEach((src) => {
      if (!src || seen.has(src)) return;
      seen.add(src);
      sources.push(src);
    });
  });

  return sources;
};

const CustomInterviewSession = () => {
  const { state, refs, actions } = useCustomInterview();

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
    isPreview,
    sessionId,
    agentName,
    displayInterviewData,
    interviewDuration,
    transcript,
    callStatus,
    user,
    showEndConfirm,
    countdownActive,
    countdownRemaining,
    countdownProgress,
    countdownMessageId,
  } = state;

  const { localVideoRef, agentVolumeCircleRef } = refs;
  const preloadedAgentVideosRef = useRef([]);
  const sessionRootRef = useRef(null);
  const {
    toggleMute,
    toggleVideo,
    toggleVideoFocus,
    handleGenerateReport,
    handleAttemptChallenge,
    handleSkipChallenge,
    handleCodingSubmit,
    formatDuration,
    handleSaveAndExit,
    requestEndSession,
    cancelEndSession,
    confirmEndSession,
  } = actions;

  const isLoopedVideoAvatarEnabled = false; // Disabled based on user feedback

  const agentMedia = useMemo(
    () =>
      interviewAgents.reduce((acc, agent) => {
        acc[agent.name] = {
          image: agent.image,
          profileImage: agent.profileImage,
          animations: agent.animations || null,
        };
        return acc;
      }, {}),
    [],
  );

  const getAgentImage = (name) =>
    agentMedia[name]?.image || "/assets/interviewers/male1.png";

  const getAgentProfileImage = (name) =>
    agentMedia[name]?.profileImage || "/assets/interviewers/male1.png";

  const getAgentVideo = (name, state) =>
    agentMedia[name]?.animations?.[state] || "";

  const currentAgentAnimations = useMemo(
    () => agentMedia[agentName]?.animations ?? null,
    [agentMedia, agentName],
  );

  const agentVisualState = isAgentSpeaking
    ? "speaking"
    : isAiThinking
      ? "thinking"
      : isUserSpeaking
        ? "listening"
        : "idle";

  const isUserTurn =
    !hasCallEnded &&
    callStatus === "active" &&
    !isAgentSpeaking &&
    !isAiThinking;

  const userAvatar =
    user?.imageUrl || user?.profileImageUrl || user?.avatarUrl || "";

  useEffect(() => {
    if (callStatus !== "active") return undefined;

    const el = document.documentElement;
    const requestFullscreen = async () => {
      if (document.fullscreenElement) return;
      if (el.requestFullscreen) return el.requestFullscreen();
      if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
      if (el.mozRequestFullScreen) return el.mozRequestFullScreen();
      if (el.msRequestFullscreen) return el.msRequestFullscreen();
    };

    requestFullscreen().catch(() => { });
    return undefined;
  }, [callStatus]);

  useEffect(() => {
    if (!hasCallEnded || !document.fullscreenElement) return undefined;

    const exitFullscreen = async () => {
      if (document.exitFullscreen) return document.exitFullscreen();
      if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
      if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
      if (document.msExitFullscreen) return document.msExitFullscreen();
    };

    exitFullscreen().catch(() => { });
    return undefined;
  }, [hasCallEnded]);

  const isCodingActionDisabled = isAgentSpeaking;
  const reloadGuard = useInterviewReloadProtection({
    sessionId,
    isSessionRunning: callStatus === "active" || callStatus === "connecting",
    hasInterviewEnded: hasCallEnded,
    isPreview,
    enableInPreview: true,
    resultPath: "/dashboard/reports",
  });

  useEffect(() => {
    if (!isLoopedVideoAvatarEnabled) return undefined;

    const animations = currentAgentAnimations;
    if (!animations) return undefined;

    const allSrcs = collectAnimationSources(
      animations,
      getPreloadPriority(agentVisualState),
    ).slice(0, 4);

    const createdVideos = allSrcs.map((src, index) => {
      const video = document.createElement("video");
      video.src = src;
      video.preload = index < 2 ? "auto" : "metadata";
      video.muted = true;
      video.playsInline = true;
      if ("fetchPriority" in video) {
        video.fetchPriority = index === 0 ? "high" : "auto";
      }
      video.load();
      return video;
    });

    preloadedAgentVideosRef.current = createdVideos;

    return () => {
      preloadedAgentVideosRef.current.forEach((video) => {
        video.removeAttribute("src");
        video.load();
      });
      preloadedAgentVideosRef.current = [];
    };
  }, [agentVisualState, currentAgentAnimations, isLoopedVideoAvatarEnabled]);

  return (
    <div ref={sessionRootRef} className="h-screen bg-[#09090b] text-zinc-100 font-sans overflow-hidden relative">


      {/* ── Full-Screen CodingSpace (after Attempt clicked) ───────────────── */}
      {activeCodingTask && (
        <div className="fixed inset-0 z-[120] flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <CodingSpace
            task={activeCodingTask}
            disableCopyPaste={false}
            showTimer={true}
            enableTerminalInput={true}
            onSubmit={handleCodingSubmit}
          />
        </div>
      )}

      <ReloadSessionPrompt
        open={reloadGuard.showReloadPrompt}
        onConfirm={reloadGuard.confirmReload}
        onCancel={reloadGuard.cancelReload}
      />

      <CustomInterviewConfirmEndModal
        isOpen={showEndConfirm}
        onConfirm={confirmEndSession}
        onCancel={cancelEndSession}
      />

      <CustomInterviewEndedModal
        isOpen={hasCallEnded && !isProcessing}
        onGenerateReport={() => handleGenerateReport()}
        onExit={handleSaveAndExit}
        isProcessing={isProcessing}
      />

      <div className="h-full flex flex-col relative z-10">
        <InterviewHeader
          displayInterviewData={displayInterviewData}
          timeLeft={timeLeft}
          connectionStatus={connectionStatus}
          interviewDuration={interviewDuration}
          isMuted={isMuted}
          isVideoOn={isVideoOn}
          formatDuration={formatDuration}
        />
        <main className="flex-1 w-full h-[calc(100vh-60px)] mx-auto  overflow-hidden">
          <Group orientation="horizontal" className="h-full w-full  flex">
            {/* Left Column: Visualizer & Controls */}
            <Panel defaultSize={65} minSize={40} className="flex flex-col h-full bg-[url('/assets/background/Landing-bg.png')] bg-cover bg-no-repeat bg-center  border border-white/5 overflow-hidden shadow-2xl relative">

              <div className="flex-1 relative z-10 min-h-0">
                <InterviewerSection
                  activeCodingTask={activeCodingTask}
                  hasCallEnded={hasCallEnded}
                  isAgentSpeaking={isAgentSpeaking}
                  isAiThinking={isAiThinking}
                  isUserSpeaking={isUserSpeaking}
                  isUserFocus={isUserFocus}
                  isVideoOn={isVideoOn}
                  callStatus={callStatus}
                  connectionStatus={connectionStatus}
                  transcriptCount={transcript.length}
                  userAvatar={userAvatar}
                  agentName={agentName}
                  getAgentImage={getAgentImage}
                  getAgentVideo={getAgentVideo}
                  agentVisualState={agentVisualState}
                  agentAnimations={currentAgentAnimations}
                  enableLoopedVideoAvatar={isLoopedVideoAvatarEnabled}
                  localVideoRef={localVideoRef}
                  agentVolumeCircleRef={agentVolumeCircleRef}
                  toggleVideoFocus={toggleVideoFocus}
                />
              </div>

              {/* Control Bar Area */}
              <div className="h-20 shrink-0 border-t border-white/5 flex items-center justify-between px-6  relative z-10">
                <ControlBar
                  isUserSpeaking={isUserSpeaking}
                  isAgentSpeaking={isAgentSpeaking}
                  isAiThinking={isAiThinking}
                  callStatus={callStatus}
                  isMuted={isMuted}
                  isVideoOn={isVideoOn}
                  toggleMute={toggleMute}
                  toggleVideo={toggleVideo}
                  handleEndCall={requestEndSession}
                />
              </div>
            </Panel>

            <Separator className="w-1   bg-zinc-800 hover:bg-zinc-600 transition-colors cursor-col-resize active:bg-primary" />

            {/* Right Column: Transcript */}
            <Panel defaultSize={35} minSize={25} className="flex flex-col h-full min-w-0">
              <TranscriptView
                transcript={transcript}
                user={user}
                isUserSpeaking={isUserSpeaking}
                isAgentSpeaking={isAgentSpeaking}
                isUserTurn={isUserTurn}
                agentName={agentName}
                getAgentImage={getAgentProfileImage}
                connectionStatus={connectionStatus}
                codingPopupTask={codingPopupTask}
                showCodingPopup={!activeCodingTask}
                isCodingActionDisabled={isCodingActionDisabled}
                handleAttemptChallenge={handleAttemptChallenge}
                handleSkipChallenge={handleSkipChallenge}
                countdownActive={countdownActive}
                countdownRemaining={countdownRemaining}
                countdownProgress={countdownProgress}
                countdownMessageId={countdownMessageId}
              />
            </Panel>
          </Group>

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
        </main>
      </div>
    </div>
  );
};

export default CustomInterviewSession;
