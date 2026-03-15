import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import {
  FiMic, FiMicOff, FiPhoneOff, FiUser, FiMessageSquare, FiClock,
} from "react-icons/fi";
import { AppContext } from "../context/AppContext";

const AGENT_COLORS = {
  Alex: "#6366f1",
  Priya: "#ec4899",
  Marcus: "#f59e0b",
  Zoe: "#10b981",
};

// ─── TTS helper ──────────────────────────────────────────────────────────────
function speakText(text, agentName, onDone) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { onDone?.(); resolve(); return; }

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.volume = 1;

    const go = () => {
      const voices = window.speechSynthesis.getVoices();
      const en = voices.filter((v) => v.lang.startsWith("en"));
      const slots = { Alex: 0, Priya: 2, Marcus: 1, Zoe: 3 };
      const idx = slots[agentName] ?? 0;
      if (en.length > 0) utter.voice = en[idx % en.length];
      utter.rate  = agentName === "Marcus" ? 1.08 : agentName === "Priya" ? 0.87 : 0.95;
      utter.pitch = agentName === "Zoe" ? 1.15 : agentName === "Priya" ? 1.08 : 1.0;
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
  const location    = useLocation();
  const navigate    = useNavigate();
  const { getToken } = useAuth();
  const { user }    = useUser();
  const { backend_URL } = useContext(AppContext);

  const meta        = location.state || {};
  const topic       = meta.topic || "Group Discussion";
  const description = meta.description || "";
  const initAgents  = meta.agents || [
    { name: "Alex",   color: "#6366f1" },
    { name: "Priya",  color: "#ec4899" },
    { name: "Marcus", color: "#f59e0b" },
    { name: "Zoe",    color: "#10b981" },
  ];

  // ── UI state ─────────────────────────────────────────────────────────────
  const [transcript,      setTranscript]      = useState([]);
  const [speakingAgent,   setSpeakingAgent]   = useState(null);
  const [isUserSpeaking,  setIsUserSpeaking]  = useState(false);
  const [isThinking,      setIsThinking]      = useState(false);
  const [isMuted,         setIsMuted]         = useState(false);
  const [duration,        setDuration]        = useState(0);
  const [sessionEnded,    setSessionEnded]    = useState(false);
  const [isEnding,        setIsEnding]        = useState(false);
  const [liveText,        setLiveText]        = useState("");

  // ── Stable refs (never trigger re-renders, always fresh in callbacks) ─────
  const aliveRef       = useRef(true);   // session still running
  const busyRef        = useRef(false);  // agent is thinking or speaking
  const mutedRef       = useRef(false);
  const lastSpkRef     = useRef(null);   // last agent name who spoke
  const recRef         = useRef(null);   // SpeechRecognition instance
  const recognitionRef = recRef;         // alias for clarity
  const proTimRef      = useRef(null);   // proactive timer
  const silTimRef      = useRef(null);   // user-silence timer
  const openedRef      = useRef(false);  // opening turn fired
  const transcriptRef  = useRef([]);     // mirror of transcript for closures
  const endRef         = useRef(null);   // scroll anchor

  // get a fresh auth token inside callbacks
  const getTokenRef = useRef(getToken);
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (aliveRef.current) setDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

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
    if (busyRef.current) return;
    busyRef.current = true;

    setIsThinking(true);

    try {
      const token = await getTokenRef.current();
      const res = await axios.post(
        `${backend_URL}/api/group-discussion/${endpoint}`,
        { sessionId, lastSpeaker: lastSpkRef.current, ...body },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!aliveRef.current) { busyRef.current = false; return; }

      const { agent, text } = res.data;
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

      setIsThinking(false);

      // pause mic during TTS
      if (recRef.current && !mutedRef.current) {
        try { recRef.current.stop(); } catch (_) {}
      }

      setSpeakingAgent(agent.name);

      await speakText(text, agent.name, null);

      setSpeakingAgent(null);
      busyRef.current = false;

      // resume mic
      if (aliveRef.current && !mutedRef.current && recRef.current) {
        try { recRef.current.start(); } catch (_) {}
      }

      // schedule next proactive turn
      scheduleProactive();
    } catch (err) {
      console.error("Agent turn error:", err);
      setIsThinking(false);
      setSpeakingAgent(null);
      busyRef.current = false;
      if (aliveRef.current && !mutedRef.current && recRef.current) {
        try { recRef.current.start(); } catch (_) {}
      }
      // retry proactive after error
      scheduleProactive(12000);
    }
  };

  // ── Proactive scheduling ──────────────────────────────────────────────────
  function scheduleProactive(delay = null) {
    if (proTimRef.current) clearTimeout(proTimRef.current);
    if (!aliveRef.current) return;
    const d = delay ?? 8000 + Math.random() * 8000; // 8-16s
    proTimRef.current = setTimeout(() => {
      if (aliveRef.current && !busyRef.current) {
        runAgentTurnRef.current({ endpoint: "next-turn", body: { proactive: true } });
      }
    }, d);
  }

  // ── Bootstrap: opening turn + SpeechRecognition ───────────────────────────
  useEffect(() => {
    if (!sessionId) return;

    aliveRef.current  = true;
    busyRef.current   = false;
    openedRef.current = false;

    // ── SpeechRecognition setup ──
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Speech recognition needs Chrome or Edge.");
    } else {
      const recognition = new SR();
      recognition.continuous     = true;
      recognition.interimResults = true;
      recognition.lang           = "en-US";
      recognitionRef.current     = recognition;
      recRef.current             = recognition;

      let finalBuffer  = "";
      let interimText  = "";
      let finalizeTimer = null;

      recognition.onstart = () => {
        console.log("🎙 SpeechRecognition started");
      };

      recognition.onresult = (e) => {
        if (!aliveRef.current || mutedRef.current) return;
        if (busyRef.current) return; // ignore echo while agent TTS plays

        if (proTimRef.current) clearTimeout(proTimRef.current);
        if (silTimRef.current)  clearTimeout(silTimRef.current);

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
          finalBuffer  = "";
          interimText  = "";
          setLiveText("");
          setIsUserSpeaking(false);

          if (spoken) {
            const userEntry = {
              id: Date.now(), speaker: "You",
              role: "user",   text: spoken,
              color: "#22c55e",
            };
            setTranscript((prev) => {
              const next = [...prev, userEntry];
              transcriptRef.current = next;
              return next;
            });

            silTimRef.current = setTimeout(() => {
              if (aliveRef.current) {
                runAgentTurnRef.current({
                  endpoint: "next-turn",
                  body: { userMessage: spoken, proactive: false },
                });
              }
            }, 700);
          }
        }, 1400);
      };

      recognition.onerror = (e) => {
        if (["no-speech", "aborted"].includes(e.error)) return;
        console.warn("SR error:", e.error);
      };

      recognition.onend = () => {
        if (aliveRef.current && !mutedRef.current && !busyRef.current) {
          try { recognition.start(); } catch (_) {}
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

    // ── Opening agent turn after 1.5s ──
    const openTimer = setTimeout(() => {
      if (!aliveRef.current || openedRef.current) return;
      openedRef.current = true;
      runAgentTurnRef.current({ endpoint: "opening", body: {} });
    }, 1500);

    return () => {
      aliveRef.current = false;
      clearTimeout(openTimer);
      if (proTimRef.current) clearTimeout(proTimRef.current);
      if (silTimRef.current)  clearTimeout(silTimRef.current);
      window.speechSynthesis?.cancel();
      if (recRef.current) {
        try { recRef.current.stop(); } catch (_) {}
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
        try { recRef.current.stop(); }  catch (_) {}
      } else {
        try { recRef.current.start(); } catch (_) {}
      }
    }
  };

  // ── End session ───────────────────────────────────────────────────────────
  const endSession = async () => {
    if (isEnding) return;
    setIsEnding(true);
    aliveRef.current = false;

    if (proTimRef.current) clearTimeout(proTimRef.current);
    if (silTimRef.current)  clearTimeout(silTimRef.current);
    window.speechSynthesis?.cancel();
    if (recRef.current) {
      try { recRef.current.stop(); } catch (_) {}
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
    const on    = speakingAgent === agent.name;
    const color = agent.color || AGENT_COLORS[agent.name] || "#6366f1";
    return (
      <div className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
        on ? "border-white/30 bg-zinc-800/80 scale-[1.03]" : "border-white/5 bg-zinc-900/60"
      }`}>
        {on && (
          <>
            <div className="absolute inset-0 rounded-2xl animate-ping  opacity-[0.15]" style={{ background: color }} />
            <div className="absolute inset-0 rounded-2xl animate-pulse opacity-[0.08]" style={{ background: color }} />
          </>
        )}
        <div className="relative w-12 h-12 rounded-full flex items-center justify-center font-black text-white z-10 text-base"
          style={{ background: `${color}33`, border: `2px solid ${on ? color : color + "44"}`, boxShadow: on ? `0 0 18px ${color}55` : "none" }}>
          {agent.name[0]}
          {on && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 flex items-center justify-center"
              style={{ background: color }}>
              <FiMic size={7} className="text-white" />
            </div>
          )}
        </div>
        <div className="text-center z-10">
          <p className="text-xs font-bold text-zinc-200">{agent.name}</p>
          <p className="text-[10px]">
            {on
              ? <span style={{ color }} className="font-semibold animate-pulse">Speaking...</span>
              : isThinking
              ? <span className="text-indigo-400 animate-pulse">Thinking...</span>
              : <span className="text-zinc-500">Listening</span>}
          </p>
        </div>
      </div>
    );
  };

  const UserTile = () => (
    <div className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
      isUserSpeaking ? "border-emerald-500/40 bg-zinc-800/80 scale-[1.03]" : "border-white/5 bg-zinc-900/60"
    }`}>
      {isUserSpeaking && <div className="absolute inset-0 rounded-2xl animate-pulse opacity-10 bg-emerald-500" />}
      <div className="relative w-12 h-12 rounded-full flex items-center justify-center z-10"
        style={{ background: "#22c55e22", border: `2px solid ${isUserSpeaking ? "#22c55e" : "#22c55e44"}`,
          boxShadow: isUserSpeaking ? "0 0 16px #22c55e44" : "none" }}>
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
            : <span className="text-zinc-500">Mic on</span>}
        </p>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col">
      {/* Header */}
      <header className="px-4 md:px-6 py-3 flex items-center justify-between bg-zinc-950/90 border-b border-white/5 backdrop-blur-xl sticky top-0 z-40">
        <div>
          <h1 className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-lg">{topic}</h1>
          <p className="text-[10px] text-zinc-500">Group Discussion</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-[10px] font-mono font-semibold text-zinc-300">
            <FiClock size={10} />{fmt(duration)}
          </div>
          {isThinking && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-semibold text-indigo-400 animate-pulse">
              Agent thinking…
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-[10px] font-bold text-zinc-300">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />Live
          </div>
        </div>
      </header>

      {/* Session-ended overlay */}
      {sessionEnded && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="text-emerald-400" size={22} />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Session Ended</h2>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">Generating your report — takes ~30 seconds.</p>
            <button onClick={() => navigate(`/gd/result/${sessionId}`)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl transition-all text-sm">
              View Report
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        {/* Left: participants + controls */}
        <div className="flex-1 p-4 md:p-6 flex flex-col gap-5">
          {/* Topic banner */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Topic</p>
            <p className="text-sm font-semibold text-zinc-200 leading-snug">{topic}</p>
            {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
          </div>

          {/* Participant grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {initAgents.map((a) => <AgentTile key={a.name} agent={a} />)}
            <UserTile />
          </div>

          {/* Live speech preview */}
          {liveText && (
            <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-[10px] text-emerald-400 font-semibold mb-1">You are saying…</p>
              <p className="text-sm text-zinc-300 italic">"{liveText}"</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-auto pt-2">
            <button onClick={toggleMute}
              className={`p-4 rounded-full border transition-all active:scale-95 cursor-pointer ${
                isMuted ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-zinc-900/80 border-white/10 text-zinc-300 hover:bg-zinc-800"
              }`}
              title={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
            </button>
            <button onClick={endSession} disabled={isEnding}
              className="px-8 py-4 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer">
              <FiPhoneOff size={18} />
              {isEnding ? "Ending…" : "End GD"}
            </button>
          </div>
        </div>

        {/* Right: transcript */}
        <div className="xl:w-[360px] border-t xl:border-t-0 xl:border-l border-white/5 flex flex-col bg-zinc-900/30">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <FiMessageSquare size={13} className="text-zinc-400" />
            <p className="text-xs font-semibold text-zinc-400">Live Transcript</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-[400px] xl:max-h-none">
            {transcript.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 text-center pt-10">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <FiMessageSquare className="text-zinc-600" size={16} />
                </div>
                <p className="text-zinc-600 text-xs">Waiting for the discussion to start…</p>
              </div>
            )}

            {transcript.map((entry) => {
              const isUser = entry.role === "user";
              return (
                <div key={entry.id} className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white"
                    style={{ background: `${entry.color}33`, border: `1.5px solid ${entry.color}66` }}>
                    {isUser
                      ? user?.imageUrl
                        ? <img src={user.imageUrl} alt="You" className="w-full h-full rounded-full object-cover" />
                        : <FiUser size={12} style={{ color: entry.color }} />
                      : entry.speaker[0]}
                  </div>
                  <div className={`max-w-[75%] flex flex-col gap-0.5 ${isUser ? "items-end" : "items-start"}`}>
                    <p className="text-[10px] font-semibold text-zinc-500 px-1">{entry.speaker}</p>
                    <div className="px-3 py-2 rounded-2xl text-xs leading-relaxed text-zinc-200"
                      style={{ background: isUser ? "#22c55e18" : `${entry.color}18`,
                        border: `1px solid ${isUser ? "#22c55e30" : entry.color + "30"}` }}>
                      {entry.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <span className="text-[10px] font-black text-indigo-400">AI</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-zinc-800/60 border border-white/5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
