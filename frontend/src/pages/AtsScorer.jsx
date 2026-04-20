import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import FileUpload from "../components/ats/FileUpload";
import ScoreResult from "../components/ats/ScoreResult";
import {
  FiArrowRight,
  FiShield,
  FiCheckCircle,
  FiFileText,
  FiTarget,
  FiCpu,
  FiClock,
  FiChevronLeft,
} from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import { BsFillCloudUploadFill } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { FEATURE_COSTS } from "../constants/pricing";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const SCAN_STAGES = [
  {
    title: "Parsing resume",
    description:
      "Reading document structure, headings, and section boundaries.",
  },
  {
    title: "Matching role context",
    description: "Comparing your profile to the target job requirements.",
  },
  {
    title: "Evaluating ATS compatibility",
    description: "Checking formatting, keyword coverage, and parseability.",
  },
  {
    title: "Preparing action plan",
    description: "Building prioritized recommendations to improve your score.",
  },
];

const AtsScorer = () => {
  const { getToken } = useAuth();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mobileStage, setMobileStage] = useState(1);
  const [scanStageIndex, setScanStageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload your resume");
      return;
    }
    if (!jobDescription || jobDescription.trim().length < 20) {
      toast.error("Please provide a valid job description");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const response = await axios.post(
        `${backendURL}/api/ats/score`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setResult(response.data.data);
        toast.success("Analysis complete!");
      } else {
        toast.error("Failed to analyze resume");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "An error occurred during analysis",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let progressTimer;
    let elapsedTimer;

    if (loading) {
      setScanStageIndex(0);
      setElapsedSeconds(0);

      progressTimer = setInterval(() => {
        setScanStageIndex((prev) =>
          prev < SCAN_STAGES.length - 1 ? prev + 1 : prev,
        );
      }, 2200);

      elapsedTimer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (progressTimer) clearInterval(progressTimer);
      if (elapsedTimer) clearInterval(elapsedTimer);
    };
  }, [loading]);

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

  const handleNextStage = () => {
    setMobileStage(2);
  };

  const handleBackToSetup = () => {
    setMobileStage(1);
  };

  const isAnalyzeDisabled =
    !file || !jobDescription || jobDescription.trim().length < 20 || loading;
  const isCompactMobileForm = isSmallScreen && mobileStage === 2;
  const jdWordCount = jobDescription.trim()
    ? jobDescription.trim().split(/\s+/).length
    : 0;
  const scanProgress = Math.round(
    ((scanStageIndex + 1) / SCAN_STAGES.length) * 100,
  );

  return (
    <>
      <Helmet>
        <title>ATS Resume Scorer | PlaceMateAI</title>
      </Helmet>
      <div className="min-h-screen text-zinc-100 transition-colors selection:bg-[#bef264]/30 pb-20 px-3 md:px-4 pt-4 md:pt-6">
        <div
          className={`flex flex-col lg:flex-row items-start justify-center gap-7 lg:gap-10 mx-auto relative transition-all duration-700 ${result ? "max-w-7xl" : "max-w-6xl"}`}
        >
          {loading ? (
            <div className="w-full max-w-5xl mx-auto animate-in zoom-in-95 fade-in duration-500 mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/75 backdrop-blur-xl p-5 md:p-6 shadow-2xl shadow-black/25">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#bef264]">
                    ATS Scanner
                  </p>
                  <h2 className="text-2xl md:text-3xl font-black text-white mt-2 tracking-tight">
                    Scanning your resume
                  </h2>
                  <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                    We are running a detailed ATS check with job-description
                    matching. This usually takes a few seconds.
                  </p>

                  <div className="mt-5 p-4 rounded-2xl border border-white/10 bg-black/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Progress
                      </span>
                      <span className="text-xs font-black text-[#bef264]">
                        {scanProgress}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#bef264] transition-all duration-500"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <div className="mt-3 text-xs text-zinc-400 inline-flex items-center gap-1.5">
                      <FiClock size={12} className="text-[#bef264]" />
                      Elapsed: {elapsedSeconds}s
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {SCAN_STAGES.map((step, index) => {
                      const isCompleted = index < scanStageIndex;
                      const isActive = index === scanStageIndex;
                      return (
                        <div
                          key={step.title}
                          className={`rounded-xl border p-3 transition-all ${
                            isCompleted
                              ? "border-[#bef264]/30 bg-[#bef264]/10"
                              : isActive
                                ? "border-white/20 bg-white/[0.03]"
                                : "border-white/10 bg-transparent opacity-65"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {isCompleted ? (
                                <FiCheckCircle
                                  className="text-[#bef264]"
                                  size={16}
                                />
                              ) : isActive ? (
                                <div className="w-4 h-4 rounded-full border-2 border-[#bef264] border-t-transparent animate-spin" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-zinc-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-100">
                                {step.title}
                              </p>
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/75 backdrop-blur-xl p-5 md:p-6 shadow-2xl shadow-black/25 h-fit">
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-200 mb-4">
                    Scan Inputs
                  </h3>
                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">
                        Resume File
                      </p>
                      <p className="text-sm font-semibold text-zinc-100 truncate">
                        {file?.name || "Uploaded document"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">
                        Job Description
                      </p>
                      <p className="text-sm font-semibold text-zinc-100">
                        {jdWordCount} words provided
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">
                        Credits Used
                      </p>
                      <p className="text-sm font-semibold text-[#bef264]">
                        {FEATURE_COSTS.atsScanner} credits
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-3">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Tip: For better matching, include responsibilities, must
                      have skills, and tech stack in the job description.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : !result ? (
            <>
              <div
                className={`w-full lg:w-1/2 flex flex-col lg:sticky lg:top-16 h-fit space-y-4 sm:space-y-5 animate-in slide-in-from-left-8 fade-in duration-700 ${isSmallScreen && mobileStage === 2 ? "hidden" : ""}`}
              >
                <div className="space-y-3">
                  <div className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] block">
                    ATS Resume Scanner
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-[44px] font-black text-white  ">
                    Optimize your resume for
                  </h1>
                  <h1 className="text-2xl sm:text-3xl italic md:text-[44px] font-black text-[#bef264]   ">
                    ATS shortlisting
                  </h1>
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-md">
                    Compare your resume against a target role and get compact,
                    actionable feedback on missing keywords, formatting issues,
                    and content quality.
                  </p>
                </div>

                <div className="w-fit rounded-2xl border border-white/10 bg-black/30 p-2">
                  <img
                    src="/assets/resume-ats-check.png"
                    alt="Resume ATS check"
                    className="w-full max-w-md h-auto object-contain rounded-xl"
                  />
                </div>

                {isSmallScreen && mobileStage === 1 && (
                  <button
                    onClick={handleNextStage}
                    className="w-full py-3 rounded-2xl font-black tracking-wider text-sm transition-all bg-[#bef264] text-black shadow-xl shadow-[#bef264]/20"
                  >
                    Proceed to Setup
                  </button>
                )}

                <div className="sm:bg-black p-4 sm:p-6 shadow-xl sm:rounded-2xl sm:border dark:border-white/5 border-gray-100 ring-1 ring-black/5 space-y-3">
                  <h3 className="text-sm font-bold dark:text-white text-black flex items-center uppercase tracking-widest">
                    <FiShield className="mr-2.5 text-[#bef264] text-lg" /> What
                    We Check
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3 inline-flex items-center gap-2 text-zinc-300">
                      <FiFileText className="text-[#bef264]" /> Resume structure
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3 inline-flex items-center gap-2 text-zinc-300">
                      <FiTarget className="text-[#bef264]" /> Keyword alignment
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3 inline-flex items-center gap-2 text-zinc-300">
                      <FiCpu className="text-[#bef264]" /> ATS parseability
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3 inline-flex items-center gap-2 text-zinc-300">
                      <IoSparkles className="text-[#bef264]" /> Improvements
                      plan
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`w-full lg:w-[470px] flex flex-col animate-in slide-in-from-right-8 fade-in duration-700 ${isSmallScreen && mobileStage === 1 ? "hidden" : ""} ${isCompactMobileForm ? "gap-4 px-1 pt-2" : "gap-4 lg:pt-6"}`}
              >
                <>
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

                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl px-4 py-3 shadow-lg shadow-black/20">
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#bef264]">
                      Session Setup
                    </p>
                    <h2
                      className={`${isCompactMobileForm ? "text-base" : "text-lg"} font-extrabold text-zinc-100 mt-1 tracking-tight`}
                    >
                      ATS scan details
                    </h2>
                    <p
                      className={`text-zinc-400 ${isCompactMobileForm ? "text-xs" : "text-sm"} font-medium mt-1`}
                    >
                      Upload resume and paste role description
                    </p>
                  </div>

                  <div
                    className={`${isCompactMobileForm ? "space-y-4" : "space-y-5"} rounded-2xl border border-zinc-800/80 bg-zinc-950/75 backdrop-blur-xl p-3 sm:p-4 shadow-2xl shadow-black/25`}
                  >
                    <div
                      className={
                        isCompactMobileForm ? "space-y-3" : "space-y-4"
                      }
                    >
                      <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                        Upload Resume (PDF)
                      </label>
                      <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-[#bef264]/50 focus-within:border-[#bef264] transition-all shadow-sm">
                        <FileUpload file={file} setFile={setFile} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/35 p-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                          File
                        </p>
                        <p className="text-xs text-zinc-300 mt-1 truncate">
                          {file?.name || "No file selected"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/35 p-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                          Job Description
                        </p>
                        <p className="text-xs text-zinc-300 mt-1">
                          {jdWordCount} words
                        </p>
                      </div>
                    </div>

                    <div
                      className={
                        isCompactMobileForm ? "space-y-3" : "space-y-4"
                      }
                    >
                      <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                        Job Description
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={isCompactMobileForm ? 6 : 8}
                        placeholder="Paste the target job description here..."
                        className={`w-full ${isCompactMobileForm ? "p-3 text-xs" : "p-4 text-[13px]"} bg-black border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-[#bef264] transition-all outline-none resize-none font-medium placeholder-zinc-700 shadow-sm`}
                      ></textarea>
                      <p className="text-[11px] text-zinc-500">
                        Minimum 20 characters recommended for reliable matching.
                      </p>
                    </div>

                    <div
                      className={`flex items-center justify-between ${isCompactMobileForm ? "px-1" : "px-2"}`}
                    >
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                        Scanning Cost
                      </span>
                      <div className="flex items-center gap-1.5 bg-[#bef264]/10 px-3 py-1 rounded-full border border-[#bef264]/20">
                        <IoSparkles className="text-[#bef264] text-xs" />
                        <span className="text-[#bef264] text-[10px] font-black uppercase tracking-wider">
                          {FEATURE_COSTS.atsScanner} Credits
                        </span>
                      </div>
                    </div>

                    <div className={isCompactMobileForm ? "pt-1" : "pt-2"}>
                      <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzeDisabled}
                        className={`w-full ${isCompactMobileForm ? "px-6 py-3.5 text-sm" : "px-10 py-4"} bg-[#bef264] hover:bg-[#bef264]/90 text-black cursor-pointer font-black rounded-2xl transition-all inline-flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[#bef264]/20 active:scale-95 group`}
                      >
                        Start Scan
                        <FiArrowRight
                          size={20}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </button>
                    </div>
                  </div>
                </>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col items-center animate-in fade-in duration-1000">
              <div className="w-full mt-2">
                <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                  <div className="flex flex-col mb-4 md:mb-0">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                      Resume <span className="text-[#bef264]">Analysis</span>
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                      Review your ATS score and category-level recommendations.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setResult(null);
                        setFile(null);
                        setJobDescription("");
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#bef264] hover:bg-[#bef264]/90 text-black font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#bef264]/20 active:scale-95 group"
                    >
                      New Upload
                      <BsFillCloudUploadFill className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                <ScoreResult result={result} file={file} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AtsScorer;
