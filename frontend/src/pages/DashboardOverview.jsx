import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
  FiStar,
  FiActivity,
  FiUsers,
  FiMessageSquare,
  FiVideo,
  FiTrendingUp,
  FiTarget,
  FiAward,
  FiMoreHorizontal,
  FiChevronRight,
  FiCheck,
  FiLoader,
  FiZap,
} from "react-icons/fi";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatDistanceToNow, differenceInHours, format } from "date-fns";
import { interviewAgents } from "../constants/agents";
import { GoClockFill } from "react-icons/go";
import { FaCheckCircle, FaClock, FaUsers } from "react-icons/fa";
import Skeleton from "../components/common/Skeleton";

const DashboardOverview = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [gds, setGDs] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const [interviewsRes, gdsRes, subscriptionRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/vapi-interview/user`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/group-discussion/my-sessions`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ]);

        setInterviews(interviewsRes.data || []);
        setGDs(gdsRes.data || []);
        setSubscription(subscriptionRes.data || null);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  const completedInterviews = interviews.filter(
    (i) =>
      i.status === "completed" ||
      i.status === "analysis_pending" ||
      i.report?.overallScore !== undefined,
  );
  const completedGDs = gds.filter(
    (g) =>
      g.status === "completed" ||
      g.status === "analysis_pending" ||
      g.report?.overallScore !== undefined,
  );
  const totalSessions = interviews.length + gds.length;

  const avgScore =
    totalSessions > 0
      ? Math.round(
        [...completedInterviews, ...completedGDs].reduce(
          (acc, curr) => acc + (curr.report?.overallScore || 0),
          0,
        ) / ([...completedInterviews, ...completedGDs].length || 1),
      )
      : 0;

  const skillMatrix = React.useMemo(() => {
    const subjects = [
      { subject: "Comm", Interview: 0, GD: 0, fullMark: 100 },
      { subject: "Depth", Interview: 0, GD: 0, fullMark: 100 },
      { subject: "Initiative", Interview: 0, GD: 0, fullMark: 100 },
      { subject: "Logic", Interview: 0, GD: 0, fullMark: 100 },
      { subject: "Confidence", Interview: 0, GD: 0, fullMark: 100 },
    ];

    completedInterviews.forEach((session) => {
      const report =
        session.report?.detailedAnalysis?.overall ||
        session.report?.overall ||
        session.report;
      if (report) {
        subjects[0].Interview += report.communication || 0;
        subjects[1].Interview += report.correctness || 0;
        subjects[2].Interview += report.creativity || 0;
        subjects[3].Interview += report.relevance || 0;
        subjects[4].Interview += report.problemSolving || 0;
      }
    });

    completedGDs.forEach((session) => {
      const report = session.report;
      if (report) {
        subjects[0].GD += report.communicationScore || 0;
        subjects[1].GD += report.depthScore || 0;
        subjects[2].GD += report.initiationScore || 0;
        subjects[3].GD += report.relevanceScore || 0;
        subjects[4].GD += report.contributionScore || 0;
      }
    });

    return subjects.map((s) => ({
      ...s,
      Interview:
        completedInterviews.length > 0
          ? Math.round(s.Interview / completedInterviews.length)
          : 0,
      GD: completedGDs.length > 0 ? Math.round(s.GD / completedGDs.length) : 0,
    }));
  }, [completedInterviews, completedGDs]);

  const totalPrepTime = [...completedInterviews, ...completedGDs].reduce(
    (acc, session) => {
      let sessionMins = 0;

      // Check if it's an interview (has actualDuration or metadata) or GD (has duration)
      if (session.actualDuration > 0) {
        // actualDuration is stored in seconds
        sessionMins = Math.round(session.actualDuration / 60);
      } else if (session.duration > 0) {
        // GD duration is stored in seconds
        sessionMins = Math.round(session.duration / 60);
      } else if (session.metadata?.duration) {
        // Fallback to metadata duration (usually in minutes)
        sessionMins = session.metadata.duration;
      } else {
        // Default fallback
        sessionMins = 10;
      }

      return acc + sessionMins;
    },
    0,
  );

  const formatPrepTime = (totalMins) => {
    if (totalMins < 60) return `${totalMins}m`;
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // Removed global loading check to support skeleton loaders

  return (
    <>
      <Helmet>
        <title>Dashboard | PlaceMateAI</title>
      </Helmet>

      {/* Include custom generic styles matching Stitch mockup context */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .glass-panel {
            background: rgba(38, 37, 40, 0.4);
            backdrop-filter: blur(16px);
            border-top: 1px solid rgba(190, 242, 100, 0.1);
            border-left: 1px solid rgba(190, 242, 100, 0.1);
        }
        .neon-glow {
            box-shadow: 0 0 20px rgba(190, 242, 100, 0.15);
        }
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-shimmer {
            animation: shimmer 2s infinite linear;
        }
      `,
        }}
      />

      <div className="px-4 md:px-8 py-8 md:py-12 max-w-6xl mx-auto space-y-12 animate-fade-in text-zinc-100 selection:bg-[#bef264] selection:text-black">
        {/* Welcome Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">
                Performance Overview
              </span>
              <h2 className="text-4xl font-black tracking-tighter text-white">
                Welcome back, {user?.firstName}.{" "}
                <span className="text-4xl animate-wave">👋</span>
              </h2>
              <p className="text-zinc-400 mt-2 max-w-lg">
                You're making great progress in your interview preparations.
                Keep the momentum going to achieve your targeted role.
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              {loading ? (
                <Skeleton className="min-w-[280px] h-[140px] rounded-2xl" />
              ) : subscription ? (
                <div className="bg-[#bef264] rounded-2xl p-6 flex flex-col gap-5 shadow-[0_20px_50px_-12px_rgba(190,242,100,0.4)] min-w-[280px] group transition-all duration-500 hover:scale-[1.02]">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-black text-black uppercase tracking-[0.2em] leading-none shrink-0 opacity-80">
                      {subscription.tier}
                    </span>
                    <Link
                      to="/pricing"
                      className="text-[10px] font-black text-black/60 hover:text-black transition-all uppercase tracking-widest leading-none border-b border-black/10 hover:border-black pb-0.5 flex items-center gap-1"
                    >
                      Upgrade <FiChevronRight />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[11px] font-black tracking-[0.15em] text-black">
                      <span className="uppercase opacity-60">Usage</span>
                      <span className="text-black text-sm italic">
                        {Math.round(subscription.credits || 0)}{" "}
                        <span className="text-black/30 mx-0.5 not-italic">
                          /
                        </span>{" "}
                        {subscription.limits.credits || 200}
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-black/10 rounded-full overflow-hidden p-[1px] border border-black/5 shadow-inner">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-1000 ease-out relative"
                        style={{
                          width: `${Math.min(100, ((subscription.credits || 0) / (subscription.limits.credits || 200)) * 100)}%`,
                        }}
                      >
                        <div className="absolute inset-0 bg-white/10 animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/billing"
                  className="bg-[#bef264] rounded-[2rem] px-8 py-6 flex flex-col justify-center shadow-[0_20px_50px_-12px_rgba(190,242,100,0.3)] group transition-all duration-500 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FiZap
                      className="text-black/40 group-hover:text-black transition-colors"
                      size={18}
                    />
                    <span className="text-black/60 text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-black transition-colors">
                      Current Plan
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-black italic">
                      Free Tier
                    </span>
                    <div className="px-2 py-0.5 rounded bg-black/10 text-[9px] font-black text-black uppercase tracking-widest border border-black/5 uppercase italic">
                      Limited Access
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-[11px] text-black/60 font-black uppercase tracking-widest group-hover:text-black transition-colors">
                      Upgrade to Premium
                    </span>
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-[#bef264] transition-all shadow-sm">
                      <FiArrowRight />
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl glass-panel" />
              ))
          ) : (
            <>
              <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-[#bef264]/20">
            <div className="absolute top-0 right-0 p-4 text-[#bef264] opacity-6 group-hover:opacity-40 transition-opacity">
              <FaClock size={24} />
            </div>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">
              Total Prep Time
            </p>
            <h3 className="text-2xl font-black text-white">
              {formatPrepTime(totalPrepTime)}
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[#bef264] text-xs font-bold flex items-center gap-1 bg-[#bef264]/10 px-2 py-0.5 rounded-md">
                <FiActivity size={12} /> {totalSessions} Sessions
              </span>
           
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-[#bef264]/20">
            <div className="absolute top-0 right-0 p-4 text-[#bef264] opacity-6 group-hover:opacity-40 transition-opacity">
              <FaCheckCircle size={24} />
            </div>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">
              Mocks Completed
            </p>
            <h3 className="text-2xl font-black text-white">
              {completedInterviews.length}
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[#bef264] text-xs font-bold flex items-center gap-1 bg-[#bef264]/10 px-2 py-0.5 rounded-md">
                <FiCheck size={12} />{" "}
                {
                  completedInterviews.filter(
                    (i) =>
                      new Date(i.createdAt) > new Date(Date.now() - 86400000),
                  ).length
                }{" "}
                today
              </span>
            
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-[#bef264]/20">
            <div className="absolute top-0 right-0 p-4 text-[#bef264] opacity-6 group-hover:opacity-40 transition-opacity">
              <FaUsers size={24} />
            </div>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">
              GD Sessions
            </p>
            <h3 className="text-2xl font-black text-white">{gds.length}</h3>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[#bef264] text-xs font-bold flex items-center gap-1 bg-[#bef264]/10 px-2 py-0.5 rounded-md">
                <FiCheck size={12} />{" "}
                {
                  completedGDs.filter(
                    (i) =>
                      new Date(i.createdAt) > new Date(Date.now() - 86400000),
                  ).length
                }{" "}
                today
              </span>
             
            </div>
          </div>

              <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-[#bef264]/20">
                <div className="absolute top-0 right-0 p-4 text-[#bef264] opacity-6 group-hover:opacity-40 transition-opacity">
                  <FiTarget size={24} />
                </div>
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">
                  Avg Session Score
                </p>
                <h3 className="text-2xl font-black text-white">
                  {avgScore > 0 ? avgScore : 0}
                  <span className="text-lg text-zinc-500">%</span>
                </h3>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-md ${avgScore > 70 ? "bg-emerald-500/10 text-emerald-400" : "bg-[#bef264]/10 text-[#bef264]"}`}
                  >
                    <FiTrendingUp size={12} />{" "}
                    {avgScore > 75
                      ? "Excellent"
                      : avgScore > 50
                        ? "Steady"
                        : "Improving"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Activity Grid - Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Main Activities */}
          <div className="lg:col-span-7 md:col-span-12 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">
                Recommended Focus
              </h3>
              <Link
                to="/paths"
                className="text-[#bef264] text-xs font-black uppercase tracking-widest hover:text-[#dcfc9f] transition-colors"
              >
                View all paths
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <>
                  <Skeleton className="md:col-span-2 h-[320px] rounded-[2rem] glass-panel" />
                  <Skeleton className="h-[200px] rounded-[2rem] glass-panel" />
                  <Skeleton className="h-[200px] rounded-[2rem] glass-panel" />
                </>
              ) : (
                <>
                  {/* Featured Activity */}
                  <div
                onClick={() => navigate("/dashboard/setup")}
                className="md:col-span-2 glass-panel p-8 rounded-[2rem] group cursor-pointer border border-[#bef264]/10 hover:border-[#bef264]/40 transition-all duration-500 relative overflow-hidden shadow-[0_0_40px_rgba(190,242,100,0.05)]"
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#bef264]/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-[#bef264]/20 transition-colors duration-700"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-1/2">
                    <h4 className="text-2xl font-black text-white mb-3">
                      Voice Mock Interview
                    </h4>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-[#bef264]/10 text-[#bef264] text-[9px] font-black px-2 py-0.5 rounded border border-[#bef264]/20 uppercase tracking-widest">
                        10 Credits / Interview
                      </span>
                    </div>
                    <p className="text-zinc-400 mb-8 text-sm leading-relaxed font-medium">
                      Engage with our advanced AI behavioral model. Get
                      real-time sentiment analysis and body language feedback.
                    </p>
                    <button className="bg-[#bef264] text-black px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-3">
                      Start Session <FiArrowRight />
                    </button>
                  </div>
                  <div className="w-full md:w-1/2 bg-black/40 p-6 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] uppercase font-black text-zinc-500 mb-6 tracking-widest">
                      Live Feedback Preview
                    </p>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-white">Confidence</span>
                          <span className="text-[#bef264]">85%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#bef264] w-[85%] shadow-[0_0_10px_#bef264]"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-white">Pacing</span>
                          <span className="text-zinc-500">40%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-zinc-500 w-[40%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Activities */}
              <div
                onClick={() => navigate("/gd/setup")}
                className="glass-panel p-6 rounded-[2rem] group hover:bg-zinc-800/80 transition-colors cursor-pointer border border-transparent hover:border-white/10"
              >
                <h4 className="text-lg font-black text-white mb-1">
                  GD Simulator
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">
                    8 Credits / GD
                  </span>
                </div>
                <p className="text-zinc-400 text-xs font-medium mb-8 leading-relaxed">
                  Practice group dynamics with 5 AI personas. Master the art of
                  leading and listening.
                </p>
                <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  <span>Join simulator</span>
                  <FiChevronRight size={14} />
                </div>
              </div>

                  <div
                    onClick={() => navigate("/billing")}
                    className="glass-panel p-6 rounded-[2rem] group hover:bg-zinc-800/80 transition-colors cursor-pointer border border-transparent hover:border-white/10"
                  >
                    <h4 className="text-lg font-black text-white mb-2">
                      Upgrade Plan
                    </h4>
                    <p className="text-zinc-400 text-xs font-medium mb-8 leading-relaxed">
                      Get specific improvements, advanced insights, and extended
                      usage limits tailored to you.
                    </p>
                    <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      <span>View Options</span>
                      <FiChevronRight size={14} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Analytics & Charts */}
          <div className="lg:col-span-5 md:col-span-12 space-y-8 h-full">
            <div className="glass-panel p-6 rounded-3xl h-full border border-white/5 flex flex-col w-full min-h-[460px]">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-lg font-black text-white mb-1">
                    Analytical Skill Analysis
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                    Multi-dimensional performance
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#bef264]"></div>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                      Mock Interview
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                      GD Platform
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full flex-1 flex items-center justify-center -mt-4">
                {loading ? (
                  <Skeleton className="w-[320px] h-[320px] rounded-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={skillMatrix}
                    >
                      <PolarGrid stroke="rgba(255,255,255,0.05)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#71717a", fontSize: 10, fontWeight: 800 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name="Interview"
                        dataKey="Interview"
                        stroke="#bef264"
                        fill="#bef264"
                        fillOpacity={0.2}
                        strokeWidth={3}
                      />
                      <Radar
                        name="GD"
                        dataKey="GD"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.2}
                        strokeWidth={3}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                        itemStyle={{ fontWeight: 800 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="mt-6 flex justify-around p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                {loading ? (
                  <Skeleton className="w-full h-12" />
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">
                        Top Skill
                      </p>
                      <p className="text-sm font-black text-[#bef264]">
                        {avgScore > 0
                          ? skillMatrix.reduce((a, b) =>
                            a.Interview + a.GD > b.Interview + b.GD ? a : b,
                          ).subject
                          : "Pending"}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-white/5"></div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">
                        Status
                      </p>
                      <p className="text-sm font-black text-white">
                        {totalSessions > 5
                          ? "Stable"
                          : totalSessions > 0
                            ? "Building"
                            : "Incomplete"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <section>
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-black text-white">Recent Feedback</h3>
              <button className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                <FiMoreHorizontal size={18} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-900/50">
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      Type
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      Title
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      Date
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      Score
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {loading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <tr key={i}>
                          <td colSpan={6} className="px-5 py-4">
                            <Skeleton className="h-8 w-full" />
                          </td>
                        </tr>
                      ))
                  ) : (
                    <>
                      {[...completedInterviews, ...completedGDs]
                        .sort(
                          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                        )
                        .slice(0, 5)
                        .map((session, idx) => (
                          <tr
                            key={session._id || idx}
                            className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                            onClick={() =>
                              navigate(
                                session.interviewType
                                  ? `/interview/result/${session._id}`
                                  : `/gd/result/${session._id}`,
                              )
                            }
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${session.interviewType ? "bg-[#bef264]/10 text-[#bef264]" : "bg-amber-500/10 text-amber-500"}`}
                                >
                                  {session.interviewType ? (
                                    <FiVideo size={14} />
                                  ) : (
                                    <FiUsers size={14} />
                                  )}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                                  {session.interviewType ? "Interview" : "GD"}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span className="font-bold text-white group-hover:text-[#bef264] transition-colors line-clamp-1">
                                {session.interviewType
                                  ? session.metadata?.role || "Interview"
                                  : session.topic}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className="px-2 py-1 rounded bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/20 text-[9px] font-black uppercase tracking-[0.1em]">
                                Done
                              </span>
                            </td>
                            <td className="px-5 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                              {differenceInHours(
                                new Date(),
                                new Date(session.createdAt),
                              ) < 12
                                ? formatDistanceToNow(new Date(session.createdAt), {
                                  addSuffix: true,
                                })
                                : format(
                                  new Date(session.createdAt),
                                  "MMM d, yyyy",
                                )}
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-base font-black text-white group-hover:text-[#bef264] transition-colors">
                                {session.report?.overallScore || "-"}
                                <span className="text-[10px] text-zinc-500 ml-1">
                                  %
                                </span>
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <button className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-[#bef264] transition-colors flex items-center gap-1">
                                Review <FiChevronRight size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      {interviews.length === 0 && gds.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs"
                          >
                            No sessions completed yet.
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default DashboardOverview;
