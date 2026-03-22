import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMoreVertical, FiMessageSquare, FiUsers, FiClock } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@clerk/clerk-react";
import EmptyState from "../components/common/EmptyState";

const PastGDs = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pastGDs, setPastGDs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
          }
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGDs = Array.isArray(pastGDs)
    ? pastGDs.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(
    (Array.isArray(pastGDs) ? pastGDs.length : 0) / itemsPerPage
  );

  return (
    <>
      <Helmet>
        <title>Past Group Discussions | PlaceMateAI</title>
      </Helmet>
      <div className="min-h-screen text-zinc-100 transition-colors selection:bg-[#bef264]/30 pb-20">
        <div className="max-w-6xl mx-auto px-6 w-full animate-fade-in-up mt-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold dark:text-white text-black">
            Group Discussions
          </h2>
          <button
            onClick={() => navigate("/gd/setup")}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-[#bef264] hover:bg-[#bef264]-hover text-black font-bold rounded-lg transition-all active:scale-95 whitespace-nowrap text-sm"
          >
            <FiUsers size={16} />
            New GD
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border dark:border-white/5 border-black/5 bg-black">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b dark:border-white/5 border-black/5 dark:text-zinc-400 text-gray-600 text-xs font-medium dark:bg-[#1a1a1a]/50 bg-gray-100/50">
                  <th className="px-6 py-4 font-medium">Topic</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading 
                  ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b dark:border-white/5 border-black/5 dark:bg-[#1a1a1a]/50 bg-gray-100/50">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg skeleton" />
                          <div className="h-4 w-32 skeleton" />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-4 w-20 skeleton" />
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
                    </tr>
                  ))
                  : currentGDs.length > 0 ? (
                  currentGDs.map((session) => (
                    <tr
                      key={session._id}
                      onClick={() => navigate(`/gd/result/${session._id}`)}
                      className="border-b dark:border-white/5 border-black/5 dark:bg-[#1a1a1a]/50 bg-gray-100/50 dark:hover:bg-[#1a1a1a] hover:bg-white transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#bef264]/10 flex items-center justify-center border border-[#bef264]/20">
                            <FiMessageSquare className="text-[#bef264]" size={16} />
                          </div>
                          <span className="dark:text-white text-black font-medium group-hover:text-[#bef264] transition-colors truncate max-w-[200px]">
                            {session.topic}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="dark:text-zinc-300 text-gray-700 capitalize">
                          {session.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md ${session.status === "completed"
                              ? "dark:bg-[#253321] dark:text-[#93dc65] bg-green-600 text-white border dark:border-[#3e5338]"
                              : session.status === "analysis_failed"
                                ? "dark:bg-red-500/10 dark:text-red-400 border bg-red-500 text-white dark:border-red-500/20"
                                : "dark:bg-yellow-500/10 dark:text-yellow-400 border bg-yellow-500 text-white dark:border-yellow-500/20"
                            }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-black ${(session.report?.overallScore || 0) >= 75 ? "text-emerald-400" :
                            (session.report?.overallScore || 0) >= 50 ? "text-amber-400" : "text-red-400"
                          }`}>
                          {session.report?.overallScore ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="dark:text-zinc-300 text-zinc-700 font-bold">
                            {Math.floor((session.duration || 0) / 60)}m {(session.duration || 0) % 60}s
                          </span>
                          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                            Limit: {Math.floor((session.timeLimit || 600) / 60)}m
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 dark:text-zinc-300 text-gray-700 font-medium truncate max-w-[120px]">
                        {formatDistanceToNow(new Date(session.createdAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="dark:text-zinc-500 text-gray-500 dark:hover:text-white hover:text-black transition-colors p-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiMoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4">
                      <EmptyState message="no group discussions found yet" />
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1
                    ? "bg-[#bef264] text-black"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/5"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default PastGDs;
