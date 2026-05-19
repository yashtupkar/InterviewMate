import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiCreditCard,
  FiTrendingUp,
  FiPieChart,
  FiRefreshCw,
  FiAlertCircle,
  FiActivity,
  FiMessageSquare,
} from "react-icons/fi";
import { FaGlobe } from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const StatCard = ({ label, value, icon, hint, loading }) => (
  <div className="bg-surface-alt border border-white/10 rounded-xl p-4 hover:border-primary/30 transition-all flex flex-col justify-center">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-zinc-400 text-xs font-medium">{label}</p>
        {loading ? (
          <div className="h-6 bg-zinc-800 rounded mt-1 w-20 animate-pulse" />
        ) : (
          <p className="text-xl font-bold text-white mt-1">{value}</p>
        )}
      </div>
      <div className="w-8 h-8 bg-primary/20 rounded-md flex items-center justify-center text-primary shrink-0">
        {React.cloneElement(icon, { size: 16 })}
      </div>
    </div>
  </div>
);

const getBrowserIcon = (browserName) => {
  const name = browserName?.toLowerCase();
  const cdnBase = "https://raw.githubusercontent.com/alrra/browser-logos/main/src";
  const validBrowsers = ["chrome", "firefox", "safari", "edge", "opera", "brave"];
  if (validBrowsers.includes(name)) {
    return (
      <img src={`${cdnBase}/${name}/${name}.svg`} alt={browserName} className="w-5 h-5 object-contain" />
    );
  }
  return <FaGlobe className="text-zinc-400" size={16} />;
};
const COLORS = ['#bef264', '#3b82f6', '#f97316', '#ef4444', '#8b5cf6', '#64748b'];

const AdminDashboard = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [browserAnalytics, setBrowserAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchMetrics();
  }, [getToken, days]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      const [res, browserRes] = await Promise.all([
        axios.get(`${backendURL}/api/admin/dashboard/metrics`, {
          params: { days },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${backendURL}/api/admin/analytics/browsers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      if (res.data.success) {
        setMetrics(res.data.data);
      }
      if (browserRes.data.success) {
        setBrowserAnalytics(browserRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
      setError("Failed to load dashboard metrics");
      toast.error("Failed to load metrics");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchMetrics();
    toast.success("Metrics refreshed");
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const topCards = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        label: "Active Users",
        value: metrics.activeUsers?.toLocaleString(),
        icon: <FiUsers size={20} />,
        hint: `${metrics.totalUsers?.toLocaleString()} total accounts`,
      },
      {
        label: "Active Subscriptions",
        value: metrics.activeSubscriptions?.toLocaleString(),
        icon: <FiCreditCard size={20} />,
        hint: `Window: last ${metrics.periodDays} days`,
      },
      {
        label: "MRR (30d)",
        value: formatCurrency(metrics.mrr),
        icon: <FiTrendingUp size={20} />,
        hint: `${metrics.revenue?.paidOrders || 0} paid orders`,
      },
      {
        label: "Churn Rate",
        value: `${metrics.churnRate || 0}%`,
        icon: <FiPieChart size={20} />,
        hint: "Based on cancelled subscriptions",
      },
      {
        label: "Failed Sessions",
        value: metrics.failedInterviews?.toLocaleString(),
        icon: <FiActivity size={20} />,
        hint: "Interview + GD failures in selected range",
      },
      {
        label: "Platform Health",
        value: `${metrics.platformHealth || 0}%`,
        icon: <FiAlertCircle size={20} />,
        hint: "Derived from failure/incident ratio",
      },
    ];
  }, [metrics]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Operational overview with real-time platform signals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-white outline-none focus:border-primary/50"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-gap-3">
          <FiAlertCircle className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-400">{error}</p>
            <p className="text-sm text-red-300/70 mt-1">
              No fallback data is shown. Check backend/admin auth and retry.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {topCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {!loading && metrics && (
        <>
          {/* Compact Main Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Column 1: Combined Revenue & Growth */}
            <div className="space-y-6">
              <div className="bg-surface-alt border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white">Revenue & Growth</h2>
                  <button onClick={() => navigate("/admin/subscriptions")} className="text-xs text-primary hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface rounded-lg p-3 border border-white/5">
                    <p className="text-[10px] text-zinc-400 uppercase">Paid Revenue</p>
                    <p className="text-lg font-semibold text-white mt-1">{formatCurrency(metrics.revenue?.paidRevenue)}</p>
                  </div>
                  <div className="bg-surface rounded-lg p-3 border border-white/5">
                    <p className="text-[10px] text-zinc-400 uppercase">Refunded</p>
                    <p className="text-lg font-semibold text-white mt-1">{formatCurrency(metrics.revenue?.refundedAmount)}</p>
                  </div>
                  <div className="bg-surface rounded-lg p-3 border border-white/5">
                    <p className="text-[10px] text-zinc-400 uppercase">Signups (7d)</p>
                    <p className="text-lg font-semibold text-white mt-1">{metrics.growth?.weeklySignups || 0}</p>
                  </div>
                  <div className="bg-surface rounded-lg p-3 border border-white/5">
                    <p className="text-[10px] text-zinc-400 uppercase">Waitlist Pending</p>
                    <p className="text-lg font-semibold text-white mt-1">{metrics.growth?.waitlistPending || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-alt border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white">Platform Quality</h2>
                  <button onClick={() => navigate("/admin/interviews")} className="text-xs text-primary hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface rounded-lg p-3 border border-white/5">
                    <p className="text-[10px] text-zinc-400 uppercase">Interview Avg</p>
                    <p className="text-lg font-semibold text-white mt-1">{metrics.quality?.avgInterviewScore || 0}</p>
                  </div>
                  <div className="bg-surface rounded-lg p-3 border border-white/5">
                    <p className="text-[10px] text-zinc-400 uppercase">GD Avg</p>
                    <p className="text-lg font-semibold text-white mt-1">{metrics.quality?.avgGdScore || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Browser Distribution */}
            <div className="bg-surface-alt border border-white/10 rounded-xl p-5 flex flex-col">
              <h2 className="text-base font-bold text-white mb-2">Browser Distribution</h2>
              <div className="flex-1 flex flex-col justify-center min-h-[220px]">
                {browserAnalytics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={browserAnalytics}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="browser"
                        stroke="none"
                      >
                        {browserAnalytics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center text-xs text-zinc-500 h-full">No browser data.</div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                {browserAnalytics.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-surface/50 rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/5 p-1 flex items-center justify-center border border-white/10">
                        {getBrowserIcon(item.browser)}
                      </div>
                      <span className="text-xs text-white font-medium capitalize">{item.browser}</span>
                    </div>
                    <span className="text-xs text-zinc-400 font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Alerts & Activity (Compact) */}
            <div className="space-y-6 flex flex-col h-full">
              {metrics.alerts?.length > 0 && (
                <div className="bg-surface-alt border border-white/10 rounded-xl p-5">
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <FiAlertCircle className="text-red-400" /> Alerts
                  </h2>
                  <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                    {metrics.alerts.map((alert, idx) => (
                      <div key={idx} onClick={() => navigate(alert.route || "/admin")} className="p-3 rounded-lg bg-surface border border-white/5 cursor-pointer hover:border-red-500/30">
                        <p className="text-xs font-semibold text-white">{alert.label}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{alert.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-surface-alt border border-white/10 rounded-xl p-5 flex-1 flex flex-col">
                <h2 className="text-base font-bold text-white mb-3">Recent Activity</h2>
                <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[300px]">
                  {(metrics.activityFeed || []).map((item, idx) => (
                    <div key={idx} onClick={() => navigate(item.route || "/admin")} className="p-3 rounded-lg bg-surface border border-white/5 cursor-pointer hover:border-primary/30 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-white font-medium truncate max-w-[150px]">{item.label}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{item.status}</p>
                      </div>
                      <span className="text-[10px] text-zinc-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {(metrics.activityFeed || []).length === 0 && (
                    <p className="text-xs text-zinc-500">No recent activity.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !metrics && (
        <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
          <p className="text-zinc-300">
            Dashboard data is unavailable right now. Try refresh or verify
            backend/admin token.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
