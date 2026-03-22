import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPlus, FiArrowRight, FiClock, FiCheckCircle,
  FiStar, FiActivity, FiUsers, FiMessageSquare,
  FiVideo, FiTrendingUp, FiTarget, FiAward,
  FiMoreHorizontal, FiChevronRight, FiCheck
} from "react-icons/fi";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatDistanceToNow, format } from "date-fns";
import { interviewAgents } from "../constants/agents";
import CircularUsage from "../components/common/CircularUsage";

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
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/vapi-interview/user`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/group-discussion/my-sessions`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`, {
            headers: { Authorization: `Bearer ${token}` }
          })
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

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const completedGDs = gds.filter(g => g.status === 'completed');
  const totalSessions = interviews.length + gds.length;

  const avgScore = totalSessions > 0
    ? Math.round([...completedInterviews, ...completedGDs].reduce((acc, curr) => acc + (curr.report?.overallScore || 0), 0) / totalSessions)
    : 0;

  const performanceData = completedInterviews.length + completedGDs.length > 0 
    ? [...completedInterviews, ...completedGDs]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(session => ({
        date: format(new Date(session.createdAt), 'MMM dd'),
        score: session.report?.overallScore || 0,
        type: session.interviewType ? 'Interview' : 'GD',
        fullDate: format(new Date(session.createdAt), 'PPPP')
      }))
      .slice(-7)
    : [
      { date: 'Mon', score: 65, fullDate: 'Monday' },
      { date: 'Tue', score: 70, fullDate: 'Tuesday' },
      { date: 'Wed', score: 68, fullDate: 'Wednesday' },
      { date: 'Thu', score: 75, fullDate: 'Thursday' },
      { date: 'Fri', score: 82, fullDate: 'Friday' },
      { date: 'Sat', score: 85, fullDate: 'Saturday' },
      { date: 'Sun', score: 92, fullDate: 'Sunday' },
    ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#bef264] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | PlaceMateAI</title>
      </Helmet>
      
      {/* Include custom generic styles matching Stitch mockup context */}
      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel {
            background: rgba(38, 37, 40, 0.4);
            backdrop-filter: blur(16px);
            border-top: 1px solid rgba(190, 242, 100, 0.1);
            border-left: 1px solid rgba(190, 242, 100, 0.1);
        }
        .neon-glow {
            box-shadow: 0 0 20px rgba(190, 242, 100, 0.15);
        }
      `}} />

      <div className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto space-y-12 animate-fade-in text-zinc-100 selection:bg-[#bef264] selection:text-black">
        
        {/* Welcome Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[#bef264] font-bold tracking-widest text-xs uppercase mb-2 block">Performance Overview</span>
              <h2 className="text-4xl font-black tracking-tighter text-white">Welcome back, {user?.firstName}.        <span className="text-3xl animate-wave">👋</span>
</h2>
              <p className="text-zinc-400 mt-2 max-w-lg">You're making great progress in your interview preparations. Keep the momentum going to achieve your targeted role.</p>
            </div>
            <div className="flex gap-4">
              {subscription ? (
                <div className="glass-panel px-6 py-4 rounded-3xl flex flex-col justify-center border border-[#bef264]/20 shadow-[0_8px_32px_-8px_rgba(190,242,100,0.1)] min-w-[240px]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{subscription.tier} Plan</span>
                    <Link to="/billing" className="text-[#bef264] text-[10px] uppercase font-black tracking-wider hover:text-white transition-colors">Upgrade</Link>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1 items-center bg-zinc-900/50 p-2 rounded-xl border border-white/5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Talk</span>
                      <span className="text-sm font-black text-white">{subscription.credits.talkTime}/{subscription.limits.talkTime}</span>
                    </div>
                    <div className="flex flex-col gap-1 items-center bg-zinc-900/50 p-2 rounded-xl border border-white/5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Int</span>
                      <span className="text-sm font-black text-white">{subscription.credits.interviews}/{subscription.limits.interviews}</span>
                    </div>
                    <div className="flex flex-col gap-1 items-center bg-zinc-900/50 p-2 rounded-xl border border-white/5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">GD</span>
                      <span className="text-sm font-black text-white">{subscription.credits.gdSessions}/{subscription.limits.gdSessions}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel px-8 py-5 rounded-3xl flex flex-col justify-center border border-[#bef264]/20 border border-[#bef264]/20 shadow-[0_8px_32px_-8px_rgba(190,242,100,0.1)]">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Plan Status</span>
                  <span className="text-lg font-black text-white mt-1">Free Tier</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-[#bef264]/20">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FiClock size={64} />
            </div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Talk Time</p>
            <h3 className="text-4xl font-black text-white">{subscription ? Math.round(subscription.credits.talkTime || 0) : '12'}<span className="text-lg text-zinc-500">m</span></h3>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[#bef264] text-xs font-bold flex items-center gap-1 bg-[#bef264]/10 px-2 py-0.5 rounded-md">
                <FiTrendingUp size={12} /> +2.1h
              </span>
              <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">this week</span>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-[#bef264]/20">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FiCheckCircle size={64} />
            </div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Mocks Completed</p>
            <h3 className="text-4xl font-black text-white">{completedInterviews.length}</h3>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[#bef264] text-xs font-bold flex items-center gap-1 bg-[#bef264]/10 px-2 py-0.5 rounded-md">
                <FiCheck size={12} /> {completedInterviews.filter(i => new Date(i.createdAt) > new Date(Date.now() - 86400000)).length} today
              </span>
              <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Goal: 20</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-[#bef264]/20">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FiUsers size={64} />
            </div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">GD Sessions</p>
            <h3 className="text-4xl font-black text-white">{gds.length}</h3>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[#bef264] text-xs font-bold flex items-center gap-1 bg-[#bef264]/10 px-2 py-0.5 rounded-md">
                <FiCheck size={12} /> {completedGDs.filter(i => new Date(i.createdAt) > new Date(Date.now() - 86400000)).length} today
              </span>
              <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Keep practicing</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-[#bef264]/20">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FiTarget size={64} />
            </div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Avg Session Score</p>
            <h3 className="text-4xl font-black text-white">{avgScore > 0 ? avgScore : 84}<span className="text-lg text-zinc-500">%</span></h3>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[#bef264] text-xs font-bold flex items-center gap-1 bg-[#bef264]/10 px-2 py-0.5 rounded-md">
                <FiTrendingUp size={12} /> +5%
              </span>
              <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">vs last week</span>
            </div>
          </div>
        </div>

        {/* Activity Grid - Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Main Activities */}
          <div className="lg:col-span-7 md:col-span-12 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">Recommended Focus</h3>
              <Link to="/paths" className="text-[#bef264] text-xs font-black uppercase tracking-widest hover:text-[#dcfc9f] transition-colors">
                View all paths
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Featured Activity */}
              <div onClick={() => navigate('/dashboard/setup')} className="md:col-span-2 glass-panel p-8 rounded-[2rem] group cursor-pointer border border-[#bef264]/10 hover:border-[#bef264]/40 transition-all duration-500 relative overflow-hidden shadow-[0_0_40px_rgba(190,242,100,0.05)]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#bef264]/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-[#bef264]/20 transition-colors duration-700"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-1/2">
                    <div className="w-14 h-14 bg-[#bef264]/20 text-[#bef264] rounded-2xl flex items-center justify-center mb-6">
                      <FiVideo size={28} />
                    </div>
                    <h4 className="text-2xl font-black text-white mb-3">Voice Mock Interview</h4>
                    <p className="text-zinc-400 mb-8 text-sm leading-relaxed font-medium">Engage with our advanced AI behavioral model. Get real-time sentiment analysis and body language feedback.</p>
                    <button className="bg-[#bef264] text-black px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-3">
                      Start Session <FiArrowRight />
                    </button>
                  </div>
                  <div className="w-full md:w-1/2 bg-black/40 p-6 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] uppercase font-black text-zinc-500 mb-6 tracking-widest">Live Feedback Preview</p>
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
              <div onClick={() => navigate('/gd/setup')} className="glass-panel p-6 rounded-[2rem] group hover:bg-zinc-800/80 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mb-5">
                  <FiUsers size={24} />
                </div>
                <h4 className="text-lg font-black text-white mb-2">GD Simulator</h4>
                <p className="text-zinc-400 text-xs font-medium mb-8 leading-relaxed">Practice group dynamics with 5 AI personas. Master the art of leading and listening.</p>
                <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  <span>Join simulator</span>
                  <FiChevronRight size={14} />
                </div>
              </div>

              <div onClick={() => navigate('/billing')} className="glass-panel p-6 rounded-[2rem] group hover:bg-zinc-800/80 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center mb-5">
                  <FiAward size={24} />
                </div>
                <h4 className="text-lg font-black text-white mb-2">Upgrade Plan</h4>
                <p className="text-zinc-400 text-xs font-medium mb-8 leading-relaxed">Get specific improvements, advanced insights, and extended usage limits tailored to you.</p>
                <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  <span>View Options</span>
                  <FiChevronRight size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Analytics & Charts */}
          <div className="lg:col-span-5 md:col-span-12 space-y-8">
            <div className="glass-panel p-6 rounded-3xl h-full border border-white/5 flex flex-col w-full">
              <h3 className="text-lg font-black text-white mb-2">Performance Trend</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-6">Score progression</p>
              
              <div className="w-full h-[300px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#bef264" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#bef264" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#bef264" vertical={false} opacity={0.1} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#bef264', fontWeight: 700 }}
                      labelStyle={{ color: '#ffffff', marginBottom: '4px', fontWeight: 800 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#bef264"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
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
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Type</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Title</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Status</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Date</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Score</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {([...completedInterviews, ...completedGDs].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)).map((session, idx) => (
                    <tr key={session._id || idx} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => navigate(session.interviewType ? `/interview/result/${session._id}` : `/gd/result/${session._id}`)}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${session.interviewType ? 'bg-[#bef264]/10 text-[#bef264]' : 'bg-amber-500/10 text-amber-500'}`}>
                            {session.interviewType ? <FiVideo size={14} /> : <FiUsers size={14} />}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{session.interviewType ? 'Interview' : 'GD'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                         <span className="font-bold text-white group-hover:text-[#bef264] transition-colors line-clamp-1">{session.interviewType ? session.metadata?.role || "Interview" : session.topic}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-1 rounded bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/20 text-[9px] font-black uppercase tracking-[0.1em]">Done</span>
                      </td>
                      <td className="px-5 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-base font-black text-white group-hover:text-[#bef264] transition-colors">{session.report?.overallScore || '-'}<span className="text-[10px] text-zinc-500 ml-1">%</span></span>
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
                      <td colSpan={6} className="px-5 py-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">
                        No sessions completed yet.
                      </td>
                    </tr>
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


