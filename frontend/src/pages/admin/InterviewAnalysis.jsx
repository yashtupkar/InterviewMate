import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import {
  FiFilter,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const InterviewAnalysis = () => {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [overview, setOverview] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [minScore, setMinScore] = useState("");
  const [status, setStatus] = useState("");
  const [days, setDays] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = useMemo(() => {
    if (!pagination.total || !pagination.limit) return 1;
    return Math.max(1, Math.ceil(pagination.total / pagination.limit));
  }, [pagination]);

  const fetchSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const params = {
        page: currentPage,
        limit: 20,
        type: selectedType,
        days,
      };
      if (minScore !== "") params.minScore = Number(minScore);
      if (status) params.status = status;

      const res = await axios.get(`${backendURL}/api/admin/interviews`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setSessions(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, limit: 20, total: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
      setError("Failed to load interview sessions");
      setSessions([]);
      setPagination({ page: 1, limit: 20, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${backendURL}/api/admin/interviews/overview`,
        {
          params: { days },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        setOverview(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch interview overview:", err);
      setOverview(null);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentPage, selectedType, minScore, status, days]);

  useEffect(() => {
    fetchOverview();
  }, [days]);

  const handleExportCSV = () => {
    if (!sessions.length) {
      toast.error("No rows to export on current page");
      return;
    }

    const headers = ["User", "Type", "Score", "Duration", "Status", "Date"];
    const csv = [
      headers.join(","),
      ...sessions.map((s) =>
        [
          `${s.user?.firstName} ${s.user?.lastName}`,
          s.type,
          s.score,
          s.duration,
          s.status,
          new Date(s.createdAt).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interviews-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("CSV exported");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUserAvatarLabel = (session) => {
    const firstName = session.user?.firstName?.trim() || "";
    const lastName = session.user?.lastName?.trim() || "";
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim();
    if (initials) return initials.toUpperCase();
    const emailName = session.user?.email?.split("@")?.[0] || "U";
    return emailName.slice(0, 2).toUpperCase();
  };

  const getTypeBadgeClasses = (type) => {
    if (type === "GD") {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/20";
    }
    return "bg-sky-500/20 text-sky-300 border-sky-500/20";
  };

  const getAvatarSrc = (session) => session.user?.avatar || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Interview & GD Analysis
          </h1>
          <p className="text-zinc-400 mt-1">
            Review interview and group discussion sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => {
              setCurrentPage(1);
              setDays(Number(e.target.value));
            }}
            className="px-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-white outline-none focus:border-primary/50"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={fetchSessions}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-zinc-300 hover:bg-white/10"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
          >
            <FiDownload size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Total Sessions</p>
          <p className="text-2xl font-bold text-white mt-2">
            {overview?.totals?.totalSessions ?? "-"}
          </p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Avg Interview Score</p>
          <p className="text-2xl font-bold text-white mt-2">
            {overview?.quality?.avgInterviewScore ?? "-"}
          </p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Avg Duration</p>
          <p className="text-2xl font-bold text-white mt-2">
            {overview?.quality?.avgDuration ?? "-"}m
          </p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Completion Rate</p>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {overview?.quality?.completionRate ?? 0}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedType}
            onChange={(e) => {
              setCurrentPage(1);
              setSelectedType(e.target.value);
            }}
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none"
          >
            <option value="all">All Types</option>
            <option value="Interview">Interview</option>
            <option value="GD">Group Discussion</option>
          </select>

          <input
            type="number"
            placeholder="Min Score"
            value={minScore}
            onChange={(e) => {
              setCurrentPage(1);
              setMinScore(e.target.value);
            }}
            min="0"
            max="10"
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:border-primary/50 outline-none"
          />

          <select
            value={status}
            onChange={(e) => {
              setCurrentPage(1);
              setStatus(e.target.value);
            }}
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="analysis_failed">Analysis Failed</option>
            <option value="analysis_pending">Analysis Pending</option>
            <option value="in_progress">In Progress</option>
          </select>

          <button
            onClick={() => {
              setSelectedType("all");
              setMinScore("");
              setStatus("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors md:col-span-3"
          >
            <FiFilter size={16} className="inline mr-2" />
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-surface-alt border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-surface">
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">
                  USER
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">
                  TYPE
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">
                  SCORE
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">
                  DURATION
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">
                  DATE
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {!loading && sessions.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-zinc-400"
                    colSpan={7}
                  >
                    No sessions found for the selected filters.
                  </td>
                </tr>
              )}
              {sessions.map((session) => (
                <tr
                  key={session._id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="flex items-center gap-3">
                      {getAvatarSrc(session) ? (
                        <img
                          src={getAvatarSrc(session)}
                          alt={
                            `${session.user?.firstName || ""} ${session.user?.lastName || ""}`.trim() ||
                            "User avatar"
                          }
                          className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                          {getUserAvatarLabel(session)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">
                          {session.user?.firstName} {session.user?.lastName}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {session.user?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium border ${getTypeBadgeClasses(session.type)}`}
                    >
                      {session.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-white">
                      {session.score}/10
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {session.duration}m
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {formatDate(session.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-medium">
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      className="text-zinc-400 hover:text-primary transition-colors"
                      title="View Report"
                      onClick={() =>
                        toast(
                          "Detailed report view can be added in next iteration",
                        )
                      }
                    >
                      <FiEye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewAnalysis;
