import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  FiChevronLeft,
  FiMessageSquare,
  FiArrowRight,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiLoader,
  FiClock,
} from "react-icons/fi";
import { useInterview } from "../context/InterviewContext";
import { useAuth } from "@clerk/clerk-react";

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
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs text-zinc-400 font-medium">{label}</span>
      <span className="text-xs font-bold text-zinc-200">{value ?? "—"}/100</span>
    </div>
    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value || 0}%`, background: color }}
      />
    </div>
  </div>
);

const ExpandableText = ({ text, limit = 200 }) => {
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

const InterviewResult = () => {
  const { report, setReport, transcript, setTranscript, resetInterview } =
    useInterview();
  const { getToken } = useAuth();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState(null);
  const [status, setStatus] = useState(null);
  const [pollCount, setPollCount] = useState(0);

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
          const { report: fetchedReport, metadata: fetchedMetadata, transcript: fetchedTranscript, status: fetchedStatus } = response.data;
          
          if (fetchedReport) {
            setReport(fetchedReport);
            setMetadata(fetchedMetadata);
            if (Array.isArray(fetchedTranscript)) {
              setTranscript(fetchedTranscript);
            }
          }
          
          setStatus(fetchedStatus);

          if (fetchedStatus === "completed" || fetchedStatus === "analysis_failed") {
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

  if (!report || status === "analysis_pending") {
    return (
      <>
        <Helmet>
          <title>Analyzing Interview | PriPareAI</title>
        </Helmet>
        <div className="min-h-screen bg-background text-zinc-100 flex flex-col items-center justify-center gap-6">
          <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-[#bef264]/10" />
          <div className="absolute inset-0 rounded-full border-t-4 border-[#bef264] animate-spin" />
          <FiLoader className="absolute inset-0 m-auto text-[#bef264]" size={24} />
        </div>
        <div className="text-center px-4">
          <h2 className="text-xl font-black text-white tracking-tight">Analyzing Your Performance</h2>
          <p className="text-zinc-500 text-sm mt-2 font-medium max-w-xs">
            Our AI is reviewing your answers to provide detailed feedback and scoring.
          </p>
        </div>
        {pollCount > 5 && (
          <p className="text-[#bef264]/60 text-[10px] items-center gap-2 flex font-bold uppercase tracking-widest animate-pulse">
            <FiRefreshCw className="animate-spin" size={10} />
            Finalizing evaluation metrics
          </p>
          )}
        </div>
      </>
    );
  }

  if (status === "analysis_failed") {
    return (
      <>
        <Helmet>
          <title>Analysis Failed | InterviewMate</title>
        </Helmet>
        <div className="min-h-screen bg-background text-zinc-100 flex flex-col items-center justify-center gap-6 text-center px-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-2xl shadow-red-500/5">
          <FiAlertCircle className="text-red-400" size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Analysis Encountered an Error</h2>
          <p className="text-zinc-500 text-sm max-w-sm mt-2">
            We couldn't generate a report for this session. This can happen if the audio was too short or unclear.
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

  const detailedReport = report.detailedAnalysis || report;
  const questions = detailedReport.questions || [];
  const overall = detailedReport.overall || {};

  // Calculate an overall average score for the hero section
  const scoresArray = Object.values(overall).filter(v => typeof v === 'number');
  const overallScore = scoresArray.length > 0 
    ? Math.round(scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length) 
    : 0;

  const scoreColor =
    overallScore >= 75
      ? "#10b981"
      : overallScore >= 50
        ? "#f59e0b"
        : "#ef4444";

  return (
    <>
      <Helmet>
        <title>Interview Result | InterviewMate</title>
      </Helmet>
      <div className="min-h-screen text-zinc-100 selection:bg-[#bef264]/30 pb-20 p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Interview <span className="text-[#bef264]">Analysis</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1 font-medium italic">
              {metadata?.role || "Personalized Interview Session"}
            </p>
            {metadata?.createdAt && (
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                <FiClock size={10} className="text-[#bef264]/40" />
                {new Date(metadata.createdAt).toLocaleDateString(undefined, {
                  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              resetInterview();
              navigate("/interview/setup");
            }}
            className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-[#bef264] hover:opacity-90 text-black font-black text-sm transition-all shadow-xl shadow-[#bef264]/10 active:scale-95"
          >
            Practice Again
            <FiArrowRight size={18} />
          </button>
        </div>

        {/* Overall Score Hero */}
        <div className="relative overflow-hidden p-8 rounded-[2.5rem] border border-white/5 bg-surface shadow-2xl">
          <div
            className="absolute -left-20 -top-20 w-80 h-80 opacity-10 blur-[100px] rounded-full"
            style={{ background: scoreColor }}
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            {/* Score Circle */}
            <div className="relative w-36 h-36 flex-shrink-0 group">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
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
                  className="transition-all duration-[1.5s] ease-out-expo"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white leading-none">{overallScore}</span>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Overall</span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#bef264]/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                Performance Summary
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                {overallScore >= 75
                  ? "Impressive Performance!"
                  : overallScore >= 50
                    ? "Solid Foundation"
                    : "Development Needed"}
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-lg font-medium">
                <ExpandableText text={report.detailedAnalysis.summary || "Based on your responses, our AI has evaluated your technical proficiency, communication clarity, and problem-solving approach. Review the detailed metric analysis below."}/>
              </p>

              {/* Metadata chips */}
              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                <div className="px-4 py-2 rounded-xl bg-background border border-white/5 text-[11px] font-bold text-zinc-300 flex items-center gap-2 shadow-inner">
                  <FiMessageSquare size={12} className="text-[#bef264]" />
                  {questions.length} Questions
                </div>
                <div className="px-4 py-2 rounded-xl bg-background border border-white/5 text-[11px] font-bold text-zinc-300 flex items-center gap-2 shadow-inner">
                  <FiCheckCircle size={12} className="text-[#bef264]" />
                  Verified Analysis
                </div>
              </div>
            </div>
          </div>
        </div>

    

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Score Breakdown */}
          <div className="lg:col-span-3 p-8 rounded-[2rem] border border-white/5 bg-surface relative overflow-hidden h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#bef264]/10 flex items-center justify-center">
                  <FiTrendingUp className="text-[#bef264]" size={16} />
                </div>
                <h3 className="text-lg font-black text-white">Metric analysis</h3>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              {Object.entries(SCORE_LABELS).map(([key, label], i) => {
                const colors = ["#bef264", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
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
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#bef264]/5 rounded-full blur-3xl" />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Strengths / High Scores */}
            <div className="p-6 rounded-[2rem] border border-emerald-500/10 bg-emerald-500/5 shadow-xl shadow-emerald-500/5 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <FiCheckCircle className="text-emerald-400" size={16} />
                </div>
                <h3 className="text-sm font-black text-emerald-300 uppercase tracking-widest">Strengths</h3>
              </div>
              <ul className="flex flex-col gap-4">
                {report.strengths && report.strengths.length > 0 ? (
                  report.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-zinc-300 leading-relaxed font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-zinc-500 italic">No specific strengths listed.</li>
                )}
              </ul>
            </div>

            {/* Growth Areas */}
            <div className="p-6 rounded-[2rem] border border-amber-500/10 bg-amber-500/5 shadow-xl shadow-amber-500/5 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FiAlertCircle className="text-amber-400" size={16} />
                </div>
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-widest">Growth Areas</h3>
              </div>
              <ul className="flex flex-col gap-4">
                {report.detailedAnalysis.growthAreas && report.detailedAnalysis.growthAreas.length > 0 ? (
                  report.detailedAnalysis.growthAreas.map((imp, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-zinc-300 leading-relaxed font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      {imp}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-zinc-500 italic">No critical improvement areas detected.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Conversation History */}
        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#bef264]/10 flex items-center justify-center">
                <FiMessageSquare className="text-[#bef264]" size={16} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Interview Transcript</h2>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {questions.length > 0 ? (
              questions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-surface border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:border-[#bef264]/10"
                >
                  <div className="p-8 space-y-8">
                    {/* Question Header */}
                    <div className="flex items-center justify-between">
                      <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#bef264]">
                        Question {idx + 1}
                      </div>
                      <div className="flex gap-2">
                         {Object.entries(q.scores || {}).slice(0, 3).map(([key, val]) => (
                            <span key={key} className="text-[10px] font-bold text-zinc-500 uppercase">
                              {key}: <span className="text-zinc-300">{val}%</span>
                            </span>
                         ))}
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-2">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">The Question</h4>
                           <div className="text-white text-sm leading-relaxed font-medium">
                            <ExpandableText text={q.question} />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Your Answer</h4>
                           <div className="text-zinc-400 text-sm leading-relaxed font-medium italic">
                            <ExpandableText text={q.answer} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {q.feedback && (
                          <div className="p-5 rounded-2xl bg-[#bef264]/5 border border-[#bef264]/10">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#bef264] mb-3">AI feedback</h4>
                            <div className="text-zinc-200 text-xs leading-relaxed font-medium">
                              <ExpandableText text={q.feedback} />
                            </div>
                          </div>
                        )}
                        
                        {q.improvedAnswer && (
                          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Better Approach</h4>
                            <div className="text-zinc-400 text-xs leading-relaxed font-medium italic">
                              <ExpandableText text={q.improvedAnswer} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* All Scores for Question */}
                    <div className="pt-8 border-t border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 px-1">Detailed Metrics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(q.scores || {}).map(([key, val], i) => {
                          const formattedKey = key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase());
                          const colors = ["#bef264", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6", "#ef4444", "#3b82f6"];
                          const currentColor = colors[i % colors.length];
                          
                          return (
                            <div key={key} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 flex flex-col gap-2 shadow-sm transition-all hover:bg-white/[0.05]">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tight">{formattedKey}</span>
                                <span className="text-[10px] font-black" style={{ color: currentColor }}>{val}%</span>
                              </div>
                              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-1000" 
                                  style={{ width: `${val}%`, backgroundColor: currentColor }} 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-white/5">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <FiMessageSquare className="text-zinc-600" size={24} />
                </div>
                <p className="text-zinc-500 italic text-sm font-medium">
                  No detailed question analysis available.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Global Footer Navigation */}
        <div className="flex items-center justify-center pt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2 group"
          >
            Return to Dashboard
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        </div>
      </div>
    </>
  );
};

export default InterviewResult;
