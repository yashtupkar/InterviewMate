import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useInterview } from "../context/InterviewContext";
import { AppContext } from "../context/AppContext";
import { interviewAgents } from "../constants/agents";

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
    const { systemPrompt, isCustom, duration: initialDuration } = location.state || {};

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

    const userName = user?.firstName || "Candidate";
    const isPreview = new URLSearchParams(location.search).get("preview") === "true";

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

    const MOCK_INTERVIEW_DATA = {
        interviewType: "Technical",
        role: "Senior Frontend Engineer",
        level: "Senior",
        content: "",
        agentName: "Rohan",
    };

    const agentName = isPreview ? MOCK_INTERVIEW_DATA.agentName : (interviewData?.agentName || "Sophia");
    const displayInterviewData = isPreview ? MOCK_INTERVIEW_DATA : interviewData;

    const SILENCE_THRESHOLD = 2000;

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const extractFuzzyTask = (text) => {
        const lowerText = text.toLowerCase();
        const languages = ['javascript', 'html', 'python', 'java', 'cpp', 'css', 'typescript', 'react', 'sql'];
        const language = languages.find(l => lowerText.includes(l));

        let timeLimit = 300;
        const timeMatch = text.match(/(?:time|limit|duration).*?(\d+)\s*(min|sec|minute|second|$)/i);
        if (timeMatch) {
            const value = parseInt(timeMatch[1]);
            const unit = timeMatch[2]?.toLowerCase();
            if (unit && unit.startsWith('sec')) {
                timeLimit = value;
            } else {
                timeLimit = value * 60;
            }
        } else if (lowerText.includes("10 min")) {
            timeLimit = 600;
        } else if (lowerText.includes("5 min") || lowerText.includes("5 minute")) {
            timeLimit = 300;
        }

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

    // Helper to update transcript in state
    const updateUserTranscript = useCallback((text) => {
        setContextTranscript(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && !lastMsg.isAgent && lastMsg.id === currentUserMessageIdRef.current) {
                const newTranscript = [...prev];
                newTranscript[newTranscript.length - 1] = { ...lastMsg, text: text };
                return newTranscript;
            } else {
                const newId = Date.now();
                currentUserMessageIdRef.current = newId;
                return [...prev, {
                    id: newId,
                    role: "user",
                    speaker: "You",
                    text: text,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isAgent: false
                }];
            }
        });
    }, [setContextTranscript]);

    const handleAiChat = useCallback(async (forcePrompt = null) => {
        if (hasCallEndedRef.current || isAiThinkingRef.current || isAgentSpeakingRef.current) return;
        try {
            isAiThinkingRef.current = true;
            setIsAiThinking(true);
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
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
            const aiMessage = {
                id: Date.now(),
                role: "assistant",
                speaker: displayInterviewData.agentName || "Interviewer",
                text: aiText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isAgent: true
            };
            setContextTranscript(prev => [...prev, aiMessage]);
            transcriptRef.current.push({ role: "assistant", content: aiText });

            detectCodingQuestion(aiText);

            const normalized = aiText.toLowerCase();
            const endPhrases = [
                "this concludes", "concludes our interview", "that concludes",
                "interview is complete", "interview is now concluded", "interview is concluded",
                "have a great day", "thank you for your time", "reached the end",
                "goodbye", "good luck", "see you next time", "interview has finished",
                "thank you for joining us"
            ];

            const shouldEnd = endPhrases.some((phrase) => normalized.includes(phrase));
            const containsCodingTask = normalized.includes("coding question") || normalized.includes("write a function") || normalized.includes("[code_question]");

            if (shouldEnd && !containsCodingTask && !activeCodingTaskRef.current && !hasEndedRef.current) {
                hasEndedRef.current = true;
            }

            playTTS(aiText);
            isAiThinkingRef.current = false;
            setIsAiThinking(false);

        } catch (err) {
            console.error("AI Chat Error Details:", err.response?.data || err.message);
            isAiThinkingRef.current = false;
            setIsAiThinking(false);
            toast.error("AI failed to respond.");
        }
    }, [sessionId, backend_URL, displayInterviewData.agentName, getToken, location.state?.systemPrompt, setContextTranscript]);

    const detectCodingQuestion = (text) => {
        if (activeCodingTaskRef.current || codingPopupTask) return;

        const tagMatch = text.match(/\[CODE_QUESTION\]([\s\S]*?)\[\/CODE_QUESTION\]/i);
        if (tagMatch) {
            try {
                let jsonStr = tagMatch[1].trim();
                jsonStr = jsonStr.replace(/```json/gi, '').replace(/```/g, '').trim();
                const taskData = JSON.parse(jsonStr);
                if (taskData.question) {
                    setCodingPopupTask(taskData);
                    return;
                }
            } catch (e) {
                const fuzzyTask = extractFuzzyTask(tagMatch[1]);
                if (fuzzyTask) { setCodingPopupTask(fuzzyTask); return; }
            }
        }

        const lowerText = text.toLowerCase();
        const codingKeywords = ["coding question", "coding task", "coding challenge", "write a function", "make a function", "implement a function", "time limit", "solve this", "lets start solving"];
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
                } catch (e) { }
            }

            const fuzzyTask = extractFuzzyTask(text);
            if (fuzzyTask) {
                setCodingPopupTask(fuzzyTask);
                return;
            }
        }
    };

    const handleUserSpeech = useCallback((text) => {
        if (!text?.trim() || isAgentSpeakingRef.current || isAiThinkingRef.current || hasCallEndedRef.current) return;
        transcriptRef.current.push({ role: "user", content: text });
        currentUserMessageIdRef.current = null;
        handleAiChat();
    }, [handleAiChat]);

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        if (hasCallEndedRef.current) return;

        inactivityTimerRef.current = setTimeout(() => {
            if (!isUserSpeaking && !isAgentSpeaking && !isAiThinking && !activeCodingTaskRef.current && !hasCallEndedRef.current) {
                handleInactivityWarning();
            }
        }, 10000);
    }, [isUserSpeaking, isAgentSpeaking, isAiThinking]);

    const handleInactivityWarning = () => {
        if (hasCallEndedRef.current || isAiThinkingRef.current || isAgentSpeakingRef.current) return;

        isWaitingForInactivityResponseRef.current = true;
        const warningText = `Are you still there, ${userName}? Take your time, let me know when you're ready to proceed.`;

        const aiMessage = {
            id: Date.now(),
            role: "assistant",
            speaker: agentName,
            text: warningText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAgent: true
        };

        setContextTranscript(prev => [...prev, aiMessage]);
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
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAgent: true
        };
        setContextTranscript(prev => [...prev, aiMessage]);
        transcriptRef.current.push({ role: "assistant", content: conclusionText });
        playTTS(conclusionText);
        setTimeout(handleEndCall, 5000);
    };

    const playTTS = useCallback((text) => {
        if (activeCodingTaskRef.current || hasCallEndedRef.current) return;
        const cleanText = text.replace(/[*_#`~]/g, '').replace(/\[\/?CODE_QUESTION\]/gi, '').trim();
        if (!cleanText) return;

        try {
            isAgentSpeakingRef.current = true;
            setIsAgentSpeaking(true);
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch (e) { }
            }

            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.onboundary = (event) => {
                    if (event.name === 'word') lastWordTimeRef.current = Date.now();
                };
                utterance.onend = () => {
                    lastAiFinishTimeRef.current = Date.now();
                    if (isWaitingForInactivityResponseRef.current) {
                        isWaitingForInactivityResponseRef.current = false;
                        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
                        inactivityTimerRef.current = setTimeout(() => {
                            if (!isUserSpeaking && !isAgentSpeaking && !isAiThinking && !activeCodingTaskRef.current && !hasCallEndedRef.current) {
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
                        if (!hasCallEndedRef.current && !activeCodingTaskRef.current && recognitionRef.current) {
                            try { recognitionRef.current.start(); } catch (e) { }
                        }
                    }, 500);
                };
                utterance.onerror = () => {
                    isAgentSpeakingRef.current = false;
                    setIsAgentSpeaking(false);
                    if (!hasCallEndedRef.current && !activeCodingTaskRef.current && recognitionRef.current) {
                        try { recognitionRef.current.start(); } catch (err) { }
                    }
                };

                const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
                const agent = interviewAgents.find(a => a.name === agentName) || interviewAgents.find(a => a.name === "Sophia");
                const config = agent.browserVoiceConfig;
                if (!config) { setIsAgentSpeaking(false); return; }

                let voice = null;
                for (const kw of config.keywords) {
                    voice = voices.find(v => v.name.includes(kw) && v.lang.includes("en"));
                    if (voice) break;
                }
                if (!voice) {
                    voice = voices.find(v => (config.gender === 'female' ? (v.name.includes("Female") || v.name.includes("Zira")) : (v.name.includes("Male") || v.name.includes("David"))) && v.lang.includes("en"));
                }
                if (!voice) voice = voices.find(v => v.lang.includes("en"));
                if (voice) utterance.voice = voice;
                utterance.rate = config.rate;
                utterance.pitch = config.pitch;
                window.speechSynthesis.resume();
                window.speechSynthesis.speak(utterance);
            } else {
                setIsAgentSpeaking(false);
            }
        } catch (err) {
            console.error("[TTS] Critical failure:", err);
            setIsAgentSpeaking(false);
        }
    }, [agentName, availableVoices, resetInactivityTimer, isUserSpeaking, isAgentSpeaking, isAiThinking]);

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
        let finalBuffer = "";

        recognition.onstart = () => {
            setCallStatus("active");
            setConnectionStatus("Connected");
            if (transcriptRef.current.length === 0) handleAiChat();
        };

        recognition.onresult = (e) => {
            const now = Date.now();
            const isCoolingDown = (now - lastAiFinishTimeRef.current) < 1500;
            if (isAgentSpeakingRef.current || isAiThinkingRef.current || isCoolingDown || hasCallEndedRef.current) return;

            let interimTranscript = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const transcriptChunk = e.results[i][0].transcript;
                if (e.results[i].isFinal) finalBuffer += transcriptChunk;
                else interimTranscript += transcriptChunk;
            }

            const currentText = (finalBuffer + interimTranscript).trim();
            if (currentText) {
                setIsUserSpeaking(true);
                if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
                isWaitingForInactivityResponseRef.current = false;
                updateUserTranscript(currentText);

                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    const finalStr = finalBuffer.trim() || interimTranscript.trim();
                    if (finalStr) {
                        handleUserSpeech(finalStr);
                        finalBuffer = "";
                    }
                    setIsUserSpeaking(false);
                }, SILENCE_THRESHOLD);
            }
        };

        recognition.onerror = (e) => {
            if (e.error === 'not-allowed') {
                setConnectionStatus("Mic Blocked");
                toast.error("Microphone access denied.");
            }
        };

        recognition.onend = () => {
            if (!hasCallEndedRef.current && !activeCodingTaskRef.current && !isAgentSpeakingRef.current) {
                try { recognition.start(); } catch (e) { }
            }
        };

        recognitionRef.current = recognition;
        try { recognition.start(); } catch (e) { }
    }, [handleAiChat, handleUserSpeech, updateUserTranscript, setCallStatus]);

    const handleEndCall = useCallback(() => {
        hasCallEndedRef.current = true;
        setHasCallEnded(true);
        setCallStatus("ended");
        setConnectionStatus("Call Ended");
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onend = null;
                recognitionRef.current.stop();
            } catch (e) { }
        }
        window.speechSynthesis?.cancel();

        (async () => {
            try {
                const token = await getToken();
                if (contextTranscript.length > 0) {
                    await axios.post(`${backend_URL}/api/custom-interview/save-transcript`,
                        { 
                            sessionId, 
                            transcript: contextTranscript,
                            actualDuration: interviewDuration // Sending the total seconds tracked in state
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }
                // Redundant legacy deduction removed to prevent double-charging
            } catch (err) {
                console.error("Failed to complete end-call operations:", err);
            }
        })();
    }, [getToken, contextTranscript, sessionId, backend_URL, setCallStatus, interviewDuration]);

    const handleGenerateReport = async (forcedTranscript = null) => {
        if (isProcessing) return;
        if (!sessionId) { toast.error("Session not found."); return; }
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
                  duration: Math.round(interviewDuration / 60) 
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
        return () => { if (stream) stream.getTracks().forEach((track) => track.stop()); };
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
                        handleAiChat("SYSTEM NOTE: The interview time is up. In your next response, please provide brief feedback on the user's last answer, thank the user for attending, and then conclude completely. You MUST end with this exact phrase: 'Thank you for your time. The interview is now concluded. Goodbye.'");
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
            currentVolumeRef.current += (targetVolumeRef.current - currentVolumeRef.current) * 0.15;
            if (agentVolumeCircleRef.current) {
                const v = currentVolumeRef.current;
                const scale = 1 + v * 1.8;
                agentVolumeCircleRef.current.style.transform = `scale(${scale})`;
                agentVolumeCircleRef.current.style.opacity = isAgentSpeaking ? 0.4 + v * 0.6 : 0;
            }
            animationFrame = requestAnimationFrame(animateVolume);
        };
        animateVolume();
        return () => cancelAnimationFrame(animationFrame);
    }, [isAgentSpeaking]);

    useEffect(() => {
        resetInterview();
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) setAvailableVoices(voices);
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) window.speechSynthesis.onvoiceschanged = loadVoices;

        if (isPreview) {
            setCallStatus("active");
            setConnectionStatus("Connected");
            setContextTranscript([
                { id: 1, role: "assistant", speaker: "Rohan", text: "Hello! I'm Rohan, your AI interviewer. Welcome! Could you please begin by introducing yourself?", timestamp: "10:00 AM", isAgent: true },
                { id: 2, role: "user", speaker: "You", text: "Hi Rohan! I'm a senior frontend engineer with 5 years of experience building React applications.", timestamp: "10:01 AM", isAgent: false }
            ]);
            return;
        }
        setTimeout(startSTT, 1000);
        return () => {
            if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) { }
            window.speechSynthesis?.cancel();
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
        activeCodingTaskRef.current = codingPopupTask;
        setActiveCodingTask(codingPopupTask);
        setCodingPopupTask(null);
        setIsMuted(true);
        window.speechSynthesis?.cancel();
        isAgentSpeakingRef.current = false;
        setIsAgentSpeaking(false);
    };

    const handleSkipChallenge = () => {
        setCodingPopupTask(null);
        activeCodingTaskRef.current = null;
        const skipMsg = "I'm not able to attempt this coding question right now. Let's move on.";
        const newMessage = {
            id: Date.now(), role: "user", speaker: "You", text: skipMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isAgent: false
        };
        setContextTranscript(prev => [...prev, newMessage]);
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
        const newMessage = {
            id: Date.now(), role: "user", speaker: "You", text: submitMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isAgent: false
        };
        setContextTranscript(prev => [...prev, newMessage]);
        transcriptRef.current.push({ role: "user", content: submitMsg });
        setTimeout(() => handleAiChat(submitMsg), 100);
    };

    return {
        state: {
            timeLeft, isMuted, isVideoOn, isAgentSpeaking, isUserSpeaking, isAiThinking,
            hasCallEnded, activeCodingTask, codingPopupTask, isProcessing, connectionStatus,
            isUserFocus, userName, agentName, displayInterviewData, interviewDuration,
            transcript: contextTranscript, callStatus, user
        },
        refs: { localVideoRef, agentVolumeCircleRef },
        actions: {
            toggleMute, toggleVideo, toggleVideoFocus, handleEndCall, handleGenerateReport,
            handleAttemptChallenge, handleSkipChallenge, handleCodingSubmit, resetInterview,
            formatDuration
        }
    };
};
