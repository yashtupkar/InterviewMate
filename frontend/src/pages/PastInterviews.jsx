import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMoreVertical, FiLoader, FiPlus } from "react-icons/fi";
import { formatDistanceToNow, differenceInHours, format } from "date-fns";
import { useAuth } from "@clerk/clerk-react";
import { interviewAgents } from "../constants/agents";
import EmptyState from "../components/common/EmptyState";

const PastInterviews = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pastInterviews, setPastInterviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPastInterviews = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/vapi-interview/user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (Array.isArray(res.data)) {
          setPastInterviews(res.data);
        } else {
          setPastInterviews([]);
        }
      } catch (err) {
        console.error("Error fetching past interviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPastInterviews();
  }, [getToken]);

  const handleGenerateReport = async (e, sessionId) => {
    e.stopPropagation();
    const token = await getToken();
    setLoading(true);
    navigate(`/interview/result/${sessionId}`);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vapi-interview/retry-analysis`,
        { sessionId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInterviews = Array.isArray(pastInterviews)
    ? pastInterviews.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(
    (Array.isArray(pastInterviews) ? pastInterviews.length : 0) / itemsPerPage,
  );

  return (
    <div className="w-full animate-fade-in-up">
        <div className="overflow-hidden rounded-xl border dark:border-white/5 border-black/5 d bg-black">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b dark:border-white/5 border-black/5 dark:text-zinc-400 text-gray-600 text-xs font-medium dark:bg-[#1a1a1a]/50 bg-gray-100/50">
                  <th className="px-4 sm:px-6 py-4 font-medium">Interviewer</th>
                  <th className="px-6 py-4 font-medium hidden sm:table-cell">Job Title</th>
                  <th className="px-6 py-4 font-medium hidden lg:table-cell">Interview Type</th>
                  <th className="px-4 sm:px-6 py-4 font-medium">Status</th>
                  <th className="px-4 sm:px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium hidden lg:table-cell">Created</th>
                  <th className="px-4 sm:px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b dark:border-white/5 border-black/5 dark:bg-[#1a1a1a]/50 bg-gray-100/50">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full skeleton" />
                          <div className="h-4 w-24 skeleton" />
                        </div>
                      </td>
                      <td className="px-6 py-6 font-medium">
                        <div className="h-4 w-32 skeleton" />
                      </td>
                      <td className="px-6 py-6 hidden sm:table-cell">
                        <div className="h-4 w-20 skeleton" />
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-6 w-20 rounded-md skeleton" />
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-4 w-8 skeleton" />
                      </td>
                      <td className="px-6 py-6 hidden md:table-cell">
                        <div className="h-4 w-24 skeleton" />
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-4 w-8 bg-white/5 rounded mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : currentInterviews.length > 0 ? (
                  currentInterviews.map((session) => {
                    const agentName = session.metadata?.agentName || "Rohan";
                    const agent = interviewAgents.find(
                      (a) => a.name === agentName,
                    ) || {
                      bg: "6366f1",
                      image: "/assets/interviewers/male1.png",
                    };
                    return (
                      <tr
                        key={session._id}
                        onClick={() =>
                          navigate(`/interview/result/${session._id}`)
                        }
                        className="border-b dark:border-white/5 border-black/5 dark:bg-[#1a1a1a]/50 bg-gray-100/50 dark:hover:bg-[#1a1a1a] hover:bg-white transition-colors cursor-pointer group"
                      >
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <img
                              src={agent.profileImage}
                              alt={agentName}
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border dark:border-zinc-700 border-gray-300 object-cover shrink-0"
                            />
                            <span className="dark:text-zinc-200 text-gray-800 font-medium group-hover:text-indigo-400 transition-colors text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">
                              {agentName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="dark:text-white text-black font-medium truncate max-w-[120px] lg:max-w-none block">
                            {session.metadata?.role || "Interview Session"}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="dark:text-zinc-300 text-gray-700 capitalize">
                            {session.interviewType}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span
                            className={`inline-flex px-1.5 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[11px] font-semibold rounded-md ${
                              session.status === "completed"
                                ? "dark:bg-[#253321] dark:text-[#93dc65] bg-green-600 text-white border dark:border-[#3e5338]"
                                : session.status === "analysis_pending"
                                  ? "dark:bg-blue-500/10 dark:text-blue-400 border bg-blue-500 text-white dark:border-blue-500/20"
                                  : session.status === "analysis_failed"
                                    ? "dark:bg-red-500/10 dark:text-red-400 border bg-red-500 text-white dark:border-red-500/20"
                                    : "dark:bg-yellow-500/10 dark:text-yellow-400 border bg-yellow-500 text-white dark:border-yellow-500/20"
                            }`}
                          >
                            {session.status === "completed"
                              ? "Done"
                              : session.status === "analysis_pending"
                                ? "..."
                                : "Fail"}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`font-black text-xs sm:text-sm ${(session.report?.overallScore || 0) >= 75 ? "text-emerald-400" :
                              (session.report?.overallScore || 0) >= 50 ? "text-amber-400" : "text-red-400"
                            }`}>
                            {session.report?.overallScore ?? "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 dark:text-zinc-300 text-gray-700 font-medium truncate max-w-[100px] hidden lg:table-cell">
                          {differenceInHours(new Date(), new Date(session.createdAt)) < 12
                            ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })
                            : format(new Date(session.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            {(session.status === "analysis_pending" ||
                              session.status === "analysis_failed") && (
                              <button
                                onClick={(e) =>
                                  handleGenerateReport(e, session._id)
                                }
                                className="text-[8px] sm:text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider bg-indigo-500/10 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border border-indigo-500/20"
                              >
                                {session.status === "analysis_pending" ? "Retry" : "Gen"}
                              </button>
                            )}
                            <button
                              className="dark:text-zinc-500 text-gray-500 dark:hover:text-white hover:text-black transition-colors p-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiMoreVertical size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4">
                      <EmptyState message="no interview found yet" />
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === i + 1
                    ? "bg-[#bef264] text-black"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
    </div>
  );
};

export default PastInterviews;
