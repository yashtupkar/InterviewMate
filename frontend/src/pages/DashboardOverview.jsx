import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPlus, FiArrowUpRight, FiClock, FiCheckCircle,
  FiStar, FiActivity, FiUsers, FiMessageSquare,
  FiCalendar, FiTrendingUp, FiTarget, FiAward
} from "react-icons/fi";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { formatDistanceToNow, format } from "date-fns";
import { interviewAgents } from "../constants/agents";

const DashboardOverview = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [gds, setGDs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const [interviewsRes, gdsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/vapi-interview/user`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/group-discussion/my-sessions`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setInterviews(interviewsRes.data || []);
        setGDs(gdsRes.data || []);
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

  const avgInterviewScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.report?.overallScore || 0), 0) / completedInterviews.length)
    : 0;

  const avgGDScore = completedGDs.length > 0
    ? Math.round(completedGDs.reduce((acc, curr) => acc + (curr.report?.overallScore || 0), 0) / completedGDs.length)
    : 0;

  const totalSessions = interviews.length + gds.length;

  const performanceData = [...completedInterviews, ...completedGDs]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(session => ({
      date: format(new Date(session.createdAt), 'MMM dd'),
      score: session.report?.overallScore || 0,
      type: session.interviewType ? 'Interview' : 'GD',
      fullDate: format(new Date(session.createdAt), 'PPPP')
    }))
    .slice(-7);

  // Mock data for radar if no completed sessions, else we could derive it
  const radarData = [
    { subject: 'Communication', A: 85, fullMark: 100 },
    { subject: 'Technical', A: 78, fullMark: 100 },
    { subject: 'Clarity', A: 92, fullMark: 100 },
    { subject: 'Problem Solving', A: 88, fullMark: 100 },
    { subject: 'Confidence', A: 80, fullMark: 100 },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#bef264 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | PriPareAI</title>
      </Helmet>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-fade-in">
        {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
            Welcome back, {user?.firstName}
            <span className="text-2xl animate-bounce">👋</span>
          </h1>
          <p className="text-zinc-400 font-medium text-sm md:text-base">Here's what's happening with your interview prep today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/setup"
            className="bg-[#bef264] hover:bg-[#bef264-hover active:scale-95 text-black font-bold px-6 py-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(190,242,100,0.15)] flex items-center gap-2 group"
          >
            <FiPlus className="group-hover:rotate-90 transition-transform duration-300" />
            New Interview
          </Link>
          <Link
            to="/gd/setup"
            className="bg-white/5 hover:bg-white/10 active:scale-95 text-white font-bold px-6 py-3 rounded-2xl transition-all border border-white/10 flex items-center gap-2 group"
          >
            <FiUsers className="group-hover:scale-110 transition-transform duration-300" />
            Start GD
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<FiTarget className="text-blue-400" />}
          title="Total Sessions"
          value={totalSessions}
          trend="+12%"
          description="Sessions completed"
          color="blue"
        />
        <MetricCard
          icon={<FiAward className="text-purple-400" />}
          title="Avg Interview Score"
          value={`${avgInterviewScore}%`}
          trend="+5%"
          description="Based on evaluations"
          color="purple"
        />
        <MetricCard
          icon={<FiMessageSquare className="text-amber-400" />}
          title="Avg GD Score"
          value={`${avgGDScore}%`}
          trend="+2%"
          description="Topic mastery"
          color="amber"
        />
        <MetricCard
          icon={<FiActivity className="text-emerald-400" />}
          title="Preparation Level"
          value="Ready"
          badge="Gold Tier"
          description="Overall status"
          color="emerald"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface/40 border border-white/5 rounded-[2rem] p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Performance Trend</h3>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Score progression over time</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#bef264]"></div> <span className="text-zinc-400 font-bold">Score</span></div>
            </div>
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#bef264" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#bef264" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#bef264" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#bef264', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                  itemStyle={{ color: '#bef264', fontWeight: 700 }}
                  labelStyle={{ color: 'var(--text-main)', marginBottom: '4px', fontWeight: 800 }}
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

        <div className="bg-surface/40 border border-white/5 rounded-[2rem] p-8 flex flex-col">
          <h3 className="text-white font-bold text-lg mb-1">Skills Distribution</h3>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-8">Comprehensive assessment</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Skills"
                  dataKey="A"
                  stroke="#bef264"
                  fill="#bef264"
                  fillOpacity={0.6}
                  animationDuration={2000}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            <SkillItem label="Communication" value={85} color="bg-blue-400" />
            <SkillItem label="Problem Solving" value={70} color="bg-indigo-400" />
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Interviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiClock className="text-zinc-500" />
                Recent Interviews
              </h3>
              <Link to="/dashboard/interviews" className="text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
                View All
              </Link>
            </div>

            <div className="grid gap-3">
              {interviews.slice(0, 3).length > 0 ? (
                interviews.slice(0, 3).map((session) => (
                  <RecentItem
                    key={session._id}
                    title={session.metadata?.role || "Interview Session"}
                    subtitle={`${session.metadata?.agentName || "Rohan"} • ${session.interviewType}`}
                    date={session.createdAt}
                    score={session.report?.overallScore}
                    status={session.status}
                    onClick={() => navigate(`/interview/result/${session._id}`)}
                    type="interview"
                    agentName={session.metadata?.agentName}
                  />
                ))
              ) : (
                <EmptyState message="No interviews yet. Take your first one!" />
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiUsers className="text-zinc-500" />
                Recent Group Discussions
              </h3>
              <Link to="/dashboard/gd-interviews" className="text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
                View All
              </Link>
            </div>

            <div className="grid gap-3">
              {gds.slice(0, 3).length > 0 ? (
                gds.slice(0, 3).map((session) => (
                  <RecentItem
                    key={session._id}
                    title={session.topic}
                    subtitle={session.category || "General"}
                    date={session.createdAt}
                    score={session.report?.overallScore}
                    status={session.status}
                    onClick={() => navigate(`/gd/result/${session._id}`)}
                    type="gd"
                  />
                ))
              ) : (
                <EmptyState message="No GDs yet. Start practicing with peers!" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FiAward className="text-zinc-500" />
            Quick Actions
          </h3>
          <div className="space-y-4">
            <QuickActionCard
              icon={<FiStar className="text-indigo-400" />}
              title="Technical Interview"
              desc="Prepare for coding rounds"
              link="/dashboard/setup"
              color="border-indigo-500/10 hover:bg-indigo-500/5 hover:border-indigo-500/20"
            />
            <QuickActionCard
              icon={<FiUsers className="text-[#bef264" />}
              title="Join Group Discussion"
              desc="Improve team collaboration"
              link="/gd/setup"
              color="border-[#bef264] hover:bg-[#bef264] hover:border-[#bef264]"
            />
            <QuickActionCard
              icon={<FiActivity className="text-orange-400" />}
              title="Daily Challenges"
              desc="Consistency is key"
              link="#"
              color="border-orange-500/10 hover:bg-orange-500/5 hover:border-orange-500/20"
              comingSoon
            />
          </div>

          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#bef264] to-[#bef210] text-black relative overflow-hidden group shadow-[0_20px_40px_rgba(190,242,100,0.1)]">
            <div className="relative z-10">
              <h4 className="font-black text-2xl mb-2">Pro Tip 💡</h4>
              <p className="text-black/70 text-sm font-semibold leading-relaxed mb-6">
                Reviewing your transcripts is the fastest way to identify verbal fillers and improve your clarity.
              </p>
              <button className="bg-black text-white font-bold px-5 py-2 rounded-xl text-sm transition-transform active:scale-95">
                Read Guide
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <FiTrendingUp size={120} />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

const MetricCard = ({ icon, title, value, trend, badge, description, color }) => (
  <div className="bg-surface/40 border border-white/5 rounded-[2rem] p-6 transition-all hover:bg-surface/60 group relative overflow-hidden">
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={`p-3 rounded-2xl bg-zinc-800/50 group-hover:scale-110 transition-transform`}>{icon}</div>
      {trend && (
        <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
          {trend}
        </span>
      )}
      {badge && (
        <span className="text-[10px] font-black text-emerald-400 border border-emerald-400/20 px-2 py-1 rounded-lg uppercase tracking-wider">
          {badge}
        </span>
      )}
    </div>
    <div className="relative z-10">
      <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">{title}</h3>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-black text-white">{value}</span>
      </div>
      <p className="text-zinc-600 text-[10px] font-bold mt-2 uppercase tracking-[0.2em]">{description}</p>
    </div>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.02] blur-3xl -mr-16 -mt-16 rounded-full group-hover:opacity-[0.05] transition-opacity`}></div>
  </div>
);

const SkillItem = ({ label, value, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
      <span>{label}</span>
      <span className="text-white">{value}%</span>
    </div>
    <div className="h-2 w-full bg-zinc-800/50 rounded-full overflow-hidden p-0.5 border border-white/5">
      <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const RecentItem = ({ title, subtitle, date, score, status, onClick, type, agentName }) => {
  const agent = interviewAgents.find(a => a.name === agentName) || { image: "/assets/interviewers/male1.png" };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-[1.5rem] transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          {type === 'interview' ? (
            <img src={agent.image} className="w-12 h-12 rounded-2xl object-cover bg-zinc-800 border border-white/10" alt="" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center">
              <FiMessageSquare className="text-zinc-500" size={20} />
            </div>
          )}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface ${status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm group-hover:text-[#bef264 transition-colors line-clamp-1">{title}</h4>
          <p className="text-zinc-500 text-xs font-medium">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-3">
          {score !== undefined && (
            <span className={`text-sm font-black ${score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {score}%
            </span>
          )}
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-tighter">
            {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </span>
        </div>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-[0.1em] border ${status === 'completed' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' :
          status === 'analysis_pending' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' :
            'border-zinc-500/20 text-zinc-500'
          }`}>
          {status === 'completed' ? 'Completed' : status === 'analysis_pending' ? 'Analyzing' : status}
        </span>
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon, title, desc, link, color, comingSoon }) => (
  <Link
    to={link}
    className={`flex items-center gap-4 p-4 border rounded-2xl transition-all group ${color} ${comingSoon ? 'opacity-50 pointer-events-none' : ''}`}
  >
    <div className="p-3 rounded-xl bg-zinc-800/30 group-hover:scale-110 transition-transform">{icon}</div>
    <div>
      <h4 className="text-white font-bold text-sm flex items-center gap-2">
        {title}
        {comingSoon && <span className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 uppercase font-black">Coming Soon</span>}
      </h4>
      <p className="text-zinc-500 text-xs font-medium">{desc}</p>
    </div>
    {!comingSoon && <FiArrowUpRight className="ml-auto text-zinc-600 group-hover:text-white transition-colors" />}
  </Link>
);

const EmptyState = ({ message }) => (
  <div className="p-10 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01] flex flex-col items-center justify-center text-center">
    <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4 transition-transform hover:rotate-12">
      <FiActivity className="text-zinc-600" size={24} />
    </div>
    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{message}</p>
  </div>
);

export default DashboardOverview;

