import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  FiSearch, FiEdit3, FiFileText, 
  FiTrendingUp, FiCheckCircle, FiCopy, FiZap,
  FiArrowRight, FiInfo, FiLayout, FiGlobe, FiLinkedin,
  FiAward, FiTarget, FiMessageSquare, FiMousePointer, FiBriefcase
} from "react-icons/fi";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const LinkedInOptimisation = () => {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("analyze");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Form states
  const [profileText, setProfileText] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [coreFocus, setCoreFocus] = useState("");
  const [postTopic, setPostTopic] = useState("");
  const [postGoal, setPostGoal] = useState("engagement");

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const callAPI = async (endpoint, data) => {
    setLoading(true);
    setResult(null);
    try {
      const token = await getToken();
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/linkedin/${endpoint}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
      toast.success("AI Generation Success!");
    } catch (err) {
      toast.error("AI Generation failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "analyze", label: "Profile Audit", icon: <FiSearch />, desc: "Strength score & roadmap" },
    { id: "headlines", label: "Headline Suite", icon: <FiTarget />, desc: "Catchy role hooks" },
    { id: "about", label: "Bio Architect", icon: <FiEdit3 />, desc: "Rewrite about section" },
    { id: "post", label: "Post Creator", icon: <FiMessageSquare />, desc: "Viral content drafts" },
  ];

  return (
    <>
      <Helmet>
        <title>LinkedIn Optimization | PlaceMateAI</title>
      </Helmet>
      <div className="min-h-screen text-zinc-100 selection:bg-[#bef264]/30 pb-20 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header Section Compact */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-[#bef264] rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative flex items-center justify-between bg-[#121212]/80 backdrop-blur-xl border border-white/5 p-5 md:px-8 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#bef264] rounded-xl shadow-lg transform group-hover:rotate-6 transition-transform">
                <FiLinkedin className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  LinkedIn <span className="text-[#bef264] px-1 bg-[#bef264]/10 rounded-md">Optimization</span>
                </h1>
                <p className="text-zinc-400 text-sm mt-1">Transform your presence with AI intelligence.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection Row Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); }}
              className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left ${
                activeTab === tab.id 
                ? "bg-white/10 border-[#bef264]/50 shadow-[0_0_15px_rgba(190,242,100,0.1)]" 
                : "bg-[#121212] border-white/5 hover:border-white/10 hover:bg-white/5"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${activeTab === tab.id ? "bg-[#bef264] text-black" : "bg-white/5 text-zinc-400"}`}>
                {React.cloneElement(tab.icon, { size: 18 })}
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${activeTab === tab.id ? "text-white" : "text-zinc-300"}`}>{tab.label}</h3>
                <p className="text-[10px] text-zinc-500 truncate hidden sm:block">{tab.desc}</p>
              </div>
              {activeTab === tab.id && <div className="absolute top-2 right-2 text-[#bef264]"><FiCheckCircle size={12} /></div>}
            </button>
          ))}
        </div>

        {/* Main Interface Layout - Split View Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
          
          {/* Form Side Compact */}
          <div className="lg:col-span-5 h-full">
            <div className="bg-[#121212] border border-white/5 p-5 md:p-6 rounded-2xl shadow-xl h-full flex flex-col relative">
              <div className="absolute top-4 right-4 text-white/5 text-4xl">
                {tabs.find(t => t.id === activeTab)?.icon}
              </div>

              {activeTab === "analyze" && (
                <div className="space-y-4 flex flex-col h-full animate-slide-up">
                  <div className="flex-grow space-y-2 flex flex-col">
                    <label className="text-xs font-semibold text-zinc-400 flex items-center gap-2">
                       Profile Content to Audit
                    </label>
                    <textarea
                      value={profileText}
                      onChange={(e) => setProfileText(e.target.value)}
                      placeholder="Paste your Headline, About, or Experience section here..."
                      className="w-full flex-grow bg-black/40 border border-white/10 rounded-xl p-4 text-zinc-300 text-sm focus:border-[#bef264]/50 transition-all outline-none resize-none placeholder:text-zinc-700"
                    />
                  </div>
                  <button
                    disabled={!profileText || loading}
                    onClick={() => callAPI("analyze", { profileText })}
                    className="w-full bg-[#bef264]  text-black font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-auto hover:shadow-lg hover:shadow-[#bef264]/20"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/> : <><FiTrendingUp /> Run Audit</>}
                  </button>
                </div>
              )}

              {activeTab === "headlines" && (
                <div className="space-y-4 flex flex-col h-full animate-slide-up">
                  <div className="space-y-4 flex-grow">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400">Target Role</label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Lead Product Designer"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-zinc-300 text-sm focus:border-[#bef264]/50 outline-none transition-all placeholder:text-zinc-700"
                      />
                    </div>
                    <div className="space-y-1.5 flex flex-col justify-start h-full pb-[136px]">
                      <label className="text-xs font-semibold text-zinc-400">Core Expertise & Skills</label>
                      <textarea
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. UX Strategy, Figma, Mentorship"
                        className="w-full h-full bg-black/40 border border-white/10 rounded-xl p-3 text-zinc-300 text-sm focus:border-[#bef264]/50 outline-none transition-all resize-none placeholder:text-zinc-700"
                      />
                    </div>
                  </div>
                  <button
                    disabled={!role || loading}
                    onClick={() => callAPI("generate-headlines", { role, skills })}
                    className="w-full bg-[#bef264]  text-black font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#bef264]/20 absolute bottom-5 md:bottom-6 left-5 md:left-6 right-5 md:right-6"
                    style={{ width: "calc(100% - 40px)", '@media (min-width: 768px)': { width: "calc(100% - 48px)" } }}
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/> : <><FiTarget /> Get Hooks</>}
                  </button>
                </div>
              )}

              {activeTab === "about" && (
                <div className="space-y-4 flex flex-col h-full animate-slide-up">
                  <div className="space-y-4 flex-grow flex flex-col">
                    <div className="space-y-1.5 flex-grow flex flex-col">
                      <label className="text-xs font-semibold text-zinc-400">Current Bio / Notes</label>
                      <textarea
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        placeholder="Bullet points or old bio..."
                        className="w-full flex-grow min-h-[120px] bg-black/40 border border-white/10 rounded-xl p-3 text-zinc-300 text-sm focus:border-[#bef264]/50 outline-none resize-none placeholder:text-zinc-700"
                      />
                    </div>
                    <div className="space-y-1.5 shrink-0">
                      <label className="text-xs font-semibold text-zinc-400">Optimization Goal</label>
                      <input
                        type="text"
                        value={coreFocus}
                        onChange={(e) => setCoreFocus(e.target.value)}
                        placeholder="e.g. Highlight Leadership"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-zinc-300 text-sm focus:border-[#bef264]/50 outline-none placeholder:text-zinc-700"
                      />
                    </div>
                  </div>
                  <button
                    disabled={!aboutText || loading}
                    onClick={() => callAPI("optimize-about", { rawText: aboutText, coreFocus })}
                    className="w-full bg-[#bef264]  text-black font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#bef264]/20 mt-auto"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/> : <><FiEdit3 /> Architect Bio</>}
                  </button>
                </div>
              )}

              {activeTab === "post" && (
                <div className="space-y-4 flex flex-col h-full animate-slide-up">
                  <div className="space-y-4 flex-grow flex flex-col">
                    <div className="space-y-1.5 flex-grow flex flex-col">
                      <label className="text-xs font-semibold text-zinc-400">Post Topic / Insight</label>
                      <textarea
                        value={postTopic}
                        onChange={(e) => setPostTopic(e.target.value)}
                        placeholder="What's the core idea? (e.g. AI tools saving 10 hours a week)"
                        className="w-full flex-grow bg-black/40 border border-white/10 rounded-xl p-3 text-zinc-300 text-sm focus:border-[#bef264]/50 outline-none resize-none placeholder:text-zinc-700"
                      />
                    </div>
                    <div className="space-y-1.5 shrink-0">
                      <label className="text-xs font-semibold text-zinc-400">Objective</label>
                      <select
                        value={postGoal}
                        onChange={(e) => setPostGoal(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-zinc-300 text-sm focus:border-[#bef264]/50 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="engagement">Maximize Engagement</option>
                        <option value="storytelling">Storytelling Format</option>
                        <option value="informational">Educational Sharing</option>
                        <option value="jobsearch">Opportunity Attraction</option>
                      </select>
                    </div>
                  </div>
                  <button
                    disabled={!postTopic || loading}
                    onClick={() => callAPI("create-post", { topic: postTopic, goal: postGoal })}
                    className="w-full bg-[#bef264]  text-black font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-auto"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/> : <><FiZap /> Draft Post</>}
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Result Side Compact */}
          <div className="lg:col-span-7 h-full">
            <div className={`h-full bg-[#121212]/50 border border-white/5 rounded-2xl shadow-inner relative overflow-y-auto ${!result && !loading ? 'flex items-center justify-center' : 'p-6'}`}>
              
              {!result && !loading && (
                <div className="text-center p-8 text-zinc-500 flex flex-col items-center">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-4">
                     <FiZap size={24} className="text-[#bef264]/50" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-300 mb-1">Awaiting Input</h3>
                  <p className="text-sm max-w-[250px]">Select a powerful AI tool and provide context to see magic.</p>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212]/80 backdrop-blur-sm z-10">
                  <div className="relative mb-4">
                    <div className="w-12 h-12 border-2 border-[#bef264]/20 border-t-[#bef264] rounded-full animate-spin"></div>
                  </div>
                  <p className="text-zinc-400 text-sm font-medium animate-pulse">Consulting intelligence...</p>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-6 animate-fade-in-up pb-4">
                  
                  {activeTab === "analyze" && result.analysis && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">Audit Results</h3>
                        </div>
                        <div className="px-4 py-2 bg-[#bef264]/10 rounded-lg border border-[#bef264]/20 text-center flex items-center gap-2">
                          <span className="text-xl font-black text-[#bef264]">{result.score || 0}%</span>
                          <span className="text-xs text-[#bef264]/70">Score</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <CompactScore label="Search" val={result.analysis?.searchability || 0} icon={<FiGlobe />} />
                        <CompactScore label="Engagement" val={result.analysis?.engagement || 0} icon={<FiMousePointer />} />
                        <CompactScore label="Clarity" val={result.analysis?.clarity || 0} icon={<FiAward />} />
                      </div>

                      {result.strengths?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-[#bef264]">Key Strengths</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.strengths.map((s, i) => (
                              <span key={i} className="px-2.5 py-1 bg-[#bef264]/10 text-[#bef264] rounded-md text-[11px] font-medium border border-[#bef264]/20">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.improvements?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-rose-400">Optimization Roadmap</h4>
                          <div className="grid gap-2">
                            {result.improvements.map((imp, i) => (
                              <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-start gap-3">
                                <div className="text-rose-400/50 mt-0.5"><FiMessageSquare size={14} /></div>
                                <div>
                                  <h5 className="text-zinc-200 text-sm font-semibold">{imp.point}</h5>
                                  <p className="text-zinc-400 text-xs mt-0.5">{imp.reason}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.improvedVersion && (
                        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden mt-4">
                          <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
                            <h4 className="text-xs font-semibold text-zinc-300">✨ Improved Version</h4>
                            <button onClick={() => handleCopy(result.improvedVersion)} className="text-zinc-400 hover:text-white transition-colors">
                              <FiCopy size={14} />
                            </button>
                          </div>
                          <div className="p-4 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {result.improvedVersion}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "headlines" && (
                     <div className="space-y-5">
                       <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <h3 className="text-xl font-bold text-white">Generated Headlines</h3>
                        <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded">A/B Ready</span>
                       </div>
                       <div className="grid gap-3">
                         {Array.isArray(result.headlines) ? result.headlines.map((h, i) => (
                           <div key={i} className="group flex items-start justify-between gap-4 bg-white/5 border border-white/5 p-4 rounded-xl hover:border-[#bef264]/30 transition-all">
                             <p className="text-zinc-200 text-sm font-medium">{h}</p>
                             <button onClick={() => handleCopy(h)} className="text-zinc-500 hover:text-[#bef264] shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <FiCopy size={16} />
                             </button>
                           </div>
                         )) : (
                            <div className="text-zinc-400 text-sm p-4 bg-white/5 rounded-xl border border-white/5">
                              <p className="whitespace-pre-wrap">{result.headlines || result}</p>
                            </div>
                         )}
                       </div>
                     </div>
                  )}

                  {activeTab === "about" && (
                    <div className="space-y-4 flex flex-col h-full">
                       <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <h3 className="text-xl font-bold text-white">Architected Bio</h3>
                        <button onClick={() => handleCopy(result.optimized || typeof result === 'string' ? result : JSON.stringify(result))} className="flex items-center gap-1.5 text-xs bg-[#bef264] text-black px-3 py-1.5 rounded-md font-semibold hover:bg-white transition-colors">
                          <FiCopy size={12} /> Copy Output
                        </button>
                       </div>
                       <div className="bg-black/30 border border-white/5 p-5 rounded-xl text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap flex-grow">
                         {result.optimized || (typeof result === 'string' ? result : JSON.stringify(result, null, 2))}
                       </div>
                    </div>
                  )}

                  {activeTab === "post" && (
                    <div className="space-y-4 flex flex-col h-full">
                       <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <h3 className="text-xl font-bold text-white">Viral Draft</h3>
                        <button onClick={() => handleCopy(result.post || typeof result === 'string' ? result : JSON.stringify(result))} className="flex items-center gap-1.5 text-xs bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-md font-semibold hover:bg-white/20 transition-colors">
                          <FiCopy size={12} /> Copy
                        </button>
                       </div>
                       <div className="bg-white/5 border border-white/5 p-6 rounded-xl text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
                         {result.post || (typeof result === 'string' ? result : JSON.stringify(result, null, 2))}
                       </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

const CompactScore = ({ label, val, icon }) => (
  <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center gap-2">
    <div className="flex items-center gap-2">
       <span className="text-zinc-500">{icon}</span>
       <span className="text-lg font-bold text-white">{val}%</span>
    </div>
    <span className="text-[10px] uppercase font-semibold text-zinc-500">{label}</span>
  </div>
);

export default LinkedInOptimisation;
