import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import {
  FiMic, FiMicOff, FiPhoneOff, FiUser, FiMessageSquare, FiClock,
  FiInfo,
  FiLoader,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { AppContext } from "../context/AppContext";

const AGENT_COLORS = {
  Alex: "#6366f1",
  Priya: "#ec4899",
  Marcus: "#f59e0b",
  Zoe: "#10b981",
};

const AGENT_IMAGES = {
  Alex: "/assets/interviewers/male1.png",
  Priya: "/assets/interviewers/female1.png",
  Marcus: "/assets/interviewers/male2.png",
  Zoe: "/assets/interviewers/female2.png",
};

const FALLBACK_MAX_GD_TIME = 600; // 10 minutes

// ─── TTS helper ──────────────────────────────────────────────────────────────
function speakText(text, agentName, onDone) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { onDone?.(); resolve(); return; }

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.volume = 1;

    const go = () => {
      const voices = window.speechSynthesis.getVoices();

      // Strict filter for Indian Voices (English India)
      const indianVoices = voices.filter(v => v.lang.includes("IN") || v.name.toLowerCase().includes("india"));
      const otherEnglish = voices.filter(v => v.lang.startsWith("en") && !indianVoices.includes(v));

      const profiles = {
        Alex: { gender: 'male', rate: 1.0, pitch: 1.0 },
        Priya: { gender: 'female', rate: 0.95, pitch: 1.1 },
        Marcus: { gender: 'male', rate: 0.88, pitch: 0.8 }, // Deep and slow
        Zoe: { gender: 'female', rate: 1.15, pitch: 1.4 }    // Fast and High-pitched
      };

      const p = profiles[agentName] || { gender: 'female', rate: 1, pitch: 1 };

      // Better gender detection for browser voices
      const isMaleVoice = (v) => {
        const name = v.name.toLowerCase();
        return name.includes('male') || name.includes('david') || name.includes('mark') || name.includes('ravi') || name.includes('george') || name.includes('stefan') || name.includes('google english india');
      };
      const isFemaleVoice = (v) => {
        const name = v.name.toLowerCase();
        return name.includes('female') || name.includes('zira') || name.includes('heera') || name.includes('samantha') || name.includes('catherine') || name.includes('priya') || name.includes('hazel') || name.includes('online');
      };

      // ── UNIQUE VOICE SELECTION ──
      const indianMale = indianVoices.filter(isMaleVoice);
      const indianFemale = indianVoices.filter(isFemaleVoice);
      const otherMale = otherEnglish.filter(isMaleVoice);
      const otherFemale = otherEnglish.filter(isFemaleVoice);

      let voice = null;
      if (agentName === "Alex") voice = indianMale[0] || otherMale[0];
      if (agentName === "Marcus") voice = indianMale[1] || otherMale[1] || otherMale[0] || indianMale[0];
      if (agentName === "Priya") voice = indianFemale[0] || otherFemale[0];
      if (agentName === "Zoe") voice = indianFemale[1] || otherFemale[1] || otherFemale[0] || indianFemale[0];

      // Ultimate fallback
      if (!voice) voice = voices[0];

      if (voice) utter.voice = voice;

      const variance = (Math.random() * 0.04) - 0.02;
      utter.rate = p.rate + variance;
      utter.pitch = p.pitch + variance;

      utter.onend = utter.onerror = () => { onDone?.(); resolve(); };
      window.speechSynthesis.speak(utter);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      go();
    } else {
      window.speechSynthesis.onvoiceschanged = go;
    }
  });
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GroupDiscussionSession() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();
  const { backend_URL } = useContext(AppContext);

  const meta = location.state || {};
  const topic = meta.topic || "Group Discussion";
  const description = meta.description || "";
  const initAgents = meta.agents || [
    { name: "Alex", color: "#6366f1" },
    { name: "Priya", color: "#ec4899" },
    { name: "Marcus", color: "#f59e0b" },
    { name: "Zoe", color: "#10b981" },
  ];
  const maxTime = meta.timeLimit || FALLBACK_MAX_GD_TIME;

  // ── UI state ─────────────────────────────────────────────────────────────
  const [transcript, setTranscript] = useState([]);
  const [speakingAgent, setSpeakingAgent] = useState(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [isConcludingPhase, setIsConcludingPhase] = useState(false);
  const [invigilatorMessage, setInvigilatorMessage] = useState(`Your GD topic is "${topic}". Let's start now.`);
  const [invigilatorStatus, setInvigilatorStatus] = useState("start"); // start, active, concluding
  const [invTimer, setInvTimer] = useState(45); // countdown for conclusion
  const [prepCountdown, setPrepCountdown] = useState(60); // 1 minute prep
  const [showPrepModal, setShowPrepModal] = useState(meta.prepTime || false);

  // ── Stable refs (never trigger re-renders, always fresh in callbacks) ─────
  const aliveRef = useRef(true);   // session still running
  const busyRef = useRef(false);  // agent is thinking or speaking (API call + TTS)
  const agentSpeakingRef = useRef(false); // TRUE ONLY during actual TTS
  const userSpeakingRef = useRef(false);  // mirror of isUserSpeaking state
  const lastUserSpeechRef = useRef(0);    // timestamp of last user activity
  const mutedRef = useRef(false);
  const lastSpkRef = useRef(null);   // last agent name who spoke
  const recRef = useRef(null);   // SpeechRecognition instance
  const recognitionRef = recRef;         // alias for clarity
  const proTimRef = useRef(null);   // proactive timer
  const silTimRef = useRef(null);   // user-silence timer
  const openedRef = useRef(false);  // opening turn fired
  const concludedRef = useRef(false); // conclusion triggered
  const transcriptRef = useRef([]);     // mirror of transcript for closures
  const prefetchedTurnRef = useRef(null); // stores { agent, text } pre-fetched
  const endRef = useRef(null);   // scroll anchor
  const conclusionPendingRef = useRef(false); // track wrap-up if user speaks while busy
  const prepTimerRef = useRef(null);
  const openTimerRef = useRef(null); // Ref for AI opening timer

  // get a fresh auth token inside callbacks
  const getTokenRef = useRef(getToken);
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (aliveRef.current && !showPrepModal) {
        setDuration((d) => {
          const next = d + 1;
          // Auto-conclude check if we hit max time
          if (next >= maxTime && !concludedRef.current) {
            concludedRef.current = true;
            if (!busyRef.current) {
              console.log("🕒 Time limit reached. Triggering auto-conclusion.");
              runAgentTurnRef.current({ endpoint: "conclude" });
            } else {
              console.log("🕒 Time limit reached but AI is busy. Queuing auto-conclusion.");
              conclusionPendingRef.current = true;
            }
          }

          // Invigilator Trigger: 45s before the end
          if (next === maxTime - 45 && !concludedRef.current) {
            triggerInvigilator();
          }

          // Handle live countdown
          if (next >= maxTime - 45 && next < maxTime) {
            setInvTimer(maxTime - next);
          }

          return next;
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [showPrepModal, maxTime]);

  const triggerInvigilator = async () => {
    console.log("📢 Invigilator: Time is almost up!");
    setIsConcludingPhase(true);
    setInvigilatorStatus("concluding");
    setInvigilatorMessage("Candidates, please conclude the GD now.");
    setInvTimer(45);
    // CRITICAL: Clear pre-fetched regular turns so they don't block the conclusion!
    prefetchedTurnRef.current = null;
    // START pre-fetching the conclusion immediately so it's ready for silence detection
    prefetchNextTurn(lastSpkRef.current);
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [transcript]);

  // ── Core: run one agent turn ──────────────────────────────────────────────
  // This is a plain async function stored in a ref — no stale-closure issues.
  const runAgentTurnRef = useRef(null);
  runAgentTurnRef.current = async ({ endpoint = "next-turn", body = {} } = {}) => {
    if (!aliveRef.current) return;
    if (concludedRef.current && endpoint !== "conclude") return;
    
    // HARD OVERRIDE: If we are in the concluding phase, force the endpoint to "conclude"
    // to prevent agents from adding follow-up points after the warning.
    let finalEndpoint = endpoint;
    if (isConcludingPhase && (endpoint === "next-turn" || endpoint === "proactive")) {
      console.log("🎯 Overriding regular turn to 'conclude' during warning phase.");
      finalEndpoint = "conclude";
    }
    
    // 1. Priority Check: Don't interrupt the user
    if (userSpeakingRef.current) {
      console.log("🤫 User is speaking, skipping agent turn.");
      scheduleProactive(3000);
      return;
    }

    // 2. Floor protection: Give user a gap after they finish speaking
    const timeSinceUser = Date.now() - lastUserSpeechRef.current;
    if (timeSinceUser < 1000 && !body.userMessage) {
      console.log("⏳ Protecting floor (user recently spoke). Wait...");
      scheduleProactive(1200);
      return;
    }

    if (busyRef.current) return;
    busyRef.current = true;

    let turnData = null;

    // 1. Check if we have a pre-fetched turn
    if (endpoint === "next-turn" && body.proactive && prefetchedTurnRef.current) {
      // If we are concluding, verify it's a conclusion turn (usually shouldn't be here)
      if (isConcludingPhase) {
        console.log("🚫 Concluding phase: Discarding pre-fetched regular turn for wrap-up priority.");
        prefetchedTurnRef.current = null;
      } else {
        console.log("⚡ Found pre-fetched turn! Consuming instantly.");
        turnData = prefetchedTurnRef.current;
        prefetchedTurnRef.current = null;
      }
    }
    
    // ── MANUAL USER MESSAGE SAVE ──
    // If we have a user message, save it now because we use skipSave: true for turn generation.
    if (body.userMessage) {
      try {
        const token = await getTokenRef.current();
        await axios.post(
          `${backend_URL}/api/group-discussion/add-user-message`,
          { sessionId, text: body.userMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.warn("Failed to manual-save user message:", err.message);
      }
    }
    
    if (!turnData) {
      // 2. Otherwise, fetch it now
      setIsThinking(true);
      try {
        const token = await getTokenRef.current();
        const res = await axios.post(
          `${backend_URL}/api/group-discussion/${finalEndpoint}`,
          { sessionId, lastSpeaker: lastSpkRef.current, skipSave: true, ...body },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        turnData = res.data;

        // ── PHASE TRANSITION CHECK ──
        // If the invigilator warning started while we were thinking about a normal point,
        // discard this result so we can trigger a proper conclusion turn instead.
        if (isConcludingPhase && finalEndpoint !== "conclude") {
          console.log("🛑 Phase changed to concluding during thinking. Aborting regular turn.");
          setIsThinking(false);
          busyRef.current = false;
          scheduleProactive(500); // Trigger a fresh turn (which will now be a conclusion)
          return;
        }

        // ── SECOND INTERRUPTION CHECK ──
        // If the user started speaking while we were fetching the data, ABORT this turn!
        if (userSpeakingRef.current && !body.userMessage) {
          console.log("🛑 User interrupted agent thinking. Discarding fetched turn.");
          setIsThinking(false);
          busyRef.current = false;
          scheduleProactive(4000);
          return;
        }
      } catch (err) {
        console.error("Agent turn error:", err);
        setIsThinking(false);
        setSpeakingAgent(null);
        busyRef.current = false;
        if (aliveRef.current && !mutedRef.current && recRef.current) {
          try { recRef.current.start(); } catch (_) { }
        }
        scheduleProactive(12000);
        return;
      }
    }

    if (!aliveRef.current || !turnData) { busyRef.current = false; return; }

    const { agent, text } = turnData;
    lastSpkRef.current = agent.name;

    const entry = {
      id: Date.now(), speaker: agent.name,
      role: "agent", text,
      color: agent.color || AGENT_COLORS[agent.name] || "#6366f1",
    };

    setTranscript((prev) => {
      const next = [...prev, entry];
      transcriptRef.current = next;
      return next;
    });

    // ── SAVE TO DB ──
    try {
      const token = await getTokenRef.current();
      await axios.post(
        `${backend_URL}/api/group-discussion/add-agent-message`,
        { sessionId, name: agent.name, text, personality: agent.personality },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.warn("Failed to save agent turn to DB:", err.message);
    }

    setIsThinking(false);

    // pause mic during TTS
    if (recRef.current && !mutedRef.current) {
      try { recRef.current.stop(); } catch (_) { }
    }

    setSpeakingAgent(agent.name);
    agentSpeakingRef.current = true;

    // ── SMART STEP: While this agent is speaking, pre-fetch the NEXT one! ──
    if (aliveRef.current) {
      prefetchNextTurn(agent.name);
    }

    await speakText(text, agent.name, null);

    setSpeakingAgent(null);
    agentSpeakingRef.current = false;
    busyRef.current = false;

    // resume mic
    if (aliveRef.current && !mutedRef.current && recRef.current) {
      try { recRef.current.start(); } catch (_) { }
    }

    // schedule next proactive turn unless we just concluded
    if (finalEndpoint === "conclude") {
      setTimeout(endSession, 2000); // end session after conclusion plays
    } else {
      // ── CHECK PENDING CONCLUSION ──
      if (conclusionPendingRef.current) {
        console.log("🔄 Consuming pending conclusion request...");
        conclusionPendingRef.current = false;
        runAgentTurnRef.current({ endpoint: "conclude" });
      } else {
        scheduleProactive();
      }
    }
  };

  // ── Background Pre-fetching ───────────────────────────────────────────────
  async function prefetchNextTurn(currentSpeaker) {
    if (prefetchedTurnRef.current || concludedRef.current) return;
    
    // During conclusion phase, we pre-fetch the "conclude" endpoint
    const endpoint = isConcludingPhase ? "conclude" : "next-turn";
    
    console.log(`🔍 Pre-fetching ${endpoint} for next agent to follow ${currentSpeaker}...`);
    try {
      const token = await getTokenRef.current();
      const res = await axios.post(
        `${backend_URL}/api/group-discussion/${endpoint}`,
        { sessionId, lastSpeaker: currentSpeaker, proactive: true, skipSave: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (aliveRef.current) {
        prefetchedTurnRef.current = res.data;
        console.log(`✅ Pre-fetch (${endpoint}) ready:`, res.data.agent.name);
      }
    } catch (err) {
      console.warn("Pre-fetch failed (will retry normally if needed):", err.message);
    }
  }

  // ── Proactive scheduling ──────────────────────────────────────────────────
  function scheduleProactive(delay = null) {
    if (proTimRef.current) clearTimeout(proTimRef.current);
    if (!aliveRef.current) return;

    // ── NATURAL GAP MODE ──
    // Even if we have a response ready, give the user space
    const hasPre = !!prefetchedTurnRef.current;
    
    // User floor protection: if pre-fetched, wait 2s - 3s. 
    // If concluding phase, we want to be more proactive to wrap up.
    let d = delay ?? (hasPre ? 2000 + Math.random() * 1000 : 6000 + Math.random() * 5000);

    if (isConcludingPhase && !delay) {
      // If we have a pre-fetched conclusion, don't wait too long for the user.
      // 5-8 seconds of total silence is enough to trigger the AI conclusion.
      d = hasPre ? 3000 + Math.random() * 2000 : 6000 + Math.random() * 3000;
    }

    console.log(`⏱ Scheduling turn in ${Math.round(d)}ms (${hasPre ? "Pre-fetched" : "Gap"}) ${isConcludingPhase ? "(Concluding Phase)" : ""}`);
    proTimRef.current = setTimeout(() => {
      if (aliveRef.current && !busyRef.current && !userSpeakingRef.current) {
        runAgentTurnRef.current({ endpoint: "next-turn", body: { proactive: true } });
      } else if (userSpeakingRef.current) {
        // if user is speaking when timer fires, reschedule
        scheduleProactive(3000);
      }
    }, d);
  }

  // ── Bootstrap: opening turn + SpeechRecognition ───────────────────────────
  useEffect(() => {
    if (!sessionId) return;

    aliveRef.current = true;
    busyRef.current = false;
    openedRef.current = false;

    // ── SpeechRecognition setup ──
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Speech recognition needs Chrome or Edge.");
    } else {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognitionRef.current = recognition;
      recRef.current = recognition;

      let finalBuffer = "";
      let interimText = "";
      let finalizeTimer = null;

      recognition.onstart = () => {
        console.log("🎙 SpeechRecognition started");
      };

      recognition.onresult = (e) => {
        if (!aliveRef.current || mutedRef.current) return;
        
        // ONLY ignore if agent is actually speaking out loud (to avoid echo)
        // If agent is just "thinking" (fetching API), we SHOULD detect user speech!
        if (agentSpeakingRef.current) return; 

        // ── USER SPOKE: Cancel opening if it hasn't fired ──
        if (openTimerRef.current) {
          console.log("🛑 User spoke before AI opener. Cancelling opening turn.");
          clearTimeout(openTimerRef.current);
          openTimerRef.current = null;
        }

        // ── USER SPOKE: Invalidate pre-fetch ──
        if (prefetchedTurnRef.current) {
          console.log("🚫 User spoke, invalidating pre-fetched turn.");
          prefetchedTurnRef.current = null;
        }

        if (proTimRef.current) clearTimeout(proTimRef.current);
        if (silTimRef.current) clearTimeout(silTimRef.current);

        lastUserSpeechRef.current = Date.now();
        userSpeakingRef.current = true;
        setIsUserSpeaking(true);

        interimText = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            finalBuffer += e.results[i][0].transcript;
          } else {
            interimText += e.results[i][0].transcript;
          }
        }
        const display = (finalBuffer + " " + interimText).trim();
        setLiveText(display);
        setIsUserSpeaking(true);

        if (finalizeTimer) clearTimeout(finalizeTimer);
        finalizeTimer = setTimeout(() => {
          const spoken = finalBuffer.trim();
          finalBuffer = "";
          interimText = "";
          setLiveText("");
          
          userSpeakingRef.current = false;
          setIsUserSpeaking(false);

          if (spoken) {
            const userEntry = {
              id: Date.now(), speaker: "You",
              role: "user", text: spoken,
              color: "#22c55e",
            };

            // ── CHECK FOR USER CONCLUSION ──
            const lower = spoken.toLowerCase();
            const keywords = [
              "conclusion", "conclude", "concluding", "wrap up", "wrapping up", 
              "final point", "thank you everyone", "that is all from my side", 
              "my conclusion", "summarize", "summarizing", "end the discussion"
            ];
            const isUserConcluding = keywords.some(k => lower.includes(k));

            if (isUserConcluding && !concludedRef.current) {
              concludedRef.current = true;
              conclusionPendingRef.current = false; 
              if (proTimRef.current) clearTimeout(proTimRef.current);
              if (silTimRef.current) clearTimeout(silTimRef.current);
              
              toast.success("Conclusion detected. Finalizing discussion...");
              setTranscript((prev) => {
                const next = [...prev, userEntry];
                transcriptRef.current = next;
                return next;
              });

              // Save and end sequence
              setTimeout(async () => {
                try {
                  const token = await getTokenRef.current();
                  await axios.post(
                    `${backend_URL}/api/group-discussion/add-user-message`,
                    { sessionId, text: spoken },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                } catch (err) {
                  console.error("Failed to save final message:", err);
                }
                if (aliveRef.current) endSession();
              }, 1200);
              return;
            }

            setTranscript((prev) => {
              const next = [...prev, userEntry];
              transcriptRef.current = next;
              return next;
            });

            silTimRef.current = setTimeout(() => {
              if (aliveRef.current) {
                runAgentTurnRef.current({
                  endpoint: isConcludingPhase ? "conclude" : "next-turn",
                  body: { userMessage: spoken, proactive: false },
                });
              }
            }, 300); // Snappy response
          }
        }, 800);
      };

      recognition.onerror = (e) => {
        if (["no-speech", "aborted"].includes(e.error)) return;
        console.warn("SR error:", e.error);
      };

      recognition.onend = () => {
        if (aliveRef.current && !mutedRef.current && !busyRef.current) {
          try { recognition.start(); } catch (_) { }
        }
      };

      try {
        recognition.start();
        toast.success("🎙️ Mic ready — speak when you want to join!");
      } catch (err) {
        console.error("SR start error:", err);
        toast.error("Couldn't start microphone. Check browser permissions.");
      }
    }

      // ── Opening agent turn after 5s ──
      openTimerRef.current = setTimeout(() => {
        if (!aliveRef.current || openedRef.current) return;
        
        // If preparation mode is on, don't start yet
        if (meta.prepTime) {
          console.log("⏳ Prep mode active: delaying opening turn.");
          return;
        }

        openedRef.current = true;
        openTimerRef.current = null;
        runAgentTurnRef.current({ endpoint: "opening", body: { skipSave: true } });
        
        // After opening starts, transition invigilator status to "analyzing" after 10s
        setTimeout(() => {
          if (aliveRef.current && !isConcludingPhase) {
            setInvigilatorStatus("active");
            setInvigilatorMessage("AI Invigilator is analyzing the discussion flow...");
          }
        }, 10000);
      }, 1500);

    return () => {
      aliveRef.current = false;
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
      if (proTimRef.current) clearTimeout(proTimRef.current);
      if (silTimRef.current) clearTimeout(silTimRef.current);
      window.speechSynthesis?.cancel();
      if (recRef.current) {
        try { recRef.current.stop(); } catch (_) { }
        recRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ── Mute toggle ───────────────────────────────────────────────────────────
  const toggleMute = () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setIsMuted(next);
    if (recRef.current) {
      if (next) {
        try { recRef.current.stop(); } catch (_) { }
      } else {
        try { recRef.current.start(); } catch (_) { }
      }
    }
  };

  // ── Preparation Timer Logic ────────────────────────────────────────────────
  useEffect(() => {
    if (showPrepModal) {
      prepTimerRef.current = setInterval(() => {
        setPrepCountdown((prev) => {
          if (prev === 5) {
            // Trigger voice at 56s (4s remaining)
            speakText("Start GD now", "Alex", null);
          }
          if (prev <= 1) {
            clearInterval(prepTimerRef.current);
            handlePrepEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPrepModal]);

  const handlePrepEnd = async () => {
    // 1. Close modal
    setShowPrepModal(false);
    
    // 3. Start GD
    if (aliveRef.current && !openedRef.current) {
      openedRef.current = true;
      runAgentTurnRef.current({ endpoint: "opening", body: { skipSave: true } });
      
      setTimeout(() => {
        if (aliveRef.current && !isConcludingPhase) {
          setInvigilatorStatus("active");
          setInvigilatorMessage("AI Invigilator is analyzing the discussion flow...");
        }
      }, 10000);
    }
  };

  const PrepModal = () => {
    if (!showPrepModal) return null;
    return (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-[#bef264]/20 rounded-[2.5rem] p-10 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#bef264]/5 rounded-full blur-3xl -mr-20 -mt-20" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#bef264]/10 border border-[#bef264]/20 text-[#bef264] text-xs font-black uppercase tracking-widest mb-6">
              <FiClock className="animate-pulse" />
              Preparation Phase
            </div>
            
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4 tracking-tight leading-loose">
              Prepare for: <span className="text-[#bef264] italic">"{topic}"</span>
            </h2>
            
            <p className="text-zinc-400 text-sm mb-12 font-medium leading-relaxed max-w-md mx-auto">
              You have 1 minute to collect your thoughts and prepare your points. The GD will start automatically when the timer ends.
            </p>

            <div className="relative w-48 h-48 mx-auto mb-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={553}
                  strokeDashoffset={553 - (prepCountdown / 60) * 553}
                  className="text-[#bef264] transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white tabular-nums">
                  0:{String(prepCountdown).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-black text-[#bef264] uppercase tracking-widest mt-1">Seconds Left</span>
              </div>
            </div>

            <button
              onClick={handlePrepEnd}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl transition-all text-xs font-black uppercase tracking-widest active:scale-95"
            >
              Skip & Start Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── End session ───────────────────────────────────────────────────────────
  const endSession = async () => {
    if (isEnding) return;
    setIsEnding(true);
    aliveRef.current = false;

    if (proTimRef.current) clearTimeout(proTimRef.current);
    if (silTimRef.current) clearTimeout(silTimRef.current);
    window.speechSynthesis?.cancel();
    if (recRef.current) {
      try { recRef.current.stop(); } catch (_) { }
      recRef.current = null;
    }

    try {
      const token = await getToken();
      await axios.post(
        `${backend_URL}/api/group-discussion/generate-report`,
        { sessionId, duration },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Report err:", err);
    }

    setSessionEnded(true);
    setIsEnding(false);
  };

  // ── Tiles ─────────────────────────────────────────────────────────────────
  const AgentTile = ({ agent }) => {
    const on = speakingAgent === agent.name;
    const color = agent.color || AGENT_COLORS[agent.name] || "#6366f1";
    return (
      <div className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-500 overflow-hidden bg-zinc-900 backdrop-blur-md ${on ? "border-white/20 ring-1 ring-white/10 scale-[1.05] z-10 shadow-2xl" : "border-white/5 "
        }`}>
        {on && (
          <div className="absolute inset-x-0 bottom-0 h-1 flex items-end justify-center gap-[2px] px-4 pb-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-full bg-white/40 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.random() * 80}%`,
                  animationDuration: `${0.4 + Math.random() * 0.6}s`,
                  background: color
                }}
              />
            ))}
          </div>
        )}

        <div className="relative w-16 h-16 rounded-full flex items-center justify-center font-black text-white z-10 text-xl transition-all duration-500 overflow-hidden"
          style={{
            background: on ? `${color}44` : `${color}11`,
            border: `3px solid ${on ? color : color + "22"}`,
            boxShadow: on ? `0 0 30px ${color}66` : "none",
            transform: on ? "translateY(-5px)" : "none"
          }}>
          {AGENT_IMAGES[agent.name] ? (
            <img src={AGENT_IMAGES[agent.name]} alt={agent.name} className="w-full h-full object-cover" />
          ) : (
            agent.name[0]
          )}
          {on && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-zinc-900 flex items-center justify-center shadow-lg"
              style={{ background: color }}>
              <FiMic size={10} className="text-white" />
            </div>
          )}
        </div>

        <div className="text-center z-10 mt-1">
          <p className="text-xs font-bold text-white tracking-wide">{agent.name}</p>
          <div className="h-4 flex items-center justify-center">
            {on ? (
              <span style={{ color }} className="text-[10px] uppercase font-black animate-pulse tracking-tighter">Speaking</span>
            ) : isThinking ? (
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            ) : (
              <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-tighter">Quiet</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const UserTile = () => {
    // Floor is open even if an agent is "thinking" (API call), 
    // because user can still interrupt the thinking process.
    const isFloorOpen = !speakingAgent && !isMuted && !sessionEnded;
    
    return (
      <div className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${isUserSpeaking ? "border-emerald-500/40 bg-zinc-800/80 scale-[1.03]" : isFloorOpen ? "border-[#bef264]/40 bg-zinc-900/60 ring-2 ring-[#bef264]/20" : "border-white/5 bg-zinc-900/60"
        }`}>
        {isUserSpeaking && <div className="absolute inset-0 rounded-2xl animate-pulse opacity-10 bg-emerald-500" />}
        {isFloorOpen && !isUserSpeaking && (
          <div className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-xl text-black text-[10px] font-black uppercase tracking-widest animate-bounce shadow-xl z-20 ${
            !openedRef.current ? "bg-emerald-500 shadow-emerald-500/20" : isConcludingPhase ? "bg-orange-500 shadow-orange-500/20" : "bg-[#bef264] shadow-[#bef264]/20"
          }`}>
            {!openedRef.current 
              ? "Initiate the discussion!" 
              : isConcludingPhase 
                ? "Conclude the discussion!" 
                : "Give your opinion!"
            }
            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${
              !openedRef.current ? "bg-emerald-500" : isConcludingPhase ? "bg-orange-500" : "bg-[#bef264]"
            }`} />
          </div>
        )}
        <div className="relative w-12 h-12 rounded-full flex items-center justify-center z-10"
          style={{
            background: isFloorOpen ? `${AGENT_COLORS.Marcus}22` : "#22c55e22", 
            border: `2px solid ${isUserSpeaking ? "#22c55e" : isFloorOpen ? (!openedRef.current ? "#10b981" : isConcludingPhase ? "#f97316" : "var(--[#bef264])") : "#22c55e44"}`,
            boxShadow: isUserSpeaking ? "0 0 16px #22c55e44" : isFloorOpen ? (isConcludingPhase ? "0 0 20px rgba(249,115,22,0.3)" : "0 0 20px var(--[#bef264]-glow)") : "none"
          }}>
          {user?.imageUrl
            ? <img src={user.imageUrl} alt="You" className="w-full h-full rounded-full object-cover" />
            : <FiUser className="text-emerald-400" size={20} />}
          {isUserSpeaking && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 bg-emerald-400 flex items-center justify-center">
              <FiMic size={7} className="text-zinc-900" />
            </div>
          )}
        </div>
        <div className="text-center z-10">
          <p className="text-xs font-bold text-zinc-200">You</p>
          <p className="text-[10px]">
            {isMuted
              ? <span className="text-red-400 font-semibold">Muted</span>
              : isUserSpeaking
                ? <span className="text-emerald-400 font-semibold animate-pulse">Speaking...</span>
                : isFloorOpen 
                  ? <span className={`font-black animate-pulse uppercase tracking-tighter ${
                      !openedRef.current ? "text-emerald-400" : isConcludingPhase ? "text-orange-400" : "text-[#bef264]"
                    }`}>
                      {!openedRef.current ? "Init GD" : isConcludingPhase ? "Wrap Up" : "Open Floor"}
                    </span>
                  : <span className="text-zinc-500 font-semibold">Ready</span>}
          </p>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen dark:bg-zinc-950 bg-white dark:text-zinc-100 text-gray-900 overflow-hidden">
      <PrepModal />
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="px-4 md:px-6 py-3 flex items-center justify-between bg-zinc-950/80 border-b dark:border-white/5 border-black/5 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 dark:bg-zinc-900/70 bg-gray-100/70 rounded-xl border border-[#bef264]/20">
              <FiMessageSquare className="text-[#bef264]" size={18} />
            </div>
            <div>
              <h1 className="text-sm md:text-lg font-bold dark:text-white text-black tracking-tight truncate max-w-[160px] md:max-w-none">
                {topic}
              </h1>
              <p className="text-[10px] md:text-[11px] dark:text-zinc-500 text-gray-500 font-medium">
                Group Discussion • Level Professional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-zinc-900 bg-gray-50 border dark:border-white/5 border-black/5 shadow-inner">
              <FiClock className="text-[#bef264]" size={12} />
              <span className="text-[10px] font-mono font-semibold dark:text-zinc-300 text-gray-700">
                {fmt(duration)}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-zinc-900 bg-gray-50 border dark:border-white/5 border-black/5 text-[10px] font-semibold dark:text-zinc-300 text-gray-700">
              {isMuted ? <FiMicOff size={12} className="text-red-400" /> : <FiMic size={12} className="text-emerald-400" />}
              <span>{isMuted ? "Mic Off" : "Mic On"}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 font-bold text-[10px] dark:bg-zinc-900 bg-gray-50 dark:text-zinc-300 text-gray-700 rounded-lg border dark:border-white/5 border-black/5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              Live
            </div>
          </div>
        </header>

        {/* Session-ended overlay */}
        {sessionEnded && (
          <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-[#1a1a1a] border border-white/5 rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#bef264]/5 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="w-20 h-20 rounded-3xl bg-[#bef264]/10 border border-[#bef264]/20 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#bef264]/5">
                <FiCheckCircle className="text-[#bef264]" size={32} />
              </div>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">GD is <span className="text-[#bef264] italic">Concluded!</span></h2>
              <p className="text-zinc-500 text-sm mb-8 font-medium leading-relaxed">
                The discussion has concluded successfully. We're finalizing your contribution report with AI analysis.
              </p>
              <button onClick={() => navigate(`/gd/result/${sessionId}`)}
                className="w-full bg-[#bef264] hover:bg-[#bef264]-hover text-black font-black py-4 rounded-2xl transition-all text-sm shadow-xl shadow-[#bef264]/10 active:scale-95 flex items-center justify-center gap-2">
                View Performance Analysis
                <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-3 overflow-hidden">
          {/* Left Column: Participants */}
          <div className="flex flex-col gap-6 min-w-0">
            {/* Participant Grid Section */}
            <div className="relative aspect-video bg-black  rounded-[28px] overflow-hidden border  border-[#bef264] shadow-2xl p-6">
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none" />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
                {initAgents.map((a) => <AgentTile key={a.name} agent={a} />)}
                <UserTile />
              </div>
            </div>

            {/* Integrated Controls Bar */}
            <div className="flex items-center justify-center gap-4 bg-zinc-900/60 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/5 shadow-2xl">
              <button onClick={toggleMute}
                className={`p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 ${isMuted ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 hover:bg-white/10 text-white"}`}
              >
                {isMuted ? <FiMicOff className="text-sm" /> : <FiMic className="text-xl" />}
                <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
              </button>
              
              <button onClick={endSession} disabled={isEnding}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all active:scale-95 shadow-xl font-bold ${
                  isConcludingPhase 
                  ? "bg-red-600 text-white shadow-red-600/40 animate-pulse border-2 border-white/20" 
                  : "bg-[#bef264] hover:bg-[#bef264]-hover text-black shadow-[#bef264]/20"
                }`}
              >
                <FiPhoneOff className="text-sm" />
                <span className="text-xs font-black  tracking-widest">
                  {isConcludingPhase ? "WRAP UP NOW" : "Conclude Discussion"}
                </span>
              </button>
            </div>

            {/* Live Transcription Peek */}
            <div className={`transition-all duration-500 `}>
              <div className="dark:bg-[#1a1a1a] bg-white p-6 rounded-[2rem] border dark:border-white/5 border-gray-100 shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <FiMic className="text-emerald-400" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Live Voice Processing</p>
                  <p className="text-sm dark:text-zinc-200 text-gray-800 italic font-medium leading-snug">"{liveText}"</p>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="hidden lg:block dark:bg-[#1a1a1a] bg-white p-6 rounded-[2rem] border dark:border-white/5 border-gray-100 shadow-xl">
              <h3 className="text-xs font-bold dark:text-white text-black mb-3 flex items-center uppercase tracking-widest">
                <FiInfo className="mr-3 text-[#bef264] text-lg" /> Topic Context
              </h3>
              <p className="text-[13px] dark:text-zinc-400 text-gray-500 leading-relaxed font-medium">
                {description || "Contribute your points precisely. agents will react to your tone and logic. The session will automatically conclude after 6 minutes or when you signal a wrap-up."}
              </p>
            </div>
          </div>

          {/* Right Column: Invigilator + Transcript */}
          <div className="flex flex-col h-[600px] xl:h-[calc(100vh-160px)] min-h-0 gap-3">
            
            {/* STANDALONE INVIGILATOR SECTION */}
            <div className={`p-1 rounded-[2rem] transition-all duration-700 ${
              invigilatorStatus === "concluding" 
              ? "bg-gradient-to-r from-red-600 to-orange-600 shadow-[0_0_40px_rgba(220,38,38,0.3)] scale-[1.02]" 
              : invigilatorStatus === "active" 
                ? "bg-zinc-800/80 border border-white/5" 
                : "bg-indigo-600/20 border border-indigo-500/30"
            }`}>
              <div className={`px-6 py-4 rounded-[1.8rem] flex items-center gap-4 relative overflow-hidden ${
                invigilatorStatus === "concluding" ? "bg-zinc-950/40" : "bg-transparent"
              }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  invigilatorStatus === "concluding" ? "bg-white text-red-600 animate-pulse" : 
                  invigilatorStatus === "active" ? "bg-emerald-500 text-white" : 
                  "bg-indigo-500 text-white"
                }`}>
                  <FiInfo size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${
                      invigilatorStatus === "concluding" ? "bg-red-500 text-white" : 
                      invigilatorStatus === "active" ? "bg-emerald-500/20 text-emerald-400" : 
                      "bg-indigo-500/20 text-indigo-400"
                    }`}>
                      {invigilatorStatus === "start" ? "Session Guide" : invigilatorStatus === "active" ? "Live Monitoring" : "URGENT NOTICE"}
                    </span>
                  </div>
                  <h2 className={`text-sm md:text-base font-black leading-tight truncate ${
                    invigilatorStatus === "concluding" ? "text-white" : "text-zinc-100"
                  }`}>
                    {invigilatorMessage}
                  </h2>
                </div>

                {invigilatorStatus === "concluding" ? (
                  <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                    <span className="text-[10px] font-black text-white/60 uppercase">Ends In</span>
                    <span className="text-xl font-black text-white tabular-nums">00:{String(invTimer).padStart(2, '0')}</span>
                  </div>
                ) : invigilatorStatus === "active" ? (
                  <div className="flex gap-1.5 px-3 py-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-1.5 h-6 bg-emerald-500/40 rounded-full animate-sound-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                ) : null}

                {/* Background scanning effect for active/start status */}
                {invigilatorStatus !== "concluding" && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-100%] animate-scan" />
                  </div>
                )}
              </div>
            </div>

            {/* TRANSCRIPT CONTAINER */}
            <div className="flex-1 flex flex-col min-h-0 bg-zinc-900/30 rounded-[28px] border dark:border-white/5 border-black/5 overflow-hidden backdrop-blur-md">
              {/* Discussion Header */}
              <div className="px-6 py-4 border-b dark:border-white/5 border-black/5 flex items-center justify-between dark:bg-zinc-900/50 bg-gray-100/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse shadow-[0_0_10px_var(--[#bef264])]" />
                  <p className="text-xs font-black text-white uppercase tracking-widest">Discussion Log</p>
                </div>
                {isThinking && (
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase mr-2 tracking-tighter">AI Processing</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-1 h-3 bg-[#bef264]/40 rounded-full animate-sound-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Scrolling List */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar min-h-0">
                {transcript.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <FiMessageSquare size={40} className="mb-4 text-zinc-600" />
                    <p className="text-xs font-bold uppercase tracking-widest">Floor initializing...</p>
                  </div>
                ) : (
                  transcript.map((entry) => {
                    const isUser = entry.role === "user";
                    const color = isUser ? "#22c55e" : entry.color;
                    return (
                      <div key={entry.id} className={`flex gap-3 animate-fade-in-up ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black text-white shadow-lg overflow-hidden"
                          style={{ background: `${color}33`, border: `2px solid ${color}44` }}>
                          {isUser
                            ? user?.imageUrl
                              ? <img src={user.imageUrl} alt="You" className="w-full h-full object-cover" />
                              : <FiUser size={16} />
                            : AGENT_IMAGES[entry.speaker] ? (
                              <img src={AGENT_IMAGES[entry.speaker]} alt={entry.speaker} className="w-full h-full object-cover" />
                            ) : (
                              entry.speaker[0]
                            )}
                        </div>
                        <div className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"} max-w-[85%]`}>
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">{entry.speaker}</span>
                          <div className={`px-5 py-3 rounded-2xl text-[13px] leading-relaxed shadow-lg ${isUser ? "rounded-tr-sm bg-zinc-800 text-zinc-100" : "rounded-tl-sm text-zinc-200"}`}
                            style={!isUser ? { background: `${color}15`, border: `1px solid ${color}40` } : { border: "1px solid rgba(255,255,255,0.05)" }}>
                            {entry.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {isThinking && (
                  <div className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-[#bef264]/10 border-2 border-[#bef264]/20 flex items-center justify-center">
                      <FiLoader className="animate-spin text-[#bef264]" size={16} />
                    </div>
                    <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm w-16 flex items-center justify-center">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-[#bef264]/60 animate-bounce" />
                        <div className="w-1 h-1 rounded-full bg-[#bef264]/60 animate-bounce delay-75" />
                        <div className="w-1 h-1 rounded-full bg-[#bef264]/60 animate-bounce delay-150" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} className="h-10 shrink-0" />
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        
        @keyframes sound-bar {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
        .animate-sound-bar { animation: sound-bar 1s infinite ease-in-out; }
        .mirror { transform: scaleX(-1); }

        .animate-bounce-in {
          animation: bounce-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes bounce-in {
          0% { transform: translate(-50%, -100px) scale(0.5); opacity: 0; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scan { animation: scan 3s linear infinite; }
      `}</style>
    </div>
  );
}
