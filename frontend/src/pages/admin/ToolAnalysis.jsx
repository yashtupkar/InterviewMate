import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import {
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const ToolAnalysis = () => {
  const { getToken } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await axios.get(`${backendURL}/api/admin/analytics/tools`, {
        params: { days },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch tool analytics:", err);
      setError("Failed to load tool analytics");
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tools Analytics</h1>
          <p className="text-zinc-400 mt-1">
            Platform tool usage and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <FiAlertCircle className="text-red-400 mt-0.5" />
          <p className="text-sm text-red-300">
            {error}. No fallback metrics are displayed.
          </p>
        </div>
      )}

      {!loading && !analytics && (
        <div className="bg-surface-alt border border-white/10 rounded-xl p-6 text-zinc-300">
          Analytics data is unavailable.
        </div>
      )}

      {analytics && (
        <>
          {/* ATS Analyzer Stats */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">ATS Analyzer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-zinc-400 text-sm font-medium">
                      Total Scans
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {analytics.ats?.totalScans?.toLocaleString() ?? "-"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                    <FiTrendingUp size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-zinc-400 text-sm font-medium">
                      Average Score
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {analytics.ats?.avgScore ?? 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                    <FiTrendingUp size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-zinc-400 text-sm font-medium">
                      Scans in Period
                    </p>
                    <p className="text-3xl font-bold text-green-400 mt-2">
                      {analytics.periodDays}d
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400">
                    <FiTrendingUp size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Common Issues */}
            <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Most Common Issues
              </h3>
              <div className="space-y-3">
                {(analytics.ats?.commonIssues || []).map((issue, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium">{issue.issue}</p>
                      <div className="w-full h-2 bg-surface rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${issue.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-white font-semibold">{issue.count}</p>
                      <p className="text-xs text-zinc-500">
                        {issue.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
                {(analytics.ats?.commonIssues || []).length === 0 && (
                  <p className="text-sm text-zinc-400">
                    No ATS issue data captured in this window.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Resume Builder Stats */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Resume Builder</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
                <p className="text-zinc-400 text-sm font-medium">
                  Total Resumes
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {analytics.resumeBuilder?.totalResumes ?? "-"}
                </p>
                <p className="text-xs text-zinc-500 mt-2">in selected window</p>
              </div>

              <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
                <p className="text-zinc-400 text-sm font-medium">
                  Template Variety
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {analytics.resumeBuilder?.templateUsage?.length || 0}
                </p>
                <p className="text-xs text-zinc-500 mt-2">templates used</p>
              </div>

              <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
                <p className="text-zinc-400 text-sm font-medium">
                  Interview Sessions
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {analytics.interviews?.totalSessions ?? 0}
                </p>
                <p className="text-xs text-zinc-500 mt-2">all types</p>
              </div>

              <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
                <p className="text-zinc-400 text-sm font-medium">
                  Most Used Template
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {analytics.resumeBuilder?.mostUsedTemplate || "n/a"}
                </p>
                <p className="text-xs text-zinc-500 mt-2">template</p>
              </div>
            </div>

            <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Template Usage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(analytics.resumeBuilder?.templateUsage || []).map((item) => (
                  <div
                    key={item.key}
                    className="bg-surface rounded-lg p-4 border border-white/5"
                  >
                    <p className="text-white font-medium capitalize">
                      {item.key}
                    </p>
                    <p className="text-2xl font-bold text-primary mt-2">
                      {item.count}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">resumes</p>
                  </div>
                ))}
                {(analytics.resumeBuilder?.templateUsage || []).length ===
                  0 && (
                  <p className="text-sm text-zinc-400 md:col-span-4">
                    No resume templates used in this period.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* GD Session Stats */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              Group Discussion Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-zinc-400 text-sm font-medium">
                      Total Sessions
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {analytics.gd?.totalSessions ?? 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                    <FiUsers size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-zinc-400 text-sm font-medium">
                      Average Score
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {analytics.gd?.avgScore ?? 0}/10
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                    <FiTrendingUp size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-zinc-400 text-sm font-medium">
                      Avg Duration
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {analytics.gd?.avgDuration ?? 0}m
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                    <FiClock size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Interview Type Breakdown */}
            <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Interview Type Breakdown
              </h3>
              <div className="space-y-3">
                {(analytics.interviews?.typeBreakdown || []).map(
                  (item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <p className="text-white font-medium capitalize">
                        {item.key}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${
                                ((item.count || 0) /
                                  ((analytics.interviews?.typeBreakdown ||
                                    [])[0]?.count || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-white font-semibold w-12">
                          {item.count}
                        </p>
                      </div>
                    </div>
                  ),
                )}
                {(analytics.interviews?.typeBreakdown || []).length === 0 && (
                  <p className="text-sm text-zinc-400">
                    No interview type activity found in this period.
                  </p>
                )}
              </div>
            </div>

            {/* Most Used Topic */}
            <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                GD Topic Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(analytics.gd?.topTopics || []).map((topic) => (
                  <div
                    key={topic.topic}
                    className="bg-surface rounded-lg p-4 border border-white/5"
                  >
                    <p className="text-white font-medium">{topic.topic}</p>
                    <p className="text-2xl font-bold text-primary mt-2">
                      {topic.count}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">sessions</p>
                  </div>
                ))}
                {(analytics.gd?.topTopics || []).length === 0 && (
                  <p className="text-sm text-zinc-400 md:col-span-3">
                    No GD topics found in this period.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ToolAnalysis;
