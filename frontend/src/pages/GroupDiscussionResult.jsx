import React, { useState, useEffect, useContext } from "react";
import { Helmet } from "react-helmet-async";
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
  FiClock,
  FiBarChart2,
} from "react-icons/fi";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/lottie/Digital marketing social media and data analysis.json";
import { AppContext } from "../context/AppContext";
import ShareReportModal from "../components/share/ShareReportModal";
import ShareReportButton from "../components/share/ShareReportButton";

const SCORE_LABELS = {
  contributionScore: "Contribution",
  communicationScore: "Communication",
  relevanceScore: "Relevance",
  initiationScore: "Initiative",
  depthScore: "Knowledge Depth",
  speakingScore: "Speaking Skills",
};

const DEFAULT_ZERO_TURN_REPORT = {
  overallScore: 0,
  summary:
    "We could not generate a detailed discussion analysis for this session.",
  strengths: [
    "Session setup completed successfully.",
    "You can retry immediately with the same topic.",
  ],
  improvements: [
    "Speak at least once to receive contribution and communication insights.",
    "Aim for 3 to 5 concise turns with relevant points and examples.",
  ],
  userTurnCount: 0,
  totalTurns: 0,
  contributionScore: 0,
  communicationScore: 0,
  relevanceScore: 0,
  initiationScore: 0,
  depthScore: 0,
  speakingScore: 0,
};

const SkeletonBlock = ({ className = "" }) => (
  <div className={`rounded-md bg-white/10 animate-pulse ${className}`} />
);

const TranscriptSkeletonCard = () => (
  <div className="rounded-2xl border border-white/10 bg-surface p-5 space-y-3">
    <div className="flex items-center justify-between gap-4">
      <SkeletonBlock className="h-5 w-28" />
      <SkeletonBlock className="h-4 w-16" />
    </div>
    <SkeletonBlock className="h-4 w-11/12" />
    <SkeletonBlock className="h-4 w-9/12" />
  </div>
);

const ReportSkeletonState = () => (
  <div className="min-h-screen text-zinc-100 pb-16 px-4 md:px-6 pt-20">
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-3 flex-1">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-8 w-72" />
            <SkeletonBlock className="h-4 w-56" />
          </div>
          <SkeletonBlock className="h-12 w-36" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-20 w-full" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 rounded-2xl border border-white/10 bg-surface p-5 md:p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonBlock key={idx} className="h-12 w-full" />
          ))}
        </div>
        <div className="xl:col-span-5 space-y-4">
          <SkeletonBlock className="h-40 w-full" />
          <SkeletonBlock className="h-40 w-full" />
        </div>
      </div>

      <div className="space-y-4">
        <TranscriptSkeletonCard />
        <TranscriptSkeletonCard />
      </div>
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
              Generating your GD report
            </h2>
            <p className="text-zinc-400 text-sm mt-3 max-w-lg">
              We are evaluating your contribution quality, communication style,
              and discussion relevance to produce a compact report.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 rounded-full border border-white/10 bg-background text-[11px] text-zinc-300">
                Measuring contribution impact
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
        <TranscriptSkeletonCard />
        <TranscriptSkeletonCard />
      </div>
    </div>
  </div>
);

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

const GroupDiscussionResult = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { backend_URL } = useContext(AppContext);

  const [session, setSession] = useState(null);
  const [status, setStatus] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [isZeroTurn, setIsZeroTurn] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Poll for report completion
  useEffect(() => {
    let intervalId;
    let attempts = 0;
    const MAX_ATTEMPTS = 24;

    setSession(null);
    setStatus(null);
    setPollCount(0);
    setIsZeroTurn(false);
    setIsInitialLoading(true);

    const fetchReport = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${backend_URL}/api/group-discussion/report/${sessionId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = res.data || {};
        const transcript = Array.isArray(data.transcript)
          ? data.transcript
          : [];
        const transcriptUserTurns = transcript.filter(
          (msg) => msg?.role === "user",
        ).length;
        const userTurnCountCandidate = [
          data?.report?.userTurnCount,
          data?.userTurnCount,
          transcriptUserTurns,
        ].find((item) => typeof item === "number");
        const userTurnCount = userTurnCountCandidate ?? 0;

        if (userTurnCount === 0) {
          clearInterval(intervalId);
          setIsZeroTurn(true);
          setStatus("zero_turn");
          setSession({
            ...data,
            status: "zero_turn",
            report: {
              ...DEFAULT_ZERO_TURN_REPORT,
              userTurnCount,
              totalTurns: transcript.length,
            },
          });
          setIsInitialLoading(false);
          return;
        }

        setSession(data);
        setStatus(data.status || "processing");

        if (data.status === "completed" || data.status === "analysis_failed") {
          clearInterval(intervalId);
          setIsInitialLoading(false);
        } else {
          attempts++;
          setPollCount(attempts);
          if (attempts >= MAX_ATTEMPTS) {
            clearInterval(intervalId);
            setIsInitialLoading(false);
          }
        }
      } catch (err) {
        console.error(err);
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(intervalId);
          setIsInitialLoading(false);
        }
      }
    };

    if (sessionId) {
      fetchReport();
      intervalId = setInterval(fetchReport, 2500);
    }

    return () => clearInterval(intervalId);
  }, [backend_URL, getToken, sessionId]);

  const report = session?.report;
  const overallScore = report?.overallScore ?? 0;
  const isGenerating =
    !isInitialLoading &&
    status &&
    status !== "completed" &&
    status !== "analysis_failed" &&
    status !== "zero_turn";
  const isFailed = status === "analysis_failed";

  const scoreColor =
    overallScore >= 75 ? "#10b981" : overallScore >= 50 ? "#f59e0b" : "#ef4444";

  const formatDuration = (s) => {
    if (!s) return "-";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  if (isInitialLoading) {
    return (
      <>
        <Helmet>
          <title>GD Analysis | PlaceMateAI</title>
        </Helmet>
        <ReportSkeletonState />
      </>
    );
  }

  if (isGenerating) {
    return (
      <>
        <Helmet>
          <title>GD Analysis | PlaceMateAI</title>
        </Helmet>
        <GeneratingState pollCount={pollCount} />
      </>
    );
  }

  if (!report || isFailed) {
    return (
      <>
        <Helmet>
          <title>GD Analysis Failed | PlaceMateAI</title>
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
              We couldn't generate a report for this session. This usually
              happens if the audio was unclear.
            </p>
          </div>
          <button
            onClick={() => navigate("/gd/setup")}
            className="mt-2 px-10 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-sm transition-all border border-white/10 shadow-xl"
          >
            Try New Session
          </button>
        </div>
      </>
    );
  }

  const strengths = report?.strengths || [];
  const improvements = report?.improvements || [];
  const transcript = Array.isArray(session?.transcript)
    ? session.transcript
    : [];

  return (
    <>
      <Helmet>
        <title>GD Analysis | PlaceMateAI</title>
      </Helmet>
      <div className="min-h-screen text-zinc-100 selection:bg-[#bef264]/30 pb-20 px-4 md:px-6 pt-10">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#bef264] font-black">
                Group Discussion Report
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1">
                GD Performance Analysis
              </h1>
              <p className="text-zinc-400 text-sm mt-2 max-w-2xl">
                {session?.topic || "Personalized Group Discussion Session"}
              </p>
              {session?.createdAt ? (
                <p className="text-[11px] text-zinc-500 font-bold mt-2 flex items-center gap-2">
                  <FiClock size={12} className="text-[#bef264]/60" />
                  {new Date(session.createdAt).toLocaleDateString(undefined, {
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
              {!isZeroTurn ? (
                <ShareReportButton onClick={() => setShowShare(true)} />
              ) : null}
              <button
                onClick={() => navigate("/gd/setup")}
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
              <div className="relative w-32 h-32 flex-shrink-0">
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
                  {isZeroTurn
                    ? "No Participation Captured"
                    : overallScore >= 75
                      ? "Outstanding Contribution"
                      : overallScore >= 50
                        ? "Solid Discussion Presence"
                        : "Needs More Participation"}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed mt-3 max-w-3xl">
                  {report.summary}
                </p>

                <div className="flex flex-wrap gap-2 mt-5">
                  <div className="px-3 py-1.5 rounded-lg bg-background border border-white/10 text-[11px] font-bold text-zinc-300 flex items-center gap-2">
                    <FiUsers size={12} className="text-[#bef264]" />
                    {report.userTurnCount ?? 0} Your Turns
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-background border border-white/10 text-[11px] font-bold text-zinc-300 flex items-center gap-2">
                    <FiMessageSquare size={12} className="text-[#bef264]" />
                    {report.totalTurns ?? 0} Total Turns
                  </div>
                  <div
                    className="px-3 py-1.5 rounded-lg bg-background border border-white/10 text-[11px] font-bold text-zinc-300 flex items-center gap-2"
                    title="Actual Duration / Time Limit"
                  >
                    <FiClock size={12} className="text-[#bef264]" />
                    {formatDuration(session?.duration)}
                    <span className="text-zinc-600 mx-0.5">/</span>
                    <span className="text-zinc-500">
                      {formatDuration(session?.timeLimit)}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-background border border-white/10 text-[11px] font-bold text-zinc-300 flex items-center gap-2">
                    <FiBarChart2 size={12} className="text-[#bef264]" />
                    {Object.keys(SCORE_LABELS).length} Metrics
                  </div>
                  {report.initiationBonus ? (
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400 flex items-center gap-2">
                      <FiCheckCircle size={12} />
                      Initiation Bonus
                    </div>
                  ) : null}
                  {report.conclusionBonus ? (
                    <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-400 flex items-center gap-2">
                      <FiCheckCircle size={12} />
                      Conclusion Bonus
                    </div>
                  ) : null}
                </div>

                {report.speakingStyle ? (
                  <div className="mt-5 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">
                      Speaking Style
                    </span>
                    <p className="text-zinc-300">"{report.speakingStyle}"</p>
                  </div>
                ) : null}
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
                    Metric Analysis
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
                      value={report[key]}
                      color={colors[i % colors.length]}
                    />
                  );
                })}
              </div>
            </div>

            <div className="xl:col-span-5 flex flex-col gap-4">
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-3 mb-6">
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <FiAlertCircle className="text-amber-400" size={16} />
                  </div>
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-widest">
                    Growth Areas
                  </h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {improvements.length > 0 ? (
                    improvements.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed font-medium"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        {typeof item === "string"
                          ? item
                          : item?.point ||
                            item?.explanation ||
                            "Improvement note"}
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

          <div className="p-5 md:p-6 rounded-2xl border border-white/10 bg-surface">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#bef264]/10 flex items-center justify-center">
                  <FiMessageSquare className="text-[#bef264]" size={16} />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Discussion Transcript
                </h3>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-fit">
                {transcript.length} Messages
              </div>
            </div>

            <div className="flex flex-col gap-4 max-h-[580px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
              {transcript.length > 0 ? (
                transcript.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  const agent = session.agents?.find(
                    (a) => a.name === msg.speaker,
                  );
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
                        className={`max-w-[88%] p-4 rounded-2xl text-sm leading-relaxed font-medium border ${
                          isUser
                            ? "bg-[#bef264]/5 border-[#bef264]/20 text-zinc-100 rounded-tr-sm"
                            : "bg-white/[0.03] border-white/10 text-zinc-300 rounded-tl-sm"
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
                })
              ) : (
                <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/10">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <FiMessageSquare className="text-zinc-600" size={24} />
                  </div>
                  <p className="text-zinc-500 italic text-sm font-medium">
                    No discussion transcript available for this session.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center pt-2">
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

      {/* Share Modal */}
      <ShareReportModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        type="gd"
        score={overallScore}
        topic={session?.topic}
        scoreBreakdown={Object.fromEntries(
          Object.keys(SCORE_LABELS).map((k) => [k, report[k]]),
        )}
        sessionId={sessionId}
        date={session?.createdAt}
      />
    </>
  );
};

export default GroupDiscussionResult;
