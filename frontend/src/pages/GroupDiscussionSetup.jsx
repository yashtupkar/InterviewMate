import React, { useState, useEffect, useContext } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import {
  FiUsers,
  FiMic,
  FiMicOff,
  FiArrowRight,
  FiChevronLeft,
  FiZap,
  FiGlobe,
  FiCpu,
  FiAlertCircle,
  FiMessageSquare,
  FiShuffle,
  FiCreditCard,
  FiEdit,
} from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { FEATURE_COSTS } from "../constants/pricing";
import { interviewAgents } from "../constants/agents";

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
  const [customTopic, setCustomTopic] = useState("");
  const [mobileStage, setMobileStage] = useState(1);
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const { backend_URL } = useContext(AppContext);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const topics = TOPIC_POOLS[selectedCategory] || [];

  // Helper functions for error handling (matching CreateInterview.jsx pattern)
  const getDetailedErrorMessage = (error, fallbackMessage) => {
    const statusCode = error?.response?.status;
    const backendMessage = error?.response?.data?.message;
    const genericMessage = error?.message;
    const message = backendMessage || genericMessage || fallbackMessage;

    if (statusCode) {
      return `${statusCode}: ${message}`;
    }

    return message;
  };

  const showErrorToast = (error, fallbackMessage) => {
    toast.error(getDetailedErrorMessage(error, fallbackMessage));
  };

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth < 768;
      setIsSmallScreen(small);
      if (!small) {
        setMobileStage(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = await getToken();
        if (token) {
          const res = await axios.get(
            `${backend_URL}/api/subscription/status`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
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

  const availableCredits =
    (subscription?.credits || 0) + (subscription?.topupCredits || 0);

  const handleStart = async () => {
    // Validation
    if (!micReady) {
      const error =
        "Microphone access is required to participate in group discussions.";
      setFieldErrors({ mic: error });
      toast.error(error);
      return;
    }

    if (
      subscription &&
      subscription.tier !== "Infinite Elite" &&
      availableCredits < FEATURE_COSTS.gdSession
    ) {
      toast.error(
        `You need at least ${FEATURE_COSTS.gdSession} credits to start a GD session. Redirecting to billing...`,
      );
      setTimeout(() => navigate("/billing"), 2000);
      return;
    }

    setIsStarting(true);
    try {
      const token = await getToken();
      const res = await axios.post(
        `${backend_URL}/api/group-discussion/start`,
        {
          category: selectedCategory,
          topicIndex: selectedTopicIdx === "custom" ? null : selectedTopicIdx,
          customTopic: selectedTopicIdx === "custom" ? customTopic : null,
          timeLimit: timeLimit * 60, // convert to seconds
          prepTime,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Discussion session started successfully. Launching...");
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
      showErrorToast(
        err,
        "Failed to start discussion session. Please try again.",
      );
      setIsStarting(false);
    }
  };

  const canProceedToForm = micReady;
  const isCompactMobileForm = isSmallScreen && mobileStage === 2;

  const handleNextStage = () => {
    if (!canProceedToForm) {
      const error = "Please enable microphone access to continue.";
      setFieldErrors({ mic: error });
      toast.error(error);
      return;
    }

    setMobileStage(2);
  };

  const handleBackToSetup = () => {
    setMobileStage(1);
  };

  return (
    <>
      <Helmet>
        <title>GD Setup | PlaceMateAI</title>
      </Helmet>
      <div className="min-h-screen  text-zinc-100 transition-colors selection:bg-[#bef264]/30 pb-20 p-4 md:p-8">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-12 max-w-7xl mx-auto mt-2 sm:mt-8 relative">
          {/* Left Column: Preview & Info - Sticky */}
          <div
            className={`w-full lg:w-1/2 flex flex-col lg:sticky lg:top-16 h-fit space-y-4 sm:space-y-6 animate-fade-in-left ${isSmallScreen && mobileStage === 2 ? "hidden" : ""}`}
          >
            <div className="space-y-4">
              <div className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">
                GD Simulator AI
              </div>
              <h1 className="text-2xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Master the <span className="text-[#bef264] italic">GD</span>{" "}
                Dynamics
              </h1>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-md">
                Prepare for group discussions with 4 unique AI personas. They
                interact naturally, allowing you to simulate a high-pressure
                corporate GD environment.
              </p>
            </div>

            {/* Discussion Panel Preview */}
            <div className="p-5 sm:p-6 bg-gradient-to-b  from-zinc-900/40 via-zinc-950/60 to-zinc-950/80 rounded-2xl border-y border-[#bef264] shadow-2xl shadow-black/40 relative overflow-hidden">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#bef264]/3 via-transparent to-zinc-900/20 rounded-2xl" />
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#bef264]/5 rounded-full blur-3xl -mt-32 -ml-32" />

              <div className="relative z-10">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-[11px] font-black text-[#bef264] uppercase tracking-[0.15em] mb-1">
                      ■ Live Discussion
                    </h3>
                    <p className="text-[13px] font-bold text-zinc-200">
                      Session Participants
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse" />
                    <span className="text-[10px] font-black text-[#bef264] uppercase tracking-wider">
                      4 Active
                    </span>
                  </div>
                </div>

                {/* Agents Grid - Enhanced */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {interviewAgents.slice(0, 4).map((agent, idx) => (
                    <div
                      key={agent.name}
                      className="group relative"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`,
                      }}
                    >
                      <div
                        className="p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-default"
                        style={{
                          backgroundColor: `#${agent.bg}08`,
                          borderColor: `#${agent.bg}35`,
                          boxShadow: `0 0 20px -10px #${agent.bg}40`,
                        }}
                      >
                        {/* Status Badge */}
                        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        </div>

                        {/* Agent Info */}
                        <div className="flex items-center gap-2.5">
                          <div
                            className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 shadow-lg"
                            style={{
                              borderColor: `#${agent.bg}60`,
                              background: `linear-gradient(135deg, #${agent.bg}20, #${agent.bg}08)`,
                            }}
                          >
                            <img
                              src={agent.profileImage}
                              alt={agent.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[12px] font-black truncate block"
                              style={{ color: `#${agent.bg}` }}
                            >
                              {agent.name}
                            </p>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                              {agent.label} • Active
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent mb-4" />

                {/* Participant Section */}
                <div className="p-3.5 bg-[#bef264]/5 border border-[#bef264]/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#bef264]/30 to-[#bef264]/10 border-2 border-[#bef264]/40 flex items-center justify-center shadow-lg">
                        <FiMic size={18} className="text-[#bef264]" />
                      </div>
                      <div>
                        <p className="text-[12px] font-black text-white">You</p>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                          Your Role
                        </p>
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border transition-all ${
                        micReady
                          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                          : "border-red-500/50 bg-red-500/15 text-red-300"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${micReady ? "bg-emerald-400 animate-pulse" : "bg-red-400 animate-pulse"}`}
                      />
                      {micReady ? "Ready" : "Mic Off"}
                    </div>
                  </div>
                </div>

          
              </div>

              <style>{`
                @keyframes fadeInUp {
                  from {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
            </div>

            {isSmallScreen && mobileStage === 1 && (
              <button
                onClick={handleNextStage}
                disabled={!canProceedToForm}
                className={`w-full py-3 rounded-2xl font-black tracking-wider text-sm transition-all flex items-center justify-center gap-2 group ${
                  canProceedToForm
                    ? "bg-[#bef264] text-black shadow-xl shadow-[#bef264]/20 hover:bg-[#a3e635]"
                    : "bg-zinc-800 text-zinc-400 cursor-not-allowed"
                }`}
              >
                {canProceedToForm ? (
                  <>
                    Proceed to Session Details
                    <FiArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                ) : (
                  <>
                    Enable Microphone to Continue
                    <FiMicOff size={16} />
                  </>
                )}
              </button>
            )}

            <div className="sm:bg-black p-3 sm:p-7 shadow-xl rounded-2xl sm:border dark:border-white/5 border-gray-100 ring-1 ring-black/5">
              <h3 className="text-sm font-bold dark:text-white text-black mb-3 flex items-center uppercase tracking-widest">
                <FiMessageSquare className="mr-3 text-[#bef264] text-lg" /> GD
                Dynamics
              </h3>
              <p className="text-[13px] dark:text-zinc-400 text-gray-600 leading-relaxed font-medium capitalize">
                Participants will open the floor, jump in with counter-points,
                and conclude based on collective input. speak clearly to ensure
                the AI understands your contribution.
              </p>
            </div>
          </div>

          {/* Right Column: Setup Form */}
          <div
            className={`w-full lg:w-[500px] flex flex-col animate-fade-in-right ${isSmallScreen && mobileStage === 1 ? "hidden" : ""}`}
          >
            {isCompactMobileForm && (
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={handleBackToSetup}
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
                >
                  <FiChevronLeft size={14} /> Back
                </button>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bef264]">
                  Step 2 of 2
                </span>
              </div>
            )}

            <div className="rounded-2xl border mb-2 border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl px-4 py-3 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#bef264]">
                    GD Session Setup
                  </p>
                  <h2
                    className={`${isCompactMobileForm ? "text-base" : "text-lg"} font-extrabold text-zinc-100 mt-1 tracking-tight`}
                  >
                    GD details
                  </h2>
                </div>
              </div>
              <p
                className={`text-zinc-400 ${isCompactMobileForm ? "text-xs" : "text-sm"} font-medium mt-1`}
              >
                Setup your group discussion session parameters.
              </p>
            </div>

            <div
              className={`${isCompactMobileForm ? "space-y-4" : "space-y-5"} rounded-2xl border border-zinc-800/80 bg-zinc-950/75 backdrop-blur-xl p-3 sm:p-4 shadow-2xl shadow-black/25`}
            >
              {/* Duration / Time Limit */}
              <div className={isCompactMobileForm ? "space-y-3" : "space-y-4"}>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                  Time Limit <span className="text-red-400">*</span>
                </label>
                <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-700 shadow-sm">
                  {[5, 10, 15, 20].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setTimeLimit(mins)}
                      className={`flex-1 ${isCompactMobileForm ? "py-2 text-[10px]" : "py-2 text-[11px]"} font-semibold uppercase tracking-wide rounded-lg transition-all ${
                        timeLimit === mins
                          ? "bg-[#bef264] text-zinc-900 shadow"
                          : "text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      {mins} Min
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-zinc-800/80" />

              <hr className="border-zinc-800/80" />

              {/* Category Select */}
              <div className={isCompactMobileForm ? "space-y-3" : "space-y-4"}>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                  Discussion Category <span className="text-red-400">*</span>
                </label>
                <div
                  className={`grid ${isCompactMobileForm ? "grid-cols-2 gap-2.5" : "grid-cols-2 gap-3"}`}
                >
                  {CATEGORIES.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => {
                        handleCategoryChange(key);
                        clearFieldError("category");
                      }}
                      className={`flex items-center gap-2 ${isCompactMobileForm ? "p-2.5" : "p-3"} rounded-xl border transition-all duration-300 group ${
                        selectedCategory === key
                          ? "border-[#bef264]/70 bg-[#bef264]/10 text-white"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 text-zinc-400"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg transition-colors ${selectedCategory === key ? "bg-[#bef264]/20 text-[#d9f99d]" : "bg-zinc-800 text-zinc-400"}`}
                      >
                        <Icon size={14} />
                      </div>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wide truncate ${selectedCategory === key ? "text-white" : "text-zinc-400"}`}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-zinc-800/80" />

              {/* Topic Selection */}
              <div className={isCompactMobileForm ? "space-y-3" : "space-y-4"}>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                  Select Topic <span className="text-red-400">*</span>
                </label>
                <div className="p-1 bg-zinc-900/70 rounded-2xl border border-zinc-700 overflow-hidden shadow-sm">
                  <div
                    className={`${isCompactMobileForm ? "max-h-[200px]" : "max-h-[240px]"} overflow-y-auto custom-scrollbar space-y-1 p-1`}
                  >
                    {/* Random Option */}
                    <button
                      onClick={() => {
                        setSelectedTopicIdx(null);
                        clearFieldError("topic");
                      }}
                      className={`w-full text-left ${isCompactMobileForm ? "px-3 py-2.5 text-[11px]" : "px-4 py-3.5 text-[12px]"} rounded-lg transition-all flex items-center justify-between group font-semibold ${
                        selectedTopicIdx === null
                          ? "bg-[#bef264] text-zinc-900 font-black"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      Choose Automatically
                      <FiShuffle
                        size={14}
                        className={
                          selectedTopicIdx === null
                            ? "text-zinc-900"
                            : "text-[#bef264]"
                        }
                      />
                    </button>

                    {/* Custom Topic Option */}
                    <button
                      onClick={() => setSelectedTopicIdx("custom")}
                      className={`w-full text-left ${isCompactMobileForm ? "px-3 py-2.5 text-[11px]" : "px-4 py-3.5 text-[12px]"} rounded-lg transition-all flex items-center justify-between group font-semibold ${
                        selectedTopicIdx === "custom"
                          ? "bg-[#bef264] text-zinc-900 font-black"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      Add Custom Topic
                      <FiEdit size={14} />
                    </button>

                    {selectedTopicIdx === "custom" && (
                      <div
                        className={`${isCompactMobileForm ? "p-2.5" : "p-3.5"} bg-zinc-800/50 rounded-lg border border-zinc-700 animate-fade-in`}
                      >
                        <textarea
                          value={customTopic}
                          onChange={(e) => {
                            setCustomTopic(e.target.value);
                            clearFieldError("topic");
                          }}
                          placeholder="Enter your topic for discussion..."
                          className={`w-full ${isCompactMobileForm ? "p-2.5 text-[11px]" : "p-3 text-[12px]"} bg-zinc-900 border border-zinc-700 focus:ring-[#bef264]/40 focus:border-[#bef264]/70 rounded-lg text-white focus:ring-1 transition-all outline-none resize-none font-semibold placeholder-zinc-500 shadow-sm`}
                          rows={isCompactMobileForm ? 2 : 3}
                        />
                      </div>
                    )}

                    <div className="h-px bg-zinc-800 my-1" />

                    {/* Preset Topics */}
                    {topics.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTopicIdx(idx);
                          clearFieldError("topic");
                        }}
                        className={`w-full text-left ${isCompactMobileForm ? "px-3 py-2.5 text-[11px]" : "px-4 py-3 text-[12px]"} rounded-lg transition-all font-semibold leading-snug ${
                          selectedTopicIdx === idx
                            ? "bg-[#bef264]/15 text-[#d9f99d] border border-[#bef264]/30 font-black"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Preparation Time Toggle */}
              <div
                className={`flex items-center justify-between ${isCompactMobileForm ? "p-3" : "p-4"} bg-zinc-900/50 rounded-xl border border-zinc-700 shadow-sm transition-all hover:border-zinc-600`}
              >
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                    Preparation Time
                  </label>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                    1 minute to prepare before start
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrepTime(!prepTime)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    prepTime ? "bg-[#bef264]" : "bg-zinc-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      prepTime ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <hr className="border-zinc-800/80" />

              {/* Action Button */}
              <div className={isCompactMobileForm ? "pt-2" : "pt-4"}>
                <button
                  onClick={handleStart}
                  disabled={isStarting || !micReady}
                  className={`w-full ${isCompactMobileForm ? "py-3.5 text-sm" : "py-4 text-[13px]"} font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 group active:scale-[0.99] ${
                    !micReady
                      ? "bg-zinc-800 text-zinc-400 cursor-not-allowed hover:bg-zinc-800"
                      : subscription &&
                          subscription.tier !== "Infinite Elite" &&
                          availableCredits < FEATURE_COSTS.gdSession
                        ? "bg-zinc-800 text-zinc-400 cursor-not-allowed hover:bg-zinc-800"
                        : "bg-[#bef264] hover:bg-[#a3e635] text-zinc-900 shadow-[#bef264]/20"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isStarting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-zinc-900/20 border-t-zinc-900 rounded-full animate-spin" />
                      Starting Session...
                    </>
                  ) : !micReady ? (
                    <>
                      Enable Microphone to Start
                      <FiMicOff size={18} />
                    </>
                  ) : subscription &&
                    subscription.tier !== "Infinite Elite" &&
                    availableCredits < FEATURE_COSTS.gdSession ? (
                    <>
                      Get Credits
                      <FiCreditCard className="group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      Start Discussion Floor
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <div
                  className={`w-2 h-2 rounded-full ${micReady ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
                />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  {micReady ? "Microphone Ready" : "Microphone Access Required"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupDiscussionSetup;
