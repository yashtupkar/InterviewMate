import React, { useState, useEffect, useContext } from "react";
import { Helmet } from "react-helmet-async";
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
  FiShuffle,
  FiCreditCard,
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
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(null); // null means Random Topic
  const [timeLimit, setTimeLimit] = useState(5); // minutes
  const [prepTime, setPrepTime] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const { backend_URL } = useContext(AppContext);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const topics = TOPIC_POOLS[selectedCategory] || [];

  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = await getToken();
        if (token) {
          const res = await axios.get(`${backend_URL}/api/subscription/status`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSubscription(res.data);
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
      }
    };
    fetchSubscription();
  }, [getToken, backend_URL]);

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
  const handleCategoryChange = (key) => {
    setSelectedCategory(key);
    setSelectedTopicIdx(null); // Always default to random when category changes for simplicity
  };

  const handleStart = async () => {
    if (subscription && subscription.tier !== 'Elite' && subscription.credits.gdSessions <= 0) {
      toast.error("You have run out of GD session credits. Redirecting to billing...");
      setTimeout(() => navigate("/billing"), 2000);
      return;
    }

    if (!micReady) {
      toast.error("Please allow microphone access to participate.");
      return;
    }
    setIsStarting(true);
    try {
      const token = await getToken();
      const res = await axios.post(
        `${backend_URL}/api/group-discussion/start`,
        { 
          category: selectedCategory, 
          topicIndex: selectedTopicIdx,
          timeLimit: timeLimit * 60, // convert to seconds
          prepTime
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/gd/session/${res.data.sessionId}`, {
        state: {
          topic: res.data.topic,
          description: res.data.description,
          agents: res.data.agents,
          category: res.data.category,
          timeLimit: timeLimit * 60,
          prepTime: res.data.prepTime,
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to start session. Please try again.");
      setIsStarting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>GD Setup | PriPareAI</title>
      </Helmet>
      <div className="min-h-screen  text-zinc-100 transition-colors selection:bg-[#bef264]/30 pb-20 p-4 md:p-8">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-12 max-w-7xl mx-auto animate-fade mt-8">

        {/* Left Column: Preview & Info - Sticky */}
        <div className="w-full lg:w-1/2 flex flex-col sticky top-16 space-y-6 animate-fade-in-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#bef264]/10 border border-[#bef264]/20 text-[#bef264] text-[10px] font-black uppercase tracking-widest">
              <FiZap size={12} />
              AI Participants · Real-time Session
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Master the <span className="text-[#bef264] italic">GD</span> Dynamics
            </h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-md">
              Prepare for group discussions with 4 unique AI personas. They interact naturally, allowing you to simulate a high-pressure corporate GD environment.
            </p>
          </div>

          {/* Discussion Panel Preview */}
          <div className="p-8 bg-zinc-950 rounded-[2rem] border-y border-[#bef264] shadow-2xl shadow-[#bef264]/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#bef264]/5 rounded-full blur-3xl -mr-10 -mt-10" />
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 relative z-10">Discussion Panel</h3>
            <div className="grid grid-cols-2 gap-6 relative z-10">
              {[
                { name: "Alex", color: "#6366f1", trait: "Analytical", image: "/assets/interviewers/male1.png" },
                { name: "Priya", color: "#ec4899", trait: "Empathetic", image: "/assets/interviewers/female1.png" },
                { name: "Marcus", color: "#f59e0b", trait: "Bold", image: "/assets/interviewers/male2.png" },
                { name: "Zoe", color: "#10b981", trait: "Creative", image: "/assets/interviewers/female2.png" },
              ].map((agent) => (
                <div key={agent.name} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg flex-shrink-0 overflow-hidden"
                    style={{ background: `${agent.color}33`, border: `2px solid ${agent.color}44` }}
                  >
                    {agent.image ? (
                      <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                      agent.name[0]
                    )}
                </div>
                <div>
                    <p className="text-xs font-black text-white">{agent.name}</p>
                    <p className="text-[9px] text-[#bef264] font-bold uppercase tracking-tight">{agent.trait}</p>
                  </div>
                </div>
              ))}
              </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#bef264]/20 border-2 border-[#bef264]/40 flex items-center justify-center">
                  <FiMic size={18} className="text-[#bef264]" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">You</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Candidate</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${micReady ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400"
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${micReady ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                {micReady ? "Mic Active" : "Mic Access Needed"}
              </div>
            </div>
          </div>

          <div className="dark:bg-[#1a1a1a] bg-white p-7 shadow-xl rounded-[2rem] border dark:border-white/5 border-gray-100 ring-1 ring-black/5">
            <h3 className="text-sm font-bold dark:text-white text-black mb-3 flex items-center uppercase tracking-widest">
              <FiMessageSquare className="mr-3 text-[#bef264] text-lg" /> GD Dynamics
            </h3>
            <p className="text-[13px] dark:text-zinc-500 text-gray-600 leading-relaxed font-medium capitalize">
              Participants will open the floor, jump in with counter-points, and conclude based on collective input. speak clearly to ensure the AI understands your contribution.
            </p>
          </div>
        </div>

        {/* Right Column: Setup Form */}
        <div className="w-full lg:w-[450px] flex flex-col gap-8 animate-fade-in-right px-4">
          <div className="pb-2">
            <h2 className="text-lg font-black dark:text-white text-black mb-1 uppercase tracking-tight">
              Session Configuration
            </h2>

            <div className="space-y-6">
              {/* Duration Select */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                  Time Limit
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[2,5, 8, 10, 15].map((min) => (
                    <button
                      key={min}
                      onClick={() => setTimeLimit(min)}
                      className={`py-2.5 rounded-xl border text-xs font-black transition-all ${timeLimit === min
                        ? "border-[#bef264] bg-[#bef264]/10 text-white"
                        : "border-white/5 bg-white/5 text-zinc-500 hover:border-white/10"
                        }`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Preparation Time Toggle */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                  Topic Preparation (1 min)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: true, label: "Enabled" },
                    { value: false, label: "Disabled" },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setPrepTime(opt.value)}
                      className={`py-2.5 rounded-xl border text-xs font-black transition-all ${prepTime === opt.value
                        ? "border-[#bef264] bg-[#bef264]/10 text-white"
                        : "border-white/5 bg-white/5 text-zinc-500 hover:border-white/10"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Select */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => handleCategoryChange(key)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${selectedCategory === key
                        ? "border-[#bef264] bg-[#bef264]/10 text-white"
                        : "border-white/5 bg-white/5 text-zinc-500 hover:border-white/10"
                        }`}
                    >
                      <Icon size={14} className={selectedCategory === key ? "text-[#bef264]" : ""} />
                      <span className="text-[11px] font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic List */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                  Select Topic
                </label>
                <div className="p-1 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                  <div className="max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                    {/* Random Option */}
                    <button
                      onClick={() => setSelectedTopicIdx(null)}
                      className={`w-full text-left sticky top-0 px-4 py-3 rounded-xl transition-all mb-1 flex items-center justify-between group ${selectedTopicIdx === null
                        ? "bg-[#bef264] text-black font-black"
                        : "text-zinc-400 hover:bg-white/5 font-bold"
                        }`}
                    >
                      <span className="text-[12px]">Choose Automatically (Random)</span>
                      <FiShuffle size={14} className={selectedTopicIdx === null ? "text-black" : "text-[#bef264] opacity-50"} />
                    </button>

                    <div className="h-px bg-white/5 mx-2 my-1" />

                    {/* Manual Options */}
                    {topics.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTopicIdx(idx)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all mb-1 ${selectedTopicIdx === idx
                          ? "bg-white/10 text-white border border-white/10 font-bold"
                          : "text-zinc-300 hover:text-[#bef264] hover:bg-[#bef264]/10 font-medium"
                          }`}
                      >
                        <p className="text-[12px] leading-snug">{topic}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleStart}
                  disabled={isStarting || !micReady}
                  className={`w-full ${subscription && subscription.tier !== 'Elite' && subscription.credits.gdSessions <= 0 ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-[#bef264] hover:bg-[#bef264]/90 text-black'} font-black py-4 rounded-2xl transition-all shadow-xl shadow-[#bef264]/20 flex items-center justify-center gap-2 group disabled:opacity-50`}
                >
                  {isStarting ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : subscription && subscription.tier !== 'Elite' && subscription.credits.gdSessions <= 0 ? (
                    <>
                      Pay as you go
                      <FiCreditCard className="group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      Start Discussion Floor
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${micReady ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {micReady ? "Microphone Ready" : "Microphone Required"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default GroupDiscussionSetup;
