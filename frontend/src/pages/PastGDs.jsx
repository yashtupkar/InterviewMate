import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMessageSquare, FiClock, FiArrowRight } from "react-icons/fi";
import { formatDistanceToNow, differenceInHours, format } from "date-fns";
import { useAuth } from "@clerk/clerk-react";
import EmptyState from "../components/common/EmptyState";

const ITEMS_PER_PAGE = 8;

const getStatusUi = (status) => {
  if (status === "completed") {
    return {
      label: "Completed",
      className:
        "dark:bg-[#253321] dark:text-[#93dc65] bg-green-600 text-white border dark:border-[#3e5338]",
    };
  }
  if (status === "analysis_failed") {
    return {
      label: "Failed",
      className:
        "dark:bg-red-500/10 dark:text-red-400 border bg-red-500 text-white dark:border-red-500/20",
    };
  }
  return {
    label: "Pending",
    className:
      "dark:bg-yellow-500/10 dark:text-yellow-400 border bg-yellow-500 text-white dark:border-yellow-500/20",
  };
};

const getVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push("...");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) {
    pages.push("...");
  }

  pages.push(totalPages);
  return pages;
};

const formatCreatedAt = (value) => {
  if (!value) return "-";
  const createdAt = new Date(value);
  return differenceInHours(new Date(), createdAt) < 12
    ? formatDistanceToNow(createdAt, { addSuffix: true })
    : format(createdAt, "MMM d, yyyy");
};

const formatDuration = (seconds) => {
  const safeValue = Number(seconds) || 0;
  return `${Math.floor(safeValue / 60)}m ${safeValue % 60}s`;
};

const PastGDs = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pastGDs, setPastGDs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPastGDs = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/group-discussion/my-sessions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (Array.isArray(res.data)) {
          setPastGDs(res.data);
        } else {
          setPastGDs([]);
        }
      } catch (err) {
        console.error("Error fetching past GDs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPastGDs();
  }, [getToken]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pastGDs.length]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentGDs = Array.isArray(pastGDs)
    ? pastGDs.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(
    (Array.isArray(pastGDs) ? pastGDs.length : 0) / ITEMS_PER_PAGE,
  );
  const pageItems = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const startRecord = pastGDs.length === 0 ? 0 : indexOfFirstItem + 1;
  const endRecord = Math.min(indexOfLastItem, pastGDs.length);

  return (
    <div className="w-full animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs sm:text-sm dark:text-zinc-400 text-gray-600 font-medium">
          Showing {startRecord}-{endRecord} of {pastGDs.length} GD sessions
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10  bg-white/5">
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-white/5 border-black/5 dark:text-zinc-400 text-gray-600 text-xs font-medium dark:bg-[#1a1a1a]/50 bg-gray-100/50">
                <th className="px-6 py-4 font-medium">Topic</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium text-right">Report</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr
                    key={i}
                    className="border-b dark:border-white/5 border-black/5 dark:bg-[#1a1a1a]/50 bg-gray-100/50"
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg skeleton" />
                        <div className="h-4 w-32 skeleton" />
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-5 w-24 rounded-md skeleton" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-4 w-8 skeleton" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-6 w-24 skeleton" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-4 w-24 skeleton" />
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="h-8 w-20 rounded-md skeleton ml-auto" />
                    </td>
                  </tr>
                ))
              ) : currentGDs.length > 0 ? (
                currentGDs.map((session) => (
                  <tr
                    key={session._id}
                    className="border-b dark:border-white/5 border-black/5 dark:bg-[#1a1a1a]/50 bg-gray-100/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#bef264]/10 flex items-center justify-center border border-[#bef264]/20 shrink-0">
                          <FiMessageSquare
                            className="text-[#bef264]"
                            size={14}
                          />
                        </div>
                        <span className="dark:text-white text-black font-medium truncate max-w-[260px] text-xs sm:text-sm">
                          {session.topic}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const statusUi = getStatusUi(session.status);
                        return (
                          <span
                            className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md ${statusUi.className}`}
                          >
                            {statusUi.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-black text-xs sm:text-sm ${
                          (session.report?.overallScore || 0) >= 75
                            ? "text-emerald-400"
                            : (session.report?.overallScore || 0) >= 50
                              ? "text-amber-400"
                              : "text-red-400"
                        }`}
                      >
                        {session.report?.overallScore ?? "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="dark:text-zinc-300 text-zinc-700 font-bold whitespace-nowrap">
                          {formatDuration(session.duration)}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest whitespace-nowrap">
                          Limit: {formatDuration(session.timeLimit || 600)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 dark:text-zinc-300 text-gray-700 font-medium whitespace-nowrap">
                      {formatCreatedAt(session.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/gd/result/${session._id}`)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#bef264] hover:opacity-80 transition-opacity"
                      >
                        View
                        <FiArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4">
                    <EmptyState message="no group discussions found yet" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden p-3 space-y-3">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
              >
                <div className="h-4 w-40 skeleton" />
                <div className="h-4 w-24 skeleton" />
                <div className="h-8 w-full rounded-lg skeleton" />
              </div>
            ))
          ) : currentGDs.length > 0 ? (
            currentGDs.map((session) => {
              const statusUi = getStatusUi(session.status);
              return (
                <button
                  key={session._id}
                  onClick={() => navigate(`/gd/result/${session._id}`)}
                  className="w-full text-left rounded-xl border border-white/10 bg-white/[0.02] p-4 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold dark:text-zinc-100 text-zinc-900 truncate">
                        {session.topic}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {session.category || "General"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md ${statusUi.className}`}
                    >
                      {statusUi.label}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs gap-2">
                    <span className="text-zinc-500 inline-flex items-center gap-1 whitespace-nowrap">
                      <FiClock size={12} />
                      {formatDuration(session.duration)}
                    </span>
                    <span
                      className={`font-black ${
                        (session.report?.overallScore || 0) >= 75
                          ? "text-emerald-400"
                          : (session.report?.overallScore || 0) >= 50
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}
                    >
                      Score: {session.report?.overallScore ?? "-"}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-zinc-500">
                    {formatCreatedAt(session.createdAt)}
                  </p>
                </button>
              );
            })
          ) : (
            <EmptyState message="no group discussions found yet" />
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/5 text-zinc-300 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          {pageItems.map((item, idx) =>
            item === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-zinc-500 text-sm"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => setCurrentPage(item)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item
                    ? "bg-[#bef264] text-black"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/5"
                }`}
              >
                {item}
              </button>
            ),
          )}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/5 text-zinc-300 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PastGDs;
