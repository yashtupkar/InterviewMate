import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import { AppContext } from "../context/AppContext";
import usePollyTTS from "./usePollyTTS";
import { interviewAgents } from "../constants/agents";

const AGENT_COLORS = interviewAgents.reduce((acc, agent) => {
  acc[agent.name] = `#${agent.bg}`;
  return acc;
}, {});

const AGENT_IMAGES = interviewAgents.reduce((acc, agent) => {
  acc[agent.name] = agent.image;
  return acc;
}, {});

const FALLBACK_MAX_GD_TIME = 600;

export function useGroupDiscussion(sessionId, meta, navigate) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { backend_URL } = useContext(AppContext);

  const topic = meta.topic || "Group Discussion";
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
  const [showEndConfirm, setShowEndConfirm] = useState(false); // New confirm popup state
  const [invigilatorMessage, setInvigilatorMessage] = useState(
    `Your GD topic is "${topic}". Let's start now.`
  );
  const [invigilatorStatus, setInvigilatorStatus] = useState("start");
  const [invTimer, setInvTimer] = useState(45);
  const [prepCountdown, setPrepCountdown] = useState(60);
  const [showPrepModal, setShowPrepModal] = useState(meta.prepTime || false);

  // ── Stable refs ─────────────────────────────────────────────────────────
  const aliveRef = useRef(true);
  const busyRef = useRef(false);
  const agentSpeakingRef = useRef(false);
  const userSpeakingRef = useRef(false);
  const lastUserSpeechRef = useRef(0);
  const mutedRef = useRef(false);
  const lastSpkRef = useRef(null);
  const recRef = useRef(null);
  const recognitionRef = recRef;
  const recognitionStoppedByUsRef = useRef(false);
  const proTimRef = useRef(null);
  const silTimRef = useRef(null);
  const openedRef = useRef(false);
  const concludedRef = useRef(false);
  const transcriptRef = useRef([]);
  const prefetchedTurnRef = useRef(null);
  const endRef = useRef(null);
  const conclusionPendingRef = useRef(false);
  const prepTimerRef = useRef(null);
  const openTimerRef = useRef(null);
  const userInitiatedRef = useRef(false);
  const aiOpeningFiredRef = useRef(false);

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const { speakText: hookSpeakText, stopSpeaking } = usePollyTTS();

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (aliveRef.current && !showPrepModal) {
        setDuration((d) => {
          const next = d + 1;
          if (next >= maxTime && !concludedRef.current) {
            concludedRef.current = true;
            if (!busyRef.current) {
              runAgentTurnRef.current({ endpoint: "conclude" });
            } else {
              conclusionPendingRef.current = true;
            }
          }

          if (next === maxTime - 45 && !concludedRef.current) {
            triggerInvigilator();
          }

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
    setIsConcludingPhase(true);
    setInvigilatorStatus("concluding");
    setInvigilatorMessage("Candidates, please conclude the GD now.");
    setInvTimer(45);
    prefetchedTurnRef.current = null;
    prefetchNextTurn(lastSpkRef.current);
  };

  // auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [transcript]);

  const runAgentTurnRef = useRef(null);
  runAgentTurnRef.current = async ({ endpoint = "next-turn", body = {} } = {}) => {
    if (!aliveRef.current) return;
    if (concludedRef.current && endpoint !== "conclude") return;

    let finalEndpoint = endpoint;
    if (isConcludingPhase && (endpoint === "next-turn" || endpoint === "proactive")) {
      finalEndpoint = "conclude";
    }

    if (userSpeakingRef.current) {
      scheduleProactive(3000);
      return;
    }

    const timeSinceUser = Date.now() - lastUserSpeechRef.current;
    if (timeSinceUser < 1000 && !body.userMessage) {
      scheduleProactive(1200);
      return;
    }

    if (busyRef.current) return;
    busyRef.current = true;

    let turnData = null;

    if ((endpoint === "next-turn" || endpoint === "opening") && prefetchedTurnRef.current) {
      if (isConcludingPhase && endpoint === "next-turn") {
        prefetchedTurnRef.current = null;
      } else {
        turnData = prefetchedTurnRef.current;
        prefetchedTurnRef.current = null;
      }
    }

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

    if (!turnData && endpoint === "opening") {
      setIsThinking(true);
      let waitAttempts = 0;
      while (!prefetchedTurnRef.current && waitAttempts < 50) {
        await new Promise((r) => setTimeout(r, 100));
        waitAttempts++;
      }
      if (prefetchedTurnRef.current) {
        turnData = prefetchedTurnRef.current;
        prefetchedTurnRef.current = null;
      }
      setIsThinking(false);
    }

    if (!turnData) {
      if (endpoint === "opening") {
        busyRef.current = false;
        scheduleProactive(1000);
        return;
      }

      setIsThinking(true);
      try {
        const token = await getTokenRef.current();
        const res = await axios.post(
          `${backend_URL}/api/group-discussion/${finalEndpoint}`,
          { sessionId, lastSpeaker: lastSpkRef.current, skipSave: true, ...body },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        turnData = res.data;

        if (isConcludingPhase && finalEndpoint !== "conclude") {
          setIsThinking(false);
          busyRef.current = false;
          scheduleProactive(500);
          return;
        }

        if (userSpeakingRef.current && !body.userMessage) {
          setIsThinking(false);
          busyRef.current = false;
          scheduleProactive(4000);
          return;
        }
      } catch (err) {
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

    if (!aliveRef.current || !turnData) {
      busyRef.current = false;
      return;
    }

    const { agent, text } = turnData;
    lastSpkRef.current = agent.name;

    const entry = {
      id: Date.now(),
      speaker: agent.name,
      role: "agent",
      text,
      color: agent.color || AGENT_COLORS[agent.name] || "#6366f1",
    };

    setTranscript((prev) => {
      const next = [...prev, entry];
      transcriptRef.current = next;
      return next;
    });

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

    if (recRef.current && !mutedRef.current) {
      try {
        recRef.current.stop();
        recognitionStoppedByUsRef.current = true;
      } catch (err) { }
    }

    setSpeakingAgent(agent.name);
    agentSpeakingRef.current = true;

    if (aliveRef.current) {
      prefetchNextTurn(agent.name);
    }

    await hookSpeakText(text, agent.name, {
      onComplete: () => { },
      onError: (err) => console.error("TTS error:", err),
    });

    setSpeakingAgent(null);
    agentSpeakingRef.current = false;
    busyRef.current = false;

    if (aliveRef.current && !mutedRef.current && recognitionStoppedByUsRef.current && recRef.current) {
      recognitionStoppedByUsRef.current = false;
      setTimeout(() => {
        try {
          if (recRef.current && aliveRef.current && !mutedRef.current) {
            recRef.current.start();
          }
        } catch (err) { }
      }, 100);
    }

    if (finalEndpoint === "conclude") {
      setTimeout(triggerEndSession, 2000); // trigger the ending which asks for confirmation logic or automatically confirm?
    } else {
      if (conclusionPendingRef.current) {
        conclusionPendingRef.current = false;
        runAgentTurnRef.current({ endpoint: "conclude" });
      } else {
        scheduleProactive();
      }
    }
  };

  async function prefetchNextTurn(currentSpeaker) {
    if (prefetchedTurnRef.current || concludedRef.current) return;
    const endpoint = isConcludingPhase ? "conclude" : "next-turn";

    try {
      const token = await getTokenRef.current();
      const res = await axios.post(
        `${backend_URL}/api/group-discussion/${endpoint}`,
        { sessionId, lastSpeaker: currentSpeaker, proactive: true, skipSave: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (aliveRef.current) prefetchedTurnRef.current = res.data;
    } catch (err) {
      console.warn("Pre-fetch failed:", err.message);
    }
  }

  function scheduleProactive(delay = null) {
    if (proTimRef.current) clearTimeout(proTimRef.current);
    if (!aliveRef.current) return;

    const hasPre = !!prefetchedTurnRef.current;
    let d = delay ?? (hasPre ? 2000 + Math.random() * 1000 : 6000 + Math.random() * 5000);
    if (isConcludingPhase && !delay) {
      d = hasPre ? 3000 + Math.random() * 2000 : 6000 + Math.random() * 3000;
    }

    proTimRef.current = setTimeout(() => {
      if (aliveRef.current && !busyRef.current && !userSpeakingRef.current) {
        runAgentTurnRef.current({ endpoint: "next-turn", body: { proactive: true } });
      } else if (userSpeakingRef.current) {
        scheduleProactive(3000);
      }
    }, d);
  }

  useEffect(() => {
    if (!sessionId) return;
    aliveRef.current = true;
    busyRef.current = false;
    openedRef.current = false;

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
        recognitionStoppedByUsRef.current = false;
      };

      recognition.onresult = (e) => {
        if (!aliveRef.current || mutedRef.current || agentSpeakingRef.current) return;

        if (!aiOpeningFiredRef.current && !userInitiatedRef.current) {
          userInitiatedRef.current = true;
          if (openTimerRef.current) clearTimeout(openTimerRef.current);
        }

        if (prefetchedTurnRef.current) prefetchedTurnRef.current = null;
        if (proTimRef.current) clearTimeout(proTimRef.current);
        if (silTimRef.current) clearTimeout(silTimRef.current);

        lastUserSpeechRef.current = Date.now();
        userSpeakingRef.current = true;
        setIsUserSpeaking(true);

        interimText = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) finalBuffer += e.results[i][0].transcript;
          else interimText += e.results[i][0].transcript;
        }
        setLiveText((finalBuffer + " " + interimText).trim());

        if (finalizeTimer) clearTimeout(finalizeTimer);
        finalizeTimer = setTimeout(() => {
          const spoken = finalBuffer.trim();
          finalBuffer = "";
          interimText = "";
          setLiveText("");
          userSpeakingRef.current = false;
          setIsUserSpeaking(false);

          if (spoken) {
            const userEntry = { id: Date.now(), speaker: "You", role: "user", text: spoken, color: "#22c55e" };
            const lower = spoken.toLowerCase();
            const keywords = ["conclusion", "conclude", "concluding", "wrap up", "wrapping up", "final point", "thank you everyone", "that is all from my side", "my conclusion", "summarize", "summarizing", "end the discussion"];
            const isUserConcluding = keywords.some((k) => lower.includes(k));

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

              setTimeout(async () => {
                try {
                  const token = await getTokenRef.current();
                  await axios.post(`${backend_URL}/api/group-discussion/add-user-message`, { sessionId, text: spoken }, { headers: { Authorization: `Bearer ${token}` } });
                } catch (err) { }
                if (aliveRef.current) endSession();
              }, 1200);
              return;
            }

            setTranscript((prev) => {
              const next = [...prev, userEntry];
              transcriptRef.current = next;
              return next;
            });

            if (!busyRef.current && !silTimRef.current) {
              silTimRef.current = setTimeout(() => {
                if (aliveRef.current) {
                  runAgentTurnRef.current({
                    endpoint: isConcludingPhase ? "conclude" : "next-turn",
                    body: { userMessage: spoken, proactive: false },
                  });
                }
                silTimRef.current = null;
              }, 300);
            }
          }
        }, 3000);
      };

      recognition.onerror = (e) => {
        if (["no-speech", "aborted"].includes(e.error)) return;
      };

      recognition.onend = () => {
        if (aliveRef.current && !mutedRef.current && !recognitionStoppedByUsRef.current) {
          setTimeout(() => {
            try {
              if (recRef.current && aliveRef.current && !mutedRef.current && !recognitionStoppedByUsRef.current) {
                recRef.current.start();
              }
            } catch (err) { }
          }, 100);
        }
      };

      try {
        recognitionStoppedByUsRef.current = false;
        recognition.start();
        toast.success("🎙️ Mic ready — speak when you want to join!");
      } catch (err) {
        toast.error("Couldn't start microphone. Check browser permissions.");
      }
    }

    (async () => {
      try {
        const token = await getTokenRef.current();
        const res = await axios.post(
          `${backend_URL}/api/group-discussion/opening`,
          { sessionId, skipSave: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (aliveRef.current && res.data) prefetchedTurnRef.current = res.data;
      } catch (err) { }
    })();

    openTimerRef.current = setTimeout(() => {
      if (!aliveRef.current || openedRef.current) return;
      if (meta.prepTime) return;

      if (userInitiatedRef.current) return;

      openedRef.current = true;
      aiOpeningFiredRef.current = true;
      openTimerRef.current = null;

      runAgentTurnRef.current({ endpoint: "opening", body: { skipSave: true } });

      setTimeout(() => {
        if (aliveRef.current && !isConcludingPhase) {
          setInvigilatorStatus("active");
          setInvigilatorMessage("AI Invigilator is analyzing the discussion flow...");
        }
      }, 10000);
    }, 5000);

    return () => {
      aliveRef.current = false;
      userInitiatedRef.current = false;
      aiOpeningFiredRef.current = false;
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
      if (proTimRef.current) clearTimeout(proTimRef.current);
      if (silTimRef.current) clearTimeout(silTimRef.current);
      if (recRef.current) {
        try { recRef.current.stop(); } catch (_) { }
        recRef.current = null;
      }
    };
  }, [sessionId]);

  const toggleMute = () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setIsMuted(next);
    if (recRef.current) {
      if (next) {
        try {
          recRef.current.stop();
          recognitionStoppedByUsRef.current = true;
        } catch (err) { }
      } else {
        recognitionStoppedByUsRef.current = false;
        setTimeout(() => {
          try {
            if (recRef.current && !mutedRef.current) {
              recRef.current.start();
            }
          } catch (err) {
            setTimeout(() => {
              try {
                if (recRef.current && !mutedRef.current) recRef.current.start();
              } catch (_) { }
            }, 500);
          }
        }, 50);
      }
    }
  };

  useEffect(() => {
    if (showPrepModal) {
      prepTimerRef.current = setInterval(() => {
        setPrepCountdown((prev) => {
          if (prev === 5) {
            hookSpeakText("Start GD now", "Rohan", {
              onComplete: () => { },
              onError: (err) => console.error("TTS error:", err),
            }).catch(() => { });
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
  }, [showPrepModal]);

  const handlePrepEnd = async () => {
    setShowPrepModal(false);
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

  const triggerEndSession = () => {
    setShowEndConfirm(true);
  };

  const cancelEndSession = () => {
    setShowEndConfirm(false);
  };

  const confirmEndSession = async () => {
    setShowEndConfirm(false);
    stopSpeaking(); // Stop TTS playback if any

    if (isEnding) return;
    setIsEnding(true);
    aliveRef.current = false;

    if (proTimRef.current) clearTimeout(proTimRef.current);
    if (silTimRef.current) clearTimeout(silTimRef.current);
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
      setSessionEnded(true);
      setIsEnding(false);
    } catch (err) { }
  };

  return {
    state: {
      transcript,
      speakingAgent,
      isUserSpeaking,
      isThinking,
      isMuted,
      duration,
      sessionEnded,
      isEnding,
      liveText,
      isConcludingPhase,
      invigilatorMessage,
      invigilatorStatus,
      invTimer,
      prepCountdown,
      showPrepModal,
      showEndConfirm,
      user,
      openedRef: openedRef.current,
      concludedRef: concludedRef.current
    },
    refs: {
      endRef
    },
    actions: {
      toggleMute,
      endSession: triggerEndSession,
      confirmEndSession,
      cancelEndSession,
      handlePrepEnd
    },
    constants: {
      AGENT_COLORS,
      AGENT_IMAGES,
      topic,
      description: meta.description || "",
      initAgents: meta.agents || [
        { name: "Rohan", color: "#6366f1" },
        { name: "Sophia", color: "#ec4899" },
        { name: "Marcus", color: "#f59e0b" },
        { name: "Emma", color: "#10b981" },
      ],
      maxTime
    }
  };
}
