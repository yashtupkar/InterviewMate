import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FiMessageSquare,
  FiArrowRight,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiClock,
  FiBarChart2,
} from "react-icons/fi";
import { useInterview } from "../context/InterviewContext";
import { useAuth } from "@clerk/clerk-react";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/lottie/Digital marketing social media and data analysis.json";
import ShareReportModal from "../components/share/ShareReportModal";
import ShareReportButton from "../components/share/ShareReportButton";

const SCORE_LABELS = {
  correctness: "Correctness",
  clarity: "Clarity",
  relevance: "Relevance",
  detail: "Conciseness & Detail",
  efficiency: "Efficiency",
  creativity: "Creativity",
  communication: "Communication",
  problemSolving: "Problem Solving",
};

const ScoreBar = ({ label, value, color = "#bef264" }) => (
  <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-3">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-zinc-400 font-medium">{label}</span>
      <span className="text-xs font-bold text-zinc-200">
        {value ?? "-"}/100
      </span>
    </div>
    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${value || 0}%`, background: color }}
      />
    </div>
  </div>
);

const ExpandableText = ({ text = "", limit = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (text.length <= limit) return <p className="leading-relaxed">{text}</p>;

  return (
    <div>
      <p className="leading-relaxed">
        {isExpanded ? text : `${text.substring(0, limit)}...`}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-[#bef264] hover:opacity-80 font-bold transition-colors inline-flex items-center"
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      </p>
    </div>
  );
};

const SkeletonBlock = ({ className = "" }) => (
  <div className={`rounded-md bg-white/10 animate-pulse ${className}`} />
);

const QuestionSkeletonCard = () => (
  <div className="rounded-2xl border border-white/10 bg-surface p-5 space-y-4">
    <div className="flex items-center justify-between gap-4">
      <SkeletonBlock className="h-6 w-28" />
      <SkeletonBlock className="h-5 w-24" />
    </div>
    <SkeletonBlock className="h-4 w-11/12" />
    <SkeletonBlock className="h-4 w-9/12" />
    <SkeletonBlock className="h-20 w-full" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {Array.from({ length: 4 }).map((_, idx) => (
        <SkeletonBlock key={idx} className="h-10 w-full" />
      ))}
    </div>
  </div>
);

const GeneratingState = ({ pollCount = 0 }) => (
  <div className="min-h-screen text-zinc-100 pb-16 px-4 md:px-6 pt-24">
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-44 h-44 shrink-0">
            <Lottie animationData={loadingAnimation} loop={true} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#bef264] font-black">
              Analysis in Progress
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-white mt-2">
              Generating your interview report
            </h2>
            <p className="text-zinc-400 text-sm mt-3 max-w-lg">
              We are scoring each answer, extracting strengths and growth areas,
              and preparing a compact report with actionable feedback.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 rounded-full border border-white/10 bg-background text-[11px] text-zinc-300">
                Evaluating answer quality
              </span>
              <span className="px-3 py-1 rounded-full border border-white/10 bg-background text-[11px] text-zinc-300">
                Building score breakdown
              </span>
              <span className="px-3 py-1 rounded-full border border-white/10 bg-background text-[11px] text-zinc-300">
                Finalizing suggestions
              </span>
            </div>
            {pollCount > 4 ? (
              <p className="text-[#bef264]/70 text-[11px] mt-4 flex items-center gap-2 justify-center md:justify-start font-bold uppercase tracking-wider">
                <FiRefreshCw className="animate-spin" size={12} />
                Finalizing evaluation metrics
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-20 w-full" />
      </div>

      <div className="space-y-4">
        <QuestionSkeletonCard />
        <QuestionSkeletonCard />
      </div>
    </div>
  </div>
);

const InterviewResult = () => {
  const { report, setReport, setTranscript, resetInterview } = useInterview();
  const { getToken } = useAuth();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState(null);
  const [status, setStatus] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    let intervalId;
    let attempts = 0;

    // Reset all states when sessionId changes to avoid showing stale data
    setReport(null);
    setTranscript([]);
    setStatus(null);
    setMetadata(null);
    setPollCount(0);

    const fetchReport = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/vapi-interview/report/${sessionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data) {
          const {
            report: fetchedReport,
            metadata: fetchedMetadata,
            transcript: fetchedTranscript,
            status: fetchedStatus,
          } = response.data;

          if (fetchedReport) {
            setReport(fetchedReport);
            setMetadata(fetchedMetadata);
            if (Array.isArray(fetchedTranscript)) {
              setTranscript(fetchedTranscript);
            }
          }

          setStatus(fetchedStatus);

          if (
            fetchedStatus === "completed" ||
            fetchedStatus === "analysis_failed"
          ) {
            clearInterval(intervalId);
          } else {
            attempts++;
            setPollCount(attempts);
          }
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        attempts++;
        if (attempts > 30) {
          clearInterval(intervalId);
          navigate("/interview/setup");
        }
      }
    };

    if (sessionId) {
      fetchReport();
      intervalId = setInterval(fetchReport, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [sessionId, getToken, setReport, setTranscript, navigate]);

  const isGenerating =
    status && status !== "completed" && status !== "analysis_failed";

  if (!report || isGenerating) {
    return (
      <>
        <Helmet>
          <title>Interview Analysis | PlaceMateAI</title>
        </Helmet>
        <GeneratingState pollCount={pollCount} />
      </>
    );
  }

  if (status === "analysis_failed") {
    return (
      <>
        <Helmet>
          <title>Analysis Failed | PlaceMateAI</title>
        </Helmet>
        <div className="min-h-screen bg-background text-zinc-100 flex flex-col items-center justify-center gap-6 text-center px-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-2xl shadow-red-500/5">
            <FiAlertCircle className="text-red-400" size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">
              Analysis Encountered an Error
            </h2>
            <p className="text-zinc-500 text-sm max-w-sm mt-2">
              We couldn't generate a report for this session. This can happen if
              the audio was too short or unclear.
            </p>
          </div>
          <button
            onClick={() => navigate("/interview/setup")}
            className="mt-2 px-10 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-sm transition-all border border-white/10 shadow-xl"
          >
            Try New Session
          </button>
        </div>
      </>
    );
  }

  const detailedReport = report?.detailedAnalysis || report || {};
  const questions = detailedReport.questions || [];
  const overall = detailedReport.overall || {};
  const strengths = report?.strengths || detailedReport?.strengths || [];
  const growthAreas = detailedReport?.growthAreas || report?.growthAreas || [];
  const summaryText =
    detailedReport?.summary ||
    "Based on your responses, our AI has evaluated your technical proficiency, communication clarity, and problem-solving approach.";

  // Calculate an overall average score for the hero section
  const scoresArray = Object.values(overall).filter(
    (v) => typeof v === "number",
  );
  const overallScore =
    scoresArray.length > 0
      ? Math.round(scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length)
      : 0;

  const scoreColor =
    overallScore >= 75 ? "#10b981" : overallScore >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <>
      <Helmet>
        <title>Interview Result | PlaceMateAI</title>
      </Helmet>
      <div className="min-h-screen text-zinc-100 selection:bg-[#bef264]/30 pb-20 px-4 md:px-6 pt-10">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#bef264] font-black">
                Interview Report
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1">
                Interview Performance Analysis
              </h1>
              <p className="text-zinc-400 text-sm mt-2 max-w-2xl">
                {metadata?.role || "Personalized Interview Session"}
              </p>
              {metadata?.createdAt ? (
                <p className="text-[11px] text-zinc-500 font-bold mt-2 flex items-center gap-2">
                  <FiClock size={12} className="text-[#bef264]/60" />
                  {new Date(metadata.createdAt).toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
          
              <ShareReportButton onClick={() => setShowShare(true)} />
              <button
                onClick={() => {
                  resetInterview();
                  navigate("/interview/setup");
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#bef264] hover:opacity-90 text-black font-black text-sm transition-all"
              >
                Practice Again
                <FiArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden p-6 md:p-7 rounded-3xl border border-white/10 bg-surface">
            <div
              className="absolute -left-20 -top-20 w-80 h-80 opacity-10 blur-[100px] rounded-full"
              style={{ background: scoreColor }}
            />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="relative w-32 h-32 flex-shrink-0 group">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - overallScore / 100)}`}
                    className="transition-all duration-[1.2s] ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white leading-none">
                    {overallScore}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">
                    Overall
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {overallScore >= 75
                    ? "Impressive Performance!"
                    : overallScore >= 50
                      ? "Solid Foundation"
                      : "Development Needed"}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed mt-3 max-w-3xl">
                  <ExpandableText text={summaryText} />
                </p>

                <div className="flex flex-wrap gap-2 mt-5">
                  <div className="px-3 py-1.5 rounded-lg bg-background border border-white/10 text-[11px] font-bold text-zinc-300 flex items-center gap-2">
                    <FiMessageSquare size={12} className="text-[#bef264]" />
                    {questions.length} Questions
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-background border border-white/10 text-[11px] font-bold text-zinc-300 flex items-center gap-2">
                    <FiCheckCircle size={12} className="text-[#bef264]" />
                    Verified Analysis
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-background border border-white/10 text-[11px] font-bold text-zinc-300 flex items-center gap-2">
                    <FiBarChart2 size={12} className="text-[#bef264]" />
                    {Object.keys(overall).length} Metrics
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-7 p-5 md:p-6 rounded-2xl border border-white/10 bg-surface">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#bef264]/10 flex items-center justify-center">
                    <FiTrendingUp className="text-[#bef264]" size={16} />
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Metric analysis
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(SCORE_LABELS).map(([key, label], i) => {
                  const colors = [
                    "#bef264",
                    "#ec4899",
                    "#f59e0b",
                    "#10b981",
                    "#06b6d4",
                  ];
                  return (
                    <ScoreBar
                      key={key}
                      label={label}
                      value={overall[key]}
                      color={colors[i % colors.length]}
                    />
                  );
                })}
              </div>
            </div>

            <div className="xl:col-span-5 flex flex-col gap-4">
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <FiCheckCircle className="text-emerald-400" size={16} />
                  </div>
                  <h3 className="text-sm font-black text-emerald-300 uppercase tracking-widest">
                    Strengths
                  </h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {strengths.length > 0 ? (
                    strengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed font-medium"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-zinc-500 italic">
                      No specific strengths listed.
                    </li>
                  )}
                </ul>
              </div>

              <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <FiAlertCircle className="text-amber-400" size={16} />
                  </div>
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-widest">
                    Growth Areas
                  </h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {growthAreas.length > 0 ? (
                    growthAreas.map((imp, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed font-medium"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        {imp}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-zinc-500 italic">
                      No critical improvement areas detected.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#bef264]/10 flex items-center justify-center">
                <FiMessageSquare className="text-[#bef264]" size={16} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Interview Transcript
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {questions.length > 0 ? (
                questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-surface border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-[#bef264]/30"
                  >
                    <div className="p-5 md:p-6 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#bef264]">
                          Question {idx + 1}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(q.scores || {})
                            .slice(0, 3)
                            .map(([key, val]) => (
                              <span
                                key={key}
                                className="text-[10px] px-2 py-1 rounded-md bg-background border border-white/10 font-bold text-zinc-400 uppercase"
                              >
                                {key}:{" "}
                                <span className="text-zinc-200">{val}%</span>
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                              The Question
                            </h4>
                            <div className="text-white text-sm leading-relaxed font-medium">
                              <ExpandableText
                                text={
                                  q.question || "No question text available."
                                }
                              />
                            </div>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                              Your Answer
                            </h4>
                            <div className="text-zinc-300 text-sm leading-relaxed">
                              <ExpandableText
                                text={q.answer || "No answer captured."}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {q.feedback && (
                            <div className="p-4 rounded-xl bg-[#bef264]/5 border border-[#bef264]/20">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#bef264] mb-2">
                                AI feedback
                              </h4>
                              <div className="text-zinc-200 text-xs leading-relaxed font-medium">
                                <ExpandableText text={q.feedback} />
                              </div>
                            </div>
                          )}

                          {q.improvedAnswer && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                                Better Approach
                              </h4>
                              <div className="text-zinc-300 text-xs leading-relaxed">
                                <ExpandableText text={q.improvedAnswer} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 px-1">
                          Detailed Metrics
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(q.scores || {}).map(
                            ([key, val], i) => {
                              const formattedKey = key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase());
                              const colors = [
                                "#bef264",
                                "#ec4899",
                                "#f59e0b",
                                "#10b981",
                                "#06b6d4",
                                "#8b5cf6",
                                "#ef4444",
                                "#3b82f6",
                              ];
                              const currentColor = colors[i % colors.length];

                              return (
                                <div
                                  key={key}
                                  className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex flex-col gap-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tight">
                                      {formattedKey}
                                    </span>
                                    <span
                                      className="text-[10px] font-black"
                                      style={{ color: currentColor }}
                                    >
                                      {val}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-700"
                                      style={{
                                        width: `${val}%`,
                                        backgroundColor: currentColor,
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-surface rounded-2xl border border-white/10">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <FiMessageSquare className="text-zinc-600" size={24} />
                  </div>
                  <p className="text-zinc-500 italic text-sm font-medium">
                    No detailed question analysis available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareReportModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        type="interview"
        score={overallScore}
        role={metadata?.role}
        scoreBreakdown={overall}
        sessionId={sessionId}
        date={metadata?.createdAt}
      />
    </>
  );
};

export default InterviewResult;
