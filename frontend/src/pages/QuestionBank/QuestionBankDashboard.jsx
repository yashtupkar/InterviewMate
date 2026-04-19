import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiSearch,
  FiCode,
  FiLayers,
  FiDatabase,
  FiCpu,
  FiUsers,
  FiClock,
  FiStar,
  FiArrowRight,
  FiZap,
  FiChevronDown,
} from "react-icons/fi";
import GoogleAdsBlock from "../../components/common/GoogleAdsBlock";
import Skeleton from "../../components/common/Skeleton";
import CTA from "../../components/home/CTA";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const QuestionBankDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    skills: [],
    companies: [],
    behavioral: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchTab, setSearchTab] = useState("Topics"); // Topics | Companies | Roles
  const [visibleSkills, setVisibleSkills] = useState(8);
  const [visibleCompanies, setVisibleCompanies] = useState(8);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${backendURL}/api/questions/stats/aggregates`,
        );
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load question stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleCardClick = (type, value) => {
    if (type === "skill") {
      navigate(`/interview-questions/${encodeURIComponent(value)}`);
      return;
    }

    navigate(`/interview-questions/all?${type}=${encodeURIComponent(value)}`);
  };

  const getCompanyLogo = (companyName) => {
    const domain = companyName.toLowerCase().replace(/\s+/g, "") + ".com";
    return `https://logo.clearbit.com/${domain}`;
  };

  const getCompanyIcon = (name) => {
    const n = name.toLowerCase().trim();
    if (n.includes("google")) return "logos:google-icon";
    if (n.includes("amazon")) return "logos:aws";
    if (n.includes("microsoft")) return "logos:microsoft-icon";
    if (n.includes("apple")) return "logos:apple";
    if (n.includes("meta") || n.includes("facebook")) return "logos:meta-icon";
    if (n.includes("netflix")) return "logos:netflix-icon";
    if (n.includes("uber")) return "simple-icons:uber";
    if (n.includes("airbnb")) return "logos:airbnb-icon";
    if (n.includes("adobe")) return "logos:adobe-icon";
    if (n.includes("tesla")) return "logos:tesla";
    if (n.includes("spotify")) return "logos:spotify-icon";
    if (n.includes("twitter") || n === "x") return "logos:twitter";
    if (n.includes("github")) return "logos:github-icon";
    return null; // Fallback to Clearbit or Initial
  };

  const getSkillIcon = (name) => {
    const n = name.toLowerCase().trim();
    if (n.includes("react")) return "logos:react";
    if (n.includes("javascript") || n === "js") return "logos:javascript";
    if (n.includes("node")) return "logos:nodejs-icon";
    if (n.includes("python")) return "logos:python";
    if (n.includes("java") && !n.includes("javascript")) return "logos:java";
    if (n.includes("html")) return "logos:html-5";
    if (n.includes("css")) return "logos:css-3";
    if (n.includes("next")) return "logos:nextjs-icon";
    if (n.includes("typescript") || n === "ts") return "logos:typescript-icon";
    if (n.includes("system design")) return "flat-color-icons:radar-plot";
    if (n.includes("dsa") || n.includes("algorithm"))
      return "flat-color-icons:tree-structure";
    if (n.includes("docker")) return "logos:docker-icon";
    if (n.includes("kubernetes")) return "logos:kubernetes";
    if (n.includes("aws")) return "logos:aws";
    if (n.includes("sql")) return "logos:mysql";
    if (n.includes("mongodb")) return "logos:mongodb-icon";
    if (n.includes("tailwind")) return "logos:tailwindcss-icon";
    if (n.includes("figma")) return "logos:figma";
    if (n.includes("git")) return "logos:git-icon";
    if (n === "c") return "logos:c";
    if (n === "c++" || n.includes("cpp")) return "logos:c-plusplus";
    if (n.includes("redux")) return "logos:redux";
    return "material-symbols:code-blocks-outline";
  };

  // Filter skills based on search query AND active tab
  const filteredSkills = useMemo(() => {
    let baseSkills = stats.skills;
    const query = search.toLowerCase().trim();

    // 1. Branching Logic by Tab
    if (searchTab === "Roles") {
      if (query) {
        baseSkills = baseSkills.filter((skill) =>
          skill.domain?.toLowerCase().includes(query),
        );
      }
    } else if (searchTab === "Topics") {
      if (query) {
        baseSkills = baseSkills.filter((skill) =>
          skill.name.toLowerCase().includes(query),
        );
      }
    }

    // 2. Consolidate duplicates by name
    const consolidated = baseSkills.reduce((acc, skill) => {
      const existing = acc.find(
        (s) => s.name.toLowerCase() === skill.name.toLowerCase(),
      );
      if (existing) {
        existing.totalQuestions += skill.totalQuestions;
        existing.codingQuestions += skill.codingQuestions;
      } else {
        acc.push({ ...skill });
      }
      return acc;
    }, []);

    return consolidated;
  }, [search, searchTab, stats.skills]);

  // Search Results Prediction
  const searchSuggestions = useMemo(() => {
    if (!search) return [];
    const query = search.toLowerCase();
    if (searchTab === "Topics") {
      return stats.skills
        .filter((s) => s.name.toLowerCase().includes(query))
        .slice(0, 5);
    } else if (searchTab === "Companies") {
      return stats.companies
        .filter((c) => c.name.toLowerCase().includes(query))
        .slice(0, 5);
    }
    const uniqueDomains = Array.from(
      new Set(stats.skills.map((s) => s.domain).filter(Boolean)),
    );
    return uniqueDomains
      .filter((d) => d.toLowerCase().includes(query))
      .slice(0, 5);
  }, [search, searchTab, stats]);

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 md:px-8 pt-44 max-w-7xl mx-auto overflow-x-hidden relative">
      {/* --- HERO SECTION --- */}
      <div className="relative mb-12 text-center z-10">
        <h1 className="text-4xl lg:text-4xl font-black leading-tight tracking-tight mb-4">
          What <span className="text-[#bef264]">interview</span> are you
          preparing for?
        </h1>
        <p className="text-zinc-500 text-base md:text-lg max-w-xl mx-auto font-medium mb-8">
          Access company-specific, role-based, and behavioral questions — all in
          one place to make you interview-ready.
        </p>

        {/* Multi-Modal Search Center */}
        <div className="relative max-w-3xl mx-auto z-20">
          <div className="bg-zinc-900 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl overflow-hidden">
            <div className="flex p-1 border-b border-white/5 bg-black/20">
              {["Topics", "Companies", "Roles"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setSearchTab(tab);
                    setSearch("");
                  }}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${
                    searchTab === tab
                      ? "bg-[#bef264] text-black shadow-lg shadow-[#bef264]/20"
                      : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center px-6 py-3">
              <FiSearch className="text-zinc-500 text-xl shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Filter ${searchTab.toLowerCase()} (e.g., ${searchTab === "Companies" ? "Google" : "Frontend"})...`}
                className="w-full bg-transparent px-4 py-2 text-base focus:outline-none placeholder:text-zinc-700 font-medium"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mr-3 text-zinc-600 hover:text-white transition-colors text-xs font-bold"
                >
                  CLEAR
                </button>
              )}
              <button
                onClick={() => {
                  const element = document.getElementById("mastery-tracks");
                  element?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="bg-[#bef264] text-black px-6 py-2 rounded-2xl font-black text-xs hover:shadow-[0_0_20px_rgba(190,242,100,0.4)] transition-all shrink-0 active:scale-95"
              >
                FILTER
              </button>
            </div>

            {search && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                {searchSuggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      handleCardClick(
                        searchTab === "Companies" ? "company" : "skill",
                        typeof item === "string" ? item : item.name,
                      )
                    }
                    className="px-6 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <span className="font-bold text-zinc-300 group-hover:text-[#bef264] transition-colors">
                      {typeof item === "string" ? item : item.name}
                    </span>
                    <FiArrowRight className="text-zinc-700 group-hover:text-[#bef264] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["Frontend", "System-Design", "Machine-Learning", "Behavioral"].map(
            (topic) => (
              <button
                key={topic}
                onClick={() =>
                  navigate(`/interview-questions/${topic.toLowerCase()}`)
                }
                className="px-4 py-2 bg-zinc-900/50 border border-white/5 rounded-full text-xs font-bold text-zinc-400 hover:border-[#bef264]/50 hover:text-white transition-all flex items-center gap-2"
              >
                <FiZap className="text-[#bef264]" /> {topic}
              </button>
            ),
          )}
        </div>
      </div>

      {/* --- MASTERY TRACKS --- */}
      <div id="mastery-tracks" className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-1.5 h-8 bg-emerald-500 rounded-full"></span>
              Top Skills & Languages
            </h2>
            <p className="text-zinc-500 text-sm font-medium mt-1">
              Practice patterns from top-tier tech giants
            </p>
          </div>
          <span className="text-zinc-600 text-xs font-bold">
            {filteredSkills.length} tracks
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-3xl" />
              ))}
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="py-20 text-center bg-zinc-900/30 rounded-[40px] border border-dashed border-white/10">
            <FiLayers className="mx-auto text-4xl text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-bold">
              No tracks found for this selection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredSkills.slice(0, visibleSkills).map((skill) => (
              <div
                key={skill.name}
                onClick={() => handleCardClick("skill", skill.name)}
                className="group relative bg-zinc-900 border border-white/5 rounded-3xl p-6 hover:bg-zinc-800 transition-all duration-500 cursor-pointer flex flex-col active:scale-98"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2.5 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                    <img
                      src={`https://api.iconify.design/${getSkillIcon(skill.name).replace(":", "/")}.svg`}
                      className="w-full h-full object-contain"
                      alt={skill.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-black text-white truncate group-hover:text-[#bef264] transition-colors uppercase tracking-tight">
                      {skill.name}
                    </h4>
                    <p className="text-[#bef264]/60 text-[10px] font-black uppercase tracking-wider">
                      Active Track
                    </p>
                  </div>
                </div>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-6">
                  Comprehensive{" "}
                  <span className="uppercase font-bold">{skill.name}</span>{" "}
                  mastery track covering industry patterns and technical debt.
                </p>
                <div className="h-px w-full bg-white/5 mb-6"></div>
                <div className="flex items-center gap-6 mb-8 mt-auto">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <FiLayers className="text-lg" />
                    <span className="text-xs font-bold">
                      {skill.totalQuestions} Questions
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#bef264]">
                    <FiCode className="text-lg" />
                    <span className="text-xs font-bold">
                      {skill.codingQuestions} Labs
                    </span>
                  </div>
                </div>
                <button className="w-full bg-[#bef264] hover:bg-white text-black py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all">
                  START PRACTICE
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredSkills.length > visibleSkills && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisibleSkills((prev) => prev + 8)}
              className="group flex items-center gap-3 px-8 py-3 bg-zinc-900 border border-white/10 rounded-2xl text-sm font-bold text-zinc-400 hover:text-white hover:border-[#bef264]/30 hover:bg-zinc-800 transition-all active:scale-95"
            >
              Load More
              <FiChevronDown className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* --- MIDDLE AD --- */}
      <div className="my-20">
        <GoogleAdsBlock slotId="dashboard-middle-ad" />
      </div>

      {/* --- COMPANIES SECTION --- */}
      <div className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>
              Company Specific
            </h2>
            <p className="text-zinc-500 text-sm font-medium mt-1">
              Practice patterns from top-tier tech giants
            </p>
          </div>
          <span className="text-zinc-600 text-xs font-bold">
            {stats.companies.length} companies
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array(8)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-72 w-full rounded-[32px]" />
                ))
            : stats.companies.slice(0, visibleCompanies).map((company) => (
                <div
                  key={company.name}
                  onClick={() => handleCardClick("company", company.name)}
                  className="group bg-zinc-900 border border-white/5 p-6 rounded-[32px] hover:bg-zinc-800 transition-all duration-500 cursor-pointer flex flex-col active:scale-98"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-white rounded-full p-2.5 shadow-xl group-hover:scale-110 transition-transform flex items-center justify-center overflow-hidden border border-white/5">
                      <img
                        src={
                          getCompanyIcon(company.name)
                            ? `https://api.iconify.design/${getCompanyIcon(company.name).replace(":", "/")}.svg`
                            : getCompanyLogo(company.name)
                        }
                        alt={company.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="bg-zinc-900 border border-white/5 text-[10px] font-black text-zinc-400 px-4 py-1.5 rounded-full uppercase tracking-tighter">
                      Verified
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-xl font-black text-white mb-1 group-hover:text-blue-500 transition-colors capitalize">
                      {company.name}
                    </h4>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                      Engineering Blueprint
                    </p>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-300 mb-6 leading-relaxed">
                    Master the technical patterns used of {company.name}{" "}
                    engineering teams.
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="bg-white/5 text-zinc-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase">
                      FAANG Choice
                    </span>
                    <span className="bg-white/5 text-zinc-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase">
                      High Stakes
                    </span>
                  </div>
                  <div className="h-px bg-white/5 w-full mb-6 mt-auto"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-500 text-lg font-black leading-none">
                        {company.totalQuestions}+
                      </p>
                      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-tighter">
                        Challenges
                      </p>
                    </div>
                    <button className="bg-white text-black px-6 py-2.5 rounded-2xl font-black text-[10px] tracking-widest">
                      PRACTICE
                    </button>
                  </div>
                </div>
              ))}
        </div>

        {!loading && stats.companies.length > visibleCompanies && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisibleCompanies((prev) => prev + 8)}
              className="group flex items-center gap-3 px-8 py-3 bg-zinc-900 border border-white/10 rounded-2xl text-sm font-bold text-zinc-400 hover:text-white hover:border-blue-500/30 hover:bg-zinc-800 transition-all active:scale-95"
            >
              Load More
              <FiChevronDown className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* --- BEHAVIORAL MASTERY --- */}
      <div id="behavioral-prep" className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-1.5 h-8 bg-orange-500 rounded-full"></span>
              Behavioral Mastery
            </h2>
            <p className="text-zinc-500 text-sm font-medium mt-1">
              Nail the soft-skills and HR rounds with structured patterns
            </p>
          </div>
          <button
            onClick={() => navigate("/interview-questions/behavioral")}
            className="text-zinc-500 text-xs font-black flex items-center gap-2 hover:text-white transition-all uppercase tracking-widest"
          >
            VIEW ALL <FiArrowRight />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-52 w-full rounded-3xl" />
                ))
            : [
                {
                  id: "basic-hr",
                  label: "HR Essentials",
                  desc: "Introduction, strengths, and standard HR patterns.",
                  color: "from-emerald-600 to-emerald-900",
                  icon: <FiUsers />,
                },
                {
                  id: "experience",
                  label: "Level Up Experience",
                  desc: "Tell me about a time... Deep dives into your past.",
                  color: "from-blue-600 to-blue-900",
                  icon: <FiClock />,
                },
                {
                  id: "teamwork",
                  label: "Teamwork & Conflict",
                  desc: "Collaboration, disagreements, and peer leadership.",
                  color: "from-purple-600 to-purple-900",
                  icon: <FiZap />,
                },
                {
                  id: "problem-solving",
                  label: "Problem & Impact",
                  desc: "Challenges faced and the quantifiable impact made.",
                  color: "from-orange-600 to-orange-900",
                  icon: <FiCpu />,
                },
              ].map((cat) => {
                const stat = stats.behavioral?.find((b) => b.name === cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() =>
                      navigate(`/interview-questions/behavioral?category=${cat.id}`)
                    }
                    className="group relative h-52 rounded-3xl overflow-hidden border border-white/10 cursor-pointer active:scale-[0.98] transition-all p-6 flex flex-col justify-between"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90 group-hover:opacity-100 transition-opacity duration-500`}
                    ></div>
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)`,
                        backgroundSize: "24px 24px",
                      }}
                    ></div>
                    <div className="relative z-10 space-y-2">
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
                        {stat?.totalQuestions || 0} Questions
                      </p>
                      <h3 className="text-3xl font-black text-white tracking-tight">
                        {cat.label}
                      </h3>
                      <p className="text-white/80 text-xs font-medium max-w-sm leading-snug">
                        {cat.desc}
                      </p>
                    </div>
                    <div className="relative z-10">
                      <button className="bg-[#bef264] hover:bg-white text-black px-6 py-2.5 rounded-xl font-black text-[10px] tracking-widest flex items-center gap-2 group/btn transition-all shadow-lg">
                        START PRACTICE{" "}
                        <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
      {/* Persistent Ad Banner */}
      <div className="max-w-7xl mx-auto px-6">
        <GoogleAdsBlock slotId="global-layout-footer" />
      </div>

      {/* --- CURATED DEEP DIVES --- */}
      {/* <div className="mb-24">
         <h2 className="text-2xl font-black mb-8 px-2 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-purple-500 rounded-full"></span>
            Curated Deep Dives
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { 
                title: "DSA Foundations", 
                desc: "The core logic of modern engineering. Master arrays to graphs.", 
                color: "bg-gradient-to-br from-indigo-500 to-indigo-900",
                icon: <FiLayers />
              },
              { 
                title: "System Design architect", 
                desc: "Scale the unscalable. Insights into high-availability systems.", 
                color: "bg-gradient-to-br from-rose-500 to-rose-900",
                icon: <FiCpu />
              }
            ].map((dive, i) => (
              <div 
                key={i}
                className="group relative h-64 rounded-[40px] overflow-hidden border border-white/5 cursor-pointer active:scale-[0.98] transition-all"
                onClick={() => navigate(`/interview-questions/${dive.title.split(' ')[0].toLowerCase()}`)}
              >
                 <div className={`absolute inset-0 ${dive.color} opacity-80 group-hover:opacity-100 transition-opacity duration-500`}></div>
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }}></div>
                 <div className="relative h-full p-10 flex flex-col justify-end">
                    <div className="absolute top-8 right-8 text-6xl text-white/10 group-hover:scale-125 transition-transform duration-700">
                      {dive.icon}
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black text-white group-hover:translate-x-2 transition-transform">{dive.title}</h3>
                       <p className="text-white/70 font-medium max-w-xs">{dive.desc}</p>
                       <div className="pt-4">
                          <span className="inline-flex items-center gap-2 text-xs font-black bg-white text-black px-6 py-2.5 rounded-2xl group-hover:bg-[#bef264] transition-colors">
                             START LAB <FiArrowRight />
                          </span>
                       </div>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div> */}

      {/* --- FINAL CTA --- */}
      <CTA />
    </div>
  );
};

export default QuestionBankDashboard;
