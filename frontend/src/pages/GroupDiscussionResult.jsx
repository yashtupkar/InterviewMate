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
  FiClock,
} from "react-icons/fi";
import { AppContext } from "../context/AppContext";

const SCORE_LABELS = {
  contributionScore: "Contribution",
  communicationScore: "Communication",
  relevanceScore: "Relevance",
  initiationScore: "Initiative",
  depthScore: "Knowledge Depth",
  speakingScore: "Speaking Skills",
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
      <div className="min-h-screen bg-background text-zinc-100 flex flex-col items-center justify-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-[#bef264]/10" />
          <div className="absolute inset-0 rounded-full border-t-4 border-[#bef264] animate-spin" />
          <FiLoader className="absolute inset-0 m-auto text-[#bef264]" size={24} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-white tracking-tight">Generating Your Report</h2>
          <p className="text-zinc-500 text-sm mt-2 font-medium">
            Analyzing contribution, relevance, and communication...
          </p>
        </div>
        {pollCount > 5 && (
          <p className="text-[#bef264]/60 text-[10px] items-center gap-2 flex font-bold uppercase tracking-widest animate-pulse">
            <FiRefreshCw className="animate-spin" size={10} />
            AI is finalizing the evaluation
          </p>
        )}
      </div>
    );
  }

  if (!report || session?.status === "analysis_failed") {
    return (
      <div className="min-h-screen bg-background text-zinc-100 flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-2xl shadow-red-500/5">
          <FiAlertCircle className="text-red-400" size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Analysis Encountered an Error</h2>
          <p className="text-zinc-500 text-sm max-w-sm mt-2">
            We couldn't generate a report for this session. This usually happens if the audio was unclear.
          </p>
        </div>
        <button
          onClick={() => navigate("/gd/setup")}
          className="mt-2 px-10 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-sm transition-all border border-white/10 shadow-xl"
        >
          Try New Session
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-zinc-100 selection:bg-[#bef264]/30 pb-20 p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">GD <span className="text-[#bef264]">Analysis</span></h1>
            <p className="text-zinc-500 text-sm mt-1 font-medium italic">
              " {session?.topic} "
            </p>
            {session?.createdAt && (
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                <FiClock size={10} className="text-[#bef264]/40" />
                {new Date(session.createdAt).toLocaleDateString(undefined, {
                  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate("/gd/setup")}
            className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-[#bef264] hover:bg-[#bef264]-hover text-black font-black text-sm transition-all shadow-xl shadow-[#bef264]/10 active:scale-95"
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
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Score</span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#bef264]/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                Performance Summary
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                {overallScore >= 75
                  ? "Outstanding Contribution!"
                  : overallScore >= 50
                    ? "Great Progress"
                    : "Learning Phase"}
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-lg font-medium">
                {report.summary}
              </p>

              {/* Metadata chips */}
              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                <div className="px-4 py-2 rounded-xl bg-background border border-white/5 text-[11px] font-bold text-zinc-300 flex items-center gap-2 shadow-inner">
                  <FiUsers size={12} className="text-[#bef264]" />
                  {report.userTurnCount ?? 0} Turns
                </div>
                <div className="px-4 py-2 rounded-xl bg-background border border-white/5 text-[11px] font-bold text-zinc-300 flex items-center gap-2 shadow-inner">
                  <FiMessageSquare size={12} className="text-[#bef264]" />
                  {report.totalTurns ?? 0} Total
                </div>
                <div className="px-4 py-2 rounded-xl bg-background border border-white/5 text-[11px] font-bold text-zinc-300 flex items-center gap-2 shadow-inner" title="Actual Duration / Time Limit">
                  <FiClock size={12} className="text-[#bef264]" />
                  {formatDuration(session?.duration)}
                  <span className="text-zinc-600 mx-0.5">/</span>
                  <span className="text-zinc-500">{formatDuration(session?.timeLimit)}</span>
                </div>
                {report.initiationBonus && (
                  <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400 flex items-center gap-2 shadow-lg">
                    <FiCheckCircle size={12} />
                    Initiation Bonus
                  </div>
                )}
                {report.conclusionBonus && (
                  <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-400 flex items-center gap-2 shadow-lg">
                    <FiCheckCircle size={12} />
                    Conclusion Bonus
                  </div>
                )}
              </div>
              {report.speakingStyle && (
                <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 text-sm">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500 block mb-1">Speaking Style</span>
                  <p className="text-zinc-300 italic font-medium">"{report.speakingStyle}"</p>
                </div>
              )}
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
                <h3 className="text-lg font-black text-white">Metric Analysis</h3>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              {Object.entries(SCORE_LABELS).map(([key, label], i) => {
                const colors = ["var(--[#bef264])", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
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
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#bef264]/5 rounded-full blur-3xl" />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Strengths */}
            <div className="p-6 rounded-[2rem] border border-emerald-500/10 bg-emerald-500/5 shadow-xl shadow-emerald-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <FiCheckCircle className="text-emerald-400" size={16} />
                </div>
                <h3 className="text-sm font-black text-emerald-300 uppercase tracking-widest">Key Strengths</h3>
              </div>
              <ul className="flex flex-col gap-4">
                {(report.strengths || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-zinc-300 leading-relaxed font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
                {(!report.strengths || report.strengths.length === 0) && (
                  <li className="text-xs text-zinc-500 italic">Analytical trace shows neutral performance.</li>
                )}
              </ul>
            </div>

            {/* Improvements */}
            <div className="p-6 rounded-[2rem] border border-amber-500/10 bg-amber-500/5 shadow-xl shadow-amber-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FiAlertCircle className="text-amber-400" size={16} />
                </div>
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-widest">Growth Areas</h3>
              </div>
              <ul className="flex flex-col gap-5">
                {(report.improvements || []).map((imp, i) => (
                  <li key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[11px] font-black text-amber-400/80 uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {typeof imp === 'string' ? 'Improvement' : imp.point}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed pl-3.5 font-medium">
                      {typeof imp === 'string' ? imp : imp.explanation}
                    </p>
                  </li>
                ))}
                {(!report.improvements || report.improvements.length === 0) && (
                  <li className="text-xs text-zinc-500 italic">No critical improvement areas detected.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Transcript Section */}
        <div className="p-8 rounded-[2rem] border border-white/5 bg-surface relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#bef264]/10 flex items-center justify-center">
                <FiMessageSquare className="text-[#bef264]" size={16} />
              </div>
              <h3 className="text-lg font-black text-white">Discussion Transcript</h3>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {session.transcript?.length || 0} Messages
            </div>
          </div>

          <div className="flex flex-col gap-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            {session.transcript &&
              session.transcript.map((msg, idx) => {
                const isUser = msg.role === "user";
                const agent = session.agents?.find((a) => a.name === msg.speaker);
                const color = isUser ? "#bef264" : agent?.color || "#6366f1";

                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-2 px-1">
                      {!isUser && (
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      )}
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.2em]"
                        style={{ color: isUser ? "#bef264" : color }}
                      >
                        {msg.speaker}
                      </span>
                      {isUser && (
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      )}
                    </div>
                    <div
                      className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed font-medium shadow-sm ${
                        isUser
                          ? "bg-[#bef264]/5 border border-[#bef264]/20 text-zinc-100 rounded-tr-sm"
                          : "bg-white/[0.03] border border-white/5 text-zinc-300 rounded-tl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="mt-2 text-[9px] text-zinc-600 font-black uppercase tracking-widest px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            {!session.transcript?.length && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <FiMessageSquare className="text-zinc-600" size={24} />
                </div>
                <p className="text-zinc-500 italic text-sm font-medium">
                  The analytical trace for this session is empty.
                </p>
              </div>
            )}
          </div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#bef264]/2 rounded-full blur-3xl" />
        </div>

        {/* Global Footer Navigation */}
        <div className="flex items-center justify-center pt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2 group"
          >
            Exit Analysis Report
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupDiscussionResult;
