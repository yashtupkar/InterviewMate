import React from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useLocation, useNavigate } from "react-router-dom";

// Hook
import { useGroupDiscussion } from "../hooks/useGroupDiscussion";

// Components
import GDHeader from "../components/group-discussion/GDHeader";
import GDPrepModal from "../components/group-discussion/GDPrepModal";
import GDEndedOverlay from "../components/group-discussion/GDEndedOverlay";
import GDConfirmEndModal from "../components/group-discussion/GDConfirmEndModal";
import GDParticipantGrid from "../components/group-discussion/GDParticipantGrid";
import GDControlBar from "../components/group-discussion/GDControlBar";
import GDLiveVoicePeek from "../components/group-discussion/GDLiveVoicePeek";
import GDTopicContext from "../components/group-discussion/GDTopicContext";
import GDInvigilator from "../components/group-discussion/GDInvigilator";
import GDTranscriptView from "../components/group-discussion/GDTranscriptView";

export default function GroupDiscussionSession() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const meta = location.state || {};

  const { state, refs, actions, constants } = useGroupDiscussion(
    sessionId,
    meta,
    navigate
  );

  return (
    <>
      <Helmet>
        <title>Group Discussion Session | PlaceMateAI</title>
      </Helmet>
      <div className="h-screen flex flex-col bg-background overflow-hidden selection:bg-[#bef264]/30 text-zinc-100">
        {/* Mesh Background Effects
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#bef264]/5 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow delay-700" />
        </div> */}

        <GDPrepModal
          showPrepModal={state.showPrepModal}
          prepCountdown={state.prepCountdown}
          topic={constants.topic}
          handlePrepEnd={actions.handlePrepEnd}
        />
        <GDEndedOverlay
          sessionEnded={state.sessionEnded}
          sessionId={sessionId}
        />
        <GDConfirmEndModal 
          showEndConfirm={state.showEndConfirm}
          confirmEndSession={actions.confirmEndSession}
          cancelEndSession={actions.cancelEndSession}
        />

        <div className="h-full flex flex-col relative z-10">
          <GDHeader
            topic={constants.topic}
            duration={state.duration}
            isMuted={state.isMuted}
          />

          <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-4 grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6 overflow-hidden">
            {/* Left Column: Participants and Controls */}
            <div className="flex flex-col  min-w-0">
              <GDParticipantGrid
                initAgents={constants.initAgents}
                AGENT_COLORS={constants.AGENT_COLORS}
                speakingAgent={state.speakingAgent}
                isThinking={state.isThinking}
                AGENT_IMAGES={constants.AGENT_IMAGES}
                user={state.user}
                isUserSpeaking={state.isUserSpeaking}
                openedRef={state.openedRef}
                isConcludingPhase={state.isConcludingPhase}
                isMuted={state.isMuted}
                sessionEnded={state.sessionEnded}
              />
              <GDControlBar
                toggleMute={actions.toggleMute}
                isMuted={state.isMuted}
                endSession={actions.endSession}
                isEnding={state.isEnding}
                isConcludingPhase={state.isConcludingPhase}
              />
              <GDLiveVoicePeek 
                liveText={state.liveText} 
                isUserSpeaking={state.isUserSpeaking} 
                speakingAgent={state.speakingAgent}
              />
              <GDTopicContext description={constants.description} />
            </div>

            {/* Right Column: Invigilator + Transcript */}
            <div className="flex flex-col h-[600px] xl:h-[calc(100vh-140px)] min-h-0 gap-4">
              <GDInvigilator
                invigilatorStatus={state.invigilatorStatus}
                invigilatorMessage={state.invigilatorMessage}
                invTimer={state.invTimer}
              />
              <GDTranscriptView
                transcript={state.transcript}
                isThinking={state.isThinking}
                user={state.user}
                AGENT_IMAGES={constants.AGENT_IMAGES}
                endRef={refs.endRef}
              />
            </div>
          </main>
        </div>

        <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(190,242,100,0.4); }
        
        @keyframes sound-bar {
          0%, 100% { height: 6px; }
          50% { height: 16px; }
        }
        .animate-sound-bar { animation: sound-bar 1.2s infinite ease-in-out; }

        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scan { animation: scan 3s linear infinite; }
      `}</style>
      </div>
    </>
  );
}
