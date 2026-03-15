import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import {
  FiArrowRight,
  FiMessageSquare,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiUsers,
  FiLoader,
} from "react-icons/fi";
import { AppContext } from "../context/AppContext";

const SCORE_LABELS = {
  contributionScore: "Contribution",
  communicationScore: "Communication",
  relevanceScore: "Relevance",
  initiationScore: "Initiative",
  depthScore: "Knowledge Depth",
};

const ScoreBar = ({ label, value, color = "#6366f1" }) => (
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

const GroupDiscussionResult = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { backend_URL } = useContext(AppContext);

  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  // Poll for report completion
  useEffect(() => {
    let intervalId;
    let attempts = 0;
    const MAX_ATTEMPTS = 20; // ~40s

    const fetchReport = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${backend_URL}/api/group-discussion/report/${sessionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = res.data;
        setSession(data);

        if (data.status === "completed" || data.status === "analysis_failed") {
          clearInterval(intervalId);
          setIsLoading(false);
        } else {
          attempts++;
          setPollCount(attempts);
          if (attempts >= MAX_ATTEMPTS) {
            clearInterval(intervalId);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error(err);
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(intervalId);
          setIsLoading(false);
        }
      }
    };

    fetchReport();
    intervalId = setInterval(fetchReport, 2000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const report = session?.report;
  const overallScore = report?.overallScore ?? 0;

  const scoreColor =
    overallScore >= 75
      ? "#10b981"
      : overallScore >= 50
      ? "#f59e0b"
      : "#ef4444";

  const formatDuration = (s) => {
    if (!s) return "—";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
          <FiLoader className="absolute inset-0 m-auto text-indigo-400" size={20} />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold">Analyzing your performance...</p>
          <p className="text-zinc-500 text-xs mt-1">
            Evaluating contribution & communication
          </p>
        </div>
        {pollCount > 5 && (
          <p className="text-zinc-600 text-xs animate-pulse">
            This may take up to 30 seconds...
          </p>
        )}
      </div>
    );
  }

  if (!report || session?.status === "analysis_failed") {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-4 text-center px-4">
        <FiAlertCircle className="text-red-400" size={36} />
        <h2 className="text-xl font-bold text-white">Report Generation Failed</h2>
        <p className="text-zinc-400 text-sm max-w-sm">
          We couldn't generate a report. Please try ending the session again.
        </p>
        <button
          onClick={() => navigate("/gd/setup")}
          className="mt-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all"
        >
          Start New GD
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/gd/setup")}
            className="p-2 bg-zinc-900/70 hover:bg-zinc-800 cursor-pointer rounded-xl transition-colors text-zinc-400 hover:text-white"
          >
            <FiArrowRight className="rotate-180" size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white">GD Performance Report</h1>
            <p className="text-[10px] text-zinc-500 truncate max-w-[220px]">
              {session?.topic}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/gd/setup")}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
        >
          New GD
          <FiArrowRight size={12} />
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
        {/* Overall Score Hero */}
        <div className="relative overflow-hidden p-6 rounded-3xl border border-white/5 bg-zinc-900/60">
          <div
            className="absolute inset-0 opacity-5"
            style={{ background: `radial-gradient(circle at 20% 50%, ${scoreColor}, transparent 70%)` }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Score Circle */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallScore / 100)}`}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{overallScore}</span>
                <span className="text-[10px] text-zinc-500 font-medium">/ 100</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">
                Overall GD Score
              </p>
              <h2 className="text-2xl font-black text-white mb-2">
                {overallScore >= 75
                  ? "Excellent Contribution!"
                  : overallScore >= 50
                  ? "Good Performance"
                  : "Needs Improvement"}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
                {report.summary}
              </p>

              {/* Metadata chips */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                <span className="px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-[10px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <FiUsers size={10} />
                  {report.userTurnCount ?? 0} turns spoken
                </span>
                <span className="px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-[10px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <FiMessageSquare size={10} />
                  {report.totalTurns ?? 0} total exchanges
                </span>
                <span className="px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-[10px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <FiRefreshCw size={10} />
                  {formatDuration(session?.duration)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="p-6 rounded-3xl border border-white/5 bg-zinc-900/60">
          <div className="flex items-center gap-2 mb-5">
            <FiTrendingUp className="text-indigo-400" size={16} />
            <h3 className="text-sm font-bold text-white">Score Breakdown</h3>
          </div>
          <div className="flex flex-col gap-4">
            {Object.entries(SCORE_LABELS).map(([key, label], i) => {
              const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
              return (
                <ScoreBar
                  key={key}
                  label={label}
                  value={report[key]}
                  color={colors[i % colors.length]}
                />
              );
            })}
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-4">
              <FiCheckCircle className="text-emerald-400" size={15} />
              <h3 className="text-sm font-bold text-emerald-300">Strengths</h3>
            </div>
            <ul className="flex flex-col gap-2.5">
              {(report.strengths || []).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
              {(!report.strengths || report.strengths.length === 0) && (
                <li className="text-xs text-zinc-600">No specific strengths identified.</li>
              )}
            </ul>
          </div>

          <div className="p-5 rounded-3xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2 mb-4">
              <FiAlertCircle className="text-amber-400" size={15} />
              <h3 className="text-sm font-bold text-amber-300">Areas to Improve</h3>
            </div>
            <ul className="flex flex-col gap-2.5">
              {(report.improvements || []).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
              {(!report.improvements || report.improvements.length === 0) && (
                <li className="text-xs text-zinc-600">No areas identified for improvement.</li>
              )}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/gd/setup")}
            className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            Practice Again
            <FiArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-200 font-bold text-sm transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupDiscussionResult;
