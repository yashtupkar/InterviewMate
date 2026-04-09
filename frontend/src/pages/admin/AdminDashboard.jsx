import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { FiUsers, FiCreditCard, FiTrendingUp, FiPieChart, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const StatCard = ({ label, value, icon, trend, loading }) => (
  <div className="bg-surface-alt border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-all">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-zinc-400 text-sm font-medium">{label}</p>
        {loading ? (
          <div className="h-8 bg-zinc-800 rounded mt-2 w-24 animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        )}
        {trend && (
          <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
          </p>
        )}
      </div>
      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
        {icon}
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { getToken } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, [getToken]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await axios.get(`${backendURL}/api/admin/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError('Failed to load dashboard metrics');
      toast.error('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchMetrics();
    toast.success('Metrics refreshed');
  };

  // Mock data for development
  const mockMetrics = {
    totalUsers: 1245,
    activeSubscriptions: 342,
    mrr: 8510,
    churnRate: 2.3,
    dau: 156,
    newSignups: 24,
    failedInterviews: 5,
    avgInterviewDuration: 8.5,
    platformHealth: 98,
  };

  const displayMetrics = metrics || mockMetrics;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Platform overview and key metrics</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
        >
          <FiRefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-gap-3">
          <FiAlertCircle className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-400">{error}</p>
            <p className="text-sm text-red-300/70 mt-1">Showing mock data. Check backend connection.</p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Total Users"
          value={displayMetrics.totalUsers?.toLocaleString()}
          icon={<FiUsers size={20} />}
          trend={12.5}
          loading={loading}
        />
        <StatCard
          label="Active Subscriptions"
          value={displayMetrics.activeSubscriptions?.toLocaleString()}
          icon={<FiCreditCard size={20} />}
          trend={8.2}
          loading={loading}
        />
        <StatCard
          label="Monthly Revenue (MRR)"
          value={`$${displayMetrics.mrr?.toLocaleString()}`}
          icon={<FiTrendingUp size={20} />}
          trend={15.3}
          loading={loading}
        />
        <StatCard
          label="Churn Rate"
          value={`${displayMetrics.churnRate}%`}
          icon={<FiPieChart size={20} />}
          trend={-2.1}
          loading={loading}
        />
        <StatCard
          label="Daily Active Users"
          value={displayMetrics.dau?.toLocaleString()}
          icon={<FiUsers size={20} />}
          trend={5.8}
          loading={loading}
        />
        <StatCard
          label="New Sign-ups (This Week)"
          value={displayMetrics.newSignups?.toLocaleString()}
          icon={<FiTrendingUp size={20} />}
          trend={22.4}
          loading={loading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
          <p className="text-zinc-400 text-sm font-medium">Failed Interviews</p>
          <p className="text-2xl font-bold text-white mt-2">{displayMetrics.failedInterviews}</p>
          <p className="text-xs text-yellow-400/70 mt-2">⚠️ Needs investigation</p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
          <p className="text-zinc-400 text-sm font-medium">Avg Interview Duration</p>
          <p className="text-2xl font-bold text-white mt-2">{displayMetrics.avgInterviewDuration}m</p>
          <p className="text-xs text-green-400/70 mt-2">✓ Normal range</p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
          <p className="text-zinc-400 text-sm font-medium">Platform Health</p>
          <p className="text-2xl font-bold text-white mt-2">{displayMetrics.platformHealth}%</p>
          <p className="text-xs text-green-400/70 mt-2">✓ All systems operational</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="px-4 py-3 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors font-medium text-sm">
            View All Users
          </button>
          <button className="px-4 py-3 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors font-medium text-sm">
            Manage Subscriptions
          </button>
          <button className="px-4 py-3 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors font-medium text-sm">
            Check Feedback
          </button>
          <button className="px-4 py-3 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors font-medium text-sm">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
