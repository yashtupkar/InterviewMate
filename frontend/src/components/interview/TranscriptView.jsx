import React, { useEffect, useRef, useState } from "react";
import { FiMessageSquare, FiInfo, FiRadio, FiUsers, FiSearch, FiChevronDown } from "react-icons/fi";
import CodingTaskAlert from "./CodingTaskAlert";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import InteractiveMCQ from "./InteractiveMCQ";
import InteractiveSnippet from "./InteractiveSnippet";

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
  handleInteractiveSubmit,
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
    
    const isInteractive = fullText.includes("[MCQ]") || fullText.includes("[SNIPPET]");

    if (totalChars === 0 || isInteractive) {
      completedAgentMessageIdsRef.current.add(latestAgentMessage.id);
      setTypedAgentText((prev) => ({ ...prev, [latestAgentMessage.id]: fullText }));
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

  const renderMessageText = (msg, typedText) => {
    const textToRender = msg.isAgent && msg.id != null ? (typedText ?? msg.text) : msg.text;
    if (!textToRender) return null;
    
    // Check for MCQ
    const mcqRegex = /\[MCQ\]([\s\S]*?)\[\/MCQ\]/i;
    const mcqMatch = textToRender.match(mcqRegex);
    if (mcqMatch) {
      try {
        const data = JSON.parse(mcqMatch[1].trim());
        const beforeText = textToRender.substring(0, mcqMatch.index);
        const afterText = textToRender.substring(mcqMatch.index + mcqMatch[0].length);
        const isLatest = msg.id === transcript[transcript.length - 1]?.id;
        
        return (
          <div className="flex flex-col gap-2 w-full">
            {beforeText && (
              <div className="prose prose-sm prose-invert max-w-none break-words leading-relaxed text-zinc-100">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{beforeText}</ReactMarkdown>
              </div>
            )}
            <InteractiveMCQ data={data} onSubmit={(ans) => {
               if(isLatest && handleInteractiveSubmit) handleInteractiveSubmit(ans);
            }} />
            {afterText && (
              <div className="prose prose-sm prose-invert max-w-none break-words leading-relaxed text-zinc-100">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{afterText}</ReactMarkdown>
              </div>
            )}
          </div>
        );
      } catch(e) {
        console.error("Failed to parse MCQ data", e);
      }
    }

    // Check for Snippet
    const snippetRegex = /\[SNIPPET\]([\s\S]*?)\[\/SNIPPET\]/i;
    const snippetMatch = textToRender.match(snippetRegex);
    if (snippetMatch) {
      try {
        const data = JSON.parse(snippetMatch[1].trim());
        const beforeText = textToRender.substring(0, snippetMatch.index);
        const afterText = textToRender.substring(snippetMatch.index + snippetMatch[0].length);
        const isLatest = msg.id === transcript[transcript.length - 1]?.id;
        
        return (
          <div className="flex flex-col gap-2 w-full">
            {beforeText && (
              <div className="prose prose-sm prose-invert max-w-none break-words leading-relaxed text-zinc-100">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{beforeText}</ReactMarkdown>
              </div>
            )}
            <InteractiveSnippet data={data} onSubmit={(ans) => {
               if(isLatest && handleInteractiveSubmit) handleInteractiveSubmit(ans);
            }} />
            {afterText && (
              <div className="prose prose-sm prose-invert max-w-none break-words leading-relaxed text-zinc-100">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{afterText}</ReactMarkdown>
              </div>
            )}
          </div>
        );
      } catch(e) {
        console.error("Failed to parse SNIPPET data", e);
      }
    }

    const codeBlockRegex = /\[SUBMITTED_CODE language="(.*?)"\]([\s\S]*?)\[\/SUBMITTED_CODE\]/i;
    const match = textToRender.match(codeBlockRegex);
    
    if (match) {
      const beforeText = textToRender.substring(0, match.index);
      const language = match[1];
      const code = match[2].trim();
      const afterText = textToRender.substring(match.index + match[0].length);
      
      return (
        <div className="flex flex-col gap-2">
          {beforeText && (
            <div className="prose prose-sm prose-invert max-w-none break-words leading-relaxed text-zinc-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{beforeText}</ReactMarkdown>
            </div>
          )}
          <div className="my-2 rounded-xl overflow-hidden border border-zinc-700 shadow-sm w-full">
            <div className="bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-400 border-b border-zinc-700 flex justify-between items-center">
              <span className="uppercase tracking-wider">{language}</span>
            </div>
            <div className="relative bg-[#1e1e1e]" style={{ height: '250px' }}>
              <Editor
                height="100%"
                language={language === 'js' ? 'javascript' : language}
                theme="vs-dark"
                value={code}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 13,
                  padding: { top: 12, bottom: 12 },
                  lineNumbers: "on",
                  folding: false,
                  wordWrap: "on"
                }}
              />
            </div>
          </div>
          {afterText && (
            <div className="prose prose-sm prose-invert max-w-none break-words leading-relaxed text-zinc-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{afterText}</ReactMarkdown>
            </div>
          )}
        </div>
      );
    }
    
    const finalRenderText = textToRender.replace(/\[CODE_QUESTION\][\s\S]*?\[\/CODE_QUESTION\]/gi, "").trim();
    if (!finalRenderText) return null;

    return (
      <div className="prose prose-sm prose-invert max-w-none break-words leading-relaxed text-zinc-100">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{finalRenderText}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-zinc-900   overflow-hidden h-full">
      <div className="px-3 py-3 flex items-center justify-between border-b border-white/5 ">
        <div className="flex items-center gap-3">
          <h3 className="text-[15px] font-semibold text-white tracking-wide">
            Transcript
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <FiSearch className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
            <span className="text-xs font-medium text-white">All</span>
            <FiChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>
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
              className={`flex flex-col  group animate-in fade-in slide-in-from-bottom-2 duration-500`}
            >
              <div
                className={`flex items-center gap-2 mb-1.5 `}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden  transition-transform group-hover:scale-105 `}
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
                  className={`flex justify-between w-full`}
                >
                  <span className="text-xs font-semibold   uppercase tracking-[0.1em]">
                    {msg.speaker}
                  </span>
                  {msg.timestamp && (
                    <span className="text-xs font-semibold ">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`relative p-3 rounded-xl text-md leading-relaxed transition-all break-words`}
              >
                {renderMessageText(msg, typedAgentText[msg.id])}
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

      <div className="p-4 border-t border-white/5 bg-zinc-900/60">
        {countdownActive ? (
          <div className="rounded-xl border border-zinc-600 bg-zinc-800/90 px-4 py-3 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FiRadio size={16} className="text-zinc-300 animate-pulse" />
                <p className="text-sm font-medium leading-tight text-zinc-100">
                  Paused: speak now to continue, or auto-send will trigger.
                </p>
              </div>
              <span className="text-xs font-bold text-zinc-300">
                {Math.ceil(countdownRemaining / 1000)}s
              </span>
            </div>
            <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-600">
              <div
                className="h-full transition-all duration-100 bg-zinc-300"
                style={{ width: `${countdownProgress}%` }}
              />
            </div>
          </div>
        ) : isAgentSpeaking ? (
          <div className="rounded-xl border border-zinc-600 bg-zinc-800/70 px-4 py-3 flex items-center gap-3 shadow-md">
            <FiUsers size={16} className="text-zinc-300" />
            <p className="text-sm font-medium leading-tight text-zinc-200">
              Agent is speaking. Listen carefully, your turn starts next.
            </p>
          </div>
        ) : isUserSpeaking ? (
          <div className="rounded-xl border border-zinc-500 bg-zinc-700/60 px-4 py-3 flex items-center gap-3 shadow-inner">
            <FiRadio size={16} className="text-zinc-200 animate-pulse" />
            <p className="text-sm font-medium leading-tight text-white">
              Listening: keep speaking naturally.
            </p>
          </div>
        ) : isUserTurn ? (
          <div className="rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-3 flex items-center gap-3 shadow-md">
            <FiInfo size={16} className="text-zinc-300" />
            <p className="text-sm font-medium leading-tight text-zinc-200">
              Your turn: start speaking now.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 flex items-center gap-3">
            <FiInfo size={16} className="text-zinc-400" />
            <p className="text-sm font-medium leading-tight text-zinc-300">
              AI-generated transcript.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptView;
