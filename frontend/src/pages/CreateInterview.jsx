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
  FiZap,
  FiArrowRight,
  FiCreditCard,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useInterview } from "../context/InterviewContext";
import { useUser, useAuth } from "@clerk/clerk-react";

import { interviewAgents } from "../constants/agents";

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
  const [showAllAgents, setShowAllAgents] = useState(false);
  const [isExperienceDropdownOpen, setIsExperienceDropdownOpen] = useState(false);

  const localVideoRef = useRef(null);
  const experienceDropdownRef = useRef(null);
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    resetInterview();
    const fetchSubscription = async () => {
      try {
        const token = await getToken();
        if (token) {
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`, {
            headers: { Authorization: `Bearer ${token}` }
          });
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
      if (experienceDropdownRef.current && !experienceDropdownRef.current.contains(event.target)) {
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
    if (subscription && subscription.tier !== 'Elite' && subscription.credits.interviews <= 0) {
      toast.error("You have run out of interview credits. Redirecting to billing...");
      setTimeout(() => navigate("/billing"), 2000);
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
    };

    setLoading(true);
    const token = await getToken();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vapi-interview/start`,
        finalInterviewData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const { systemPrompt, sessionId: newSessionId, vapiPublicKey } = response.data;
      setSessionId(newSessionId);

      navigate(`/session/${newSessionId}`, {
        state: { systemPrompt, vapiPublicKey },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize interview.");
    } finally {
      setLoading(false);
    }
  };

  const toggleVideo = () => setIsCameraEnabled(!isCameraEnabled);

  return (
    <>
      <Helmet>
        <title>Interview Setup | PriPareAI</title>
      </Helmet>
      <div className="min-h-screen text-zinc-100 transition-colors selection:bg-[#bef264]/30 pb-20 p-4 md:p-8">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-12 max-w-7xl mx-auto animate-fade mt-8">
        {/* Pre-call Preview / Green Room - Sticky Section */}
        <div className="w-full lg:w-1/2 flex flex-col sticky top-16 space-y-6 animate-fade-in-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#bef264]/10 border border-[#bef264]/20 text-[#bef264] text-[10px] font-black uppercase tracking-widest">
              <FiZap size={12} />
              AI Interview · Real-time Session
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Ace your <span className="text-[#bef264] italic">Job</span> Interview
            </h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-md">
              Prepare for your dream job with real-time AI feedback. Practice speaking in a professional environment with our advanced AI interviewers.
            </p>
          </div>

          <div className="relative aspect-video bg-zinc-950 rounded-[2rem] border border-[#bef264] overflow-hidden group shadow-2xl shadow-[#bef264]/5">
            {isCameraEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover mirror"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm">
                <div className="flex flex-col items-center opacity-80">
                  {user?.imageUrl ? (
                    <img
                      src={user?.imageUrl}
                      alt="User Avatar"
                      className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-indigo-500/30"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 border-2 border-indigo-500/50">
                      <FiUser className="text-4xl text-indigo-400" />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-zinc-400 tracking-wide uppercase">
                    Camera is Off
                  </span>
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/80 backdrop-blur-2xl p-2.5 rounded-3xl border border-white/10 transition-all duration-300 shadow-2xl hover:bg-zinc-900">
              <button
                onClick={() => setIsMicEnabled(!isMicEnabled)}
                className={`p-4 rounded-2xl transition-all cursor-pointer ${!isMicEnabled ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 hover:bg-white/10 text-white"}`}
              >
                {!isMicEnabled ? <FiMicOff className="text-xl" /> : <FiMic className="text-xl" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-2xl transition-all cursor-pointer ${!isCameraEnabled ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 hover:bg-white/10 text-white"}`}
              >
                {!isCameraEnabled ? <FiVideoOff className="text-xl" /> : <FiVideo className="text-xl" />}
              </button>
            </div>

            <div className="absolute top-6 left-6 flex items-center space-x-2 bg-zinc-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <div className={`w-2 h-2 rounded-full ${isCameraEnabled && isMicEnabled ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></div>
              <span className="text-[10px] font-black tracking-widest text-white uppercase opacity-90">
                {isCameraEnabled && isMicEnabled ? "System Ready" : "Setup Required"}
              </span>
            </div>
          </div>

          <div className="dark:bg-[#1a1a1a] bg-white p-7 shadow-xl rounded-[2rem] border dark:border-white/5 border-gray-100 ring-1 ring-black/5">
            <h3 className="text-sm font-bold dark:text-white text-black mb-3 flex items-center uppercase tracking-widest">
              <FiShield className="mr-3 text-[#bef264] text-xl" /> Professional Environment
            </h3>
            <p className="text-[13px] dark:text-zinc-500 text-gray-600 leading-relaxed font-medium">
              Ensure you are in a quiet room with good lighting. Our AI interviewer will analyze both your tone and content to provide detailed feedback.
            </p>
          </div>
        </div>

        {/* Setup Form */}
        <div className="w-full lg:w-[450px] flex flex-col gap-8 animate-fade-in-right px-4">
          <div className="pb-2">
            <h2 className="text-lg font-black dark:text-white text-black mb-1 uppercase tracking-tight">
              Interview details
            </h2>
            <p className="dark:text-zinc-500 text-gray-500 text-sm font-medium">
              Give the job details you want to apply for
            </p>
          </div>

          <div className="space-y-6">
            {/* Job Title */}
            <div className="space-y-4">
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                Job title
              </label>
              <input
                name="role"
                value={interviewData?.role || ""}
                onChange={handleInputChange}
                placeholder="e.g. Frontend Developer"
                className="w-full px-5 py-4 bg-black border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-[#bef264]/50 focus:border-[#bef264] transition-all outline-none text-[13px] font-bold placeholder-gray-600 shadow-sm"
              />
            </div>

            <hr className="dark:border-white/5 border-black/5" />

            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                  Context source
                </label>
                <div className="flex dark:bg-black rounded-full p-1 border border-zinc-800 w-fit shadow-sm">
                  <button
                    onClick={() => setInputType("jobDescription")}
                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full transition-all ${inputType === "jobDescription" ? "bg-[#bef264] text-black shadow-lg" : "dark:text-zinc-500 text-gray-500 hover:text-zinc-300"}`}
                  >
                    JD
                  </button>
                  <button
                    onClick={() => setInputType("resume")}
                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full transition-all ${inputType === "resume" ? "bg-[#bef264] text-black shadow-lg" : "dark:text-zinc-500 text-gray-500 hover:text-zinc-300"}`}
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => setInputType("both")}
                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full transition-all ${inputType === "both" ? "bg-[#bef264] text-black shadow-lg" : "dark:text-zinc-500 text-gray-500 hover:text-zinc-300"}`}
                  >
                    Both
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {(inputType === "jobDescription" || inputType === "both") && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                      Job Description
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows="4"
                      placeholder="Paste the job description here..."
                      className="w-full p-4 bg-black border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-[#bef264] transition-all outline-none resize-none text-[13px] font-medium dark:placeholder-zinc-700 placeholder-gray-500 shadow-sm"
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
                      rows="4"
                      placeholder="Paste your core resume points here..."
                      className="w-full p-4 bg-black border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-[#bef264]/50 transition-all outline-none resize-none text-[13px] font-medium dark:placeholder-zinc-700 placeholder-gray-500 shadow-sm"
                    ></textarea>
                  </div>
                )}
              </div>
            </div>

            <hr className="dark:border-white/5 border-black/5" />

            {/* Experience Level */}
            <div className="relative space-y-4" ref={experienceDropdownRef}>
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                Experience level
              </label>
              <button
                type="button"
                onClick={() => setIsExperienceDropdownOpen(!isExperienceDropdownOpen)}
                className="w-full flex items-center justify-between px-5 py-4 bg-black border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-[#bef264] outline-none text-[13px] font-bold shadow-sm transition-all cursor-pointer hover:border-zinc-700"
              >
                <span>
                  {
                    [
                      { value: "Junior", label: "Entry Level" },
                      { value: "Mid-Level", label: "Mid-Level Associate" },
                      { value: "Senior", label: "Senior Professional" },
                      { value: "Architect", label: "Architect / Lead" }
                    ].find((level) => level.value === (interviewData.level || "Junior"))?.label
                  }
                </span>
                <FiChevronDown className={`transition-transform duration-300 text-zinc-500 ${isExperienceDropdownOpen ? "rotate-180" : ""}`} />
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
                        handleInputChange({ target: { name: "level", value: level.value } });
                        setIsExperienceDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3.5 text-[13px] transition-all cursor-pointer ${(interviewData.level || "Junior") === level.value
                        ? "bg-[#bef264/10 text-[#bef264] font-black"
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
            <div className="space-y-4">
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
              <div className="grid grid-cols-2 gap-3 transition-all duration-300">
                {interviewAgents
                  .slice(0, showAllAgents ? undefined : 4)
                  .map((agent) => (
                    <div
                      key={agent.name}
                      onClick={() =>
                        setInterviewData((p) => ({
                          ...p,
                          agentName: agent.name,
                          agentVoiceProvider: agent.provider,
                          agentVoiceId: agent.voiceId,
                        }))
                      }
                      style={{
                        borderColor:
                          interviewData.agentName === agent.name
                            ? `#${agent.bg}`
                            : "transparent",
                        backgroundColor:
                          interviewData.agentName === agent.name
                            ? `#${agent.bg}15`
                            : "transparent",
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${interviewData.agentName === agent.name
                        ? "shadow-lg shadow-black/20"
                        : "border-zinc-800 bg-black hover:border-zinc-700 opacity-70 hover:opacity-100"
                        }`}
                    >
                      <div
                        className={`relative rounded-full p-0.5 transition-all ${interviewData.agentName === agent.name
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
                          className={`w-10 h-10 rounded-full object-cover border-2 ${interviewData.agentName === agent.name
                            ? "border-zinc-950"
                            : "border-transparent"
                            }`}
                        />
                      </div>
                      <div>
                        <p
                          className="text-[12px] font-black dark:text-white text-black transition-colors"
                          style={{
                            color:
                              interviewData.agentName === agent.name
                                ? `#${agent.bg}`
                                : "",
                          }}
                        >
                          {agent.name}
                        </p>
                        <p className="text-[9px] dark:text-zinc-500 text-gray-500 font-black uppercase tracking-tight">
                          {agent.label} Voice
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <hr className="dark:border-white/5 border-black/5" />

            {/* Interview Types */}
            <div className="space-y-4">
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                Interview Type
              </label>
              <div className="space-y-3">
                {/* Technical */}
                <button
                  onClick={() => setInterviewData((p) => ({ ...p, interviewType: "technical" }))}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-300 group ${interviewData.interviewType === "technical" ? "border-[#bef264] bg-[#bef264]/10 text-white shadow-xl shadow-[#bef264]/5" : "border-zinc-800 bg-black hover:border-zinc-700 text-zinc-400"}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-sm border-2 transition-all ${interviewData.interviewType === "technical" ? "bg-[#bef264] border-[#bef264] scale-110" : "bg-transparent border-zinc-700 group-hover:border-zinc-500"}`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[13px] font-black transition-colors ${interviewData.interviewType === "technical" ? "text-white" : "group-hover:text-zinc-200"}`}>
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
                  onClick={() => setInterviewData((p) => ({ ...p, interviewType: "behavioral" }))}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-300 group ${interviewData.interviewType === "behavioral" ? "border-[#bef264] bg-[#bef264]/10 text-white shadow-xl shadow-[#bef264]/5" : "border-zinc-800 bg-black hover:border-zinc-700 text-zinc-400"}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-sm border-2 transition-all ${interviewData.interviewType === "behavioral" ? "bg-[#bef264] border-[#bef264] scale-110" : "bg-transparent border-zinc-700 group-hover:border-zinc-500"}`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[13px] font-black transition-colors ${interviewData.interviewType === "behavioral" ? "text-white" : "group-hover:text-zinc-200"}`}>
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

            <div className="pt-2">
              <button
                onClick={startInterview}
                disabled={loading}
                className={`w-full px-10 ${subscription && subscription.tier !== 'Elite' && subscription.credits.interviews <= 0 ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-[#bef264] hover:bg-[#bef264]/90 text-black'} cursor-pointer font-black py-4 rounded-2xl transition-all inline-flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[#bef264]/10 active:scale-95 group`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Starting Interview...
                  </>
                ) : subscription && subscription.tier !== 'Elite' && subscription.credits.interviews <= 0 ? (
                  <>
                    Pay as you go
                    <FiCreditCard size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    Start Session
                    <FiArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
