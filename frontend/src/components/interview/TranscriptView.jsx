import React, { useEffect, useRef, useState } from "react";
import { FiMessageSquare, FiInfo, FiRadio, FiUsers } from "react-icons/fi";
import CodingTaskAlert from "./CodingTaskAlert";

const TranscriptView = ({
  transcript,
  user,
  isUserSpeaking = false,
  isAgentSpeaking = false,
  isUserTurn = false,
  agentName,
  getAgentImage,
  connectionStatus,
  codingPopupTask,
  showCodingPopup,
  isCodingActionDisabled,
  handleAttemptChallenge,
  handleSkipChallenge,
  className = "",
  countdownActive = false,
  countdownRemaining = 0,
  countdownProgress = 100,
}) => {
  const [typedAgentText, setTypedAgentText] = useState({});
  const completedAgentMessageIdsRef = useRef(new Set());
  const typingTimerRef = useRef(null);
  const isInitializedRef = useRef(false);
  const localTranscriptEndRef = useRef(null);

  useEffect(() => {
    if (!localTranscriptEndRef.current) return;
    localTranscriptEndRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [transcript, typedAgentText, countdownActive, countdownRemaining]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitializedRef.current) {
      const existingAgentText = {};

      transcript.forEach((msg) => {
        if (msg?.isAgent && msg.id != null) {
          completedAgentMessageIdsRef.current.add(msg.id);
          existingAgentText[msg.id] = msg.text;
        }
      });

      if (Object.keys(existingAgentText).length > 0) {
        setTypedAgentText(existingAgentText);
      }

      isInitializedRef.current = true;
      return;
    }

    const latestAgentMessage = [...transcript]
      .reverse()
      .find((msg) => msg?.isAgent && msg.id != null);

    if (!latestAgentMessage) return;
    if (completedAgentMessageIdsRef.current.has(latestAgentMessage.id)) return;

    const fullText = latestAgentMessage.text ?? "";
    const totalChars = fullText.length;

    if (totalChars === 0) {
      completedAgentMessageIdsRef.current.add(latestAgentMessage.id);
      setTypedAgentText((prev) => ({ ...prev, [latestAgentMessage.id]: "" }));
      return;
    }

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    const totalDurationMs = Math.min(12000, Math.max(2200, totalChars * 55));
    const charDelayMs = Math.max(28, Math.floor(totalDurationMs / totalChars));

    let currentIndex = 1;
    setTypedAgentText((prev) => ({
      ...prev,
      [latestAgentMessage.id]: fullText.slice(0, 1),
    }));

    typingTimerRef.current = setInterval(() => {
      currentIndex += 1;

      if (currentIndex >= totalChars) {
        setTypedAgentText((prev) => ({
          ...prev,
          [latestAgentMessage.id]: fullText,
        }));
        completedAgentMessageIdsRef.current.add(latestAgentMessage.id);
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        return;
      }

      setTypedAgentText((prev) => ({
        ...prev,
        [latestAgentMessage.id]: fullText.slice(0, currentIndex),
      }));
    }, charDelayMs);
  }, [transcript]);

  const userAvatar =
    user?.imageUrl || user?.profileImageUrl || user?.avatarUrl || "";
  const userInitial =
    user?.firstName?.[0] || user?.fullName?.[0] || user?.username?.[0] || "U";

  return (
    <div className="flex flex-col bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.3)] h-[660px]">
      <div className="p-4 flex items-center justify-between bg-zinc-800 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <FiMessageSquare className="text-primary w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">
              Transcript
            </h3>
          </div>
        </div>
        <div className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
            {connectionStatus}
          </span>
        </div>
      </div>

      {showCodingPopup && codingPopupTask && (
        <div className="p-3 border-b border-white/5 bg-zinc-800/20">
          <CodingTaskAlert
            codingPopupTask={codingPopupTask}
            isActionDisabled={isCodingActionDisabled}
            disabledReason="Wait for the AI voice to finish before choosing an action."
            handleAttemptChallenge={handleAttemptChallenge}
            handleSkipChallenge={handleSkipChallenge}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-12 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent hover:scrollbar-thumb-zinc-700 transition-colors">
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 text-zinc-500">
              <FiMessageSquare size={20} />
            </div>
            <p className="text-[11px] font-semibold text-zinc-300 mb-1">
              Conversation will appear here.
            </p>
            <p className="text-[10px] text-zinc-500 max-w-[240px]">
              You will see real-time interviewer prompts and your responses in
              this panel.
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
                  ) : userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] font-black text-black">
                      {userInitial}
                    </span>
                  )}
                </div>
                <div
                  className={`flex flex-col ${msg.isAgent ? "items-start" : "items-end"}`}
                >
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.1em]">
                    {msg.speaker}
                  </span>
                  {msg.timestamp && (
                    <span className="text-[8px] font-semibold text-zinc-600">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`relative p-3 rounded-2xl text-[12px] leading-relaxed max-w-[95%] sm:max-w-[90%] shadow-lg transition-all break-words ${
                  msg.isAgent
                    ? "bg-zinc-800/80 text-zinc-100 rounded-tl-none border border-white/5"
                    : "bg-gradient-to-br from-primary to-[#a3e14d] text-black font-semibold rounded-tr-none shadow-primary/10"
                }`}
              >
                {msg.isAgent && msg.id != null
                  ? (typedAgentText[msg.id] ?? msg.text)
                  : msg.text}
                {msg.isAgent &&
                  msg.id != null &&
                  typedAgentText[msg.id] != null &&
                  typedAgentText[msg.id] !== msg.text && (
                    <span className="ml-1 inline-block h-3 w-[2px] animate-pulse rounded-full bg-primary align-middle" />
                  )}
              </div>
            </div>
          ))
        )}
        <div ref={localTranscriptEndRef} className="h-10" />
      </div>

      <div className="min-h-[62px] p-3.5 border-t border-white/5 bg-zinc-900/60 text-[9px] text-zinc-400">
        {countdownActive ? (
          <div className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FiRadio size={12} className="text-amber-300 animate-pulse" />
                <p className="font-medium leading-tight text-amber-100">
                  Paused: speak now to continue, or auto-send will trigger.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-50">
                {Math.ceil(countdownRemaining / 1000)}s
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-amber-200/20 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  countdownProgress > 33
                    ? "bg-gradient-to-r from-primary to-[#a3e14d]"
                    : countdownProgress > 10
                      ? "bg-yellow-500/70"
                      : "bg-red-500/80 animate-pulse"
                }`}
                style={{ width: `${countdownProgress}%` }}
              />
            </div>
          </div>
        ) : isAgentSpeaking ? (
          <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-2.5 py-2 flex items-center gap-2">
            <FiUsers size={12} className="text-sky-300" />
            <p className="font-medium leading-tight text-sky-100">
              Agent is speaking. Listen carefully, your turn starts next.
            </p>
          </div>
        ) : isUserSpeaking ? (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-2 flex items-center gap-2">
            <FiRadio size={12} className="text-emerald-300 animate-pulse" />
            <p className="font-medium leading-tight text-emerald-100">
              Listening: keep speaking naturally.
            </p>
          </div>
        ) : isUserTurn ? (
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-2 flex items-center gap-2">
            <FiInfo size={12} className="text-cyan-300" />
            <p className="font-medium leading-tight text-cyan-100">
              Your turn: start speaking now.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-zinc-800/45 px-2.5 py-2 flex items-center gap-2">
            <FiInfo size={12} className="text-primary/60" />
            <p className="font-medium leading-tight text-zinc-300">
              AI-generated transcript.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptView;
