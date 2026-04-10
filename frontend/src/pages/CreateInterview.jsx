import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiUser,
  FiLoader,
  FiShield,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiZap,
  FiArrowRight,
  FiCreditCard,
  FiVolume2,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useInterview } from "../context/InterviewContext";
import { useUser, useAuth } from "@clerk/clerk-react";
import usePollyTTS from "../hooks/usePollyTTS";

import { interviewAgents } from "../constants/agents";

const jobTitles = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Mobile Developer",
  "Software Engineer",
];

const CreateInterview = () => {
  const {
    interviewData,
    setInterviewData,
    setSessionId,
    resetInterview,
    isCameraEnabled,
    setIsCameraEnabled,
    isMicEnabled,
    setIsMicEnabled,
  } = useInterview();

  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inputType, setInputType] = useState("both"); // 'resume', 'jobDescription', 'both'
  const [jobDescription, setJobDescription] = useState("");
  const [resumeContent, setResumeContent] = useState("");
  const [duration, setDuration] = useState(10); // 5, 10, 15, 20 minutes
  const [showAllAgents, setShowAllAgents] = useState(false);
  const [isExperienceDropdownOpen, setIsExperienceDropdownOpen] =
    useState(false);
  const [mobileStage, setMobileStage] = useState(1);
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const { speakText, stopSpeaking } = usePollyTTS();

  const playVoiceSample = async (agent, e = null) => {
    if (e) e.stopPropagation();

    try {
      const text = `Hi, I am ${agent.name}. I'll be your interviewer today.`;
      await speakText(text, agent.name);
    } catch (err) {
      console.error("Voice preview error:", err);
      toast.error("Voice preview unavailable. Please try again.");
    }
  };

  const localVideoRef = useRef(null);
  const experienceDropdownRef = useRef(null);
  const jobTitleSliderRef = useRef(null);
  const navigate = useNavigate();

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
    resetInterview();
    const fetchSubscription = async () => {
      try {
        const token = await getToken();
        if (token) {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`,
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
  }, [getToken]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        experienceDropdownRef.current &&
        !experienceDropdownRef.current.contains(event.target)
      ) {
        setIsExperienceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      if (isCameraEnabled) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: false,
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera access denied:", err);
          setIsCameraEnabled(false);
          toast.error("Could not access camera. Please check permissions.");
        }
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraEnabled]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInterviewData((prev) => ({ ...prev, [name]: value }));
  };

  const startInterview = async () => {
    if (
      subscription &&
      subscription.tier !== "Infinite Elite" &&
      (subscription.credits || 0) < 10
    ) {
      toast.error(
        "You need at least 10 credits to start an interview. Redirecting to billing...",
      );
      setTimeout(() => navigate("/billing"), 2000);
      return;
    }

    if (!interviewData.agentName) {
      toast.error("Please select an interviewer to continue.");
      return;
    }

    if (!isCameraEnabled || !isMicEnabled) {
      toast.error("Please enable both camera and microphone to start.");
      return;
    }

    let combinedContent = "";
    if (inputType === "resume") combinedContent = `Resume: ${resumeContent}`;
    else if (inputType === "jobDescription")
      combinedContent = `Job Description: ${jobDescription}`;
    else {
      if (!resumeContent && !jobDescription) {
        toast.error("Please provide resume or job description content.");
        return;
      }
      if (resumeContent) combinedContent += `Resume: ${resumeContent}\n`;
      if (jobDescription)
        combinedContent += `Job Description: ${jobDescription}`;
    }

    if (!combinedContent.trim()) {
      toast.error("Please provide resume or job description content.");
      return;
    }

    const finalInterviewData = {
      ...interviewData,
      content: combinedContent,
      userName: user?.firstName || "Candidate",
      duration: duration,
    };

    setLoading(true);
    const token = await getToken();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/custom-interview/start`,
        finalInterviewData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const {
        systemPrompt,
        sessionId: newSessionId,
        duration: serverDuration,
      } = response.data;
      setSessionId(newSessionId);

      navigate(`/session-custom/${newSessionId}`, {
        state: {
          systemPrompt,
          isCustom: true,
          duration: serverDuration || duration,
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize custom interview.");
    } finally {
      setLoading(false);
    }
  };

  const scrollSlider = (direction) => {
    if (jobTitleSliderRef.current) {
      const scrollAmount = 200;
      jobTitleSliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const toggleVideo = () => setIsCameraEnabled(!isCameraEnabled);

  const canProceedToForm = isCameraEnabled && isMicEnabled;
  const isCompactMobileForm = isSmallScreen && mobileStage === 2;

  const handleNextStage = () => {
    if (!canProceedToForm) {
      toast.error("Please enable both camera and microphone to continue.");
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
        <title>Interview Setup | PlaceMateAI</title>
      </Helmet>
      <div className="min-h-screen text-zinc-100 transition-colors selection:bg-[#bef264]/30 md:pb-20 p-4 md:p-8">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-12 max-w-7xl mx-auto mt-2 sm:mt-8 relative">
          {/* Pre-call Preview / Green Room - Sticky Section */}
          <div
            className={`w-full lg:w-1/2 flex flex-col lg:sticky lg:top-16 h-fit space-y-4 sm:space-y-6 animate-fade-in-left ${isSmallScreen && mobileStage === 2 ? "hidden" : ""}`}
          >
            <div className="space-y-4">
              <div className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">
                AI Mock Interview
              </div>
              <h1 className="text-2xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Ace your <span className="text-[#bef264] italic">Job</span>{" "}
                Interview
              </h1>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-md">
                Prepare for your dream job with real-time AI feedback. Practice
                speaking in a professional environment with our advanced AI
                interviewers.
              </p>
            </div>

            <div className="relative aspect-video bg-zinc-950 rounded-xl sm:rounded-[2rem] border-y border-[#bef264] overflow-hidden group shadow-2xl shadow-[#bef264]/5">
              {isCameraEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover mirror rounded-xl sm:rounded-[2rem]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm">
                  <div className="flex flex-col items-center opacity-80">
                    {user?.imageUrl ? (
                      <img
                        src={user?.imageUrl}
                        alt="User Avatar"
                        className="w-10 h-10 sm:w-24 sm:h-24 rounded-full object-cover mb-4 border-4 border-indigo-500/30"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-24 sm:h-24 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 border-2 border-indigo-500/50">
                        <FiUser className="text-4xl text-indigo-400" />
                      </div>
                    )}
                    <span className="text-xs sm:text-sm font-semibold text-zinc-400 tracking-wide uppercase">
                      Camera is Off
                    </span>
                  </div>
                </div>
              )}

              {/* Controls Overlay Desktop*/}
              <div className="absolute hidden  bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 sm:flex items-center gap-4 bg-zinc-900/80 backdrop-blur-2xl p-2.5  rounded-xl sm:rounded-3xl border border-white/10 transition-all duration-300 shadow-2xl hover:bg-zinc-900">
                <button
                  onClick={() => setIsMicEnabled(!isMicEnabled)}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-2xl transition-all cursor-pointer ${!isMicEnabled ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 hover:bg-white/10 text-white"}`}
                >
                  {!isMicEnabled ? (
                    <FiMicOff className="text-sm sm:text-xl" />
                  ) : (
                    <FiMic className="text-sm sm:text-xl" />
                  )}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-2xl transition-all cursor-pointer ${!isCameraEnabled ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 hover:bg-white/10 text-white"}`}
                >
                  {!isCameraEnabled ? (
                    <FiVideoOff className="text-sm sm:text-xl" />
                  ) : (
                    <FiVideo className="text-sm sm:text-xl" />
                  )}
                </button>
              </div>

              <div className="absolute top-1 sm:top-6 left-1 sm:left-6 flex items-center space-x-2 bg-zinc-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <div
                  className={`w-2 h-2 rounded-full ${isCameraEnabled && isMicEnabled ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
                ></div>
                <span className="text-[8px] sm:text-[10px] font-black tracking-widest text-white uppercase opacity-90">
                  {isCameraEnabled && isMicEnabled
                    ? "System Ready"
                    : "Setup Required"}
                </span>
              </div>
            </div>
            {/* Controls Overlay Mobile */}
            <div className="w-fit mx-auto sm:hidden  flex items-center gap-4 bg-zinc-900/80 backdrop-blur-2xl p-2.5  rounded-xl sm:rounded-3xl border border-white/10 transition-all duration-300 shadow-2xl hover:bg-zinc-900">
              <button
                onClick={() => setIsMicEnabled(!isMicEnabled)}
                className={`px-4 py-2 sm:p-4 rounded-lg sm:rounded-2xl transition-all cursor-pointer ${!isMicEnabled ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 hover:bg-white/10 text-white"}`}
              >
                {!isMicEnabled ? (
                  <FiMicOff className="text-sm sm:text-xl" />
                ) : (
                  <FiMic className="text-sm sm:text-xl" />
                )}
              </button>
              <button
                onClick={toggleVideo}
                className={`px-4 py-2 sm:p-4  rounded-lg sm:rounded-2xl transition-all cursor-pointer ${!isCameraEnabled ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 hover:bg-white/10 text-white"}`}
              >
                {!isCameraEnabled ? (
                  <FiVideoOff className="text-sm sm:text-xl" />
                ) : (
                  <FiVideo className="text-sm sm:text-xl" />
                )}
              </button>
            </div>

            {isSmallScreen && mobileStage === 1 && (
              <button
                onClick={handleNextStage}
                disabled={!canProceedToForm}
                className={`w-full py-3 rounded-2xl  font-black  tracking-wider text-sm transition-all ${canProceedToForm ? "bg-[#bef264] text-black shadow-xl shadow-[#bef264]/20" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}
              >
                {canProceedToForm
                  ? "Proceed to Interview Details"
                  : "Enable Camera & Mic"}
              </button>
            )}

            <div className="sm:dark:bg-[#1a1a1a] sm:bg-white p-3 sm:p-7 shadow-xl rounded-[2rem] sm:border dark:border-white/5 border-gray-100 ring-1 ring-black/5">
              <h3 className="text-sm font-bold dark:text-white text-black mb-3 flex items-center uppercase tracking-widest">
                <FiShield className="mr-3 text-[#bef264] text-xl" />
                Professional Environment
              </h3>
              <p className="text-[13px] dark:text-zinc-500 text-gray-600 leading-relaxed font-medium">
                Ensure you are in a quiet room with good lighting. Our AI
                interviewer will analyze both your tone and content to provide
                detailed feedback.
              </p>
            </div>
          </div>

          {/* Setup Form */}
          <div
            className={`w-full lg:w-[450px] flex flex-col animate-fade-in-right ${isSmallScreen && mobileStage === 1 ? "hidden" : ""} ${isCompactMobileForm ? "gap-5 px-1" : "gap-8 px-4"}`}
          >
            {isCompactMobileForm && (
              <div className="flex items-center justify-between mb-1">
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

            <div className={isCompactMobileForm ? "pb-1" : "pb-2"}>
              <h2
                className={`${isCompactMobileForm ? "text-base" : "text-lg"} font-black dark:text-white text-black mb-1 uppercase tracking-tight`}
              >
                Interview details
              </h2>
              <p
                className={`dark:text-zinc-500 text-gray-500 ${isCompactMobileForm ? "text-xs" : "text-sm"} font-medium`}
              >
                Give the job details you want to apply for
              </p>
            </div>

            <div className={isCompactMobileForm ? "space-y-4" : "space-y-6"}>
              {/* Job Title */}
              <div className={isCompactMobileForm ? "space-y-3" : "space-y-4"}>
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                  Job title
                </label>
                <input
                  name="role"
                  value={interviewData?.role || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. Frontend Developer"
                  className={`w-full ${isCompactMobileForm ? "px-4 py-3 text-xs" : "px-5 py-4 text-[13px]"} bg-black border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-[#bef264]/50 focus:border-[#bef264] transition-all outline-none font-bold placeholder-gray-600 shadow-sm`}
                />

                {/* Job Title Suggestions Slider */}
                <div className="relative group/slider">
                  <div
                    ref={jobTitleSliderRef}
                    className="flex gap-2 overflow-x-auto mx-4 scrollbar-none no-scrollbar snap-x snap-mandatory"
                  >
                    {jobTitles.map((title) => (
                      <button
                        key={title}
                        onClick={() =>
                          handleInputChange({
                            target: { name: "role", value: title },
                          })
                        }
                        className={`whitespace-nowrap px-4 py-2 rounded-full border text-[11px] font-bold transition-all cursor-pointer snap-start ${
                          interviewData.role === title
                            ? "bg-[#bef264]/10 border-[#bef264] text-[#bef264] shadow-[0_0_15px_-3px_rgba(190,242,100,0.2)]"
                            : "bg-zinc-800 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-300"
                        }`}
                      >
                        {title}
                      </button>
                    ))}
                  </div>

                  {/* Left Scroll Button */}
                  <button
                    onClick={() => scrollSlider("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-7 h-7  rounded-full flex items-center justify-center  text-[#bef264] bg-zinc-800 border border-[#bef264] transition-all   z-10 shadow-xl"
                  >
                    <FiChevronLeft size={16} />
                  </button>

                  {/* Right Scroll Button */}
                  <button
                    onClick={() => scrollSlider("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-7 h-7  rounded-full flex items-center justify-center  text-[#bef264] bg-zinc-800 border border-[#bef264] transition-all  z-10 shadow-xl"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>

              <hr className="dark:border-white/5 border-black/5" />

              <div className={isCompactMobileForm ? "space-y-3" : "space-y-4"}>
                <div
                  className={`flex items-center justify-between ${isCompactMobileForm ? "mb-1" : "mb-2"}`}
                >
                  <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                    Context source
                  </label>
                  <div className="flex dark:bg-black rounded-full p-1 border border-zinc-800 w-fit shadow-sm">
                    <button
                      onClick={() => setInputType("jobDescription")}
                      className={`${isCompactMobileForm ? "px-3 py-1 text-[9px]" : "px-4 py-1.5 text-[10px]"} font-black uppercase tracking-wider rounded-full transition-all ${inputType === "jobDescription" ? "bg-[#bef264] text-black shadow-lg" : "dark:text-zinc-500 text-gray-500 hover:text-zinc-300"}`}
                    >
                      JD
                    </button>
                    <button
                      onClick={() => setInputType("resume")}
                      className={`${isCompactMobileForm ? "px-3 py-1 text-[9px]" : "px-4 py-1.5 text-[10px]"} font-black uppercase tracking-wider rounded-full transition-all ${inputType === "resume" ? "bg-[#bef264] text-black shadow-lg" : "dark:text-zinc-500 text-gray-500 hover:text-zinc-300"}`}
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => setInputType("both")}
                      className={`${isCompactMobileForm ? "px-3 py-1 text-[9px]" : "px-4 py-1.5 text-[10px]"} font-black uppercase tracking-wider rounded-full transition-all ${inputType === "both" ? "bg-[#bef264] text-black shadow-lg" : "dark:text-zinc-500 text-gray-500 hover:text-zinc-300"}`}
                    >
                      Both
                    </button>
                  </div>
                </div>

                <div
                  className={isCompactMobileForm ? "space-y-3" : "space-y-4"}
                >
                  {(inputType === "jobDescription" || inputType === "both") && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                        Job Description
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={isCompactMobileForm ? 3 : 4}
                        placeholder="Paste the job description here..."
                        className={`w-full ${isCompactMobileForm ? "p-3 text-xs" : "p-4 text-[13px]"} bg-black border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-[#bef264] transition-all outline-none resize-none font-medium dark:placeholder-zinc-700 placeholder-gray-500 shadow-sm`}
                      ></textarea>
                    </div>
                  )}

                  {(inputType === "resume" || inputType === "both") && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                        Resume Content
                      </label>
                      <textarea
                        value={resumeContent}
                        onChange={(e) => setResumeContent(e.target.value)}
                        rows={isCompactMobileForm ? 3 : 4}
                        placeholder="Paste your core resume points here..."
                        className={`w-full ${isCompactMobileForm ? "p-3 text-xs" : "p-4 text-[13px]"} bg-black border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-[#bef264]/50 transition-all outline-none resize-none font-medium dark:placeholder-zinc-700 placeholder-gray-500 shadow-sm`}
                      ></textarea>
                    </div>
                  )}
                </div>
              </div>

              <hr className="dark:border-white/5 border-black/5" />

              {/* Experience Level */}
              <div
                className={`relative ${isCompactMobileForm ? "space-y-3" : "space-y-4"}`}
                ref={experienceDropdownRef}
              >
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                  Experience level
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setIsExperienceDropdownOpen(!isExperienceDropdownOpen)
                  }
                  className={`w-full flex items-center justify-between ${isCompactMobileForm ? "px-4 py-3 text-xs" : "px-5 py-4 text-[13px]"} bg-black border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-[#bef264] outline-none font-bold shadow-sm transition-all cursor-pointer hover:border-zinc-700`}
                >
                  <span>
                    {
                      [
                        { value: "Junior", label: "Entry Level" },
                        { value: "Mid-Level", label: "Mid-Level Associate" },
                        { value: "Senior", label: "Senior Professional" },
                        { value: "Architect", label: "Architect / Lead" },
                      ].find(
                        (level) =>
                          level.value === (interviewData.level || "Junior"),
                      )?.label
                    }
                  </span>
                  <FiChevronDown
                    className={`transition-transform duration-300 text-zinc-500 ${isExperienceDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isExperienceDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                    {[
                      { value: "Junior", label: "Entry Level" },
                      { value: "Mid-Level", label: "Mid-Level Associate" },
                      { value: "Senior", label: "Senior Professional" },
                      { value: "Architect", label: "Architect / Lead" },
                    ].map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => {
                          handleInputChange({
                            target: { name: "level", value: level.value },
                          });
                          setIsExperienceDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3.5 text-[13px] transition-all cursor-pointer ${
                          (interviewData.level || "Junior") === level.value
                            ? "bg-[#bef264]/10 text-[#bef264] font-black"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <hr className="dark:border-white/5 border-black/5" />

              {/* Interviewer Selection */}
              <div className={isCompactMobileForm ? "space-y-3" : "space-y-4"}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                    Select Interviewer
                  </label>
                  <button
                    onClick={() => setShowAllAgents(!showAllAgents)}
                    className="text-[10px] font-black uppercase tracking-widest text-[#bef264] hover:text-[#bef264]/80 transition-colors"
                  >
                    {showAllAgents ? "Show Less" : "View All"}
                  </button>
                </div>
                <div
                  className={`grid ${isCompactMobileForm ? "grid-cols-1 gap-2.5" : "grid-cols-2 gap-3"} transition-all duration-300`}
                >
                  {interviewAgents
                    .filter((a) =>
                      [
                        "Rohan",
                        "Sophia",
                        "Marcus",
                        "Emma",
                        "Drew",
                        "Rachel",
                      ].includes(a.name),
                    )
                    .slice(0, showAllAgents ? undefined : 4)
                    .map((agent) => (
                      <div
                        key={agent.name}
                        onClick={() => {
                          setInterviewData((p) => ({
                            ...p,
                            agentName: agent.name,
                            agentVoiceProvider: agent.provider,
                            agentVoiceId: agent.voiceId,
                          }));
                          playVoiceSample(agent);
                        }}
                        style={{
                          borderColor:
                            interviewData.agentName === agent.name
                              ? `#${agent.bg}`
                              : "",
                          backgroundColor:
                            interviewData.agentName === agent.name
                              ? `#${agent.bg}15`
                              : "",
                        }}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          interviewData.agentName === agent.name
                            ? "shadow-xl shadow-black/40 scale-[1.02]"
                            : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900"
                        }`}
                      >
                        <div
                          className={`relative rounded-full p-0.5 transition-all duration-300 ${
                            interviewData.agentName === agent.name
                              ? "scale-110"
                              : ""
                          }`}
                          style={{
                            background:
                              interviewData.agentName === agent.name
                                ? `linear-gradient(135deg, #${agent.bg}, #${agent.bg}88)`
                                : "transparent",
                          }}
                        >
                          <img
                            src={agent.image}
                            alt={agent.name}
                            className={`w-11 h-11 rounded-full object-cover border-2 ${
                              interviewData.agentName === agent.name
                                ? "border-zinc-950"
                                : "border-zinc-800"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className="text-[13px] font-black truncate transition-colors"
                              style={{
                                color:
                                  interviewData.agentName === agent.name
                                    ? `#${agent.bg}`
                                    : "#d4d4d8", // zinc-300
                              }}
                            >
                              {agent.name}
                            </p>
                            <button
                              onClick={(e) => playVoiceSample(agent, e)}
                              className={`p-2 rounded-xl transition-all ${
                                interviewData.agentName === agent.name
                                  ? "bg-white/10 text-white hover:bg-white/20"
                                  : "bg-zinc-800/50 text-zinc-500 hover:text-white hover:bg-zinc-800"
                              }`}
                              title="Play sample"
                            >
                              <FiVolume2 size={14} />
                            </button>
                          </div>
                          <p className="text-[10px] dark:text-zinc-500 text-gray-500 font-black uppercase tracking-widest mt-0.5">
                            {agent.label} Voice
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <hr className="dark:border-white/5 border-black/5" />

              {/* Interview Types */}
              <div className={isCompactMobileForm ? "space-y-3" : "space-y-4"}>
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                  Interview Type
                </label>
                <div
                  className={isCompactMobileForm ? "space-y-2.5" : "space-y-3"}
                >
                  {/* Technical */}
                  <button
                    onClick={() =>
                      setInterviewData((p) => ({
                        ...p,
                        interviewType: "technical",
                      }))
                    }
                    className={`w-full flex items-center gap-4 ${isCompactMobileForm ? "px-4 py-3" : "px-5 py-4"} rounded-xl border transition-all duration-300 group ${interviewData.interviewType === "technical" ? "border-[#bef264] bg-[#bef264]/10 text-white shadow-xl shadow-[#bef264]/5" : "border-zinc-800 bg-black hover:border-zinc-700 text-zinc-400"}`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-sm border-2 transition-all ${interviewData.interviewType === "technical" ? "bg-[#bef264] border-[#bef264] scale-110" : "bg-transparent border-zinc-700 group-hover:border-zinc-500"}`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[13px] font-black transition-colors ${interviewData.interviewType === "technical" ? "text-white" : "group-hover:text-zinc-200"}`}
                        >
                          Technical
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-[#bef264]/20 text-[#bef264] font-black uppercase tracking-widest">
                          Problem solving
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-zinc-500 leading-tight">
                        Test your domain expertise and logic
                      </p>
                    </div>
                  </button>

                  {/* Behavioral */}
                  <button
                    onClick={() =>
                      setInterviewData((p) => ({
                        ...p,
                        interviewType: "behavioral",
                      }))
                    }
                    className={`w-full flex items-center gap-4 ${isCompactMobileForm ? "px-4 py-3" : "px-5 py-4"} rounded-xl border transition-all duration-300 group ${interviewData.interviewType === "behavioral" ? "border-[#bef264] bg-[#bef264]/10 text-white shadow-xl shadow-[#bef264]/5" : "border-zinc-800 bg-black hover:border-zinc-700 text-zinc-400"}`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-sm border-2 transition-all ${interviewData.interviewType === "behavioral" ? "bg-[#bef264] border-[#bef264] scale-110" : "bg-transparent border-zinc-700 group-hover:border-zinc-500"}`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[13px] font-black transition-colors ${interviewData.interviewType === "behavioral" ? "text-white" : "group-hover:text-zinc-200"}`}
                        >
                          Behavioral
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest">
                          Soft skills
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-zinc-500 leading-tight">
                        Evaluate experiences and interpersonal skills
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <hr className="dark:border-white/5 border-black/5" />

              {/* Interview Duration */}
              <div className={isCompactMobileForm ? "space-y-3" : "space-y-4"}>
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                  Interview Duration
                </label>
                <div className="flex bg-black rounded-xl p-1 border border-zinc-800 shadow-sm">
                  {[5, 10, 15, 20].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDuration(mins)}
                      className={`flex-1 ${isCompactMobileForm ? "py-2 text-[10px]" : "py-2.5 text-[11px]"} font-black uppercase tracking-wider rounded-lg transition-all ${
                        duration === mins
                          ? "bg-[#bef264] text-black shadow-lg"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {mins} Min
                    </button>
                  ))}
                </div>
              </div>

              <div className={isCompactMobileForm ? "pt-1" : "pt-2"}>
                <button
                  onClick={startInterview}
                  disabled={loading}
                  className={`w-full ${isCompactMobileForm ? "px-6 py-3.5 text-sm" : "px-10 py-4"} ${subscription && subscription.tier !== "Infinite Elite" && subscription.credits <= 0 ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-[#bef264] hover:bg-[#bef264]/90 text-black"} cursor-pointer font-black rounded-2xl transition-all inline-flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[#bef264]/20 active:scale-95 group`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Starting Interview...
                    </>
                  ) : subscription &&
                    subscription.tier !== "Infinite Elite" &&
                    subscription.credits < 10 ? (
                    <>
                      Get Credits
                      <FiCreditCard
                        size={20}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  ) : (
                    <>
                      Start Session
                      <FiArrowRight
                        size={20}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateInterview;
