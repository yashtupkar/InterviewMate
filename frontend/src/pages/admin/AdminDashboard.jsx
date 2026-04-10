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
import toast from "react-hot-toast";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const StatCard = ({ label, value, icon, hint, loading }) => (
  <div className="bg-surface-alt border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-all">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-zinc-400 text-sm font-medium">{label}</p>
        {loading ? (
          <div className="h-8 bg-zinc-800 rounded mt-2 w-24 animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        )}
        {hint && <p className="text-xs mt-2 text-zinc-400">{hint}</p>}
      </div>
      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
        {icon}
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
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
      const token = await getToken();
      const res = await axios.get(`${backendURL}/api/admin/dashboard/metrics`, {
        params: { days },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMetrics(res.data.data);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {!loading && metrics && (
        <>
          {/* Revenue + Growth */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Revenue & Payment Health
                </h2>
                <button
                  onClick={() => navigate("/admin/subscriptions")}
                  className="text-xs px-3 py-1.5 rounded-md bg-primary/20 text-primary hover:bg-primary/30"
                >
                  Open Subscriptions
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">Paid Revenue</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {formatCurrency(metrics.revenue?.paidRevenue)}
                  </p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">Refunded Amount</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {formatCurrency(metrics.revenue?.refundedAmount)}
                  </p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">Paid Orders</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {metrics.revenue?.paidOrders || 0}
                  </p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">Failed Orders</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {metrics.revenue?.failedOrders || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Growth Funnel</h2>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="text-xs px-3 py-1.5 rounded-md bg-primary/20 text-primary hover:bg-primary/30"
                >
                  Open Users
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">New Signups (7d)</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {metrics.growth?.weeklySignups || 0}
                  </p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">Daily Active Users</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {metrics.dau || 0}
                  </p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">Waitlist Pending</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {metrics.growth?.waitlistPending || 0}
                  </p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">
                    New Waitlist ({metrics.periodDays}d)
                  </p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {metrics.growth?.newWaitlistEntries || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quality + Support */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Interview & GD Quality
                </h2>
                <button
                  onClick={() => navigate("/admin/interviews")}
                  className="text-xs px-3 py-1.5 rounded-md bg-primary/20 text-primary hover:bg-primary/30"
                >
                  Open Interviews
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">Interview Completed</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {metrics.quality?.interviewCompleted || 0}
                  </p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">GD Completed</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {metrics.quality?.gdCompleted || 0}
                  </p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">Avg Interview Score</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {metrics.quality?.avgInterviewScore || 0}
                  </p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">Avg GD Score</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {metrics.quality?.avgGdScore || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Support Load</h2>
                <button
                  onClick={() => navigate("/admin/feedback")}
                  className="text-xs px-3 py-1.5 rounded-md bg-primary/20 text-primary hover:bg-primary/30"
                >
                  Open Feedback
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">New Contacts</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {metrics.support?.newContacts || 0}
                  </p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-zinc-400">Feedback Entries</p>
                  <p className="text-xl font-semibold text-white mt-1">
                    {metrics.support?.feedbackCount || 0}
                  </p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-white/5 col-span-2">
                  <p className="text-xs text-zinc-400">Average Rating</p>
                  <div className="flex items-center gap-2 mt-1">
                    <FiMessageSquare className="text-primary" />
                    <p className="text-xl font-semibold text-white">
                      {metrics.avgRating || 0} / 5
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts + Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                Operational Alerts
              </h2>
              <div className="space-y-3">
                {(metrics.alerts || []).map((alert, idx) => (
                  <button
                    key={`${alert.label}-${idx}`}
                    onClick={() => navigate(alert.route || "/admin")}
                    className="w-full text-left p-4 rounded-lg bg-surface border border-white/5 hover:border-primary/30 transition-colors"
                  >
                    <p className="text-sm font-semibold text-white">
                      {alert.label}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">{alert.detail}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                Recent Activity
              </h2>
              <div className="space-y-3">
                {(metrics.activityFeed || []).length === 0 && (
                  <p className="text-sm text-zinc-400">
                    No recent activity available for this period.
                  </p>
                )}
                {(metrics.activityFeed || []).map((item, idx) => (
                  <button
                    key={`${item.kind}-${idx}`}
                    onClick={() => navigate(item.route || "/admin")}
                    className="w-full p-3 rounded-lg bg-surface border border-white/5 text-left hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-white font-medium">
                        {item.label}
                      </p>
                      {typeof item.amount === "number" && (
                        <span className="text-xs text-primary">
                          {formatCurrency(item.amount)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      {item.status} •{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))}
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
