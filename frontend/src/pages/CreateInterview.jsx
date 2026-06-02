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
  FiEdit2,
  FiSave,
  FiPlay,
  FiCreditCard,
  FiVolume2,
  FiUpload,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";
import { CheckmarkIcon, toast } from "react-hot-toast";
import { useInterview } from "../context/InterviewContext";
import { useUser, useAuth } from "@clerk/clerk-react";
import usePollyTTS from "../hooks/usePollyTTS";
import { FEATURE_COSTS } from "../constants/pricing";
import UniversalPopup from "../components/common/UniversalPopup";
import Skeleton from "../components/common/Skeleton";
import { Check } from "lucide-react";

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

const presetSkills = [
  "SQL",
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "Html/CSS",
  "C++",
  "DSA",
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
  const [interviewMode, setInterviewMode] = useState("roleBased"); // 'roleBased', 'skillsBased'
  const [inputType, setInputType] = useState("both"); // 'resume', 'jobDescription', 'both'
  const [skillsSourceType, setSkillsSourceType] = useState("both"); // 'resume', 'jobDescription', 'both'
  const [jobDescription, setJobDescription] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [resumeContent, setResumeContent] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [duration, setDuration] = useState(10); // 5, 10, 15, 20 minutes
  const [showAllAgents, setShowAllAgents] = useState(false);
  const [isExperienceDropdownOpen, setIsExperienceDropdownOpen] =
    useState(false);
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [presetName, setPresetName] = useState("");
  const [isPresetLoading, setIsPresetLoading] = useState(false);
  const [isPresetSaving, setIsPresetSaving] = useState(false);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [mobileStage, setMobileStage] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeTtsAgent, setActiveTtsAgent] = useState("");
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const { speakText, stopSpeaking } = usePollyTTS();

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

  useEffect(() => {
    if (interviewMode === "skillsBased") {
      setInterviewData((prev) => ({ ...prev, interviewType: "technical" }));
    }
  }, [interviewMode, setInterviewData]);

  const playVoiceSample = async (agent, e = null) => {
    if (e) e.stopPropagation();

    if (isTtsLoading && activeTtsAgent === agent.name) {
      return;
    }

    try {
      setIsTtsLoading(true);
      setActiveTtsAgent(agent.name);
      const text = `Hi, I am ${agent.name}. I'll be your interviewer today.`;
      await speakText(text, agent.name);
    } catch (err) {
      console.error("Voice preview error:", err);
      showErrorToast(err, "Voice preview unavailable. Please try again.");
    } finally {
      setIsTtsLoading(false);
    }
  };

  const localVideoRef = useRef(null);
  const experienceDropdownRef = useRef(null);
  const jobTitleSliderRef = useRef(null);
  const presetSliderRef = useRef(null);
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

    const fetchPresets = async () => {
      try {
        setIsPresetLoading(true);
        const token = await getToken();
        if (!token) return;

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/custom-interview/presets`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setPresets(response.data?.presets || []);
      } catch (err) {
        console.error("Error fetching interview presets:", err);
        showErrorToast(err, "Unable to fetch interview presets.");
      } finally {
        setIsPresetLoading(false);
      }
    };

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
        showErrorToast(err, "Unable to fetch subscription details.");
      }
    };

    fetchPresets();
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
          clearFieldError("cameraMic");
        } catch (err) {
          console.error("Camera access denied:", err);
          setIsCameraEnabled(false);
          showErrorToast(
            err,
            "Could not access camera. Please check permissions.",
          );
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

    if (name === "role" && value.trim()) {
      clearFieldError("role");
    }

    if (name === "level" && value) {
      clearFieldError("level");
    }

    if (name === "interviewType" && value) {
      clearFieldError("interviewType");
    }
  };

  const availableCredits =
    (subscription?.credits || 0) + (subscription?.topupCredits || 0);

  const normalizeSkill = (value) =>
    value
      .trim()
      .replace(/\s+/g, " ")
      .replace(/^,+|,+$/g, "");

  const addSkill = (value) => {
    const normalized = normalizeSkill(value);
    if (!normalized) return;

    setSkills((prev) => {
      if (
        prev.some((item) => item.toLowerCase() === normalized.toLowerCase())
      ) {
        return prev;
      }
      return [...prev, normalized];
    });
  };

  const removeSkill = (value) => {
    setSkills((prev) => prev.filter((item) => item !== value));
  };

  const handleSkillInputKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== ",") {
      return;
    }

    event.preventDefault();
    if (!skillInput.trim()) {
      return;
    }

    addSkill(skillInput);
    setSkillInput("");
  };

  const addSkillFromInput = () => {
    if (!skillInput.trim()) {
      return;
    }

    const rawValues = skillInput.split(",");
    rawValues.forEach((value) => addSkill(value));
    setSkillInput("");
    clearFieldError("skills");
  };

  const togglePresetSkill = (value) => {
    const exists = skills.some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );

    if (exists) {
      setSkills((prev) =>
        prev.filter((item) => item.toLowerCase() !== value.toLowerCase()),
      );
      return;
    }

    addSkill(value);
    clearFieldError("skills");
  };

  const buildPresetPayload = () => ({
    name: presetName.trim(),
    interviewMode,
    role: interviewData?.role || "",
    level: interviewData?.level || "Junior",
    interviewType: interviewData?.interviewType || "technical",
    inputType,
    skillsSourceType,
    skills,
    jobDescription,
    resumeContent,
    resumeFileName,
    duration,
    agentName: interviewData?.agentName || "",
    agentVoiceProvider: interviewData?.agentVoiceProvider || "",
    agentVoiceId: interviewData?.agentVoiceId || "",
  });

  const applyPresetToForm = (preset) => {
    if (!preset) return;

    setInterviewMode(preset.interviewMode || "roleBased");
    setInputType(preset.inputType || "both");
    setSkillsSourceType(preset.skillsSourceType || "both");
    setSkills(Array.isArray(preset.skills) ? preset.skills : []);
    setSkillInput("");
    setJobDescription(preset.jobDescription || "");
    setResumeContent(preset.resumeContent || "");
    setResumeFileName(preset.resumeFileName || "");
    setDuration(preset.duration || 10);

    setInterviewData((prev) => ({
      ...prev,
      role: preset.role || "",
      level: preset.level || "Junior",
      interviewType: preset.interviewType || "technical",
      agentName: preset.agentName || "",
      agentVoiceProvider: preset.agentVoiceProvider || "",
      agentVoiceId: preset.agentVoiceId || "",
    }));
  };

  const handleSelectPreset = (presetId) => {
    if (selectedPresetId === presetId) {
      setSelectedPresetId("");
      setPresetName("");
      setInterviewMode("roleBased");
      setInputType("both");
      setSkillsSourceType("both");
      setSkills([]);
      setSkillInput("");
      setJobDescription("");
      setResumeContent("");
      setResumeFileName("");
      setDuration(10);
      setInterviewData((prev) => ({
        ...prev,
        role: "",
        level: "Junior",
        interviewType: "technical",
        agentName: "",
        agentVoiceProvider: "",
        agentVoiceId: "",
      }));
      toast.success("Preset removed from active selection.");
      return;
    }

    setSelectedPresetId(presetId);

    const selectedPreset = presets.find((preset) => preset._id === presetId);
    if (!selectedPreset) {
      setPresetName("");
      return;
    }

    setPresetName(selectedPreset.name || "");
    applyPresetToForm(selectedPreset);
    toast.success("Preset applied.");
  };

  const savePreset = async ({ isUpdate = false, customName = "" } = {}) => {
    const resolvedName = (customName || presetName || "").trim();

    if (!resolvedName) {
      toast.error("Please enter a preset name.");
      return false;
    }

    if (isUpdate && !selectedPresetId) {
      toast.error("Please select a preset to update.");
      return false;
    }

    try {
      setIsPresetSaving(true);
      const token = await getToken();
      if (!token) return false;

      const payload = {
        ...buildPresetPayload(),
        name: resolvedName,
      };
      let response;
      let nextSelectedId = selectedPresetId;

      if (isUpdate) {
        response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/custom-interview/presets/${selectedPresetId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const updatedPreset = response.data?.preset;
        nextSelectedId = updatedPreset._id;
        setPresets((prev) =>
          prev.map((item) =>
            item._id === updatedPreset._id ? updatedPreset : item,
          ),
        );
        toast.success("Preset updated.");
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/custom-interview/presets`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const createdPreset = response.data?.preset;
        setPresets((prev) => [createdPreset, ...prev]);
        setSelectedPresetId(createdPreset._id);
        nextSelectedId = createdPreset._id;
        toast.success("Preset saved.");
      }

      setPresetName(resolvedName);

      return nextSelectedId;
    } catch (error) {
      showErrorToast(error, "Unable to save interview preset.");
      return false;
    } finally {
      setIsPresetSaving(false);
    }
  };

  const deleteSelectedPreset = async () => {
    if (!selectedPresetId) {
      toast.error("Select a preset to delete.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this preset? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setIsPresetSaving(true);
      const token = await getToken();
      if (!token) return;

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/custom-interview/presets/${selectedPresetId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setPresets((prev) =>
        prev.filter((item) => item._id !== selectedPresetId),
      );
      setSelectedPresetId("");
      setPresetName("");
      toast.success("Preset deleted.");
    } catch (error) {
      showErrorToast(error, "Unable to delete interview preset.");
    } finally {
      setIsPresetSaving(false);
    }
  };

  const openSavePresetModal = () => {
    setPresetName(
      interviewData?.role?.trim() ? `${interviewData.role} preset` : "",
    );
    setShowSavePresetModal(true);
  };

  const handleSavePresetAndContinue = async () => {
    const saved = await savePreset({
      isUpdate: false,
      customName: presetName,
    });
    if (!saved) return;

    setShowSavePresetModal(false);
    toast.success("Preset saved. You can now start the session.");
  };

  const handlePrimaryPresetAction = async () => {
    if (selectedPresetId) {
      await savePreset({ isUpdate: true });
      return;
    }

    openSavePresetModal();
  };

  const visiblePresets = presets.filter(
    (preset) => (preset?.interviewMode || "roleBased") === interviewMode,
  );
  const canUpdateSelectedPreset = visiblePresets.some(
    (preset) => preset._id === selectedPresetId,
  );

  useEffect(() => {
    if (selectedPresetId && !canUpdateSelectedPreset) {
      setSelectedPresetId("");
    }
  }, [selectedPresetId, canUpdateSelectedPreset]);

  const isResumeRequired =
    interviewMode === "roleBased"
      ? inputType === "resume" || inputType === "both"
      : skillsSourceType === "resume" || skillsSourceType === "both";

  const isJobDescriptionRequired =
    interviewMode === "roleBased"
      ? inputType === "jobDescription" || inputType === "both"
      : skillsSourceType === "jobDescription" || skillsSourceType === "both";

  const isSkillsRequired = interviewMode === "skillsBased";

  const validateFormBeforeStart = () => {
    const nextErrors = {};
    const hasResumeContent = Boolean(resumeContent.trim());
    const hasJobDescription = Boolean(jobDescription.trim());
    const hasSkills = skills.length > 0;

    if (!interviewData?.role?.trim()) {
      nextErrors.role = "Job title is required.";
    }

    if (!interviewData?.level) {
      nextErrors.level = "Experience level is required.";
    }

    if (!interviewData?.agentName) {
      nextErrors.agentName = "Please select an interviewer.";
    }

    if (!isCameraEnabled || !isMicEnabled) {
      nextErrors.cameraMic = "Enable both camera and microphone to start.";
    }

    if (isSkillsRequired && !hasSkills) {
      nextErrors.skills = "Add at least one skill for skills-based interviews.";
    }

    if (isJobDescriptionRequired && !hasJobDescription) {
      nextErrors.jobDescription =
        "Job description is required for the selected source.";
    }

    if (isResumeRequired && !hasResumeContent) {
      nextErrors.resumeContent =
        "Resume content is required. Upload and parse your resume PDF.";
    }

    if (!duration) {
      nextErrors.duration = "Please choose interview duration.";
    }

    setFieldErrors(nextErrors);

    const firstError = Object.values(nextErrors)[0];
    if (firstError) {
      toast.error(firstError);
      return false;
    }

    return true;
  };

  const startInterviewSession = async () => {
    if (
      subscription &&
      subscription.tier !== "Infinite Elite" &&
      availableCredits < FEATURE_COSTS.mockInterview
    ) {
      toast.error(
        `You need at least ${FEATURE_COSTS.mockInterview} credits to start an interview. Redirecting to billing...`,
      );
      setTimeout(() => navigate("/billing"), 2000);
      return;
    }

    if (!validateFormBeforeStart()) {
      return;
    }

    const hasResumeContent = Boolean(resumeContent.trim());
    const hasJobDescription = Boolean(jobDescription.trim());

    const hasSkills = skills.length > 0;
    let combinedContent = "";
    let sourceType = "";

    if (interviewMode === "roleBased") {
      if (inputType === "resume") {
        if (!hasResumeContent) {
          toast.error("Please upload and parse your resume PDF first.");
          return;
        }
        combinedContent = `Resume: ${resumeContent}`;
        sourceType = "resume";
      } else if (inputType === "jobDescription") {
        if (!hasJobDescription) {
          toast.error("Please provide job description content.");
          return;
        }
        combinedContent = `Job Description: ${jobDescription}`;
        sourceType = "job-description";
      } else {
        if (!hasResumeContent && !hasJobDescription) {
          toast.error("Please provide resume or job description content.");
          return;
        }
        if (hasResumeContent) combinedContent += `Resume: ${resumeContent}\n`;
        if (hasJobDescription)
          combinedContent += `Job Description: ${jobDescription}`;
        sourceType = "resume-job-description";
      }

      if (!combinedContent.trim()) {
        toast.error("Please provide resume or job description content.");
        return;
      }
    } else {
      if (!hasSkills) {
        toast.error(
          "Please add at least one skill for a skills-based interview.",
        );
        return;
      }

      const skillsLine = `Skills Focus: ${skills.join(", ")}`;

      if (skillsSourceType === "resume") {
        if (!hasResumeContent) {
          toast.error("Please upload and parse your resume PDF first.");
          return;
        }
        combinedContent = `${skillsLine}\n\nResume: ${resumeContent}`;
        sourceType = "skills-resume";
      } else if (skillsSourceType === "jobDescription") {
        if (!hasJobDescription) {
          toast.error("Please provide job description content.");
          return;
        }
        combinedContent = `${skillsLine}\n\nJob Description: ${jobDescription}`;
        sourceType = "skills-job-description";
      } else {
        if (!hasResumeContent && !hasJobDescription) {
          toast.error("Please provide resume or job description content.");
          return;
        }
        if (hasResumeContent) combinedContent += `Resume: ${resumeContent}\n`;
        if (hasJobDescription)
          combinedContent += `Job Description: ${jobDescription}`;
        combinedContent = `${skillsLine}\n\n${combinedContent.trim()}`;
        sourceType = "skills-resume-job-description";
      }
    }

    const finalInterviewData = {
      ...interviewData,
      content: combinedContent,
      interviewMode,
      sourceType,
      skills,
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
      toast.success(
        "Interview initialized successfully. Launching your session...",
      );

      navigate(`/interviews/${newSessionId}`, {
        state: {
          systemPrompt,
          isCustom: true,
          duration: serverDuration || duration,
        },
      });
    } catch (error) {
      console.error(error);
      showErrorToast(error, "Failed to initialize custom interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setFieldErrors((prev) => ({
        ...prev,
        resumeContent: "Only PDF files are supported.",
      }));
      toast.error("Please upload a PDF file only.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        resumeContent: "Resume PDF must be 5MB or smaller.",
      }));
      toast.error("Resume PDF must be 5MB or smaller.");
      return;
    }

    try {
      setIsParsingResume(true);
      setResumeFileName(selectedFile.name);
      setResumeContent("");

      const token = await getToken();
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/custom-interview/parse-resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const parsedText = response.data?.resumeText?.trim() || "";
      if (!parsedText) {
        setResumeContent("");
        setFieldErrors((prev) => ({
          ...prev,
          resumeContent:
            "Resume was parsed but no readable text was found. Please upload a clearer PDF.",
        }));
        toast.error(
          "422: Resume parsed but no readable text was found. Please upload a clearer PDF.",
        );
        return;
      }

      setResumeContent(parsedText);
      setResumeFileName(response.data.fileName || selectedFile.name);
      clearFieldError("resumeContent");
      toast.success("Resume parsed successfully and ready to use.");
    } catch (error) {
      setResumeContent("");
      setResumeFileName("");
      setFieldErrors((prev) => ({
        ...prev,
        resumeContent:
          "Resume parsing failed. Please try another PDF or retry upload.",
      }));
      showErrorToast(error, "Failed to parse resume PDF.");
    } finally {
      setIsParsingResume(false);
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

  const scrollPresetSlider = (direction) => {
    if (presetSliderRef.current) {
      const scrollAmount = 220;
      presetSliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const toggleMic = () => {
    setIsMicEnabled((prev) => {
      const next = !prev;
      if (next && isCameraEnabled) {
        clearFieldError("cameraMic");
      }
      return next;
    });
  };

  const toggleVideo = () => {
    setIsCameraEnabled((prev) => {
      const next = !prev;
      if (next && isMicEnabled) {
        clearFieldError("cameraMic");
      }
      return next;
    });
  };

  const canProceedToForm = isCameraEnabled && isMicEnabled;
  const canStartInterview = isCameraEnabled && isMicEnabled;
  const isCreditBlocked =
    subscription &&
    subscription.tier !== "Infinite Elite" &&
    availableCredits < FEATURE_COSTS.mockInterview;
  const isCompactMobileForm = isSmallScreen && mobileStage === 2;
  const hasParsedResume = Boolean(resumeContent.trim()) && !isParsingResume;

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
              <h1 className="text-xl md:text-3xl  text-white  ">
                Ace your <span className="text-[#bef264] italic">Job</span>{" "}
                Interview
              </h1>
              <p className="text-zinc-300 text-sm  leading-relaxed max-w-full">
                Prepare for your dream job with real-time AI feedback. Practice
                speaking in a professional environment with our advanced AI
                interviewers.
              </p>
            </div>

            <div className="relative aspect-video bg-zinc-950 rounded-xl sm:rounded-2xl border-y  border-[#bef264] overflow-hidden group shadow-2xl shadow-white/20">
              {isCameraEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover mirror rounded-xl sm:rounded-2xl"
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
              <div className="absolute hidden  bottom-2 sm:bottom-2 left-1/2 -translate-x-1/2 sm:flex items-center gap-2 bg-zinc-900/80 backdrop-blur-2xl p-2   border border-white/10 transition-all duration-300 shadow-2xl hover:bg-zinc-900">
                <button
                  onClick={toggleMic}
                  className={`p-3 sm:px-6 sm:py-3 rounded-lg sm:rounded-sm transition-all cursor-pointer ${!isMicEnabled ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 hover:bg-white/10 text-white"}`}
                >
                  {!isMicEnabled ? (
                    <FiMicOff className="text-sm sm:text-lg" />
                  ) : (
                    <FiMic className="text-sm sm:text-lg" />
                  )}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 sm:px-6 sm:py-3 rounded-lg sm:rounded-sm transition-all cursor-pointer ${!isCameraEnabled ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 hover:bg-white/10 text-white"}`}
                >
                  {!isCameraEnabled ? (
                    <FiVideoOff className="text-sm sm:text-lg" />
                  ) : (
                    <FiVideo className="text-sm sm:text-lg" />
                  )}
                </button>
              </div>

              <div className="absolute top-1 sm:top-6 left-1 sm:left-6 flex items-center space-x-2 bg-zinc-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <div
                  className={`w-2 h-2 rounded-full ${isCameraEnabled && isMicEnabled ? "bg-[#bef264] animate-pulse" : "bg-red-500"}`}
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
                onClick={toggleMic}
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
                className={`w-full py-3 rounded-2xl  font-black  tracking-wider text-sm transition-all ${canProceedToForm ? "bg-[#bef264] text-black shadow-xl shadow-[#bef264]/20" : "bg-zinc-800 text-zinc-400 cursor-not-allowed"}`}
              >
                {canProceedToForm
                  ? "Proceed to Interview Details"
                  : "Enable Camera & Mic"}
              </button>
            )}

            <div className="sm:dark:bg-white/10 sm:bg-white p-3 sm:p-7 shadow-xl rounded-2xl sm:border dark:border-white/5 border-gray-100 ring-1 ring-black/5">
              <h3 className="text-sm font-bold dark:text-white text-black mb-3 flex items-center uppercase tracking-widest">
                <FiShield className="mr-3 text-[#bef264] text-xl" />
                Professional Environment
              </h3>
              <p className="text-[13px] dark:text-zinc-400 text-gray-600 leading-relaxed font-medium">
                Ensure you are in a quiet room with good lighting. Our AI
                interviewer will analyze both your tone and content to provide
                detailed feedback.
              </p>
            </div>
          </div>

          {/* Setup Form */}
          <div
            className={`w-full lg:w-[500px] flex flex-col animate-fade-in-right ${isSmallScreen && mobileStage === 1 ? "hidden" : ""} ${isCompactMobileForm ? "gap-3 px-1" : "gap-4 px-2"}`}
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

            <div className="rounded-2xl border border-zinc-800/80 bg-white/10 backdrop-blur-xl px-4 py-3 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#bef264]">
                    Session Setup
                  </p>
                  <h2
                    className={`${isCompactMobileForm ? "text-base" : "text-lg"} font-extrabold text-zinc-100 mt-1 tracking-tight`}
                  >
                    Interview details
                  </h2>
                </div>
              </div>
              <p
                className={`text-zinc-400 ${isCompactMobileForm ? "text-xs" : "text-sm"} font-medium mt-1`}
              >
                Give the job details you want to prepare for
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800 px-6 py-4">
                <h2 className="text-lg font-semibold text-zinc-100">
                  Interview Configuration
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Configure your interview parameters
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Interview Mode */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wide">
                    Interview Mode
                  </label>
                  <div className="inline-flex rounded-lg p-1 bg-zinc-900 border border-zinc-800">
                    <button
                      onClick={() => setInterviewMode("roleBased")}
                      className={`px-4 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
                        interviewMode === "roleBased"
                          ? "bg-[#bef264] text-zinc-900 shadow-lg shadow-[#bef264]/20"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Role-based
                    </button>
                    <button
                      onClick={() => setInterviewMode("skillsBased")}
                      className={`px-4 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
                        interviewMode === "skillsBased"
                          ? "bg-[#bef264] text-zinc-900 shadow-lg shadow-[#bef264]/20"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Skills-based
                    </button>
                  </div>
                </div>

                {/* Saved Presets */}
                {(isPresetLoading || visiblePresets.length > 0) && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-zinc-300 uppercase tracking-wide">
                        Saved Presets
                      </label>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          {visiblePresets.length} preset
                          {visiblePresets.length !== 1 ? "s" : ""}
                        </span>
                        <button
                          type="button"
                          onClick={deleteSelectedPreset}
                          disabled={isPresetSaving || !selectedPresetId}
                          className="px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {isPresetLoading ? (
                      <div className="space-y-3">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                          {[1, 2, 3].map((item) => (
                            <div key={item} className="flex-shrink-0 w-64">
                              <Skeleton className="h-32 w-full rounded-xl bg-zinc-800/50" />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-500 font-medium">
                          Loading presets...
                        </p>
                      </div>
                    ) : visiblePresets.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 p-6 text-center">
                        <p className="text-sm text-zinc-400 font-medium">
                          No saved presets yet. Configure the form, then use
                          Save Preset.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div
                          ref={presetSliderRef}
                          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                        >
                          {visiblePresets.map((preset) => {
                            const isSelected = selectedPresetId === preset._id;
                            return (
                              <button
                                key={preset._id}
                                type="button"
                                onClick={() => handleSelectPreset(preset._id)}
                                className={`flex-shrink-0 w-64 text-left p-4 rounded-xl border transition-all duration-200 ${
                                  isSelected
                                    ? "border-[#bef264]/70 bg-[#bef264]/10 shadow-lg shadow-[#bef264]/5"
                                    : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-900"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h4
                                    className={`text-sm font-bold truncate ${
                                      isSelected
                                        ? "text-[#d9f99d]"
                                        : "text-zinc-100"
                                    }`}
                                  >
                                    {preset.name}
                                  </h4>
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                      isSelected
                                        ? "border-[#d9f99d]/70"
                                        : "border-zinc-600"
                                    }`}
                                  >
                                    {isSelected && (
                                      <div className="w-2 h-2 rounded-full bg-[#d9f99d]" />
                                    )}
                                  </div>
                                </div>
                                <div
                                  className={`space-y-1.5 text-xs font-medium ${
                                    isSelected
                                      ? "text-zinc-200"
                                      : "text-zinc-400"
                                  }`}
                                >
                                  <p className="truncate">
                                    Role: {preset.role || "Not set"}
                                  </p>
                                  <p>Duration: {preset.duration || 10} min</p>
                                  <p>
                                    Source:{" "}
                                    {preset.interviewMode === "skillsBased"
                                      ? preset.skillsSourceType
                                      : preset.inputType}
                                  </p>
                                  <p className="truncate">
                                    Interviewer: {preset.agentName || "Not set"}
                                  </p>
                                  {preset.interviewMode === "skillsBased" && (
                                    <p className="truncate">
                                      Skills:{" "}
                                      {preset.skills?.length
                                        ? preset.skills.join(", ")
                                        : "None"}
                                    </p>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {visiblePresets.length > 2 && (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => scrollPresetSlider("left")}
                              className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all"
                            >
                              <FiChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => scrollPresetSlider("right")}
                              className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all"
                            >
                              <FiChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <hr className="border-zinc-800" />

                {/* Job Title */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wide">
                    Job Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="role"
                    value={interviewData?.role || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Frontend Developer"
                    className={`w-full px-4 py-2.5 text-sm bg-zinc-900 border rounded-xl transition-all outline-none ${
                      fieldErrors.role
                        ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-zinc-700 focus:border-[#bef264]/70 focus:ring-2 focus:ring-[#bef264]/20"
                    } text-zinc-100 placeholder-zinc-500 font-medium`}
                  />
                  {fieldErrors.role && (
                    <p className="text-xs font-medium text-red-400">
                      {fieldErrors.role}
                    </p>
                  )}

                  {/* Job Title Suggestions */}
                  <div className="relative group/slider">
                    <div
                      ref={jobTitleSliderRef}
                      className="flex gap-2 overflow-x-auto px-8 w-[85%] mx-auto py-1 no-scrollbar snap-x snap-mandatory"
                    >
                      {jobTitles.map((title) => (
                        <button
                          key={title}
                          onClick={() =>
                            handleInputChange({
                              target: { name: "role", value: title },
                            })
                          }
                          className={`flex-shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 snap-start ${
                            interviewData.role === title
                              ? "bg-[#bef264]/15 border-[#bef264]/70 text-[#d9f99d] shadow-lg shadow-[#bef264]/5"
                              : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                          }`}
                        >
                          {title}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => scrollSlider("left")}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 text-[#bef264] hover:bg-zinc-700 flex items-center justify-center transition-all shadow-lg "
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => scrollSlider("right")}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 text-[#bef264] hover:bg-zinc-700 flex items-center justify-center transition-all shadow-lg  "
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <hr className="border-zinc-800" />

                {/* Context Source */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wide">
                    {interviewMode === "roleBased"
                      ? "Context Source"
                      : "Skills & Context Source"}{" "}
                    <span className="text-red-400">*</span>
                  </label>

                  {interviewMode === "roleBased" ? (
                    <div className="inline-flex rounded-lg p-1 bg-zinc-900 border border-zinc-800">
                      {["jobDescription", "resume", "both"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setInputType(type)}
                          className={`px-4 py-1 text-[11px] font-semibold rounded-md transition-all duration-200 uppercase tracking-wide ${
                            inputType === type
                              ? "bg-[#bef264] text-zinc-900 shadow-lg shadow-[#bef264]/20"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {type === "jobDescription"
                            ? "JD"
                            : type === "resume"
                              ? "Resume"
                              : "Both"}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <>
                      {/* Skills Selection */}
                      <div
                        className={`rounded-xl border p-4 bg-zinc-900/70 ${
                          fieldErrors.skills
                            ? "border-red-500/70"
                            : "border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-medium text-zinc-300 uppercase tracking-wide">
                            Skills Focus <span className="text-red-400">*</span>
                          </label>
                          <span className="text-xs font-medium text-zinc-500">
                            Select preset or add custom
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {presetSkills.map((skill) => {
                            const isSelected = skills.some(
                              (item) =>
                                item.toLowerCase() === skill.toLowerCase(),
                            );
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => togglePresetSkill(skill)}
                                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 uppercase tracking-wide ${
                                  isSelected
                                    ? "bg-[#bef264]/15 border-[#bef264]/70 text-[#d9f99d]"
                                    : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                                }`}
                              >
                                {skill}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex gap-2 mb-3">
                          <input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillInputKeyDown}
                            placeholder="Add skills (e.g. SQL, joins, indexing)"
                            className="flex-1 px-4 py-2.5 text-sm bg-zinc-900 border border-zinc-700 rounded-xl focus:border-[#bef264]/70 focus:ring-2 focus:ring-[#bef264]/20 text-zinc-100 placeholder-zinc-500 outline-none font-medium"
                          />
                          <button
                            type="button"
                            onClick={addSkillFromInput}
                            className="px-4 py-2.5 text-sm font-semibold bg-zinc-800 border border-zinc-600 text-zinc-200 rounded-xl hover:border-zinc-500 transition-all uppercase tracking-wide"
                          >
                            Add
                          </button>
                        </div>

                        {skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#bef264]/10 border border-[#bef264]/50 text-[#bef264] rounded-full tracking-wider"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="hover:text-[#d9f99d] transition-colors"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-medium text-zinc-500">
                            No skills selected yet.
                          </p>
                        )}
                        {fieldErrors.skills && (
                          <p className="text-xs font-medium text-red-400 mt-2">
                            {fieldErrors.skills}
                          </p>
                        )}
                      </div>

                      <div className="inline-flex rounded-lg p-1 bg-zinc-900 border border-zinc-800">
                        {["jobDescription", "resume", "both"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setSkillsSourceType(type)}
                            className={`px-4 py-1 text-xs font-semibold rounded-md transition-all duration-200 uppercase tracking-wide ${
                              skillsSourceType === type
                                ? "bg-[#bef264] text-zinc-900 shadow-lg shadow-[#bef264]/20"
                                : "text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            {type === "jobDescription"
                              ? "JD"
                              : type === "resume"
                                ? "Resume"
                                : "Both"}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Job Description / Resume Inputs */}
                  <div className="space-y-3">
                    {((interviewMode === "roleBased" &&
                      (inputType === "jobDescription" ||
                        inputType === "both")) ||
                      (interviewMode === "skillsBased" &&
                        (skillsSourceType === "jobDescription" ||
                          skillsSourceType === "both"))) && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wide">
                          Job Description{" "}
                          <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => {
                            setJobDescription(e.target.value);
                            if (e.target.value.trim())
                              clearFieldError("jobDescription");
                          }}
                          rows={4}
                          placeholder="Paste the job description here..."
                          className={`w-full px-4 py-3 text-sm bg-zinc-900 border rounded-xl resize-none outline-none transition-all ${
                            fieldErrors.jobDescription
                              ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-zinc-700 focus:border-[#bef264]/70 focus:ring-2 focus:ring-[#bef264]/20"
                          } text-zinc-100 placeholder-zinc-500 font-medium`}
                        />
                        {fieldErrors.jobDescription && (
                          <p className="text-xs font-medium text-red-400">
                            {fieldErrors.jobDescription}
                          </p>
                        )}
                      </div>
                    )}

                    {((interviewMode === "roleBased" &&
                      (inputType === "resume" || inputType === "both")) ||
                      (interviewMode === "skillsBased" &&
                        (skillsSourceType === "resume" ||
                          skillsSourceType === "both"))) && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wide">
                          Resume PDF <span className="text-red-400">*</span>
                        </label>
                        <label
                          className={`flex items-center justify-between px-4 py-3 bg-zinc-900 border rounded-xl cursor-pointer transition-all ${
                            fieldErrors.resumeContent
                              ? "border-red-500/70"
                              : hasParsedResume
                                ? "border-[#bef264]/50 bg-[#bef264]/5"
                                : "border-zinc-700 hover:border-zinc-600"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${hasParsedResume ? "bg-[#bef264]/20" : "bg-[#bef264]/10"}`}
                            >
                              <FiUpload
                                className={`w-5 h-5 ${hasParsedResume ? "text-[#bef264]" : "text-[#bef264]/70"}`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-200">
                                {isParsingResume
                                  ? "Parsing your resume..."
                                  : hasParsedResume
                                    ? "Resume parsed successfully"
                                    : "Upload Resume PDF"}
                              </p>
                              <p className="text-xs font-medium text-zinc-500 mt-0.5 uppercase tracking-wide">
                                {resumeFileName
                                  ? resumeFileName
                                  : "PDF only, maximum 5MB"}
                              </p>
                            </div>
                          </div>

                          {isParsingResume ? (
                            <div className="w-5 h-5 border-2 border-zinc-600 border-t-[#bef264] rounded-full animate-spin" />
                          ) : hasParsedResume ? (
                            <FiCheckCircle className="w-5 h-5 text-[#bef264]" />
                          ) : null}

                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleResumeUpload}
                            disabled={isParsingResume}
                            className="hidden"
                          />
                        </label>

                        {!hasParsedResume && (
                          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                            <FiFileText className="text-zinc-600" />
                            <span>
                              Parsed resume data will appear after upload.
                            </span>
                          </div>
                        )}

                        {fieldErrors.resumeContent && (
                          <p className="text-xs font-medium text-red-400">
                            {fieldErrors.resumeContent}
                          </p>
                        )}

                        {hasParsedResume && (
                          <div className="space-y-2 animate-fadeIn">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-[#bef264] uppercase tracking-widest">
                                Parsed Resume Data
                              </label>
                              <span className="text-xs font-medium text-zinc-500">
                                Ready for interview context
                              </span>
                            </div>
                            <textarea
                              value={resumeContent}
                              readOnly
                              rows={4}
                              className="w-full px-4 py-3 text-sm bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-300 resize-none outline-none font-medium"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-zinc-800" />

                {/* Experience Level */}
                <div className="space-y-3" ref={experienceDropdownRef}>
                  <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wide">
                    Experience Level <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsExperienceDropdownOpen(!isExperienceDropdownOpen)
                      }
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm bg-zinc-900 border border-zinc-700 rounded-xl hover:border-zinc-600 transition-all outline-none focus:ring-2 focus:ring-[#bef264]/20 focus:border-[#bef264]/70"
                    >
                      <span className="text-zinc-100 font-medium">
                        {
                          [
                            { value: "Junior", label: "Entry Level" },
                            {
                              value: "Mid-Level",
                              label: "Mid-Level Associate",
                            },
                            { value: "Senior", label: "Senior Professional" },
                            { value: "Architect", label: "Architect / Lead" },
                          ].find(
                            (level) =>
                              level.value === (interviewData.level || "Junior"),
                          )?.label
                        }
                      </span>
                      <FiChevronDown
                        className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                          isExperienceDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isExperienceDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-zinc-950 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fadeIn">
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
                            className={`w-full text-left px-4 py-3 text-sm transition-all ${
                              (interviewData.level || "Junior") === level.value
                                ? "bg-[#bef264]/10 text-[#bef264] font-bold"
                                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                            }`}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-zinc-800" />

                {/* Interviewer Selection */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wide">
                    Select Interviewer <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {interviewAgents.map((agent) => (
                      <div
                        key={agent.name}
                        onClick={() => {
                          setInterviewData((p) => ({
                            ...p,
                            agentName: agent.name,
                            agentVoiceProvider: agent.provider,
                            agentVoiceId: agent.voiceId,
                          }));
                          clearFieldError("agentName");
                          playVoiceSample(agent);
                        }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          interviewData.agentName === agent.name
                            ? "shadow-lg shadow-black/30 scale-[1.02]"
                            : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-900"
                        }`}
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
                      >
                        <div
                          className="relative rounded-full p-0.5 transition-all duration-300"
                          style={{
                            background:
                              interviewData.agentName === agent.name
                                ? `linear-gradient(135deg, #${agent.bg}, #${agent.bg}88)`
                                : "transparent",
                            transform:
                              interviewData.agentName === agent.name
                                ? "scale(1.1)"
                                : "scale(1)",
                          }}
                        >
                          <img
                            src={agent.profileImage}
                            alt={agent.name}
                            className={`w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ring-offset-zinc-900 ${
                              interviewData.agentName === agent.name
                                ? "ring-zinc-200"
                                : "ring-zinc-700"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4
                              className="text-sm font-bold truncate transition-colors"
                              style={{
                                color:
                                  interviewData.agentName === agent.name
                                    ? `#${agent.bg}`
                                    : "#d4d4d8",
                              }}
                            >
                              {agent.name}
                            </h4>
                            <button
                              onClick={(e) => playVoiceSample(agent, e)}
                              disabled={
                                isTtsLoading && activeTtsAgent === agent.name
                              }
                              className={`p-2 rounded-lg transition-all ${
                                interviewData.agentName === agent.name
                                  ? "bg-white/10 text-white hover:bg-white/20"
                                  : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title="Play sample"
                            >
                              {isTtsLoading && activeTtsAgent === agent.name ? (
                                <FiLoader className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiVolume2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1 font-semibold uppercase tracking-wider">
                            {agent.label} Voice
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {fieldErrors.agentName && (
                    <p className="text-xs font-medium text-red-400">
                      {fieldErrors.agentName}
                    </p>
                  )}
                </div>

                <hr className="border-zinc-800" />

                {/* Interview Type */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wide">
                    Interview Type
                  </label>
                  <div className="space-y-3">
                    <button
                      onClick={() =>
                        setInterviewData((p) => ({
                          ...p,
                          interviewType: "technical",
                        }))
                      }
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 group ${
                        interviewData.interviewType === "technical"
                          ? "border-[#bef264]/70 bg-[#bef264]/10 shadow-lg shadow-[#bef264]/5"
                          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 transition-all ${
                          interviewData.interviewType === "technical"
                            ? "bg-[#bef264] border-[#bef264] scale-110"
                            : "border-zinc-700 group-hover:border-zinc-600"
                        }`}
                      >
                        {interviewData.interviewType === "technical" && (
                          <Check className="w-4 h-4 text-zinc-900" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-sm font-bold transition-colors ${
                              interviewData.interviewType === "technical"
                                ? "text-white"
                                : "text-zinc-300 group-hover:text-zinc-200"
                            }`}
                          >
                            Technical
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#bef264]/20 text-[#bef264] font-bold uppercase tracking-wider">
                            Problem solving
                          </span>
                        </div>
                        <p className="text-xs font-medium text-zinc-500">
                          Test your domain expertise and logic
                        </p>
                      </div>
                    </button>

                    {interviewMode === "roleBased" && (
                      <button
                        onClick={() =>
                          setInterviewData((p) => ({
                            ...p,
                            interviewType: "behavioral",
                          }))
                        }
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 group ${
                          interviewData.interviewType === "behavioral"
                            ? "border-violet-400/80 bg-violet-500/10 shadow-lg shadow-violet-500/5"
                            : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 transition-all ${
                            interviewData.interviewType === "behavioral"
                              ? "bg-violet-400 border-violet-400 scale-110"
                              : "border-zinc-700 group-hover:border-zinc-600"
                          }`}
                        >
                          {interviewData.interviewType === "behavioral" && (
                            <Check className="w-4 h-4 text-zinc-900" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-sm font-bold transition-colors ${
                                interviewData.interviewType === "behavioral"
                                  ? "text-white"
                                  : "text-zinc-300 group-hover:text-zinc-200"
                              }`}
                            >
                              Behavioral
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-400/20 text-violet-200 font-bold uppercase tracking-wider">
                              Soft skills
                            </span>
                          </div>
                          <p className="text-xs font-medium text-zinc-500">
                            Evaluate experiences and interpersonal skills
                          </p>
                        </div>
                      </button>
                    )}

                    {interviewMode === "skillsBased" && (
                      <p className="text-xs font-medium text-zinc-500">
                        Skills-based mode uses technical interview questions.
                      </p>
                    )}
                  </div>
                </div>

                <hr className="border-zinc-800" />

                {/* Interview Duration */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wide">
                    Interview Duration <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setDuration(mins)}
                        className={`py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 uppercase tracking-wide ${
                          duration === mins
                            ? "bg-[#bef264] text-zinc-900 shadow-lg shadow-[#bef264]/20"
                            : "bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
                        }`}
                      >
                        {mins} Min
                      </button>
                    ))}
                  </div>
                  {fieldErrors.duration && (
                    <p className="text-xs font-medium text-red-400">
                      {fieldErrors.duration}
                    </p>
                  )}
                  {fieldErrors.cameraMic && (
                    <p className="text-xs font-medium text-red-400">
                      {fieldErrors.cameraMic}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handlePrimaryPresetAction}
                    disabled={loading || isPresetSaving}
                    className={`px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] inline-flex items-center gap-2 ${
                      canUpdateSelectedPreset
                        ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-900 shadow-lg shadow-emerald-500/20"
                        : "bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200"
                    }`}
                  >
                    {loading || isPresetSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : canUpdateSelectedPreset ? (
                      <>
                        <FiEdit2 className="w-4 h-4" />
                        Update Preset
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        Save Preset
                      </>
                    )}
                  </button>

                  <button
                    onClick={startInterviewSession}
                    disabled={loading || isPresetSaving || !canStartInterview}
                    className="flex-1 px-6 py-3 bg-[#bef264] hover:bg-[#a3e635] text-zinc-900 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#bef264]/20 active:scale-[0.99] inline-flex items-center justify-center gap-2"
                  >
                    {!canStartInterview ? (
                      <>
                        <FiMicOff className="w-4 h-4" />
                        Enable Camera & Mic to Start
                      </>
                    ) : isCreditBlocked ? (
                      <>
                        <FiCreditCard className="w-4 h-4" />
                        Start Session (Get Credits)
                      </>
                    ) : (
                      <>
                        <FiPlay className="w-4 h-4" />
                        Start Session
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UniversalPopup
        isOpen={showSavePresetModal}
        onClose={() => setShowSavePresetModal(false)}
        title="Save Preset"
        description="Name this preset. After saving, use Start Session to begin the interview."
        maxWidth="max-w-md"
        padding="p-5"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowSavePresetModal(false)}
              disabled={isPresetSaving || loading}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-[11px] font-black uppercase tracking-wider hover:border-zinc-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePresetAndContinue}
              disabled={isPresetSaving || loading}
              className="px-4 py-2 rounded-xl bg-[#bef264] text-black text-[11px] font-black uppercase tracking-wider hover:bg-[#bef264]/90 disabled:opacity-50"
            >
              {isPresetSaving || loading ? "Saving..." : "Save Preset"}
            </button>
          </>
        }
      >
        <input
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="e.g. Frontend React Interview"
          className="w-full px-4 py-3 text-sm bg-black border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-[#bef264]/50 focus:border-[#bef264] transition-all outline-none font-bold placeholder-gray-600"
        />
      </UniversalPopup>
    </>
  );
};

export default CreateInterview;
