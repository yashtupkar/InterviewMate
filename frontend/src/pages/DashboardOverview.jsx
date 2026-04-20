// import React, { useState, useEffect } from "react";
// import { Helmet } from "react-helmet-async";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   FiPlus,
//   FiArrowRight,
//   FiClock,
//   FiCheckCircle,
//   FiStar,
//   FiActivity,
//   FiUsers,
//   FiMessageSquare,
//   FiVideo,
//   FiTrendingUp,
//   FiTarget,
//   FiAward,
//   FiMoreHorizontal,
//   FiChevronRight,
//   FiCheck,
//   FiLoader,
//   FiZap,
// } from "react-icons/fi";
// import axios from "axios";
// import { useAuth, useUser } from "@clerk/clerk-react";
// import {
//   Radar,
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   ResponsiveContainer,
//   Tooltip,
// } from "recharts";
// import { formatDistanceToNow, differenceInHours, format } from "date-fns";
// import { interviewAgents } from "../constants/agents";
// import { GoClockFill } from "react-icons/go";
// import { FaCheckCircle, FaClock, FaUsers } from "react-icons/fa";
// import Skeleton from "../components/common/Skeleton";

// const DashboardOverview = () => {
//   const { getToken } = useAuth();
//   const { user } = useUser();
//   const navigate = useNavigate();
//   const [interviews, setInterviews] = useState([]);
//   const [gds, setGDs] = useState([]);
//   const [subscription, setSubscription] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = await getToken();
//         const [interviewsRes, gdsRes, subscriptionRes] = await Promise.all([
//           axios.get(
//             `${import.meta.env.VITE_BACKEND_URL}/api/vapi-interview/user`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             },
//           ),
//           axios.get(
//             `${import.meta.env.VITE_BACKEND_URL}/api/group-discussion/my-sessions`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             },
//           ),
//           axios.get(
//             `${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             },
//           ),
//         ]);

//         setInterviews(interviewsRes.data || []);
//         setGDs(gdsRes.data || []);
//         setSubscription(subscriptionRes.data || null);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [getToken]);

//   const completedInterviews = interviews.filter(
//     (i) =>
//       i.status === "completed" ||
//       i.status === "analysis_pending" ||
//       i.report?.overallScore !== undefined,
//   );
//   const completedGDs = gds.filter(
//     (g) =>
//       g.status === "completed" ||
//       g.status === "analysis_pending" ||
//       g.report?.overallScore !== undefined,
//   );
//   const totalSessions = interviews.length + gds.length;

//   const avgScore =
//     totalSessions > 0
//       ? Math.round(
//           [...completedInterviews, ...completedGDs].reduce(
//             (acc, curr) => acc + (curr.report?.overallScore || 0),
//             0,
//           ) / ([...completedInterviews, ...completedGDs].length || 1),
//         )
//       : 0;

//   const skillMatrix = React.useMemo(() => {
//     const subjects = [
//       { subject: "Comm", Interview: 0, GD: 0, fullMark: 100 },
//       { subject: "Depth", Interview: 0, GD: 0, fullMark: 100 },
//       { subject: "Initiative", Interview: 0, GD: 0, fullMark: 100 },
//       { subject: "Logic", Interview: 0, GD: 0, fullMark: 100 },
//       { subject: "Confidence", Interview: 0, GD: 0, fullMark: 100 },
//     ];

//     completedInterviews.forEach((session) => {
//       const report =
//         session.report?.detailedAnalysis?.overall ||
//         session.report?.overall ||
//         session.report;
//       if (report) {
//         subjects[0].Interview += report.communication || 0;
//         subjects[1].Interview += report.correctness || 0;
//         subjects[2].Interview += report.creativity || 0;
//         subjects[3].Interview += report.relevance || 0;
//         subjects[4].Interview += report.problemSolving || 0;
//       }
//     });

//     completedGDs.forEach((session) => {
//       const report = session.report;
//       if (report) {
//         subjects[0].GD += report.communicationScore || 0;
//         subjects[1].GD += report.depthScore || 0;
//         subjects[2].GD += report.initiationScore || 0;
//         subjects[3].GD += report.relevanceScore || 0;
//         subjects[4].GD += report.contributionScore || 0;
//       }
//     });

//     return subjects.map((s) => ({
//       ...s,
//       Interview:
//         completedInterviews.length > 0
//           ? Math.round(s.Interview / completedInterviews.length)
//           : 0,
//       GD: completedGDs.length > 0 ? Math.round(s.GD / completedGDs.length) : 0,
//     }));
//   }, [completedInterviews, completedGDs]);

//   const totalPrepTime = [...completedInterviews, ...completedGDs].reduce(
//     (acc, session) => {
//       let sessionMins = 0;

//       // Check if it's an interview (has actualDuration or metadata) or GD (has duration)
//       if (session.actualDuration > 0) {
//         // actualDuration is stored in seconds
//         sessionMins = Math.round(session.actualDuration / 60);
//       } else if (session.duration > 0) {
//         // GD duration is stored in seconds
//         sessionMins = Math.round(session.duration / 60);
//       } else if (session.metadata?.duration) {
//         // Fallback to metadata duration (usually in minutes)
//         sessionMins = session.metadata.duration;
//       } else {
//         // Default fallback
//         sessionMins = 10;
//       }

//       return acc + sessionMins;
//     },
//     0,
//   );

//   const formatPrepTime = (totalMins) => {
//     if (totalMins < 60) return `${totalMins}m`;
//     const h = Math.floor(totalMins / 60);
//     const m = totalMins % 60;
//     return m > 0 ? `${h}h ${m}m` : `${h}h`;
//   };

//   const mainCredits = subscription?.credits || 0;
//   const creditLimit = subscription?.limits?.credits || 200;
//   const topupCredits = subscription?.topupCredits || 0;
//   const isMainCreditsLow =
//     mainCredits <= Math.max(10, Math.round(creditLimit * 0.15));

//   // Removed global loading check to support skeleton loaders

//   return (
//     <>
//       <Helmet>
//         <title>Dashboard | PlaceMateAI</title>
//       </Helmet>

//       {/* Include custom generic styles matching Stitch mockup context */}
//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
//         .glass-panel {
//             background: rgba(38, 37, 40, 0.4);
//             backdrop-filter: blur(16px);
//             border-top: 1px solid rgba(190, 242, 100, 0.1);
//             border-left: 1px solid rgba(190, 242, 100, 0.1);
//         }
//         .neon-glow {
//             box-shadow: 0 0 20px rgba(190, 242, 100, 0.15);
//         }
//         @keyframes shimmer {
//             0% { transform: translateX(-100%); }
//             100% { transform: translateX(100%); }
//         }
//         .animate-shimmer {
//             animation: shimmer 2s infinite linear;
//         }
//       `,
//         }}
//       />

//       <div className="px-4 md:px-8 py-8 md:py-12 max-w-6xl mx-auto space-y-6 md:space-y-12 animate-fade-in text-zinc-100 selection:bg-[#bef264] selection:text-black">
//         {/* Welcome Section */}
//         <section>
//           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
//             <div>
//               <span className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">
//                 Performance Overview
//               </span>
//               <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-white">
//                 Welcome,{" "}
//                 <span className="text-[#bef264] capitalize">
//                   {user?.firstName}
//                 </span>
//                 . <span className="text-3xl md:text-4xl animate-wave">👋</span>
//               </h2>
//               <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-lg">
//                 You're making great progress in your interview preparations.
//                 Keep the momentum going to achieve your targeted role.
//               </p>
//             </div>
//             <div className="flex gap-4 w-full md:w-auto">
//               {loading ? (
//                 <Skeleton className="min-w-[280px] h-[140px] rounded-2xl" />
//               ) : subscription ? (
//                 <div className="relative bg-[#bef264] rounded-2xl p-3 md:p-6 flex flex-col gap-5 shadow-[0_20px_50px_-12px_rgba(190,242,100,0.4)] w-full md:min-w-[280px] group transition-all duration-500 ">
//                   <div className="flex items-center justify-between ">
//                     <span className="text-[11px] font-black text-black uppercase tracking-[0.2em] leading-none shrink-0 opacity-80">
//                       {subscription.tier}
//                     </span>
//                     <Link
//                       to="/pricing"
//                       className="text-[10px] font-black text-black/60 hover:text-black transition-all uppercase tracking-widest leading-none border-b border-black/10 hover:border-black pb-0.5 flex items-center gap-1"
//                     >
//                       Upgrade <FiChevronRight />
//                     </Link>
//                   </div>

//                   <div className="space-y-3">
//                     <div className="relative flex items-center justify-between gap-3 text-black ">
//                       <div>
//                         <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/60 ">
//                           Main Credits
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-[12px] leading-none font-black italic mt-1">
//                           {Math.round(mainCredits)}
//                           <span className="text-black/35 mx-1 not-italic">
//                             /
//                           </span>
//                           {creditLimit}
//                         </p>
//                       </div>

//                       <div className="absolute right-0 top-11 z-30 w-48 rounded-lg border border-black/15 bg-[#d7f6a7] shadow-xl px-3 py-2.5 space-y-1.5 text-[10px] font-black tracking-[0.18em] text-black opacity-0 pointer-events-none translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0">
//                         <div className="flex items-center justify-between">
//                           <span className="uppercase opacity-60">
//                             Available
//                           </span>
//                           <span className="italic">
//                             {Math.round(mainCredits + topupCredits)}
//                           </span>
//                         </div>
//                         <div className="flex items-center justify-between">
//                           <span className="uppercase opacity-60">Main</span>
//                           <span className="italic">
//                             {Math.round(mainCredits)}
//                           </span>
//                         </div>
//                         <div className="flex items-center justify-between">
//                           <span className="uppercase opacity-60">Top-up</span>
//                           <span className="italic">
//                             {Math.round(topupCredits)}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden p-[1px] border border-black/5 shadow-inner">
//                       <div
//                         className="h-full bg-black rounded-full transition-all duration-1000 ease-out relative"
//                         style={{
//                           width: `${Math.min(100, (mainCredits / creditLimit) * 100)}%`,
//                         }}
//                       >
//                         <div className="absolute inset-0 bg-white/10 animate-shimmer"></div>
//                       </div>
//                     </div>

//                     {topupCredits > 0 && (
//                       <div className="space-y-1">
//                         <div className="flex items-center justify-between  font-black uppercase tracking-[0.18em] text-black/60">
//                           <span className="text-[10px]">Top-up Credits</span>
//                           <span className="text-[12px] text-black">
//                             {Math.round(topupCredits)}
//                           </span>
//                         </div>
//                         {/* <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden p-[1px] border border-black/5 shadow-inner">
//                           <div
//                             className="h-full bg-black/70 rounded-full transition-all duration-1000 ease-out"
//                             style={{
//                               width: `${Math.min(100, (topupCredits / Math.max(mainCredits + topupCredits, 1)) * 100)}%`,
//                             }}
//                           />
//                         </div> */}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <Link
//                   to="/billing"
//                   className="bg-[#bef264] rounded-[2rem] px-8 py-6 flex flex-col justify-center shadow-[0_20px_50px_-12px_rgba(190,242,100,0.3)] group transition-all duration-500 hover:scale-[1.02]"
//                 >
//                   <div className="flex items-center gap-3 mb-2">
//                     <FiZap
//                       className="text-black/40 group-hover:text-black transition-colors"
//                       size={18}
//                     />
//                     <span className="text-black/60 text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-black transition-colors">
//                       Current Plan
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <span className="text-2xl font-black text-black italic">
//                       Free Tier
//                     </span>
//                     <div className="px-2 py-0.5 rounded bg-black/10 text-[9px] font-black text-black uppercase tracking-widest border border-black/5 italic">
//                       Limited Access
//                     </div>
//                   </div>
//                   <div className="mt-5 flex items-center justify-between">
//                     <span className="text-[11px] text-black/60 font-black uppercase tracking-widest group-hover:text-black transition-colors">
//                       Upgrade to Premium
//                     </span>
//                     <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-[#bef264] transition-all shadow-sm">
//                       <FiArrowRight />
//                     </div>
//                   </div>
//                 </Link>
//               )}
//             </div>
//           </div>
//         </section>

//         <section>
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
//             {loading ? (
//               Array(4)
//                 .fill(0)
//                 .map((_, i) => (
//                   <Skeleton
//                     key={i}
//                     className="h-32 w-full rounded-2xl glass-panel"
//                   />
//                 ))
//             ) : (
//               <>
//                 <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-[#bef264]/20">
//                   <div className="absolute top-6 md:top-0  right-0 p-4 text-[#bef264] opacity-6 group-hover:opacity-40 transition-opacity">
//                     <FaClock size={24} />
//                   </div>
//                   <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">
//                     Total Prep Time
//                   </p>
//                   <h3 className="text-2xl font-black text-white">
//                     {formatPrepTime(totalPrepTime)}
//                   </h3>
//                   <div className="mt-3 flex items-center gap-2">
//                     <span className="text-[#bef264] text-xs font-bold flex items-center gap-1 bg-[#bef264]/10 px-2 py-0.5 rounded-md">
//                       <FiActivity size={12} /> {totalSessions} Sessions
//                     </span>
//                   </div>
//                 </div>

//                 <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-[#bef264]/20">
//                   <div className="absolute top-6 md:top-0  right-0 p-4 text-[#bef264] opacity-6 group-hover:opacity-40 transition-opacity">
//                     <FaCheckCircle size={24} />
//                   </div>
//                   <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">
//                     Mocks Completed
//                   </p>
//                   <h3 className="text-2xl font-black text-white">
//                     {completedInterviews.length}
//                   </h3>
//                   <div className="mt-3 flex items-center gap-2">
//                     <span className="text-[#bef264] text-xs font-bold flex items-center gap-1 bg-[#bef264]/10 px-2 py-0.5 rounded-md">
//                       <FiCheck size={12} />{" "}
//                       {
//                         completedInterviews.filter(
//                           (i) =>
//                             new Date(i.createdAt) >
//                             new Date(Date.now() - 86400000),
//                         ).length
//                       }{" "}
//                       today
//                     </span>
//                   </div>
//                 </div>

//                 <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-[#bef264]/20">
//                   <div className="absolute top-6 md:top-0  right-0 p-4 text-[#bef264] opacity-6 group-hover:opacity-40 transition-opacity">
//                     <FaUsers size={24} />
//                   </div>
//                   <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">
//                     GD Sessions
//                   </p>
//                   <h3 className="text-2xl font-black text-white">
//                     {gds.length}
//                   </h3>
//                   <div className="mt-3 flex items-center gap-2">
//                     <span className="text-[#bef264] text-xs font-bold flex items-center gap-1 bg-[#bef264]/10 px-2 py-0.5 rounded-md">
//                       <FiCheck size={12} />{" "}
//                       {
//                         completedGDs.filter(
//                           (i) =>
//                             new Date(i.createdAt) >
//                             new Date(Date.now() - 86400000),
//                         ).length
//                       }{" "}
//                       today
//                     </span>
//                   </div>
//                 </div>

//                 <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-[#bef264]/20">
//                   <div className="absolute top-6 md:top-0  right-0 p-4 text-[#bef264] opacity-6 group-hover:opacity-40 transition-opacity">
//                     <FiTarget size={24} />
//                   </div>
//                   <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">
//                     Avg Session Score
//                   </p>
//                   <h3 className="text-2xl font-black text-white">
//                     {avgScore > 0 ? avgScore : 0}
//                     <span className="text-lg text-zinc-500">%</span>
//                   </h3>
//                   <div className="mt-3 flex items-center gap-2">
//                     <span
//                       className={`text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-md ${avgScore > 70 ? "bg-emerald-500/10 text-emerald-400" : "bg-[#bef264]/10 text-[#bef264]"}`}
//                     >
//                       <FiTrendingUp size={12} />{" "}
//                       {avgScore > 75
//                         ? "Excellent"
//                         : avgScore > 50
//                           ? "Steady"
//                           : "Improving"}
//                     </span>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </section>

//         {/* Activity Grid - Asymmetric Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-8 items-start">
//           {/* Left Column: Main Activities */}
//           <div className="lg:col-span-7 hidden md:block md:col-span-12 space-y-8">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg md:text-xl font-black text-white">
//                 Recommended Focus
//               </h3>
//               <Link
//                 to="/paths"
//                 className="text-[#bef264] text-xs font-black uppercase tracking-widest hover:text-[#dcfc9f] transition-colors"
//               >
//                 View all
//               </Link>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {loading ? (
//                 <>
//                   <Skeleton className="md:col-span-2 h-[320px] rounded-[2rem] glass-panel" />
//                   <Skeleton className="h-[200px] rounded-[2rem] glass-panel" />
//                   <Skeleton className="h-[200px] rounded-[2rem] glass-panel" />
//                 </>
//               ) : (
//                 <>
//                   {/* Featured Activity */}
//                   <div
//                     onClick={() => navigate("/dashboard/setup")}
//                     className="md:col-span-2 glass-panel p-8 rounded-[2rem] group cursor-pointer border border-[#bef264]/10 hover:border-[#bef264]/40 transition-all duration-500 relative overflow-hidden shadow-[0_0_40px_rgba(190,242,100,0.05)]"
//                   >
//                     <div className="absolute top-0 right-0 w-80 h-80 bg-[#bef264]/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-[#bef264]/20 transition-colors duration-700"></div>
//                     <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
//                       <div className="w-full md:w-1/2">
//                         <h4 className="text-2xl font-black text-white mb-3">
//                           Voice Mock Interview
//                         </h4>
//                         <div className="flex items-center gap-2 mb-4">
//                           <span className="bg-[#bef264]/10 text-[#bef264] text-[9px] font-black px-2 py-0.5 rounded border border-[#bef264]/20 uppercase tracking-widest">
//                             10 Credits / Interview
//                           </span>
//                         </div>
//                         <p className="text-zinc-400 mb-8 text-sm leading-relaxed font-medium">
//                           Engage with our advanced AI behavioral model. Get
//                           real-time sentiment analysis and body language
//                           feedback.
//                         </p>
//                         <button className="bg-[#bef264] text-black px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-3">
//                           Start Session <FiArrowRight />
//                         </button>
//                       </div>
//                       <div className="w-full md:w-1/2 bg-black/40 p-6 rounded-[2rem] border border-white/5">
//                         <p className="text-[10px] uppercase font-black text-zinc-500 mb-6 tracking-widest">
//                           Live Feedback Preview
//                         </p>
//                         <div className="space-y-5">
//                           <div className="space-y-2">
//                             <div className="flex justify-between items-center text-xs font-bold">
//                               <span className="text-white">Confidence</span>
//                               <span className="text-[#bef264]">85%</span>
//                             </div>
//                             <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
//                               <div className="h-full bg-[#bef264] w-[85%] shadow-[0_0_10px_#bef264]"></div>
//                             </div>
//                           </div>
//                           <div className="space-y-2">
//                             <div className="flex justify-between items-center text-xs font-bold">
//                               <span className="text-white">Pacing</span>
//                               <span className="text-zinc-500">40%</span>
//                             </div>
//                             <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
//                               <div className="h-full bg-zinc-500 w-[40%]"></div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Secondary Activities */}
//                   <div
//                     onClick={() => navigate("/gd/setup")}
//                     className="glass-panel p-6 rounded-[2rem] group hover:bg-zinc-800/80 transition-colors cursor-pointer border border-transparent hover:border-white/10"
//                   >
//                     <h4 className="text-lg font-black text-white mb-1">
//                       GD Simulator
//                     </h4>
//                     <div className="flex items-center gap-2 mb-3">
//                       <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">
//                         8 Credits / GD
//                       </span>
//                     </div>
//                     <p className="text-zinc-400 text-xs font-medium mb-8 leading-relaxed">
//                       Practice group dynamics with 5 AI personas. Master the art
//                       of leading and listening.
//                     </p>
//                     <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
//                       <span>Join simulator</span>
//                       <FiChevronRight size={14} />
//                     </div>
//                   </div>

//                   <div
//                     onClick={() => navigate("/billing")}
//                     className="glass-panel p-6 rounded-[2rem] group hover:bg-zinc-800/80 transition-colors cursor-pointer border border-transparent hover:border-white/10"
//                   >
//                     <h4 className="text-lg font-black text-white mb-2">
//                       Upgrade Plan
//                     </h4>
//                     <p className="text-zinc-400 text-xs font-medium mb-8 leading-relaxed">
//                       Get specific improvements, advanced insights, and extended
//                       usage limits tailored to you.
//                     </p>
//                     <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
//                       <span>View Options</span>
//                       <FiChevronRight size={14} />
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Right Column: Analytics & Charts */}
//           <div className="lg:col-span-5 md:col-span-12 space-y-8 h-full">
//             <div className="glass-panel p-6 rounded-3xl h-full border border-white/5 flex flex-col w-full min-h-[460px]">
//               <div className="flex justify-between items-start mb-10">
//                 <div>
//                   <h3 className="text-lg font-black text-white mb-1">
//                     Analytical Skill Analysis
//                   </h3>
//                   <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
//                     Multi-dimensional performance
//                   </p>
//                 </div>
//                 <div className="flex flex-col items-end gap-1">
//                   <div className="flex items-center gap-2">
//                     <div className="w-1.5 h-1.5 rounded-full bg-[#bef264]"></div>
//                     <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
//                       Mock Interview
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
//                     <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
//                       GD Platform
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="w-full flex-1 flex items-center justify-center -mt-4">
//                 {loading ? (
//                   <Skeleton className="w-[320px] h-[320px] rounded-full" />
//                 ) : (
//                   <ResponsiveContainer width="100%" height={320}>
//                     <RadarChart
//                       cx="50%"
//                       cy="50%"
//                       outerRadius="80%"
//                       data={skillMatrix}
//                     >
//                       <PolarGrid stroke="rgba(255,255,255,0.05)" />
//                       <PolarAngleAxis
//                         dataKey="subject"
//                         tick={{
//                           fill: "#71717a",
//                           fontSize: 10,
//                           fontWeight: 800,
//                         }}
//                       />
//                       <PolarRadiusAxis
//                         angle={30}
//                         domain={[0, 100]}
//                         tick={false}
//                         axisLine={false}
//                       />
//                       <Radar
//                         name="Interview"
//                         dataKey="Interview"
//                         stroke="#bef264"
//                         fill="#bef264"
//                         fillOpacity={0.2}
//                         strokeWidth={3}
//                       />
//                       <Radar
//                         name="GD"
//                         dataKey="GD"
//                         stroke="#f59e0b"
//                         fill="#f59e0b"
//                         fillOpacity={0.2}
//                         strokeWidth={3}
//                       />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: "#18181b",
//                           border: "1px solid #27272a",
//                           borderRadius: "12px",
//                           fontSize: "12px",
//                         }}
//                         itemStyle={{ fontWeight: 800 }}
//                       />
//                     </RadarChart>
//                   </ResponsiveContainer>
//                 )}
//               </div>

//               <div className="mt-6 flex justify-around p-4 rounded-2xl bg-white/[0.02] border border-white/5">
//                 {loading ? (
//                   <Skeleton className="w-full h-12" />
//                 ) : (
//                   <>
//                     <div className="text-center">
//                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">
//                         Top Skill
//                       </p>
//                       <p className="text-sm font-black text-[#bef264]">
//                         {avgScore > 0
//                           ? skillMatrix.reduce((a, b) =>
//                               a.Interview + a.GD > b.Interview + b.GD ? a : b,
//                             ).subject
//                           : "Pending"}
//                       </p>
//                     </div>
//                     <div className="w-px h-8 bg-white/5"></div>
//                     <div className="text-center">
//                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">
//                         Status
//                       </p>
//                       <p className="text-sm font-black text-white">
//                         {totalSessions > 5
//                           ? "Stable"
//                           : totalSessions > 0
//                             ? "Building"
//                             : "Incomplete"}
//                       </p>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recent Activity Table */}
//         <section>
//           <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
//             <div className="p-5 border-b border-white/5 flex justify-between items-center">
//               <h3 className="text-lg font-black text-white">Recent Feedback</h3>
//               <button className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
//                 <FiMoreHorizontal size={18} />
//               </button>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead>
//                   <tr className="bg-zinc-900/50">
//                     <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
//                       Type
//                     </th>
//                     <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
//                       Title
//                     </th>
//                     <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
//                       Status
//                     </th>
//                     <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
//                       Date
//                     </th>
//                     <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
//                       Score
//                     </th>
//                     <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-white/5 text-sm">
//                   {loading ? (
//                     Array(3)
//                       .fill(0)
//                       .map((_, i) => (
//                         <tr key={i}>
//                           <td colSpan={6} className="px-5 py-4">
//                             <Skeleton className="h-8 w-full" />
//                           </td>
//                         </tr>
//                       ))
//                   ) : (
//                     <>
//                       {[...completedInterviews, ...completedGDs]
//                         .sort(
//                           (a, b) =>
//                             new Date(b.createdAt) - new Date(a.createdAt),
//                         )
//                         .slice(0, 5)
//                         .map((session, idx) => (
//                           <tr
//                             key={session._id || idx}
//                             className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
//                             onClick={() =>
//                               navigate(
//                                 session.interviewType
//                                   ? `/interview/result/${session._id}`
//                                   : `/gd/result/${session._id}`,
//                               )
//                             }
//                           >
//                             <td className="px-5 py-3">
//                               <div className="flex items-center gap-3">
//                                 <div
//                                   className={`w-8 h-8 rounded-lg flex items-center justify-center ${session.interviewType ? "bg-[#bef264]/10 text-[#bef264]" : "bg-amber-500/10 text-amber-500"}`}
//                                 >
//                                   {session.interviewType ? (
//                                     <FiVideo size={14} />
//                                   ) : (
//                                     <FiUsers size={14} />
//                                   )}
//                                 </div>
//                                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
//                                   {session.interviewType ? "Interview" : "GD"}
//                                 </span>
//                               </div>
//                             </td>
//                             <td className="px-5 py-3">
//                               <span className="font-bold text-white group-hover:text-[#bef264] transition-colors line-clamp-1">
//                                 {session.interviewType
//                                   ? session.metadata?.role || "Interview"
//                                   : session.topic}
//                               </span>
//                             </td>
//                             <td className="px-5 py-3">
//                               <span className="px-2 py-1 rounded bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/20 text-[9px] font-black uppercase tracking-[0.1em]">
//                                 Done
//                               </span>
//                             </td>
//                             <td className="px-5 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
//                               {differenceInHours(
//                                 new Date(),
//                                 new Date(session.createdAt),
//                               ) < 12
//                                 ? formatDistanceToNow(
//                                     new Date(session.createdAt),
//                                     {
//                                       addSuffix: true,
//                                     },
//                                   )
//                                 : format(
//                                     new Date(session.createdAt),
//                                     "MMM d, yyyy",
//                                   )}
//                             </td>
//                             <td className="px-5 py-3">
//                               <span className="text-base font-black text-white group-hover:text-[#bef264] transition-colors">
//                                 {session.report?.overallScore || "-"}
//                                 <span className="text-[10px] text-zinc-500 ml-1">
//                                   %
//                                 </span>
//                               </span>
//                             </td>
//                             <td className="px-5 py-3">
//                               <button className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-[#bef264] transition-colors flex items-center gap-1">
//                                 Review <FiChevronRight size={12} />
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       {interviews.length === 0 && gds.length === 0 && (
//                         <tr>
//                           <td
//                             colSpan={6}
//                             className="px-5 py-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs"
//                           >
//                             No sessions completed yet.
//                           </td>
//                         </tr>
//                       )}
//                     </>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </section>
//       </div>
//     </>
//   );
// };

// export default DashboardOverview;
// import React, { useState, useEffect } from "react";
// import { Helmet } from "react-helmet-async";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   FiArrowRight,
//   FiClock,
//   FiCheckCircle,
//   FiActivity,
//   FiUsers,
//   FiVideo,
//   FiTrendingUp,
//   FiTarget,
//   FiMoreHorizontal,
//   FiChevronRight,
//   FiPlay,
//   FiUser,
//   FiBookOpen,
// } from "react-icons/fi";
// import axios from "axios";
// import { useAuth, useUser } from "@clerk/clerk-react";
// import {
//   Radar,
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   ResponsiveContainer,
//   Tooltip,
// } from "recharts";
// import { formatDistanceToNow, differenceInHours, format } from "date-fns";
// import { FaCheckCircle, FaClock, FaUsers } from "react-icons/fa";
// import Skeleton from "../components/common/Skeleton";

// const DashboardOverview = () => {
//   const { getToken } = useAuth();
//   const { user } = useUser();
//   const navigate = useNavigate();
//   const [interviews, setInterviews] = useState([]);
//   const [gds, setGDs] = useState([]);
//   const [subscription, setSubscription] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [courses, setCourses] = useState([]);
//   const [stats, setStats] = useState({
//     completionRate: 32,
//     mentors: 60,
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = await getToken();
//         const [interviewsRes, gdsRes, subscriptionRes] = await Promise.all([
//           axios.get(
//             `${import.meta.env.VITE_BACKEND_URL}/api/vapi-interview/user`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           ),
//           axios.get(
//             `${import.meta.env.VITE_BACKEND_URL}/api/group-discussion/my-sessions`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           ),
//           axios.get(
//             `${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           ),
//         ]);

//         setInterviews(interviewsRes.data || []);
//         setGDs(gdsRes.data || []);
//         setSubscription(subscriptionRes.data || null);

//         // Mock course data
//         setCourses([
//           {
//             id: 1,
//             title: "Beginner's Guide to Becoming a Professional Front-End Developer",
//             mentor: "Leonardo Samsul",
//             category: "FRONT END",
//             type: "course"
//           },
//           {
//             id: 2,
//             title: "UX/UX Design",
//             mentor: "Bayu Saito",
//             category: "FRONT END",
//             type: "course"
//           },
//           {
//             id: 3,
//             title: "Optimizing User Experience with the Best UI/UX Design",
//             mentor: "Dr. John Smith",
//             category: "UI/UX DESIGN",
//             type: "tutorial",
//             duration: "1 hour",
//             price: "$50"
//           },
//           {
//             id: 4,
//             title: "Reviving and Refresh Company Image",
//             mentor: "Dr. Jane Doe",
//             category: "BRANDING",
//             type: "tutorial",
//             duration: "2 hours",
//             price: "$100"
//           }
//         ]);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [getToken]);

//   const completedInterviews = interviews.filter(
//     (i) =>
//       i.status === "completed" ||
//       i.status === "analysis_pending" ||
//       i.report?.overallScore !== undefined
//   );
//   const completedGDs = gds.filter(
//     (g) =>
//       g.status === "completed" ||
//       g.status === "analysis_pending" ||
//       g.report?.overallScore !== undefined
//   );
//   const totalSessions = interviews.length + gds.length;

//   const avgScore =
//     totalSessions > 0
//       ? Math.round(
//           [...completedInterviews, ...completedGDs].reduce(
//             (acc, curr) => acc + (curr.report?.overallScore || 0),
//             0
//           ) / ([...completedInterviews, ...completedGDs].length || 1)
//         )
//       : 0;

//   const skillMatrix = React.useMemo(() => {
//     const subjects = [
//       { subject: "Comm", Interview: 0, GD: 0, fullMark: 100 },
//       { subject: "Depth", Interview: 0, GD: 0, fullMark: 100 },
//       { subject: "Initiative", Interview: 0, GD: 0, fullMark: 100 },
//       { subject: "Logic", Interview: 0, GD: 0, fullMark: 100 },
//       { subject: "Confidence", Interview: 0, GD: 0, fullMark: 100 },
//     ];

//     completedInterviews.forEach((session) => {
//       const report =
//         session.report?.detailedAnalysis?.overall ||
//         session.report?.overall ||
//         session.report;
//       if (report) {
//         subjects[0].Interview += report.communication || 0;
//         subjects[1].Interview += report.correctness || 0;
//         subjects[2].Interview += report.creativity || 0;
//         subjects[3].Interview += report.relevance || 0;
//         subjects[4].Interview += report.problemSolving || 0;
//       }
//     });

//     completedGDs.forEach((session) => {
//       const report = session.report;
//       if (report) {
//         subjects[0].GD += report.communicationScore || 0;
//         subjects[1].GD += report.depthScore || 0;
//         subjects[2].GD += report.initiationScore || 0;
//         subjects[3].GD += report.relevanceScore || 0;
//         subjects[4].GD += report.contributionScore || 0;
//       }
//     });

//     return subjects.map((s) => ({
//       ...s,
//       Interview:
//         completedInterviews.length > 0
//           ? Math.round(s.Interview / completedInterviews.length)
//           : 0,
//       GD: completedGDs.length > 0 ? Math.round(s.GD / completedGDs.length) : 0,
//     }));
//   }, [completedInterviews, completedGDs]);

//   const totalPrepTime = [...completedInterviews, ...completedGDs].reduce(
//     (acc, session) => {
//       let sessionMins = 0;
//       if (session.actualDuration > 0) {
//         sessionMins = Math.round(session.actualDuration / 60);
//       } else if (session.duration > 0) {
//         sessionMins = Math.round(session.duration / 60);
//       } else if (session.metadata?.duration) {
//         sessionMins = session.metadata.duration;
//       } else {
//         sessionMins = 10;
//       }
//       return acc + sessionMins;
//     },
//     0
//   );

//   const formatPrepTime = (totalMins) => {
//     if (totalMins < 60) return `${totalMins}m`;
//     const h = Math.floor(totalMins / 60);
//     const m = totalMins % 60;
//     return m > 0 ? `${h}h ${m}m` : `${h}h`;
//   };

//   return (
//     <>
//       <Helmet>
//         <title>Dashboard | PlaceMateAI</title>
//       </Helmet>

//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
//         .dashboard-container {
//           background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
//         }
//         .course-card {
//           background: rgba(255, 255, 255, 0.03);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(190, 242, 100, 0.1);
//           transition: all 0.3s ease;
//         }
//         .course-card:hover {
//           background: rgba(255, 255, 255, 0.05);
//           border-color: rgba(190, 242, 100, 0.3);
//           transform: translateY(-2px);
//         }
//         .stat-card {
//           background: rgba(190, 242, 100, 0.05);
//           border: 1px solid rgba(190, 242, 100, 0.15);
//           backdrop-filter: blur(10px);
//         }
//         .progress-ring {
//           transform: rotate(-90deg);
//         }
//         .mentor-badge {
//           background: linear-gradient(135deg, rgba(190, 242, 100, 0.1) 0%, rgba(190, 242, 100, 0.05) 100%);
//           border: 1px solid rgba(190, 242, 100, 0.2);
//         }
//         @keyframes pulse-glow {
//           0%, 100% { box-shadow: 0 0 20px rgba(190, 242, 100, 0.1); }
//           50% { box-shadow: 0 0 30px rgba(190, 242, 100, 0.2); }
//         }
//         .pulse-glow {
//           animation: pulse-glow 3s ease-in-out infinite;
//         }
//       `,
//         }}
//       />

//       <div className="dashboard-container min-h-screen text-white">
//         <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-7xl mx-auto">
//           {/* Header with Online Course Banner */}
//           <div className="mb-8">
//             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
//               <div>
//                 <span className="text-[#bef264] text-xs font-bold uppercase tracking-wider">
//                   # ONLINE COURSE
//                 </span>
//                 <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2">
//                   Sharpen Your Skills with
//                   <br />
//                   Professional Online Courses
//                 </h1>
//               </div>
//               <button className="bg-[#bef264] text-black px-6 py-3 rounded-full font-bold hover:bg-[#d4f57a] transition-colors flex items-center gap-2">
//                 Join Now <FiArrowRight />
//               </button>
//             </div>
//           </div>

//           {/* Continue Watching Section */}
//           <div className="mb-8">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl md:text-2xl font-bold">Continue Watching</h2>
//               <button className="text-[#bef264] text-sm font-semibold hover:underline">
//                 View All
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {loading ? (
//                 Array(3).fill(0).map((_, i) => (
//                   <Skeleton key={i} className="h-32 rounded-xl" />
//                 ))
//               ) : (
//                 courses.slice(0, 3).map((course) => (
//                   <div key={course.id} className="course-card rounded-xl p-5 cursor-pointer">
//                     <div className="flex items-start justify-between mb-3">
//                       <span className="text-[#bef264] text-xs font-bold uppercase tracking-wider">
//                         {course.category}
//                       </span>
//                       {course.type === "tutorial" && (
//                         <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
//                           Tutorial
//                         </span>
//                       )}
//                     </div>
//                     <h3 className="font-semibold text-base mb-2 line-clamp-2">
//                       {course.title}
//                     </h3>
//                     <div className="flex items-center gap-2 text-sm text-gray-400">
//                       <FiUser size={14} />
//                       <span>{course.mentor} Mentor</span>
//                     </div>
//                     {course.duration && (
//                       <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
//                         <span className="text-sm text-gray-400">
//                           <FiClock className="inline mr-1" size={14} />
//                           {course.duration}
//                         </span>
//                         <span className="text-[#bef264] font-bold">{course.price}</span>
//                       </div>
//                     )}
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Main Content Grid */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Left Column - Courses */}
//             <div className="lg:col-span-2 space-y-6">
//               {/* UI/UX Design Course */}
//               <div className="course-card rounded-xl p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div>
//                     <span className="text-[#bef264] text-xs font-bold uppercase tracking-wider">
//                       UI/UX DESIGN
//                     </span>
//                     <h3 className="text-lg font-bold mt-2">
//                       Optimizing User Experience with the Best UI/UX Design
//                     </h3>
//                   </div>
//                   <span className="text-xs bg-white/10 px-3 py-1 rounded-full">
//                     Tutorial
//                   </span>
//                 </div>
//                 <p className="text-gray-400 text-sm mb-4">
//                   Learn how to create an effective user experience (UX) design.
//                 </p>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-4 text-sm text-gray-400">
//                     <span className="flex items-center gap-1">
//                       <FiUser size={14} />
//                       Dr. John Smith
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <FiClock size={14} />
//                       1 hour
//                     </span>
//                   </div>
//                   <span className="text-[#bef264] font-bold text-lg">$50</span>
//                 </div>
//               </div>

//               {/* Branding Course */}
//               <div className="course-card rounded-xl p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div>
//                     <span className="text-[#bef264] text-xs font-bold uppercase tracking-wider">
//                       BRANDING
//                     </span>
//                     <h3 className="text-lg font-bold mt-2">
//                       Reviving and Refresh Company Image
//                     </h3>
//                   </div>
//                   <span className="text-xs bg-white/10 px-3 py-1 rounded-full">
//                     Tutorial
//                   </span>
//                 </div>
//                 <p className="text-gray-400 text-sm mb-4">
//                   Learn how to improve your brand identity through branding strategies.
//                 </p>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-4 text-sm text-gray-400">
//                     <span className="flex items-center gap-1">
//                       <FiUser size={14} />
//                       Dr. Jane Doe
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <FiClock size={14} />
//                       2 hours
//                     </span>
//                   </div>
//                   <span className="text-[#bef264] font-bold text-lg">$100</span>
//                 </div>
//               </div>

//               {/* Your Lesson Section */}
//               <div className="course-card rounded-xl p-6">
//                 <h3 className="text-lg font-bold mb-4">Your Lesson</h3>
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 rounded-full bg-[#bef264]/20 flex items-center justify-center">
//                     <FiBookOpen className="text-[#bef264]" size={24} />
//                   </div>
//                   <div className="flex-1">
//                     <h4 className="font-semibold">Padhang Satrio</h4>
//                     <p className="text-sm text-gray-400">2/16/2004</p>
//                   </div>
//                   <span className="text-xs bg-[#bef264]/20 text-[#bef264] px-3 py-1 rounded-full">
//                     UI/UX DESIGN
//                   </span>
//                 </div>
//                 <p className="mt-4 text-sm text-gray-300">
//                   Understand Of UI/UX Design
//                 </p>
//                 <button className="mt-4 w-full bg-[#bef264]/10 text-[#bef264] py-2 rounded-lg font-semibold hover:bg-[#bef264]/20 transition-colors flex items-center justify-center gap-2">
//                   Continue Learning <FiPlay size={14} />
//                 </button>
//               </div>
//             </div>

//             {/* Right Column - Stats and Mentors */}
//             <div className="space-y-6">
//               {/* Statistics Card */}
//               <div className="stat-card rounded-xl p-6">
//                 <h3 className="text-lg font-bold mb-4">Statistics</h3>

//                 {/* Progress Circle */}
//                 <div className="flex items-center justify-center mb-6">
//                   <div className="relative w-32 h-32">
//                     <svg className="w-full h-full progress-ring" viewBox="0 0 100 100">
//                       <circle
//                         cx="50"
//                         cy="50"
//                         r="45"
//                         fill="none"
//                         stroke="rgba(255,255,255,0.1)"
//                         strokeWidth="8"
//                       />
//                       <circle
//                         cx="50"
//                         cy="50"
//                         r="45"
//                         fill="none"
//                         stroke="#bef264"
//                         strokeWidth="8"
//                         strokeDasharray={`${stats.completionRate * 2.827} 282.7`}
//                         strokeLinecap="round"
//                       />
//                     </svg>
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <span className="text-3xl font-bold">{stats.completionRate}%</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="text-center mb-6">
//                   <h4 className="font-semibold text-lg">Good Morning Jason 👋</h4>
//                   <p className="text-sm text-gray-400">
//                     Continue your learning to achieve your target!
//                   </p>
//                 </div>

//                 {/* Quick Stats */}
//                 <div className="grid grid-cols-2 gap-4 mb-6">
//                   <div className="text-center p-3 rounded-lg bg-white/5">
//                     <p className="text-2xl font-bold text-[#bef264]">
//                       {completedInterviews.length}
//                     </p>
//                     <p className="text-xs text-gray-400">Interviews</p>
//                   </div>
//                   <div className="text-center p-3 rounded-lg bg-white/5">
//                     <p className="text-2xl font-bold text-[#bef264]">
//                       {completedGDs.length}
//                     </p>
//                     <p className="text-xs text-gray-400">GD Sessions</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
//                   <div className="flex items-center gap-2">
//                     <FiUsers className="text-[#bef264]" />
//                     <span className="text-sm">Your mentor</span>
//                   </div>
//                   <span className="text-2xl font-bold text-[#bef264]">{stats.mentors}</span>
//                 </div>
//               </div>

//               {/* Mentors List */}
//               <div className="course-card rounded-xl p-6">
//                 <h3 className="text-lg font-bold mb-4">Your Mentors</h3>
//                 <div className="space-y-3">
//                   {[
//                     { name: "Padhang Satrio", role: "Mentor" },
//                     { name: "Zakhir Horizontals", role: "Mentor" },
//                     { name: "Leonardo Samusul", role: "Mentor" },
//                   ].map((mentor, index) => (
//                     <div key={index} className="mentor-badge rounded-lg p-3 flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-[#bef264]/20 flex items-center justify-center">
//                         <FiUser className="text-[#bef264]" />
//                       </div>
//                       <div>
//                         <p className="font-semibold text-sm">{mentor.name}</p>
//                         <p className="text-xs text-gray-400">{mentor.role}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Skill Analysis */}
//               <div className="course-card rounded-xl p-6">
//                 <h3 className="text-lg font-bold mb-4">Skill Analysis</h3>
//                 <div className="h-48">
//                   {loading ? (
//                     <Skeleton className="w-full h-full" />
//                   ) : (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <RadarChart data={skillMatrix}>
//                         <PolarGrid stroke="rgba(255,255,255,0.1)" />
//                         <PolarAngleAxis
//                           dataKey="subject"
//                           tick={{ fill: "#9ca3af", fontSize: 10 }}
//                         />
//                         <Radar
//                           name="Skills"
//                           dataKey="Interview"
//                           stroke="#bef264"
//                           fill="#bef264"
//                           fillOpacity={0.3}
//                         />
//                         <Tooltip
//                           contentStyle={{
//                             backgroundColor: "#1a1a1a",
//                             border: "1px solid #333",
//                             borderRadius: "8px",
//                           }}
//                         />
//                       </RadarChart>
//                     </ResponsiveContainer>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Bottom Stats Bar */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
//             {[
//               { label: "Total Sessions", value: totalSessions, icon: FiVideo },
//               { label: "Avg Score", value: `${avgScore}%`, icon: FiTarget },
//               { label: "Prep Time", value: formatPrepTime(totalPrepTime), icon: FiClock },
//               { label: "Completed", value: completedInterviews.length + completedGDs.length, icon: FiCheckCircle },
//             ].map((stat, index) => (
//               <div key={index} className="course-card rounded-xl p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-400 uppercase tracking-wider">
//                       {stat.label}
//                     </p>
//                     <p className="text-2xl font-bold mt-1">{stat.value}</p>
//                   </div>
//                   <div className="w-10 h-10 rounded-full bg-[#bef264]/10 flex items-center justify-center">
//                     <stat.icon className="text-[#bef264]" size={20} />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default DashboardOverview;

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

  // Feature cards configuration
  const featureCards = [
    {
      id: "ai-mock-interview",
      title: "AI Mock Interview",
      description: "Practice with AI interviewer, get real-time feedback",
      icon: FiMic,
      credits: 10,
      image:
        "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400",
      cta: "Start Interview",
      path: "/dashboard/setup",
      color: "#bef264",
    },
    {
      id: "ai-gd-simulator",
      title: "AI GD Simulator",
      description: "Group discussion with 5 AI personas",
      icon: FiUsers,
      credits: 8,
      image:
        "https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=400",
      cta: "Join GD",
      path: "/gd/setup",
      color: "#f59e0b",
    },
    {
      id: "ats-scorer",
      title: "ATS Resume Scorer",
      description: "Check your resume's ATS compatibility score",
      icon: FiAward,
      credits: 5,
      image:
        "https://images.pexels.com/photos/5989927/pexels-photo-5989927.jpeg?auto=compress&cs=tinysrgb&w=400",
      cta: "Analyze Resume",
      path: "/ats-scorer",
      color: "#3b82f6",
    },
    {
      id: "resume-builder",
      title: "AI Resume Builder",
      description: "Create professional resumes with AI assistance",
      icon: FiFileText,
      credits: 15,
      image:
        "https://images.pexels.com/photos/5989925/pexels-photo-5989925.jpeg?auto=compress&cs=tinysrgb&w=400",
      cta: "Build Resume",
      path: "/resume-builder",
      color: "#8b5cf6",
    },
    {
      id: "question-bank",
      title: "Interview Question Bank",
      description: "5000+ company-specific interview questions",
      icon: FiDatabase,
      credits: 0,
      image:
        "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400",
      cta: "Explore Questions",
      path: "/question-bank",
      color: "#ec4899",
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
                <span className="text-[#bef264] underline text-xs font-bold uppercase tracking-wider">
                  INTERVIEW PREP PLATFORM
                </span>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2 text-white">
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
                          className="w-16 h-16 rounded-full border-2 border-[#bef264] object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#bef264]/20 border-2 border-[#bef264] flex items-center justify-center">
                          <FaUserCircle className="text-[#bef264] text-4xl" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">
                          Welcome, {user?.firstName || "User"} 👋
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
                  <div className={` rounded-full  flex items-center justify-center`}>
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
                        onClick={() => navigate("/dashboard/setup")}
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

          {/* Feature Cards Grid */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              AI-Powered Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featureCards.map((feature) => (
                <div
                  key={feature.id}
                  className="feature-card rounded-xl cursor-pointer group"
                  onClick={() => navigate(feature.path)}
                >
                  {/* Image Section */}
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="feature-image w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <div className="credit-badge px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <FiZap size={12} />
                        {feature.credits} Credits
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${feature.color}20` }}
                        >
                          <feature.icon
                            style={{ color: feature.color }}
                            size={16}
                          />
                        </div>
                        <h3 className="font-bold text-base">{feature.title}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    <p className="text-sm text-gray-400 mb-4">
                      {feature.description}
                    </p>
                    <button
                      className="w-full py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 group-hover:gap-3"
                      style={{
                        backgroundColor: `${feature.color}10`,
                        color: feature.color,
                        border: `1px solid ${feature.color}30`,
                      }}
                    >
                      {feature.cta} <FiArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardOverview;
