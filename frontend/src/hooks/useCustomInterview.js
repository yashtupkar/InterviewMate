import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useInterview } from "../context/InterviewContext";
import { AppContext } from "../context/AppContext";
import { interviewAgents } from "../constants/agents";
import usePollyTTS from "./usePollyTTS";
import { analyzeCodeSubmission } from "../utils/codeSubmissionUtils";

export const useCustomInterview = () => {
  const {
    interviewData,
    sessionId,
    setSessionId,
    transcript: contextTranscript,
    setTranscript: setContextTranscript,
    callStatus,
    setCallStatus,
    interviewDuration,
    setInterviewDuration,
    resetInterview,
    isCameraEnabled,
    setIsCameraEnabled,
    isMicEnabled,
    setIsMicEnabled,
  } = useInterview();

  const { backend_URL } = useContext(AppContext);
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId: urlSessionId } = useParams();
  const {
    systemPrompt,
    isCustom,
    duration: initialDuration,
  } = location.state || {};

  const [timeLeft, setTimeLeft] = useState((initialDuration || 10) * 60);
  const [isMuted, setIsMuted] = useState(!isMicEnabled);
  const [isVideoOn, setIsVideoOn] = useState(isCameraEnabled);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [hasCallEnded, setHasCallEnded] = useState(false);
  const [activeCodingTask, setActiveCodingTask] = useState(null);
  const [codingPopupTask, setCodingPopupTask] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isUserFocus, setIsUserFocus] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownRemaining, setCountdownRemaining] = useState(0);
  const [countdownProgress, setCountdownProgress] = useState(100);
  const [countdownMessageId, setCountdownMessageId] = useState(null);

  const userName = user?.firstName || "Candidate";
  const searchParams = new URLSearchParams(location.search);
  const isPreview = searchParams.get("preview") === "true";
  const isDebugEnabled = isPreview || searchParams.get("debug") === "true";
  const debugCodingAlert = searchParams.get("codingAlert") === "true";
  const debugCodingSpace = searchParams.get("codingSpace") === "true";
  const debugAgentSpeaking = searchParams.get("agentSpeaking") === "true";
  const debugAiThinking = searchParams.get("aiThinking") === "true";
  const debugProcessing = searchParams.get("processing") === "true";
  const debugEnded = searchParams.get("ended") === "true";
  const debugTranscript = (searchParams.get("transcript") || "default")
    .toLowerCase()
    .trim();
  const debugCodingLanguage =
    searchParams.get("codingLanguage") || "javascript";
  const debugCodingQuestion =
    searchParams.get("codingQuestion") ||
    "Write a JavaScript function to check if a given string is a palindrome.";
  const debugCodingTimeRaw = Number(searchParams.get("codingTime"));

  // AWS Polly TTS Hook
  const { speakText, stopSpeaking } = usePollyTTS();

  // Refs
  const recognitionRef = useRef(null);
  const transcriptRef = useRef([]); // Internal JSON transcript for LLM
  const silenceTimerRef = useRef(null);
  const localVideoRef = useRef(null);
  const isAgentSpeakingRef = useRef(false);
  const hasEndedRef = useRef(false);
  const hasCallEndedRef = useRef(false);
  const isAiThinkingRef = useRef(false);
  const activeCodingTaskRef = useRef(null);
  const agentVolumeCircleRef = useRef(null); // Will be passed to UI
  const lastWordTimeRef = useRef(0);
  const currentVolumeRef = useRef(0);
  const targetVolumeRef = useRef(0);
  const currentUserMessageIdRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const wrapUpInformedRef = useRef(false);
  const lastAiFinishTimeRef = useRef(0);
  const isWaitingForInactivityResponseRef = useRef(false);
  const sttFinalBufferRef = useRef("");
  const lastRecognizedTextRef = useRef("");
  const lastSpeechEventTimeRef = useRef(0);
  const countdownIntervalRef = useRef(null);
  const countdownStartTimeRef = useRef(0);
  const pendingMessageRef = useRef(""); // Store message text for countdown auto-send
  const countdownMessageIdRef = useRef(null); // Track message ID for countdown

  const MOCK_INTERVIEW_DATA = {
    interviewType: "Technical",
    role: "Senior Frontend Engineer",
    level: "Senior",
    content: "",
    agentName: "Rohan",
  };

  const agentName = isPreview
    ? MOCK_INTERVIEW_DATA.agentName
    : interviewData?.agentName || "Sophia";
  const displayInterviewData = isPreview ? MOCK_INTERVIEW_DATA : interviewData;

  const SILENCE_THRESHOLD = 2000;
  const COUNTDOWN_DURATION = 5000; // 5 seconds for user to continue speaking or auto-send
  const PAUSE_DETECT = 500; // Start countdown after 0.5s of silence to give user time to think
  const SUPPORTED_CODING_LANGUAGES = [
    "javascript",
    "html",
    "python",
    "java",
    "cpp",
    "css",
    "typescript",
    "react",
    "sql",
  ];

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const cleanTaskText = (text = "") =>
    text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/\[\/?CODE_QUESTION\]/gi, "")
      .replace(/\r/g, "")
      .trim();

  const normalizeLanguage = (language = "") => {
    const lowered = String(language).toLowerCase().trim();
    if (!lowered) return "javascript";
    if (lowered === "react") return "javascript";
    return SUPPORTED_CODING_LANGUAGES.includes(lowered)
      ? lowered
      : "javascript";
  };

  const extractQuestionFromText = (sourceText = "") => {
    const cleaned = cleanTaskText(sourceText);
    if (!cleaned) return "";

    const metadataKeywords = [
      "language",
      "time\\s*limit",
      "time\\s*allotted",
      "duration",
      "constraints?",
      "examples?",
      "inputs?",
      "outputs?",
      "notes?",
      "hints?",
      "you\\s+have\\s+\\d+",
    ];
    const metadataLookahead = `(?=(?:\\n\\s*(?:${metadataKeywords.join("|")})\\b)|(?:\\s+(?:${metadataKeywords.join("|")}):)|$)`;

    const questionPatterns = [
      // Explicit markers: "Question: ...", "Task: ...", "[CODE_QUESTION] ..."
      new RegExp(
        `(?:question|task|challenge|problem)[:\\s]+([\\s\\S]*?)${metadataLookahead}`,
        "i",
      ),
      // Introductory phrases: "Here is your first coding question: ..."
      new RegExp(
        `(?:here is|here's)(?: your)?(?: first)?(?: coding)?(?: question|task|challenge)[:.\\s]+([\\s\\S]*?)${metadataLookahead}`,
        "i",
      ),
      // Action verbs: "Write a function that...", "Create a script to..."
      new RegExp(
        `((?:make|write|implement|create|develop|construct)\\s+(?:an?|the)?\\s*function\\s+(?:for|to|that)\\s+[\\s\\S]*?)${metadataLookahead}`,
        "i",
      ),
      // Catch-all phrase: "I'd like you to [action]..."
      new RegExp(
        `((?:i'd like you to|please|could you)\\s+(?:make|write|implement|create|develop|construct)\\s+[\\s\\S]*?)${metadataLookahead}`,
        "i",
      ),
    ];

    for (const pattern of questionPatterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        let extracted = match[1].trim();
        // Clean up leading "is: " or "to: " if present
        extracted = extracted.replace(/^(?:is|to)[:\s]*/i, "").trim();

        if (extracted.length > 12) {
          return extracted;
        }
      }
    }

    // Fallback: search for the first sentence that looks like an instruction
    const sentences = cleaned
      .split(/[.!?\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
    const instructionVerbs = [
      "write",
      "create",
      "implement",
      "make",
      "design",
      "develop",
      "find",
      "calculate",
    ];

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (
        instructionVerbs.some((verb) => lower.includes(verb)) &&
        !lower.includes("language") &&
        !lower.includes("time limit")
      ) {
        return sentence;
      }
    }

    // Ultimate fallback: first 3 sentences but more robustly
    const sentenceMatches = cleaned.match(/[^.!?\n]+[.!?]?/g) || [];
    let fallbackText = "";
    let count = 0;
    const fallbackMetadataRegex = new RegExp(
      `^(?:${metadataKeywords.join("|")})[:\\s]`,
      "i",
    );

    for (const s of sentenceMatches) {
      const trimmed = s.trim();
      if (trimmed.length < 5) continue;
      if (fallbackMetadataRegex.test(trimmed)) break;
      fallbackText += (fallbackText ? " " : "") + trimmed;
      count++;
      if (count >= 3) break;
    }

    return fallbackText.trim();
  };

  const isValidQuestionText = (question = "") => {
    const normalized = question.replace(/\s+/g, " ").trim();
    if (normalized.length < 12 || normalized.length > 420) return false;

    const lineBreaks = (question.match(/\n/g) || []).length;
    if (lineBreaks > 4) return false;

    const noisyPhrases = [
      "before we get to the coding question",
      "before the coding question",
      "as your interviewer",
      "thanks for",
      "introduce yourself",
      "let us continue",
      "conversation",
      "transcript",
    ];
    const lowered = normalized.toLowerCase();
    return !noisyPhrases.some((phrase) => lowered.includes(phrase));
  };

  const hasCodingTaskStructure = (text = "") => {
    const normalized = cleanTaskText(text).toLowerCase();
    const hasLanguage = SUPPORTED_CODING_LANGUAGES.some((language) =>
      normalized.includes(language),
    );
    const hasTimeLimit =
      /(?:time\s*limit|time\s*limits?|limit|duration|you\s+have|you've\s+got|take)\s*(?:of\s*)?(?:is\s*)?\d+\s*(?:min(?:ute)?s?|mins?|sec(?:ond)?s?|seconds?)?/i.test(
        normalized,
      ) ||
      /\b\d+\s*(?:min(?:ute)?s?|mins?|sec(?:ond)?s?|seconds?)\b/i.test(
        normalized,
      );
    const hasExplicitTask =
      /(?:\[code_question\]|question\s*:|task\s*:|challenge\s*:|first coding question|coding question|coding task|coding challenge)/i.test(
        normalized,
      ) ||
      /(?:write|implement|create|make)\s+(?:an?|the)?\s*function\b/i.test(
        normalized,
      );

    return hasLanguage && hasTimeLimit && hasExplicitTask;
  };

  const normalizeCodingTask = (task, sourceText = "") => {
    if (!task) return null;

    const question = extractQuestionFromText(task.question || sourceText);
    if (!isValidQuestionText(question)) return null;

    let timeLimit = Number(task.timeLimit);
    if (!Number.isFinite(timeLimit) || timeLimit <= 0) {
      timeLimit = 300;
    }
    timeLimit = Math.min(Math.max(Math.round(timeLimit), 60), 1800);

    return {
      question,
      language: normalizeLanguage(task.language),
      timeLimit,
      initialCode: typeof task.initialCode === "string" ? task.initialCode : "",
    };
  };

  const extractFuzzyTask = (text) => {
    const lowerText = text.toLowerCase();
    const language = SUPPORTED_CODING_LANGUAGES.find((l) =>
      lowerText.includes(l),
    );

    let timeLimit = 300;
    const timeMatch = text.match(
      /(?:time|limit|duration).*?(\d+)\s*(min|sec|minute|second|$)/i,
    );
    if (timeMatch) {
      const value = parseInt(timeMatch[1]);
      const unit = timeMatch[2]?.toLowerCase();
      if (unit && unit.startsWith("sec")) {
        timeLimit = value;
      } else {
        timeLimit = value * 60;
      }
    } else if (lowerText.includes("10 min")) {
      timeLimit = 600;
    } else if (lowerText.includes("5 min") || lowerText.includes("5 minute")) {
      timeLimit = 300;
    }

    if (language && text.length > 30) {
      return normalizeCodingTask(
        {
          question: extractQuestionFromText(text),
          language,
          timeLimit,
          initialCode: "",
        },
        text,
      );
    }
    return null;
  };

  // Helper to update transcript in state
  const updateUserTranscript = useCallback(
    (text) => {
      setContextTranscript((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (
          lastMsg &&
          !lastMsg.isAgent &&
          lastMsg.id === currentUserMessageIdRef.current
        ) {
          const newTranscript = [...prev];
          newTranscript[newTranscript.length - 1] = { ...lastMsg, text: text };
          return newTranscript;
        } else {
          const newId = Date.now();
          currentUserMessageIdRef.current = newId;
          return [
            ...prev,
            {
              id: newId,
              role: "user",
              speaker: "You",
              text: text,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isAgent: false,
            },
          ];
        }
      });
    },
    [setContextTranscript],
  );

  const handleAiChat = useCallback(
    async (forcePrompt = null) => {
      if (
        hasCallEndedRef.current ||
        isAiThinkingRef.current ||
        isAgentSpeakingRef.current
      )
        return;
      try {
        isAiThinkingRef.current = true;
        setIsAiThinking(true);
        if (inactivityTimerRef.current)
          clearTimeout(inactivityTimerRef.current);
        const token = await getToken();

        if (hasCallEndedRef.current) {
          setIsAiThinking(false);
          return;
        }

        const payload = {
          sessionId,
          messages: [...transcriptRef.current],
          systemPrompt:
            location.state?.systemPrompt || "You are an interviewer.",
        };

        if (forcePrompt) {
          const lastMsg = payload.messages[payload.messages.length - 1];
          if (!lastMsg || lastMsg.content !== forcePrompt) {
            payload.messages.push({ role: "user", content: forcePrompt });
          }
        }

        const { data } = await axios.post(
          `${backend_URL}/api/custom-interview/chat`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (hasCallEndedRef.current) {
          setIsAiThinking(false);
          return;
        }

        const aiText = data.text;
        const aiMessage = {
          id: Date.now(),
          role: "assistant",
          speaker: displayInterviewData.agentName || "Interviewer",
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isAgent: true,
        };
        setContextTranscript((prev) => [...prev, aiMessage]);
        transcriptRef.current.push({ role: "assistant", content: aiText });

        detectCodingQuestion(aiText);

        const normalized = aiText.toLowerCase();
        const endPhrases = [
          "this concludes",
          "concludes our interview",
          "that concludes",
          "interview is complete",
          "interview is now concluded",
          "interview is concluded",
          "have a great day",
          "thank you for your time",
          "reached the end",
          "goodbye",
          "good luck",
          "see you next time",
          "interview has finished",
          "thank you for joining us",
        ];

        const shouldEnd = endPhrases.some((phrase) =>
          normalized.includes(phrase),
        );
        const containsCodingTask =
          normalized.includes("coding question") ||
          normalized.includes("write a function") ||
          normalized.includes("[code_question]");

        if (
          shouldEnd &&
          !containsCodingTask &&
          !activeCodingTaskRef.current &&
          !hasEndedRef.current
        ) {
          hasEndedRef.current = true;
        }

        playTTS(aiText);
        isAiThinkingRef.current = false;
        setIsAiThinking(false);
      } catch (err) {
        console.error(
          "AI Chat Error Details:",
          err.response?.data || err.message,
        );
        isAiThinkingRef.current = false;
        setIsAiThinking(false);
        toast.error("AI failed to respond.");
      }
    },
    [
      sessionId,
      backend_URL,
      displayInterviewData.agentName,
      getToken,
      location.state?.systemPrompt,
      setContextTranscript,
    ],
  );

  const detectCodingQuestion = (text) => {
    if (activeCodingTaskRef.current || codingPopupTask) return;

    if (!hasCodingTaskStructure(text)) {
      return;
    }

    const tagMatch = text.match(
      /\[CODE_QUESTION\]([\s\S]*?)\[\/CODE_QUESTION\]/i,
    );
    if (tagMatch) {
      try {
        let jsonStr = tagMatch[1].trim();
        jsonStr = jsonStr
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const taskData = normalizeCodingTask(JSON.parse(jsonStr), tagMatch[1]);
        if (taskData) {
          setCodingPopupTask(taskData);
          return;
        }
      } catch (e) {
        const fuzzyTask = extractFuzzyTask(tagMatch[1]);
        if (fuzzyTask) {
          setCodingPopupTask(fuzzyTask);
          return;
        }
      }
    }

    const lowerText = text.toLowerCase();
    const codingKeywords = [
      "coding question",
      "coding task",
      "coding challenge",
      "write a function",
      "make a function",
      "implement a function",
      "time limit",
      "solve this",
      "lets start solving",
    ];
    const hasKeywords = codingKeywords.some((kw) => lowerText.includes(kw));

    if (hasKeywords) {
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          const taskData = normalizeCodingTask(
            JSON.parse(jsonMatch[0].trim()),
            text,
          );
          if (taskData) {
            setCodingPopupTask(taskData);
            return;
          }
        } catch (e) {}
      }

      const fuzzyTask = extractFuzzyTask(text);
      if (fuzzyTask) {
        setCodingPopupTask(fuzzyTask);
        return;
      }
    }
  };

  const handleUserSpeech = useCallback(
    (text) => {
      if (
        !text?.trim() ||
        isAgentSpeakingRef.current ||
        isAiThinkingRef.current ||
        hasCallEndedRef.current
      )
        return;

      // Reset STT carryover buffer so the next answer starts fresh.
      sttFinalBufferRef.current = "";
      lastRecognizedTextRef.current = "";
      lastSpeechEventTimeRef.current = 0;
      transcriptRef.current.push({ role: "user", content: text });
      currentUserMessageIdRef.current = null;
      handleAiChat();
    },
    [handleAiChat],
  );

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (hasCallEndedRef.current) return;

    inactivityTimerRef.current = setTimeout(() => {
      if (
        !isUserSpeaking &&
        !isAgentSpeaking &&
        !isAiThinking &&
        !activeCodingTaskRef.current &&
        !hasCallEndedRef.current
      ) {
        handleInactivityWarning();
      }
    }, 30000);
  }, [isUserSpeaking, isAgentSpeaking, isAiThinking]);

  const handleInactivityWarning = () => {
    if (
      hasCallEndedRef.current ||
      isAiThinkingRef.current ||
      isAgentSpeakingRef.current
    )
      return;

    isWaitingForInactivityResponseRef.current = true;
    const warningText = `Are you still there, ${userName}? Take your time, let me know when you're ready to proceed.`;

    const aiMessage = {
      id: Date.now(),
      role: "assistant",
      speaker: agentName,
      text: warningText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isAgent: true,
    };

    setContextTranscript((prev) => [...prev, aiMessage]);
    transcriptRef.current.push({ role: "assistant", content: warningText });
    playTTS(warningText);
  };

  const handleFinalInactivityConclusion = () => {
    if (hasCallEndedRef.current) return;
    const conclusionText = `Sorry ${userName}, you are not responding to my questions, so I am concluding the call.`;
    const aiMessage = {
      id: Date.now(),
      role: "assistant",
      speaker: agentName,
      text: conclusionText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isAgent: true,
    };
    setContextTranscript((prev) => [...prev, aiMessage]);
    transcriptRef.current.push({ role: "assistant", content: conclusionText });
    playTTS(conclusionText);
    setTimeout(handleEndCall, 5000);
  };

  const playTTS = useCallback(
    async (text) => {
      if (activeCodingTaskRef.current || hasCallEndedRef.current) return;
      const cleanText = text
        .replace(/[*_#`~]/g, "")
        .replace(/\[\/?CODE_QUESTION\]/gi, "")
        .trim();
      if (!cleanText) return;

      try {
        isAgentSpeakingRef.current = true;
        setIsAgentSpeaking(true);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (e) {}
        }

        // Use AWS Polly TTS instead of browser native
        await speakText(cleanText, agentName, {
          onComplete: () => {
            lastAiFinishTimeRef.current = Date.now();
            if (isWaitingForInactivityResponseRef.current) {
              isWaitingForInactivityResponseRef.current = false;
              if (inactivityTimerRef.current)
                clearTimeout(inactivityTimerRef.current);
              inactivityTimerRef.current = setTimeout(() => {
                if (
                  !isUserSpeaking &&
                  !isAgentSpeaking &&
                  !isAiThinking &&
                  !activeCodingTaskRef.current &&
                  !hasCallEndedRef.current
                ) {
                  handleFinalInactivityConclusion();
                }
              }, 15000);
            } else {
              resetInactivityTimer();
            }
            setTimeout(() => {
              isAgentSpeakingRef.current = false;
              setIsAgentSpeaking(false);
              if (hasEndedRef.current && !hasCallEndedRef.current) {
                handleEndCall();
                return;
              }
              if (
                !hasCallEndedRef.current &&
                !activeCodingTaskRef.current &&
                recognitionRef.current
              ) {
                try {
                  recognitionRef.current.start();
                } catch (e) {}
              }
            }, 500);
          },
          onError: (err) => {
            console.error("[TTS] Polly error:", err);
            isAgentSpeakingRef.current = false;
            setIsAgentSpeaking(false);
            if (
              !hasCallEndedRef.current &&
              !activeCodingTaskRef.current &&
              recognitionRef.current
            ) {
              try {
                recognitionRef.current.start();
              } catch (e) {}
            }
          },
        });
      } catch (err) {
        console.error("[TTS] Critical failure:", err);
        isAgentSpeakingRef.current = false;
        setIsAgentSpeaking(false);
      }
    },
    [
      agentName,
      speakText,
      resetInactivityTimer,
      isUserSpeaking,
      isAgentSpeaking,
      isAiThinking,
    ],
  );

  // Countdown management: starts after brief pause, auto-sends after duration
  const startCountdown = useCallback(
    (messageId, messageText) => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);

      // Store message in refs to avoid stale closure
      pendingMessageRef.current = messageText;
      countdownMessageIdRef.current = messageId;

      countdownStartTimeRef.current = Date.now();
      setCountdownActive(true);
      setCountdownMessageId(messageId);
      setCountdownRemaining(COUNTDOWN_DURATION);
      setCountdownProgress(100);

      countdownIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - countdownStartTimeRef.current;
        const remaining = Math.max(0, COUNTDOWN_DURATION - elapsed);
        const progress = (remaining / COUNTDOWN_DURATION) * 100;

        setCountdownRemaining(remaining);
        setCountdownProgress(progress);

        if (remaining <= 0) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          setCountdownActive(false);
          setCountdownMessageId(null);
          setIsUserSpeaking(false);

          // Auto-send the message using stored text
          const msgText = pendingMessageRef.current.trim();
          if (msgText) {
            handleUserSpeech(msgText);
          }
        }
      }, 50); // Update every 50ms for smooth progress
    },
    [COUNTDOWN_DURATION, handleUserSpeech],
  );

  const cancelCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdownActive(false);
    setCountdownMessageId(null);
    setCountdownRemaining(0);
    setCountdownProgress(100);
    pendingMessageRef.current = "";
    countdownMessageIdRef.current = null;
  }, []);

  const startSTT = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Speech recognition not supported.");
      setConnectionStatus("Error: Browser Not Supported");
      return;
    }
    if (recognitionRef.current) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setCallStatus("active");
      setConnectionStatus("Connected");
      sttFinalBufferRef.current = "";
      lastRecognizedTextRef.current = "";
      lastSpeechEventTimeRef.current = 0;
      if (transcriptRef.current.length === 0) handleAiChat();
    };

    recognition.onresult = (e) => {
      const now = Date.now();
      const isCoolingDown = now - lastAiFinishTimeRef.current < 1500;
      if (
        isAgentSpeakingRef.current ||
        isAiThinkingRef.current ||
        isCoolingDown ||
        hasCallEndedRef.current
      )
        return;

      let interimTranscript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcriptChunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) sttFinalBufferRef.current += transcriptChunk;
        else interimTranscript += transcriptChunk;
      }

      const currentText = (
        sttFinalBufferRef.current + interimTranscript
      ).trim();
      if (currentText) {
        // Ignore duplicate/no-change recognition events to prevent countdown flicker.
        const hasSpeechUpdate = currentText !== lastRecognizedTextRef.current;
        if (!hasSpeechUpdate && !interimTranscript.trim()) return;

        lastRecognizedTextRef.current = currentText;
        lastSpeechEventTimeRef.current = Date.now();

        setIsUserSpeaking(true);
        if (inactivityTimerRef.current)
          clearTimeout(inactivityTimerRef.current);
        isWaitingForInactivityResponseRef.current = false;

        // User is speaking: always cancel live countdown immediately.
        // Use interval ref (live value) to avoid stale state captured by onresult closure.
        if (countdownIntervalRef.current) {
          cancelCountdown();
        }

        updateUserTranscript(currentText);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        const snapshotText = currentText;
        silenceTimerRef.current = setTimeout(() => {
          // Start countdown only if silence persisted and text remained unchanged.
          const stableSilence =
            Date.now() - lastSpeechEventTimeRef.current >= PAUSE_DETECT;
          const textUnchanged = lastRecognizedTextRef.current === snapshotText;
          if (!stableSilence || !textUnchanged) return;

          // User has paused: start the countdown for auto-send
          const messageId = currentUserMessageIdRef.current;
          if (messageId) {
            startCountdown(messageId, snapshotText);
          }
        }, PAUSE_DETECT);
      }
    };

    recognition.onerror = (e) => {
      if (e.error === "not-allowed") {
        setConnectionStatus("Mic Blocked");
        toast.error("Microphone access denied.");
      }
    };

    recognition.onend = () => {
      if (
        !hasCallEndedRef.current &&
        !activeCodingTaskRef.current &&
        !isAgentSpeakingRef.current
      ) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {}
  }, [
    handleAiChat,
    handleUserSpeech,
    updateUserTranscript,
    setCallStatus,
    cancelCountdown,
    startCountdown,
  ]);

  const handleEndCall = useCallback(() => {
    setShowEndConfirm(false);
    hasCallEndedRef.current = true;
    setHasCallEnded(true);
    setCallStatus("ended");
    setConnectionStatus("Call Ended");
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    cancelCountdown(); // Clean up countdown timers
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
    }
    stopSpeaking();

    (async () => {
      try {
        const token = await getToken();
        if (contextTranscript.length > 0) {
          await axios.post(
            `${backend_URL}/api/custom-interview/save-transcript`,
            {
              sessionId,
              transcript: contextTranscript,
              actualDuration: interviewDuration, // Sending the total seconds tracked in state
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        }
        // Redundant legacy deduction removed to prevent double-charging
      } catch (err) {
        console.error("Failed to complete end-call operations:", err);
      }
    })();
  }, [
    getToken,
    contextTranscript,
    sessionId,
    backend_URL,
    setCallStatus,
    interviewDuration,
  ]);

  const requestEndSession = useCallback(() => {
    if (hasCallEndedRef.current || isProcessing) return;
    setShowEndConfirm(true);
  }, [isProcessing]);

  const cancelEndSession = useCallback(() => {
    setShowEndConfirm(false);
  }, []);

  const confirmEndSession = useCallback(() => {
    setShowEndConfirm(false);
    handleEndCall();
  }, [handleEndCall]);

  const handleSaveAndExit = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
    }
    stopSpeaking();

    const loadingToast = toast.loading("Saving interview progress...");

    (async () => {
      try {
        const token = await getToken();
        if (contextTranscript.length > 0) {
          await axios.post(
            `${backend_URL}/api/custom-interview/save-transcript`,
            {
              sessionId,
              transcript: contextTranscript,
              actualDuration: interviewDuration,
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        }
        toast.dismiss(loadingToast);
        toast.success("Interview progress saved!");
      } catch (err) {
        console.error("Failed to save transcript on exit:", err);
        toast.dismiss(loadingToast);
        toast.error("An error occurred while saving, but exiting anyway.");
      } finally {
        resetInterview();
        navigate("/dashboard/reports", { replace: true });
      }
    })();
  }, [
    getToken,
    contextTranscript,
    sessionId,
    backend_URL,
    interviewDuration,
    resetInterview,
    navigate,
  ]);

  const handleGenerateReport = async (forcedTranscript = null) => {
    if (isProcessing) return;
    if (!sessionId) {
      toast.error("Session not found.");
      return;
    }
    const finalTranscript = forcedTranscript || contextTranscript;
    if (finalTranscript.length === 0) return;

    setIsProcessing(true);
    const token = await getToken();
    try {
      const response = await axios.post(
        `${backend_URL}/api/vapi-interview/report-from-transcript`,
        {
          sessionId,
          transcript: finalTranscript,
          duration: Math.round(interviewDuration / 60),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.status === "completed" && response.data.report) {
        toast.success("Interview report generated!");
        navigate(`/interview/result/${sessionId}`);
        return;
      }
      navigate(`/interview/result/${sessionId}`);
    } catch (error) {
      console.error("Report generation error:", error);
      navigate(`/interview/result/${sessionId}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Effects
  useEffect(() => {
    if (urlSessionId && urlSessionId !== sessionId) {
      setSessionId(urlSessionId);
    }
  }, [urlSessionId, sessionId, setSessionId]);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      if (isVideoOn) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: false,
          });
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        } catch (err) {
          setIsVideoOn(false);
        }
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [isVideoOn]);

  useEffect(() => {
    let interval;
    if (callStatus === "active") {
      interval = setInterval(() => {
        setInterviewDuration((prev) => prev + 1);
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) return 0;
          const newTime = prevTime - 1;
          if (newTime <= 10 && !wrapUpInformedRef.current) {
            wrapUpInformedRef.current = true;
            handleAiChat(
              "SYSTEM NOTE: The interview time is up. In your next response, please provide brief feedback on the user's last answer, thank the user for attending, and then conclude completely. You MUST end with this exact phrase: 'Thank you for your time. The interview is now concluded. Goodbye.'",
            );
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus, handleAiChat, setInterviewDuration]);

  useEffect(() => {
    let animationFrame;
    let start = Date.now();
    const animateVolume = () => {
      const now = Date.now();
      const t = (now - start) / 1000;
      if (isAgentSpeaking && agentVolumeCircleRef.current) {
        const baseline = Math.sin(t * 3) * 0.05 + 0.05;
        const timeSinceWord = now - lastWordTimeRef.current;
        const wordSpike = Math.max(0, 1 - timeSinceWord / 350) * 0.3;
        const jitter = Math.sin(t * 22) * 0.02;
        targetVolumeRef.current = Math.max(0, baseline + wordSpike + jitter);
      } else {
        targetVolumeRef.current = 0;
      }
      currentVolumeRef.current +=
        (targetVolumeRef.current - currentVolumeRef.current) * 0.15;
      if (agentVolumeCircleRef.current) {
        const v = currentVolumeRef.current;
        const scale = 1 + v * 1.8;
        agentVolumeCircleRef.current.style.transform = `scale(${scale})`;
        agentVolumeCircleRef.current.style.opacity = isAgentSpeaking
          ? 0.4 + v * 0.6
          : 0;
      }
      animationFrame = requestAnimationFrame(animateVolume);
    };
    animateVolume();
    return () => cancelAnimationFrame(animationFrame);
  }, [isAgentSpeaking]);

  useEffect(() => {
    resetInterview();
    // No need to load voices - using AWS Polly for TTS now

    if (isPreview) {
      const previewCodingTime = Number.isFinite(debugCodingTimeRaw)
        ? Math.max(1, Math.min(60, Math.round(debugCodingTimeRaw)))
        : 5;
      const previewCodingTask = {
        title: "Technical Assessment",
        question: debugCodingQuestion,
        language: normalizeLanguage(debugCodingLanguage),
        timeLimit: previewCodingTime * 60,
        initialCode: "",
      };

      const defaultTranscript = [
        {
          id: 1,
          role: "assistant",
          speaker: "Rohan",
          text: "Hello! I'm Rohan, your AI interviewer. Welcome! Could you please begin by introducing yourself?",
          timestamp: "10:00 AM",
          isAgent: true,
        },
        {
          id: 2,
          role: "user",
          speaker: "You",
          text: "Hi Rohan! I'm a senior frontend engineer with 5 years of experience building React applications.",
          timestamp: "10:01 AM",
          isAgent: false,
        },
      ];

      const codingTranscript = [
        ...defaultTranscript,
        {
          id: 3,
          role: "assistant",
          speaker: "Rohan",
          text: `Here is your coding question. ${previewCodingTask.question} You have ${previewCodingTime} minutes.`,
          timestamp: "10:02 AM",
          isAgent: true,
        },
      ];

      setCallStatus("active");
      setConnectionStatus("Connected");
      setHasCallEnded(debugEnded);
      setIsAiThinking(debugAiThinking);
      setIsProcessing(debugProcessing);
      setIsAgentSpeaking(debugAgentSpeaking);
      isAgentSpeakingRef.current = debugAgentSpeaking;

      if (debugTranscript === "empty") {
        setContextTranscript([]);
      } else if (debugTranscript === "coding") {
        setContextTranscript(codingTranscript);
      } else {
        setContextTranscript(defaultTranscript);
      }

      if (isDebugEnabled && debugCodingSpace) {
        activeCodingTaskRef.current = previewCodingTask;
        setActiveCodingTask(previewCodingTask);
        setCodingPopupTask(null);
      } else if (isDebugEnabled && debugCodingAlert) {
        activeCodingTaskRef.current = null;
        setActiveCodingTask(null);
        setCodingPopupTask(previewCodingTask);
      } else {
        activeCodingTaskRef.current = null;
        setActiveCodingTask(null);
        setCodingPopupTask(null);
      }

      return;
    }
    setTimeout(startSTT, 1000);
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      cancelCountdown();
      if (recognitionRef.current)
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      stopSpeaking();
    };
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setIsMicEnabled(!newMuted);
  };

  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleVideoFocus = () => setIsUserFocus(!isUserFocus);

  const handleAttemptChallenge = () => {
    if (isAgentSpeakingRef.current || !codingPopupTask) return;
    activeCodingTaskRef.current = codingPopupTask;
    setActiveCodingTask(codingPopupTask);
    setCodingPopupTask(null);
    setIsMuted(true);
    stopSpeaking();
    isAgentSpeakingRef.current = false;
    setIsAgentSpeaking(false);
  };

  const handleSkipChallenge = () => {
    if (isAgentSpeakingRef.current || !codingPopupTask) return;
    setCodingPopupTask(null);
    activeCodingTaskRef.current = null;
    const skipMsg =
      "I'm not able to attempt this coding question right now. Let's move on.";
    const newMessage = {
      id: Date.now(),
      role: "user",
      speaker: "You",
      text: skipMsg,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isAgent: false,
    };
    setContextTranscript((prev) => [...prev, newMessage]);
    transcriptRef.current.push({ role: "user", content: skipMsg });
    handleAiChat(skipMsg);
  };

  const handleCodingSubmit = (submission) => {
    const { code, language } = submission;
    activeCodingTaskRef.current = null;
    setActiveCodingTask(null);
    setIsMuted(false);
    isAgentSpeakingRef.current = false;
    setIsAgentSpeaking(false);
    // Analyze the code submission to detect if it's empty or just default template
    const codeAnalysis = analyzeCodeSubmission(code, language);

    let submitMsg;
    if (codeAnalysis.isEmpty || codeAnalysis.isDefault) {
      // For empty/default submissions, inform the AI agent about this
      submitMsg = `I've submitted my solution in ${language}. However, the submission appears to be only the empty template without significant implementation.`;
    } else {
      // For valid code submissions
      submitMsg = `I've submitted my solution in ${language}:\n\n${code}`;
    }

    const newMessage = {
      id: Date.now(),
      role: "user",
      speaker: "You",
      text: submitMsg,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isAgent: false,
    };
    setContextTranscript((prev) => [...prev, newMessage]);
    transcriptRef.current.push({ role: "user", content: submitMsg });
    setTimeout(() => handleAiChat(submitMsg), 100);
  };

  return {
    state: {
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
      showEndConfirm,
      isPreview,
      sessionId,
      userName,
      agentName,
      displayInterviewData,
      interviewDuration,
      transcript: contextTranscript,
      callStatus,
      user,
      countdownActive,
      countdownRemaining,
      countdownProgress,
      countdownMessageId,
    },
    refs: { localVideoRef, agentVolumeCircleRef },
    actions: {
      toggleMute,
      toggleVideo,
      toggleVideoFocus,
      handleEndCall,
      handleGenerateReport,
      handleAttemptChallenge,
      handleSkipChallenge,
      handleCodingSubmit,
      resetInterview,
      formatDuration,
      handleSaveAndExit,
      requestEndSession,
      cancelEndSession,
      confirmEndSession,
    },
  };
};
