import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import PastInterviews from "./PastInterviews";
import PastGDs from "./PastGDs";
import { HiSparkles } from "react-icons/hi2";
import { FaUsers } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";

const Reports = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get("tab") || "").toLowerCase();
  const activeTab =
    tabParam === "gd" || tabParam === "gds" ? "gds" : "interviews";

  useEffect(() => {
    if (!tabParam) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("tab", "interviews");
      setSearchParams(nextParams, { replace: true });
    }
  }, [tabParam, searchParams, setSearchParams]);

  const handleTabChange = (tab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tab === "gds" ? "gd" : "interviews");
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Reports | PlaceMateAI</title>
      </Helmet>
      <div className="min-h-screen text-zinc-100 transition-colors selection:bg-[#bef264]/30 pb-20">
        <div className="max-w-6xl mx-auto px-2 sm:px-6 w-full mt-4 sm:mt-8">
          {/* Page Header */}
          <div className="flex  items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg sm:text-2xl ml-2 md:ml-0 font-bold dark:text-white text-black">
              {activeTab === "interviews" ? "Your Interviews" : "Your GDs"}
            </h2>
            <button
              onClick={() =>
                navigate(
                  activeTab === "interviews" ? "/dashboard/setup" : "/gd/setup",
                )
              }
              className="flex items-center justify-center gap-1 px-4 md:px-6 py-1.5 md:py-2.5 bg-[#bef264] hover:bg-[#bef264]-hover text-black font-bold rounded-lg transition-all active:scale-95 whitespace-nowrap text-sm w-fit sm:w-auto"
            >
              {activeTab === "interviews" ? (
                <>
                  <HiSparkles size={16} /> Create{" "}
                  <span className="hidden md:block">Interview</span>
                </>
              ) : (
                <>
                  <FaUsers size={16} />
                  Create <span className="hidden md:block">GD</span>
                </>
              )}
            </button>
          </div>

          {/* Compact Tabs Header */}
          <div className="flex items-center border-b dark:border-white/10 border-black/10 mb-6 gap-4 sm:gap-8 px-2 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => handleTabChange("interviews")}
              className={`flex items-center gap-2 pb-3 border-b-2 font-bold transition-all relative top-[1px] whitespace-nowrap ${
                activeTab === "interviews"
                  ? "border-[#bef264] text-[#bef264]"
                  : "border-transparent text-zinc-500 dark:hover:text-zinc-300 hover:text-gray-700"
              }`}
            >
              <HiSparkles size={16} />
              Interviews
            </button>
            <button
              onClick={() => handleTabChange("gds")}
              className={`flex items-center gap-2 pb-3 border-b-2 font-bold transition-all relative top-[1px] whitespace-nowrap ${
                activeTab === "gds"
                  ? "border-[#bef264] text-[#bef264]"
                  : "border-transparent text-zinc-500 dark:hover:text-zinc-300 hover:text-gray-700"
              }`}
            >
              <FaUsers size={16} />
              GDs
            </button>
          </div>

          {/* Tab Content */}
          <div className="w-full">
            {activeTab === "interviews" && <PastInterviews />}
            {activeTab === "gds" && <PastGDs />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
