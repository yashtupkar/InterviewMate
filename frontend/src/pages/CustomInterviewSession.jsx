import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiMessageSquare,
  FiUser,
  FiCheckCircle,
  FiLoader,
  FiMonitor,
  FiBarChart2,
  FiInfo,
  FiStar,
  FiArrowRight,
  FiShield,
  FiMoreVertical,
  FiCode,
  FiZap,
  FiClock,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useInterview } from "../context/InterviewContext";
import { AppContext } from "../context/AppContext";
import { useUser, useAuth } from "@clerk/clerk-react";
import CodingSpace from "../components/CodingSpace";
import { interviewAgents } from "../constants/agents";

const CustomInterviewSession = () => {
  const {
    interviewData,
    sessionId,
    setSessionId,
    transcript,
    setTranscript,
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
  const { systemPrompt, isCustom, duration: initialDuration } = location.state || {};

  const [timeLeft, setTimeLeft] = useState((initialDuration || 10) * 60);
  const sessionTimerRef = useRef(null);
  const wrapUpTriggeredRef = useRef(false);

  // Local state
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
  const [interimText, setInterimText] = useState("");
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isUserFocus, setIsUserFocus] = useState(false);

  const userName = user?.firstName || "Candidate";
  
  // ── DEV PREVIEW MODE ─────────────────────────────────────────────────────
  // Visit /custom-session?preview=true to design UI without a real call.
  const isPreview =
    new URLSearchParams(location.search).get("preview") === "true";

  const MOCK_INTERVIEW_DATA = {
    interviewType: "Technical",
    role: "Senior Frontend Engineer",
    level: "Senior",
    content: "",
    agentName: "Rohan",
  };

  const MOCK_TRANSCRIPT = [
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
    {
      id: 3,
      role: "assistant",
      speaker: "Rohan",
      text: "Great! Let's dive into some technical questions. Can you explain the difference between `useMemo` and `useCallback` in React?",
      timestamp: "10:01 AM",
      isAgent: true,
    },
  ];

  const agentName = isPreview ? MOCK_INTERVIEW_DATA.agentName : (interviewData?.agentName || "Sophia");
  const displayInterviewData = isPreview ? MOCK_INTERVIEW_DATA : interviewData;

  // Refs for custom voice system
  const recognitionRef = useRef(null);
  const transcriptRef = useRef([]); // To keep track of messages for LLM context
  const silenceTimerRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const isAgentSpeakingRef = useRef(false); // Critical for echo cancellation
  const audioPlayerRef = useRef(new Audio());
  const hasEndedRef = useRef(false);
  const hasCallEndedRef = useRef(false);
  const activeCodingTaskRef = useRef(null);
  const agentVolumeCircleRef = useRef(null);
  const lastWordTimeRef = useRef(0);
  const currentVolumeRef = useRef(0);
  const targetVolumeRef = useRef(0);

  // Constants
  const SILENCE_THRESHOLD = 1000; // ms to wait after last "is_final" before AI responds

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const extractFuzzyTask = (text) => {
    const lowerText = text.toLowerCase();
    
    // Look for language
    const languages = ['javascript', 'html', 'python', 'java', 'cpp', 'css', 'typescript', 'react', 'sql'];
    const language = languages.find(l => lowerText.includes(l));
    
    // Look for time limit
    let timeLimit = 300;
    const timeMatch = text.match(/(?:time|limit|duration).*?(\d+)\s*(min|sec|minute|second|$)/i);
    if (timeMatch) {
      const value = parseInt(timeMatch[1]);
      const unit = timeMatch[2]?.toLowerCase();
      if (unit && unit.startsWith('sec')) {
        timeLimit = value;
      } else {
        // Default to minutes if not specified or explicitly minutes
        timeLimit = value * 60;
      }
    } else if (lowerText.includes("10 min")) {
      timeLimit = 600;
    } else if (lowerText.includes("5 min") || lowerText.includes("5 minute")) {
      timeLimit = 300;
    }
    
    // Improved question isolation
    let question = "";
    const questionPatterns = [
      /(?:question|task|challenge)[:\s]+(.*?)(?=\n\n|Language|Time|Limit|$)/is,
      /(?:make|write|implement|create)\s+a\s+function\s+(?:for|to|that)\s+(.*?)(?=[.!\n]\s*[A-Z]|Language|Time|Limit|$)/is,
      /here is(?: your)?(?: coding)? question[:\s]+(.*?)(?=[.!\n]\s*[A-Z]|Language|Time|Limit|$)/is,
      /here it is[:\s]+(.*?)(?=[.!\n]\s*[A-Z]|Language|Time|Limit|$)/is
    ];

    for (const pattern of questionPatterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 10) {
        question = match[1].trim();
        break;
      }
    }

    if (language && (question || text.length > 30)) {
      return {
        question: question || text.replace(/\[\/?CODE_QUESTION\]/gi, '').trim(),
        language: language,
        timeLimit: timeLimit,
        initialCode: ""
      };
    }
    return null;
  };

  useEffect(() => {
    if (urlSessionId && urlSessionId !== sessionId) {
      setSessionId(urlSessionId);
    }
  }, [urlSessionId, sessionId, setSessionId]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      // Use block: 'nearest' to prevent the whole page from scrolling
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [transcript, interimText]); // Scroll on interim text as well for better UX

  // 1. Initialize STT (Web Speech API - Free and Browser Default)
  const startSTT = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Speech recognition not supported in this browser. Please use Chrome.");
      setConnectionStatus("Error: Browser Not Supported");
      return;
    }

    if (recognitionRef.current) return;

    console.log("[STT] Creating Recognition instance...");
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalBuffer = "";

    recognition.onstart = () => {
      console.log("[STT] Web Speech API: onstart fired");
      setCallStatus("active");
      setConnectionStatus("Connected");
      if (transcriptRef.current.length === 0) {
        // Just trigger the AI to start the conversation naturally based on system prompt
        handleAiChat();
      }
    };

    recognition.onresult = (e) => {
      // ── ECHO CANCELLATION GUARD ──
      if (isAgentSpeakingRef.current || hasCallEnded) {
        console.log("[STT] Ignoring result while AI is speaking");
        return;
      }

      let interimTranscript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcriptChunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalBuffer += transcriptChunk;
        } else {
          interimTranscript += transcriptChunk;
        }
      }

      const currentText = (finalBuffer + interimTranscript).trim();
      setInterimText(interimTranscript);

      if (currentText) {
        setIsUserSpeaking(true);
        // Reset silence timer for finalization
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const finalStr = finalBuffer.trim() || interimTranscript.trim();
          if (finalStr) {
            handleUserSpeech(finalStr);
            // Clear buffers AFTER triggering the update to prevent flicker
            finalBuffer = "";
            setInterimText("");
          }
          setIsUserSpeaking(false);
        }, SILENCE_THRESHOLD);
      }
    };

    recognition.onerror = (e) => {
      console.error("[STT] Error:", e.error);
      if (e.error === 'not-allowed') {
        setConnectionStatus("Mic Blocked");
        toast.error("Microphone access denied.");
      }
    };

    recognition.onend = () => {
      console.log("[STT] onend fired");
      // Only restart if the agent isn't speaking and the call isn't ended
      if (!hasCallEnded && !activeCodingTask && !isAgentSpeakingRef.current) {
        try { recognition.start(); } catch (e) { }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("STT sequence failed:", e);
    }
  };

  // Camera Management
  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      if (isVideoOn) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: false,
          });
          streamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera access denied:", err);
          setIsVideoOn(false);
        }
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn]);

  const downsampleBuffer = (buffer, sampleRate, outSampleRate) => {
    if (outSampleRate === sampleRate) return buffer;
    const sampleRateRatio = sampleRate / outSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Int16Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0, count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = Math.min(1, accum / count) * 0x7FFF;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result.buffer;
  };

  // 2. Handle User Speech & Trigger AI
  const handleUserSpeech = (text) => {
    if (!text?.trim() || isAgentSpeakingRef.current || hasCallEnded) return;

    const newMessage = {
      id: Date.now(),
      role: "user",
      speaker: "You",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAgent: false
    };

    setTranscript(prev => [...prev, newMessage]);
    transcriptRef.current.push({ role: "user", content: text });

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (!isAiThinking && !isAgentSpeaking && !activeCodingTask && !hasCallEnded) {
        handleAiChat();
      }
    }, SILENCE_THRESHOLD);
  };

  // 3. Get AI Response (OpenRouter)
  const handleAiChat = async (forcePrompt = null) => {
    if (hasCallEndedRef.current) return;
    try {
      setIsAiThinking(true);
      const token = await getToken();

      if (hasCallEndedRef.current) {
        setIsAiThinking(false);
        return;
      }

      const payload = {
        sessionId,
        messages: [...transcriptRef.current],
        systemPrompt: location.state?.systemPrompt || "You are an interviewer."
      };

      if (forcePrompt) {
        // Only push if it's not already the last message in history
        const lastMsg = payload.messages[payload.messages.length - 1];
        if (!lastMsg || lastMsg.content !== forcePrompt) {
          payload.messages.push({ role: "user", content: forcePrompt });
        }
      }

      const { data } = await axios.post(`${backend_URL}/api/custom-interview/chat`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (hasCallEndedRef.current) {
        setIsAiThinking(false);
        return;
      }

      const aiText = data.text;

      // Update transcript UI
      const aiMessage = {
        id: Date.now(),
        role: "assistant",
        speaker: interviewData.agentName || "Interviewer",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAgent: true
      };
      setTranscript(prev => [...prev, aiMessage]);
      transcriptRef.current.push({ role: "assistant", content: aiText });

      // Check for coding question in AI text
      detectCodingQuestion(aiText);

      // ── AUTO END CALL DETECTION ──
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

      const shouldEnd = endPhrases.some((phrase) => normalized.includes(phrase));
      const containsCodingTask = normalized.includes("coding question") || normalized.includes("write a function") || normalized.includes("[code_question]");

      if (shouldEnd && !containsCodingTask && !activeCodingTask && !hasEndedRef.current) {
        console.log("[AutoEnd] Concluding phrase detected:", normalized);
        hasEndedRef.current = true;
        // The actual call end will happen after TTS finishes (in playTTS onend)
      }

      playTTS(aiText);
      setIsAiThinking(false);

    } catch (err) {
      console.error("AI Chat Error Details:", err.response?.data || err.message);
      setIsAiThinking(false);
      toast.error("AI failed to respond. Check console/logs.");
    }
  };

  // 4. Play TTS (Browser Voice - 100% Free)
  const playTTS = (text) => {
    console.log("[playTTS] Triggered", { 
      activeTask: !!activeCodingTaskRef.current, 
      hasEnded: hasCallEndedRef.current 
    });

    if (activeCodingTaskRef.current || hasCallEndedRef.current) {
      console.log("[playTTS] Guard blocked speech");
      return;
    }
    
    // Clean text: Remove markdown symbols that ruin TTS experience
    const cleanText = text
      .replace(/[*_#`~]/g, '') 
      .replace(/\[\/?CODE_QUESTION\]/gi, '')
      .trim();

    if (!cleanText) return;

    try {
      isAgentSpeakingRef.current = true;
      setIsAgentSpeaking(true);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) { }
      }

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);

        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            lastWordTimeRef.current = Date.now();
          }
        };

        utterance.onend = () => {
          setTimeout(() => {
            isAgentSpeakingRef.current = false;
            setIsAgentSpeaking(false);
            
            // If auto-end was triggered during chat, end it now after speaking
            if (hasEndedRef.current && !hasCallEndedRef.current) {
              handleEndCall();
              return;
            }

            // If ended or a coding task is active, stop.
            if (hasCallEndedRef.current || activeCodingTaskRef.current) {
              isAgentSpeakingRef.current = false;
              setIsAgentSpeaking(false);
              return;
            }

            if (!hasCallEndedRef.current && !activeCodingTaskRef.current && recognitionRef.current) {
              try { recognitionRef.current.start(); } catch (e) { }
            }
          }, 500);
        };

        utterance.onerror = () => {
          isAgentSpeakingRef.current = false;
          setIsAgentSpeaking(false);
          if (!hasCallEnded && !activeCodingTask && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (err) { }
          }
        };

        // ── ENHANCED VOICE SELECTION ──
        const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();

        // Find matching agent config from shared constants
        const agent = interviewAgents.find(a => a.name === agentName) || interviewAgents.find(a => a.name === "Sophia");
        const config = agent.browserVoiceConfig;
        
        if (!config) {
          console.warn(`No browser voice config found for ${agentName}`);
          setIsAgentSpeaking(false);
          return;
        }

        // Find best matching voice from config keywords
        let voice = null;
        for (const kw of config.keywords) {
          voice = voices.find(v => v.name.includes(kw) && v.lang.includes("en"));
          if (voice) break;
        }

        // Final Fallback by gender
        if (!voice) {
          voice = voices.find(v => (config.gender === 'female' ? (v.name.includes("Female") || v.name.includes("Zira")) : (v.name.includes("Male") || v.name.includes("David"))) && v.lang.includes("en"));
        }

        if (!voice) voice = voices.find(v => v.lang.includes("en"));

        if (voice) utterance.voice = voice;
        utterance.rate = config.rate;
        utterance.pitch = config.pitch;

        window.speechSynthesis.speak(utterance);
      } else {
        setIsAgentSpeaking(false);
      }
    } catch (err) {
      console.error("[TTS] Critical failure:", err);
      setIsAgentSpeaking(false);
    }
  };

  // Detect coding questions from text
  const detectCodingQuestion = (text) => {
    // If a popup or active task is already showing, don't re-trigger
    if (activeCodingTaskRef.current || codingPopupTask) return;

    // 1. Primary: [CODE_QUESTION] tags with JSON (Keeping legacy support)
    const tagMatch = text.match(/\[CODE_QUESTION\]([\s\S]*?)\[\/CODE_QUESTION\]/i);
    if (tagMatch) {
      try {
        let jsonStr = tagMatch[1].trim();
        jsonStr = jsonStr.replace(/```json/gi, '').replace(/```/g, '').trim();
        const taskData = JSON.parse(jsonStr);
        if (taskData.question) {
          console.log("[CodingQ] Detected via tags:", taskData);
          setCodingPopupTask(taskData);
          return;
        }
      } catch (e) {
        const fuzzyTask = extractFuzzyTask(tagMatch[1]);
        if (fuzzyTask) { setCodingPopupTask(fuzzyTask); return; }
      }
    }

    // 2. Keyword fallback - Natural Language Detection
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
      "lets start solving"
    ];

    const hasKeywords = codingKeywords.some(kw => lowerText.includes(kw));
    
    if (hasKeywords) {
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          const taskData = JSON.parse(jsonMatch[0].trim());
          if (taskData.question && taskData.language) { 
            setCodingPopupTask(taskData); 
            return; 
          }
        } catch (e) {}
      }
      
      const fuzzyTask = extractFuzzyTask(text);
      if (fuzzyTask) { 
        console.log("[CodingQ] Natural language detection:", fuzzyTask); 
        setCodingPopupTask(fuzzyTask); 
        return; 
      }
    }
  };

  const handleAttemptChallenge = () => {
    activeCodingTaskRef.current = codingPopupTask;
    setActiveCodingTask(codingPopupTask);
    setCodingPopupTask(null);
    setIsMuted(true);
    if (audioPlayerRef.current) audioPlayerRef.current.pause();
    window.speechSynthesis?.cancel();
    isAgentSpeakingRef.current = false;
    setIsAgentSpeaking(false);
  };

  const handleSkipChallenge = () => {
    setCodingPopupTask(null);
    activeCodingTaskRef.current = null; // Ensure no task blocks upcoming speech
    const skipMsg = "I'm not able to attempt this coding question right now. Let's move on.";
    
    // Add to transcript UI
    const newMessage = {
      id: Date.now(),
      role: "user",
      speaker: "You",
      text: skipMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAgent: false
    };
    setTranscript(prev => [...prev, newMessage]);
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
    
    const submitMsg = `I've submitted my solution in ${language}:\n\n${code}`;
    
    // Add to transcript UI
    const newMessage = {
      id: Date.now(),
      role: "user",
      speaker: "You",
      text: submitMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAgent: false
    };
    setTranscript(prev => [...prev, newMessage]);
    transcriptRef.current.push({ role: "user", content: submitMsg });

    // Ensure state updates are committed before triggering AI (especially activeCodingTask: null)
    setTimeout(() => {
      handleAiChat(submitMsg);
    }, 100);
  };

  const handleEndCall = () => {
    hasCallEndedRef.current = true;
    setHasCallEnded(true);
    setCallStatus("ended");
    setConnectionStatus("Call Ended");
    
    // Clear all pending timers
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    if (recognitionRef.current) {
      try { 
        recognitionRef.current.onend = null; // Prevent restart
        recognitionRef.current.stop(); 
      } catch (e) { }
    }
    window.speechSynthesis?.cancel();

    // Deduct credit & Save Transcript
    (async () => {
      try {
        const token = await getToken();
        
        // Save transcript first
        if (transcript.length > 0) {
          await axios.post(`${backend_URL}/api/custom-interview/save-transcript`, 
            { sessionId, transcript }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Transcript saved successfully.");
        }

        // Deduct credit
        await axios.post(`${backend_URL}/api/subscription/deduct-interview`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Interview credit deducted.");
      } catch (err) {
        console.error("Failed to complete end-call operations:", err);
      }
    })();
  };

  const handleGenerateReport = async (forcedTranscript = null) => {
    if (isProcessing) return;
    const currentSessionId = sessionId;
    if (!currentSessionId) {
      toast.error("Session not found.");
      return;
    }

    const finalTranscript = forcedTranscript || transcript;
    if (finalTranscript.length === 0) {
      console.warn("No transcript to process.");
      return;
    }

    setIsProcessing(true);
    const token = await getToken();
    try {
      const response = await axios.post(
        `${backend_URL}/api/vapi-interview/report-from-transcript`,
        { sessionId: currentSessionId, transcript: finalTranscript },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.status === "completed" && response.data.report) {
        setIsProcessing(false);
        toast.success("Interview report generated!");
        navigate(`/interview/result/${currentSessionId}`);
        return;
      }

      navigate(`/interview/result/${currentSessionId}`);
    } catch (error) {
      console.error("Report generation error:", error);
      navigate(`/interview/result/${currentSessionId}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Timer
  useEffect(() => {
    let interval;
    if (callStatus === "active") {
      interval = setInterval(() => {
        setInterviewDuration((prev) => prev + 1);
        
        // Master countdown handling
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) return 0;
          
          const newTime = prevTime - 1;
          
          // Wrap-up Trigger at 10 seconds
          if (newTime === 10 && !wrapUpTriggeredRef.current) {
            wrapUpTriggeredRef.current = true;
            handleAiChat("The interview time is almost up. Please wrap up and conclude the session now.");
          }
          
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setIsMicEnabled(!newMuted);
  };

  const toggleVideo = () => {
    const newVideoOn = !isVideoOn;
    setIsVideoOn(newVideoOn);
  };

  const toggleVideoFocus = () => {
    setIsUserFocus((prev) => !prev);
  };

  // Simulating Google Meet-style smooth pulsing
  // We use linear interpolation (lerp) and multiple oscillations for a fluid, organic feel
  useEffect(() => {
    let animationFrame;
    let start = Date.now();
    
    const animateVolume = () => {
      const now = Date.now();
      const t = (now - start) / 1000;

      if (isAgentSpeaking && agentVolumeCircleRef.current) {
        // 1. Organic baseline "breathing" (slow oscillation)
        const baseline = Math.sin(t * 3) * 0.05 + 0.05;
        
        // 2. Word-triggered spikes (from onboundary)
        const timeSinceWord = now - lastWordTimeRef.current;
        const wordSpike = Math.max(0, 1 - timeSinceWord / 350) * 0.3;
        
        // 3. High-frequency speech "jitter" (subtle)
        const jitter = Math.sin(t * 22) * 0.02;

        targetVolumeRef.current = Math.max(0, baseline + wordSpike + jitter);
      } else {
        targetVolumeRef.current = 0;
      }

      // Smoothly interpolate current towards target (lerp)
      // 0.15 factor creates that fluid "Meet" feel
      currentVolumeRef.current += (targetVolumeRef.current - currentVolumeRef.current) * 0.15;
      
      if (agentVolumeCircleRef.current) {
        const v = currentVolumeRef.current;
        const scale = 1 + v * 1.8;
        agentVolumeCircleRef.current.style.transform = `scale(${scale})`;
        // Also subtly pulsate opacity
        agentVolumeCircleRef.current.style.opacity = isAgentSpeaking ? 0.4 + v * 0.6 : 0;
      }

      animationFrame = requestAnimationFrame(animateVolume);
    };
    
    animateVolume();
    return () => cancelAnimationFrame(animationFrame);
  }, [isAgentSpeaking, isUserFocus]);

  useEffect(() => {
    console.log("[CustomSession] Mounting... SessionID:", sessionId);
    resetInterview(); // Ensure clean state on mount

    // ── Voice Loading ──
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log("[TTS] Voices loaded:", voices.length);
        setAvailableVoices(voices);
      }
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Preview Mode Setup
    if (isPreview) {
      setCallStatus("active");
      setConnectionStatus("Connected");
      setTranscript(MOCK_TRANSCRIPT);
      return;
    }

    // Auto start
    setTimeout(() => {
      startSTT();
    }, 1000);

    return () => {
      console.log("[CustomSession] Unmounting, cleaning up...");
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

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
  const getAgentImage = (name) => agentImages[name] || "/assets/interviewers/male1.png";

  return (
    <div className="min-h-screen bg-[#09090b] dark:text-zinc-100 text-gray-900 font-sans overflow-hidden">

      {/* ── Full-Screen CodingSpace (after Attempt clicked) ───────────────── */}
      {activeCodingTask && (
        <div className="fixed inset-0 z-[120] flex flex-col animate-in fade-in duration-300">
          <CodingSpace
            task={activeCodingTask}
            disableCopyPaste={false}
            onSubmit={handleCodingSubmit}
          />
        </div>
      )}

      <div className="h-full flex flex-col min-h-[90vh]">
        <header className="px-4 md:px-6 py-3 flex items-center justify-between bg-zinc-950/80 border-b border-white/5 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => navigate("/dashboard/setup")}
              className="p-2 bg-zinc-900/70 hover:bg-zinc-800 cursor-pointer rounded-xl transition-colors text-zinc-400 hover:text-white"
            >
              <FiArrowRight className="rotate-180" size={18} />
            </button>
            <div>
              <h1 className="text-sm md:text-lg font-semibold text-white tracking-tight truncate max-w-[160px] md:max-w-none">
                {displayInterviewData.role}
              </h1>
              <p className="text-[10px] md:text-[11px] text-primary font-black uppercase tracking-[0.2em]">
                {displayInterviewData.interviewType} • Custom AI Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 shadow-inner">
              <div className="flex items-center gap-1.5 border-r border-white/10 pr-2">
                <FiClock className={`text-[10px] ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                <span className={`text-[10px] font-mono font-bold tabular-nums ${timeLeft < 60 ? 'text-red-500' : 'text-zinc-200'}`}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-agent-emerald animate-pulse' : 'bg-red-500'}`}
                />
                <span className="text-[10px] font-mono font-semibold text-zinc-500">
                  {formatDuration(interviewDuration)}
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-[10px] font-semibold text-zinc-300">
              {isMuted ? <FiMicOff size={12} /> : <FiMic size={12} />}
              <span>{isMuted ? "Mic Off" : "Mic On"}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-[10px] font-semibold text-zinc-300">
              {isVideoOn ? <FiVideo size={12} /> : <FiVideoOff size={12} />}
              <span>{isVideoOn ? "Cam On" : "Cam Off"}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 font-bold text-[10px] bg-zinc-900 text-zinc-300 rounded-lg border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {connectionStatus}
            </div>
          </div>
        </header>

        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6">
          <div className="flex flex-col gap-6 min-w-0">
            <div className={`relative aspect-video bg-zinc-900/40 rounded-[28px] overflow-hidden border border-white/5 transition-all duration-700 ${activeCodingTask ? 'scale-95 blur-xl' : 'scale-100 blur-0 shadow-[0_0_60px_rgba(24,24,27,0.7)]'}`}>
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                {callStatus === "active" && !activeCodingTask && (
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
                          onClick={async () => {
                            setIsProcessing(true);
                            try {
                              const token = await getToken();
                              // Force a final transcript save and status update
                              await axios.post(`${backend_URL}/api/custom-interview/save-transcript`, 
                                { sessionId, transcript }, 
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                            } catch (err) {
                              console.error("Final save failed:", err);
                            }
                            resetInterview();
                            navigate("/dashboard/setup");
                          }}
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

              <div className="absolute bottom-5 z-20 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
                {isUserSpeaking && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                      Listening
                    </span>
                  </div>
                )}
                {!isUserSpeaking &&
                  !isAgentSpeaking &&
                  isAiThinking &&
                  callStatus === "active" && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500/10 backdrop-blur-md border border-amber-500/20 rounded-full flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                        Thinking...
                      </span>
                    </div>
                  )}
                {!isUserSpeaking &&
                  !isAgentSpeaking &&
                  !isAiThinking &&
                  callStatus === "active" && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500/10 backdrop-blur-md border border-blue-500/20 rounded-full flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        Your Turn
                      </span>
                    </div>
                  )}
                <button
                  onClick={toggleMute}
                  className={`p-3 cursor-pointer rounded-xl transition-all ${isMuted ? "bg-red-500 text-white" : "bg-zinc-900/70 hover:bg-zinc-800 text-white"}`}
                >
                  {isMuted ? <FiMicOff size={18} /> : <FiMic size={18} />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 cursor-pointer rounded-xl transition-all ${!isVideoOn ? "bg-red-500 text-white" : "bg-zinc-900/70 hover:bg-zinc-800 text-white"}`}
                >
                  {!isVideoOn ? <FiVideoOff size={18} /> : <FiVideo size={18} />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="p-3 bg-red-600 cursor-pointer hover:bg-red-500 text-white rounded-xl shadow-lg transition-all active:scale-95"
                >
                  <FiPhoneOff size={18} />
                </button>
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
                      <div className="bg-primary h-full rounded-full animate-progress" style={{ width: '60%' }}></div>
                    </div>
                  </div>
               </div>
            )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1 h-3 bg-primary rounded-full" />
                  Session Overview
                </h3>
                <button className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors">
                  <FiMoreVertical size={16} />
                </button>
              </div>
              {/* ── Coding Question Card (inline, above transcript) ─────────────── */}
              {codingPopupTask && !activeCodingTask && (
                <div className="rounded-2xl border border-primary/30 bg-[#141417] overflow-hidden shadow-lg shadow-primary/5 animate-in slide-in-from-top-2 duration-300">
                  <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/50 to-primary" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <FiCode size={15} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Coding challenge</p>
                          <p className="text-[13px] font-black text-white truncate">{codingPopupTask.title || "Coding Task"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {codingPopupTask.timeLimit && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 border border-white/10 text-zinc-400">
                            ⏱ {Math.floor(codingPopupTask.timeLimit / 60)}m
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mb-3">
                      {codingPopupTask.question}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAttemptChallenge}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-[#a3e14d] text-black text-[11px] font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20"
                      >
                        <FiZap size={12} /> Attempt
                      </button>
                      <button
                        onClick={handleSkipChallenge}
                        className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold rounded-xl border border-white/5 transition-all active:scale-95"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-zinc-900/60 px-4 py-3 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-1.5">
                    <FiClock size={10} className="text-primary" /> Remaining
                  </span>
                  <p className="text-[11px] font-semibold text-white">
                    {formatDuration(timeLeft)}
                  </p>
                </div>
                <div className="bg-zinc-900/60 px-4 py-3 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-1.5">
                    <FiStar size={10} className="text-primary" /> Interview
                  </span>
                  <p className="text-[11px] font-semibold text-white uppercase truncate">
                    {displayInterviewData.interviewType} • {displayInterviewData.role}
                  </p>
                </div>
                <div className="bg-zinc-900/60 px-4 py-3 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-1.5">
                    <FiUser size={10} className="text-primary" /> Interviewer
                  </span>
                  <p className="text-[11px] font-semibold text-white truncate">
                    {agentName}
                  </p>
                </div>
                <div className="bg-zinc-900/60 px-4 py-3 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-1.5">
                    <FiZap size={10} className="text-primary" /> Status
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[11px] font-semibold text-emerald-500 uppercase">
                      Live Session
                    </p>
                  </div>
                </div>
              </div>

          
            </div>
          </div>

          <div className="flex flex-col min-w-0 gap-4">
        

            <div className="flex flex-col bg-zinc-900/60 rounded-2xl border border-white/5 overflow-hidden shadow-2xl h-[640px]">
              <div className="p-3 flex items-center gap-2 bg-zinc-900 border-b border-white/5">
                <div className="flex-1 flex gap-1">
                  <button className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 text-white text-[10px] font-bold shadow-md">
                    Live Transcript
                  </button>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800/80 text-zinc-400 text-[10px] font-semibold border border-white/5">
                  <FiMessageSquare size={12} />
                  Auto-scroll
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {transcript.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.isAgent ? 'items-start' : 'items-end'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`flex items-center gap-2 mb-1.5 ${msg.isAgent ? '' : 'flex-row-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden ${msg.isAgent ? 'bg-zinc-800 border border-white/10' : 'bg-primary text-black'}`}>
                        {msg.isAgent ? <img src={getAgentImage(agentName)} alt="Agent" className="w-full h-full object-cover" /> : user?.firstName?.[0] || 'U'}
                      </div>
                      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{msg.speaker} • {msg.timestamp}</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-[13px] leading-relaxed max-w-[85%] shadow-sm transition-all ${msg.isAgent ? 'bg-zinc-800/80 text-white rounded-tl-none border border-white/5' : 'bg-primary text-black font-semibold rounded-tr-none shadow-lg shadow-primary/5'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Live Interim Transcript */}
                {interimText && (
                  <div className="flex flex-col items-end animate-in fade-in duration-200">
                    <span className="text-[9px] font-bold text-zinc-600 mb-1.5 uppercase tracking-widest italic text-primary animate-pulse">Listening...</span>
                    <div className="p-3 rounded-2xl text-[13px] leading-relaxed max-w-[85%] bg-primary/20 text-primary border border-primary/30 rounded-tr-none italic">
                      {interimText}...
                    </div>
                  </div>
                )}
                <div ref={transcriptEndRef} />
              </div>
              
              <div className="p-3 border-t border-white/5 bg-zinc-900/80 flex items-center justify-between text-[10px] text-zinc-400">
                <span className="flex items-center gap-2">
                  <FiInfo size={12} />
                  Transcript updates live as you speak
                </span>
                <span className="flex items-center gap-2 text-primary font-black uppercase tracking-widest">
                  {connectionStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default CustomInterviewSession;
