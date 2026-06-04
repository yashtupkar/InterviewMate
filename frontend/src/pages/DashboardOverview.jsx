import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiClock,
  FiCheckCircle,
  FiActivity,
  FiUsers,
  FiVideo,
  FiTrendingUp,
  FiTarget,
  FiMoreHorizontal,
  FiChevronRight,
  FiChevronLeft,
  FiPlay,
  FiUser,
  FiBookOpen,
  FiMic,
  FiFileText,
  FiAward,
  FiDatabase,
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
import { FaCheckCircle, FaClock, FaUsers, FaUserCircle } from "react-icons/fa";
import Skeleton from "../components/common/Skeleton";

const DashboardOverview = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [gds, setGDs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);

  // Feature cards configuration
  const featureCards = [
    {
      id: "ai-mock-interview",
      title: "AI Mock Interview",
      description: "Practice realistic interviews with instant AI feedback.",
      icon: FiMic,
      credits: 10,
      badge: "Live",
      meta: ["Behavioral", "Technical"],
      partners: ["AI Coach", "Instant Feedback", "Detailed Reports"],

      image:
        "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400",
      cta: "Start Interview",
      path: "/interview/setup",
      color: "#bef264",
    },
    {
      id: "ai-gd-simulator",
      title: "AI GD Simulator",
      description: "Run panel-style discussions with five AI personas.",
      icon: FiUsers,
      credits: 8,
      badge: "Group",
      meta: ["Panel", "Debate", "Abstract Topics"],
      partners: ["GD Coach", "Realtime Scoring"],
      image:
        "https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=400",
      cta: "Join GD",
      path: "/gd/setup",
      color: "#f59e0b",
    },
    {
      id: "ats-scanner",
      title: "ATS Scanner",
      description: "Scan resume keywords and get ATS match fixes.",
      icon: FiAward,
      credits: 5,
      badge: "Scanner",
      meta: ["Keyword Match", "Instant Score"],
      partners: ["Job JD Match", "Parser Safe", "ATS Ready"],
      image:
        "https://images.pexels.com/photos/5989927/pexels-photo-5989927.jpeg?auto=compress&cs=tinysrgb&w=400",
      cta: "Scan Resume",
      path: "/tools/ats",
      color: "#3b82f6",
    },
    {
      id: "resume-builder",
      title: "AI Resume Builder",
      description: "Build polished resumes fast with AI writing help.",
      icon: FiFileText,
      credits: 15,
      badge: "Builder",
      meta: ["Templates", "AI Rewrite", "Export PDF"],
      partners: ["Role-specific", "Modern Layouts", "One Click"],
      image:
        "https://images.pexels.com/photos/5989925/pexels-photo-5989925.jpeg?auto=compress&cs=tinysrgb&w=400",
      cta: "Build Resume",
      path: "/tools/resume",
      color: "#8b5cf6",
    },
    {
      id: "question-bank",
      title: "Interview Question Bank",
      description: "Practice with 1200+ curated interview questions.",
      icon: FiDatabase,
      credits: 0,
      badge: "1200+",
      meta: ["Company-wise", "Role-wise"],
      partners: ["Theory", "Coding", "HR"],
      image:
        "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400",
      cta: "Explore Questions",
      path: "/interview-questions",
      color: "#ec4899",
    },
    {
      id: "peer-interview-practice",
      title: "Peer Interview Practice",
      description: "Practice interviews with peers in a live room format.",
      icon: FiVideo,
      credits: 6,
      badge: "Peers",
      meta: ["Live Rooms", "Peer Feedback", "Turn-based Q&A"],
      partners: ["Practice Buddy", "Video + Voice", "Community"],
      image:
        "https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=400",
      cta: "Practice with Peers",
      path: "/interview/setup?mode=peer",
      color: "#22c55e",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const [interviewsRes, gdsRes, subscriptionRes, resumesRes] =
          await Promise.all([
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
            user?.id
              ? axios.get(
                  `${import.meta.env.VITE_BACKEND_URL}/api/resume/${user.id}`,
                )
              : Promise.resolve({ data: { data: [] } }),
          ]);

        const interviewsData = interviewsRes.data || [];
        const gdsData = gdsRes.data || [];
        const resumesData = resumesRes?.data?.data || [];

        setInterviews(interviewsData);
        setGDs(gdsData);
        setResumes(resumesData);
        setSubscription(subscriptionRes.data || null);

        // Combine and sort recent activities
        const allActivities = [
          ...interviewsData.map((i) => ({ ...i, type: "interview" })),
          ...gdsData.map((g) => ({ ...g, type: "gd" })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setRecentActivities(allActivities.slice(0, 5));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken, user?.id]);

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

  const totalPrepTime = [...completedInterviews, ...completedGDs].reduce(
    (acc, session) => {
      let sessionMins = 0;
      if (session.actualDuration > 0) {
        sessionMins = Math.round(session.actualDuration / 60);
      } else if (session.duration > 0) {
        sessionMins = Math.round(session.duration / 60);
      } else if (session.metadata?.duration) {
        sessionMins = session.metadata.duration;
      } else {
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

  const mainCredits = subscription?.credits || 0;
  const creditLimit = subscription?.limits?.credits || 200;
  const topupCredits = subscription?.topupCredits || 0;
  const totalCredits = Math.round(mainCredits + topupCredits);

  const completionRate =
    totalSessions > 0
      ? Math.round(
          ((completedInterviews.length + completedGDs.length) / totalSessions) *
            100,
        )
      : 32; // Default from image

  const contributionCalendar = React.useMemo(() => {
    const dailyActivity = new Map();

    const addActivity = (timestamp) => {
      if (!timestamp) return;
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) return;
      const key = format(date, "yyyy-MM-dd");
      dailyActivity.set(key, (dailyActivity.get(key) || 0) + 1);
    };

    interviews.forEach((item) => {
      addActivity(item.createdAt);
      addActivity(item.updatedAt);
    });

    gds.forEach((item) => {
      addActivity(item.createdAt);
      addActivity(item.updatedAt);
    });

    resumes.forEach((item) => {
      addActivity(item.createdAt);
      addActivity(item.updatedAt);
    });

    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 139);

    const days = [];
    for (let i = 0; i < 140; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = format(date, "yyyy-MM-dd");
      days.push({ date, count: dailyActivity.get(key) || 0 });
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const activeDays = days.reduce(
      (count, day) => (day.count > 0 ? count + 1 : count),
      0,
    );

    return { weeks, activeDays };
  }, [interviews, gds, resumes]);

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

  return (
    <>
      <Helmet>
        <title>Dashboard | PlaceMateAI</title>
      </Helmet>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .dashboard-container {
          
          min-height: 100vh;
        }
        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(190, 242, 100, 0.1);
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .feature-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(190, 242, 100, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5);
        }
        .feature-card:hover .feature-image {
          transform: scale(1.05);
        }
        .feature-image {
          transition: transform 0.5s ease;
        }
        .tool-card {
          background: linear-gradient(
            155deg,
            rgba(255, 255, 255, 0.08),
            rgba(255, 255, 255, 0.03)
          );
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(12px);
          transition: transform 0.28s ease, border-color 0.28s ease,
            box-shadow 0.28s ease;
        }
        .tool-card:hover {
          transform: translateY(-4px);
          border-color: rgba(190, 242, 100, 0.35);
          box-shadow: 0 18px 30px -18px rgba(0, 0, 0, 0.75);
        }
        .tool-card:hover .tool-card-media img {
          transform: scale(1.06);
        }
        .tool-card-media img {
          transition: transform 0.45s ease;
        }
        .tool-chip {
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.08);
          color: #e5e7eb;
        }
        .tool-chip-accent {
          border: 1px solid rgba(190, 242, 100, 0.32);
          background: rgba(190, 242, 100, 0.14);
          color: #d9f99d;
        }

        .progress-ring {
          transform: rotate(-90deg);
        }
        .credit-badge {
          background: rgba(190, 242, 100, 0.15);
          border: 1px solid rgba(190, 242, 100, 0.3);
          color: #bef264;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(190, 242, 100, 0.1); }
          50% { box-shadow: 0 0 30px rgba(190, 242, 100, 0.2); }
        }
        .pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .activity-item {
          transition: all 0.2s ease;
        }
        .activity-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }
      `,
        }}
      />

      <div className="dashboard-container bg-transparent text-white">
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-6xl mx-auto">
          {/* Header with Welcome Message */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <span className="text-[#bef264] underline text-xs  uppercase tracking-wider">
                  PlaceMate-AI
                </span>
                <h1 className="text-xl md:text-2xl lg:text-3xl  mt-2 text-white">
                  Ace <span className="text-[#bef264]">Interviews</span>{" "}
                  End-to-End
                </h1>
                <p className="text-sm md:text-base text-zinc-300 mt-2 max-w-xl">
                  Beyond AI mock rounds, this is your complete prep platform.
                </p>
              </div>
              {subscription && (
                <div className="flex items-center gap-3 bg-white/5 rounded-full p-2  border border-white/10">
                  <FiZap className="text-[#bef264] ml-2" />
                  <span className="text-sm font-semibold">
                    {totalCredits} Credits
                  </span>
                  <Link
                    to="/pricing"
                    className="bg-[#bef264] text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-[#d4f57a] transition-colors"
                  >
                    Get More
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Card - Moved Above Continue Watching */}
          <div className="mb-8 flex items-start gap-2 w-full ">
            <div className="flex flex-col items-center justify-center gap-4 w-full">
              <div className="bg-white/10 w-full rounded-2xl p-6 md:p-8">
                <div className="flex items-center justify-between gap-6">
                  {/* Left - User Profile */}
                  <div className="flex items-center gap-4">
                    {loading ? (
                      <Skeleton className="w-16 h-16 rounded-full" />
                    ) : (
                      <>
                        {user?.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt={user.fullName}
                            className="w-20 h-20 rounded-xl border-2 border-zinc-700  object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-[#bef264]/20 border-2 border-[#bef264] flex items-center justify-center">
                            <FaUserCircle className="text-[#bef264] text-4xl" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold">
                            Welcome, {user?.firstName || "User"}{" "}
                            <span className="animate-wave text-2xl">👋</span>
                          </h3>
                          <p className="text-sm text-gray-400">
                            {user?.primaryEmailAddress?.emailAddress ||
                              "user@example.com"}
                          </p>
                          <p className="text-xs text-[#bef264] mt-1">
                            Member since{" "}
                            {user?.createdAt
                              ? format(new Date(user.createdAt), "MMM yyyy")
                              : "2024"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Center - Progress Ring */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-6">
                      <div className="relative w-20 h-20">
                        <svg
                          className="w-full h-full progress-ring"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="6"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#bef264"
                            strokeWidth="6"
                            strokeDasharray={`${completionRate * 2.827} 282.7`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold">
                            {completionRate}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Completion Rate</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {completedInterviews.length + completedGDs.length} of{" "}
                          {totalSessions} sessions
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom Stats Bar */}
              <div className="grid grid-cols-2 w-full md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Sessions",
                    value: totalSessions,
                    icon: FiVideo,
                    color: "#bef264",
                  },
                  {
                    label: "Average Score",
                    value: `${avgScore}%`,
                    icon: FiTarget,
                    color: "#f59e0b",
                  },
                  {
                    label: "Practice Time",
                    value: formatPrepTime(totalPrepTime),
                    icon: FiClock,
                    color: "#3b82f6",
                  },
                  {
                    label: "Skills Improved",
                    value: skillMatrix.filter((s) => s.Interview > 60).length,
                    icon: FiTrendingUp,
                    color: "#8b5cf6",
                  },
                ].map((stat, index) => (
                  <div key={index} className="bg-white/10 rounded-xl p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] text-gray-300 uppercase tracking-wider">
                          {stat.label}
                        </p>
                        <p className="text-xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div
                        className={` rounded-full  flex items-center justify-center`}
                      >
                        <stat.icon className={`text-[#bef264]`} size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Contribution Calendar */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                  Activity Calendar
                </p>
                <span className="text-xs font-semibold text-[#bef264]">
                  {contributionCalendar.activeDays} active days
                </span>
              </div>

              <div className="flex-1 my-auto min-h-[120px] overflow-hidden">
                <div className="flex gap-1.5 h-full">
                  {contributionCalendar.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-rows-7 gap-1">
                      {week.map((day) => {
                        const levelClass =
                          day.count === 0
                            ? "bg-white/10"
                            : day.count === 1
                              ? "bg-[#bef264]/35"
                              : day.count === 2
                                ? "bg-[#bef264]/60"
                                : "bg-[#bef264]";

                        return (
                          <div
                            key={format(day.date, "yyyy-MM-dd")}
                            title={`${format(day.date, "MMM d, yyyy")}: ${day.count} activity${day.count === 1 ? "" : "ies"}`}
                            className={`w-3 h-3 rounded-[3px] ${levelClass}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <p className="text-[11px] text-zinc-400">
                  Interviews, GDs, and resume updates
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded-[3px] bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-[3px] bg-[#bef264]/35" />
                  <div className="w-2.5 h-2.5 rounded-[3px] bg-[#bef264]/60" />
                  <div className="w-2.5 h-2.5 rounded-[3px] bg-[#bef264]" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
          {/* Feature Cards Slider */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">AI-Powered Tools</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSliderIndex(Math.max(0, sliderIndex - 1))}
                  disabled={sliderIndex === 0}
                  className="p-2 rounded-full bg-white/10 text-[#bef264] hover:bg-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button
                  onClick={() =>
                    setSliderIndex(
                      Math.min(featureCards.length - 1, sliderIndex + 1),
                    )
                  }
                  disabled={sliderIndex === featureCards.length - 1}
                  className="p-2 rounded-full bg-white/10 text-[#bef264] hover:bg-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Slider Container */}
            <div className="relative overflow-x-auto overflow-y-hidden scrollbar-hide">
              <style>{`
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div
                className="flex gap-6 transition-transform duration-500 ease-out pb-2"
                style={{
                  transform: `translateX(calc(-${sliderIndex * (100 / Math.max(1, Math.floor(featureCards.length / 2)))}% - ${sliderIndex * 24}px))`,
                }}
              >
                {featureCards.map((feature) => (
                  <div key={feature.id} className="flex-shrink-0 max-w-64">
                    <div
                      onClick={() => navigate(feature.path)}
                      className="group cursor-pointer rounded-2xl bg-white/10 backdrop-blur-xl p-3 transition-all duration-300 hover:bg-zinc-800/70 hover:shadow-[0_0_25px_rgba(190,242,100,0.08)] h-full"
                    >
                      {/* IMAGE */}
                      <div className="relative h-36 rounded-xl overflow-hidden">
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover scale-105 group-hover:scale-110 transition duration-500"
                        />

                        {/* badge */}
                        <div className="absolute top-2 left-2 px-2 py-1 text-[10px] rounded-full bg-zinc-800/80 text-zinc-300">
                          {feature.badge}
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="pt-4 px-1">
                        {/* CTA */}
                        <button className="w-full mb-4 border-b-4  border-lime-800/60 cursor-pointer py-2.5 rounded-lg text-sm font-semibold bg-[#bef264] text-black flex items-center justify-center gap-2 transition-all duration-300 hover:gap-3 hover:shadow-[0_0_20px_rgba(190,242,100,0.4)]">
                          {feature.cta}
                          <FiArrowRight size={14} />
                        </button>

                        <h3 className="text-xl mb-2 font-light text-white leading-tight">
                          {feature.title}
                        </h3>

                        <p className="text-sm text-zinc-400 leading-snug min-h-[42px]">
                          {feature.description}
                        </p>

                        {/* meta */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {feature.meta.map((item) => (
                            <span
                              key={item}
                              className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 text-zinc-400"
                            >
                              {item}
                            </span>
                          ))}
                        </div>

                        {/* partners */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {feature.partners.slice(0, 2).map((item) => (
                            <span
                              key={item}
                              className="text-[10px] px-2 py-1 rounded-full bg-[#bef264]/10 text-[#bef264]"
                            >
                              {item}
                            </span>
                          ))}

                          {feature.partners.length > 2 && (
                            <span className="text-[10px] text-zinc-500">
                              + more
                            </span>
                          )}
                        </div>

                        {/* live */}
                        {feature.liveText && (
                          <div className="mt-3 flex items-center gap-2 text-[11px] text-[#bef264]">
                            <span className="w-1.5 h-1.5 bg-[#bef264] rounded-full animate-pulse" />
                            {feature.liveText}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Continue Watching / Recent Activity Section */}
          <div className="mb-8 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold">
                Continue Your Prep
              </h2>
              <Link
                to="/history"
                className="text-[#bef264] text-sm font-semibold hover:underline flex items-center gap-1"
              >
                View All <FiChevronRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activities List */}
              <div className="lg:col-span-2">
                <div className="feature-card rounded-xl p-5">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <FiActivity className="text-[#bef264]" />
                    Recent Sessions
                  </h3>

                  {loading ? (
                    <div className="space-y-3">
                      {Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-20 w-full rounded-lg"
                          />
                        ))}
                    </div>
                  ) : recentActivities.length > 0 ? (
                    <div className="space-y-2">
                      {recentActivities.map((activity, index) => (
                        <div
                          key={activity._id || index}
                          className="activity-item p-3 rounded-lg cursor-pointer border border-transparent hover:border-white/10"
                          onClick={() =>
                            navigate(
                              activity.type === "interview"
                                ? `/interview/result/${activity._id}`
                                : `/gd/result/${activity._id}`,
                            )
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                activity.type === "interview"
                                  ? "bg-[#bef264]/10 text-[#bef264]"
                                  : "bg-amber-500/10 text-amber-500"
                              }`}
                            >
                              {activity.type === "interview" ? (
                                <FiMic size={18} />
                              ) : (
                                <FiUsers size={18} />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm">
                                  {activity.type === "interview"
                                    ? activity.metadata?.role ||
                                      "Mock Interview"
                                    : activity.topic || "Group Discussion"}
                                </h4>
                                <span className="text-xs text-gray-400">
                                  {differenceInHours(
                                    new Date(),
                                    new Date(activity.createdAt),
                                  ) < 24
                                    ? formatDistanceToNow(
                                        new Date(activity.createdAt),
                                        { addSuffix: true },
                                      )
                                    : format(
                                        new Date(activity.createdAt),
                                        "MMM d, yyyy",
                                      )}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-gray-400">
                                  {activity.type === "interview"
                                    ? "AI Interview"
                                    : "GD Simulator"}
                                </span>
                                {activity.report?.overallScore && (
                                  <span className="text-xs font-bold text-[#bef264]">
                                    Score: {activity.report.overallScore}%
                                  </span>
                                )}
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    activity.status === "completed"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-yellow-500/20 text-yellow-400"
                                  }`}
                                >
                                  {activity.status === "completed"
                                    ? "Completed"
                                    : "In Progress"}
                                </span>
                              </div>
                            </div>
                            <FiChevronRight className="text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <FiActivity className="mx-auto text-3xl mb-2 opacity-50" />
                      <p>No recent sessions</p>
                      <button
                        onClick={() => navigate("/interview/setup")}
                        className="mt-3 text-[#bef264] text-sm font-semibold hover:underline"
                      >
                        Start your first session
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Skill Analysis Mini */}
              <div className="feature-card rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FiTarget className="text-[#bef264]" />
                  Skill Analysis
                </h3>

                {loading ? (
                  <Skeleton className="w-full h-48" />
                ) : (
                  <>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={skillMatrix}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#9ca3af", fontSize: 9 }}
                          />
                          <Radar
                            name="Skills"
                            dataKey="Interview"
                            stroke="#bef264"
                            fill="#bef264"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {skillMatrix.slice(0, 3).map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-400">{skill.subject}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#bef264] rounded-full"
                                style={{ width: `${skill.Interview}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-[#bef264]">
                              {skill.Interview}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardOverview;
