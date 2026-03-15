import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import {
  FiUsers,
  FiMic,
  FiArrowRight,
  FiZap,
  FiGlobe,
  FiCpu,
  FiAlertCircle,
  FiMessageSquare,
} from "react-icons/fi";
import { AppContext } from "../context/AppContext";

const CATEGORIES = [
  { key: "general", label: "General / HR", icon: FiUsers, color: "#6366f1" },
  { key: "technical", label: "Technical", icon: FiCpu, color: "#10b981" },
  {
    key: "current_affairs",
    label: "Current Affairs",
    icon: FiGlobe,
    color: "#f59e0b",
  },
  {
    key: "ethical",
    label: "Ethical Dilemmas",
    icon: FiAlertCircle,
    color: "#ec4899",
  },
];

const TOPIC_POOLS = {
  general: [
    "Remote work is more productive than working from office",
    "Social media does more harm than good to society",
    "Should college education be free for everyone?",
    "Leadership is born, not made",
    "The gig economy is exploiting workers",
  ],
  technical: [
    "Artificial Intelligence will replace more jobs than it creates",
    "Open source software is better than proprietary software",
    "Data privacy is more important than national security",
    "Blockchain technology is overhyped",
    "Electric vehicles will replace combustion engines by 2040",
  ],
  current_affairs: [
    "India should prioritize economic growth over environmental sustainability",
    "Cryptocurrency should be regulated by governments",
    "The rise of AI in healthcare: boon or bane?",
    "Space exploration should be a global priority",
    "Social media companies should be liable for misinformation",
  ],
  ethical: [
    "Is whistleblowing always morally justified?",
    "Should euthanasia be legalized?",
    "Affirmative action does more harm than good",
    "Animals should have the same legal rights as humans",
    "Technology companies have too much power over society",
  ],
};

const GroupDiscussionSetup = () => {
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(null);
  const [micReady, setMicReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const { backend_URL } = useContext(AppContext);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const topics = TOPIC_POOLS[selectedCategory] || [];

  // Check mic permission
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
        setMicReady(true);
      })
      .catch(() => setMicReady(false));
  }, []);

  // Reset topic selection when category changes
  useEffect(() => {
    setSelectedTopicIdx(null);
  }, [selectedCategory]);

  const handleStart = async () => {
    if (!micReady) {
      toast.error("Please allow microphone access to participate.");
      return;
    }
    if (selectedTopicIdx === null) {
      toast.error("Please select a topic to discuss.");
      return;
    }
    setIsStarting(true);
    try {
      const token = await getToken();
      const res = await axios.post(
        `${backend_URL}/api/group-discussion/start`,
        { category: selectedCategory, topicIndex: selectedTopicIdx },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/gd/session/${res.data.sessionId}`, {
        state: {
          topic: res.data.topic,
          description: res.data.description,
          agents: res.data.agents,
          category: res.data.category,
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to start session. Please try again.");
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <FiMessageSquare className="text-indigo-400" size={16} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">Group Discussion</h1>
          <p className="text-[10px] text-zinc-500">AI-Powered GD Practice</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <FiZap size={12} />
            4 AI Agents · Random Speaker Order · Real-time
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
            Practice Group Discussion
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
            Join a live group discussion with 4 AI participants. Speak
            naturally — agents respond randomly just like a real GD. Get a
            detailed contribution report at the end.
          </p>
        </div>

        {/* Category Selection */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Choose Category
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(({ key, label, icon: Icon, color }) => {
              const isActive = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-white/20 bg-white/5"
                      : "border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-white/10"
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${color}22`,
                      border: `1px solid ${color}44`,
                    }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-300 text-center leading-tight">
                    {label}
                  </span>
                  {isActive && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Selection */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Select Topic
          </p>
          <div className="flex flex-col gap-2">
            {topics.map((topic, idx) => {
              const isSelected = selectedTopicIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedTopicIdx(idx)}
                  className={`text-left px-5 py-4 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                    isSelected
                      ? "border-indigo-500/50 bg-indigo-500/10 text-white"
                      : "border-white/5 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-white/10 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${
                          isSelected
                            ? "bg-indigo-400"
                            : "bg-zinc-700 group-hover:bg-zinc-500"
                        }`}
                      />
                      <span className="text-sm font-medium leading-snug">
                        {topic}
                      </span>
                    </div>
                    {isSelected && (
                      <FiArrowRight
                        className="text-indigo-400 flex-shrink-0 animate-pulse"
                        size={14}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Agent Preview */}
        <div className="mb-10 p-5 rounded-2xl bg-zinc-900/60 border border-white/5">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Your Discussion Panel
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { name: "Alex", color: "#6366f1", trait: "Analytical" },
              { name: "Priya", color: "#ec4899", trait: "Empathetic" },
              { name: "Marcus", color: "#f59e0b", trait: "Bold" },
              { name: "Zoe", color: "#10b981", trait: "Creative" },
            ].map((agent) => (
              <div key={agent.name} className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ background: `${agent.color}33`, border: `1.5px solid ${agent.color}66` }}
                >
                  {agent.name[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">{agent.name}</p>
                  <p className="text-[10px] text-zinc-500">{agent.trait}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2.5 ml-auto">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <FiMic size={14} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">You</p>
                <p className="text-[10px] text-zinc-500">Candidate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mic Status + Start */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold ${
              micReady
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                : "border-red-500/30 bg-red-500/5 text-red-400"
            }`}
          >
            <FiMic size={13} />
            {micReady ? "Microphone Ready" : "Microphone blocked — please allow access"}
          </div>
          <button
            onClick={handleStart}
            disabled={isStarting || !micReady || selectedTopicIdx === null}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            {isStarting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Setting up discussion...
              </>
            ) : (
              <>
                Join Group Discussion
                <FiArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupDiscussionSetup;
