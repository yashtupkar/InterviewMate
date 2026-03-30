
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { MdOutlineComputer } from "react-icons/md";
import { BsCheckCircle } from 'react-icons/bs';
import { FiUsers, FiClock, FiZap, FiCpu, FiStar, FiLogIn, FiUserPlus, FiLock } from 'react-icons/fi';
import GoogleAdsBlock from '../../components/common/GoogleAdsBlock';
import UniversalPopup from '../../components/common/UniversalPopup';
import Logo from '../../components/common/Logo';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const QuestionSkeleton = () => (
  <div className="p-4 bg-zinc-900 mb-2 border border-zinc-800 rounded-xl animate-pulse flex justify-between items-center">
    <div className="flex gap-4 w-full">
      <div className="w-10 h-10 bg-zinc-800 rounded-lg shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-3 bg-zinc-800 rounded w-16" />
          <div className="h-3 bg-zinc-800 rounded w-20" />
        </div>
      </div>
    </div>
    <div className="w-12 h-4 bg-zinc-800 rounded ml-4" />
  </div>
);

const QuestionBankList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isSignedIn } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ skills: [], companies: [], domains: [] });
  const [behavioralCats, setBehavioralCats] = useState([]);

  const [activeFilters, setActiveFilters] = useState({
    skill: searchParams.get('skill') || '',
    company: searchParams.get('company') || '',
    type: searchParams.get('type') || '',
    difficulty: searchParams.get('difficulty') || '',
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    domain: searchParams.get('domain') || '',
  });

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Auth gate popup state — triggers on pagination for guests
  const [showAuthGate, setShowAuthGate] = useState(false);

  // 🔥 Dynamic Headline
  const generateHeadline = () => {
    const { skill, company, search, domain, category } = activeFilters;

    if (search) return `Results for "${search}"`;

    const capitalize = (s) => s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    if (domain === 'behavioral') {
      if (category) return capitalize(category.replace('-', ' ')) + " Questions";
      return "Behavioral Interview Prep";
    }

    const formattedSkill = skill ? capitalize(skill) : "";

    if (formattedSkill && company) return `${formattedSkill} Questions at ${company}`;
    if (formattedSkill) return `${formattedSkill} Interview Questions`;
    if (company) return `Questions asked in ${company}`;
    if (domain) return `${capitalize(domain)} Questions`;

    return "Interview Question Bank";
  };

  // Sync URL
  useEffect(() => {
    setActiveFilters({
      skill: searchParams.get('skill') || '',
      company: searchParams.get('company') || '',
      type: searchParams.get('type') || '',
      difficulty: searchParams.get('difficulty') || '',
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      domain: searchParams.get('domain') || '',
    });
    setPage(1);
  }, [searchParams]);

  // Load filters
  useEffect(() => {
    axios.get(`${backendURL}/api/questions/filters/metadata`)
      .then(res => setFilters(res.data.data))
      .catch(console.error);
      
    axios.get(`${backendURL}/api/questions/stats/aggregates`)
      .then(res => {
        if (res.data.success) {
          setBehavioralCats(res.data.data.behavioral || []);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch questions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page,
          limit: 10,
          ...activeFilters
        });

        const res = await axios.get(`${backendURL}/api/questions?${query}`);
        setQuestions(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalQuestions(res.data.total);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [activeFilters, page]);

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    value ? params.set(key, value) : params.delete(key);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination with auth gate for guests
  const handleNextPage = () => {
    if (!isSignedIn) {
      setShowAuthGate(true);
      return;
    }
    setPage(p => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDifficultyColor = (d) => {
    if (d === "easy") return "bg-green-500/10 text-green-400";
    if (d === "medium") return "bg-yellow-500/10 text-yellow-400";
    if (d === "hard") return "bg-red-500/10 text-red-400";
    return "bg-zinc-700 text-zinc-400";
  };

  const getQuestionIcon = (q) => {
    if (q.domains?.includes('behavioral')) {
      const cat = q.category?.toLowerCase() || '';
      if (cat.includes('hr')) return <FiUsers />;
      if (cat.includes('experience')) return <FiClock />;
      if (cat.includes('teamwork')) return <FiZap />;
      if (cat.includes('problem')) return <FiCpu />;
      return <FiStar />;
    }
    return q.type === "coding" ? <MdOutlineComputer /> : <BsCheckCircle />;
  };

  return (
    <div className="min-h-screen  text-white px-4 md:px-8 pb-24 pt-24">

      {/* Auth Gate Popup — Quora/Medium/LinkedIn-style */}
      <UniversalPopup
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        maxWidth="max-w-md"
        padding="p-0"
      >
        {/* Top accent banner */}
        <div className="relative bg-gradient-to-br from-[#bef264]/15 via-zinc-900 to-zinc-900 px-6 pt-7 pb-5">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="relative text-center">
           <Logo size={34} className='mx-auto mb-2' />
            <h3 className="text-xl font-black text-white mb-1 tracking-tight">Sign in to see more</h3>
            <p className="text-zinc-500 text-sm font-medium">
              Unlock {totalQuestions}+ questions across {filters.companies?.length || 0}+ companies
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-4">
          {/* Feature checklist */}
          <div className="space-y-2.5 mb-5">
            {[
              'Unlimited access to all questions',
              'Full solutions with code examples',
              'AI-powered mock interviews',
              'Company-specific question sets',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#bef264]/15 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-[#bef264]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-zinc-300 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2.5">
            <Link
              to={`/signin?redirect_url=${encodeURIComponent(location.pathname + location.search)}`}
              onClick={() => setShowAuthGate(false)}
              className="flex items-center justify-center gap-2 w-full bg-[#bef264] text-black py-3 rounded-xl font-black text-sm hover:bg-[#d4ff7e] transition-all active:scale-[0.97] hover:shadow-[0_0_24px_rgba(190,242,100,0.25)]"
            >
              <FiLogIn className="w-4 h-4" />
              Continue with Sign In
            </Link>
            <Link
              to={`/signup?redirect_url=${encodeURIComponent(location.pathname + location.search)}`}
              onClick={() => setShowAuthGate(false)}
              className="flex items-center justify-center gap-2 w-full bg-zinc-800/80 text-white py-3 rounded-xl font-bold text-sm border border-white/5 hover:bg-zinc-700 transition-all active:scale-[0.97]"
            >
              <FiUserPlus className="w-4 h-4" />
              Create Free Account
            </Link>
          </div>

          {/* Social proof footer */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-2.5">
            <div className="flex -space-x-2">
              {['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-violet-500'].map((color, i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${color} border-2 border-zinc-900 flex items-center justify-center text-[8px] text-white font-black`}>
                  {['Y', 'A', 'R', 'S'][i]}
                </div>
              ))}
            </div>
            <span className="text-zinc-500 text-xs font-semibold">1,200+ joined this week · 100% free</span>
          </div>
        </div>
      </UniversalPopup>

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link to="/questions" className="text-sm text-zinc-300 hover:text-white mb-4 inline-flex items-center gap-1">
          ← Back
        </Link>
        <h1 className="text-3xl md:text-3xl font-black">
          <span className="text-[#bef264]">{generateHeadline().split(" ")[0]}</span>{" "}
          {generateHeadline().split(" ").slice(1).join(" ")}
        </h1>

        <div className="text-sm text-zinc-400 mt-2">
          Showing <span className="text-white">{totalQuestions}</span> results
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT FILTER */}
        <div className="lg:col-span-3">
          <div className="sticky top-24 space-y-4">

            <input
              placeholder="Search..."
              value={activeFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full bg-zinc-900 p-3 rounded-lg border border-zinc-800"
            />

            <div className="bg-zinc-900 p-4 rounded-xl space-y-3 border border-zinc-800">

              {activeFilters.domain !== 'behavioral' && (
                <select value={activeFilters.domain} onChange={(e) => handleFilterChange("domain", e.target.value)} className="w-full p-2 bg-zinc-800 rounded capitalize">
                  <option value="">All Domains</option>
                  {filters.domains?.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}

              {activeFilters.domain === 'behavioral' && (
                <div className="flex items-center justify-between px-1">
                   <span className="text-xs font-bold text-white uppercase tracking-widest">Behavioral Mode</span>
                   <button onClick={() => handleFilterChange("domain", "")} className="text-[10px] text-zinc-500 hover:text-white underline">Switch to Technical</button>
                </div>
              )}

              {(activeFilters.domain === 'behavioral' || activeFilters.category) && (
                <select value={activeFilters.category} onChange={(e) => handleFilterChange("category", e.target.value)} className="w-full p-2 bg-zinc-800 rounded capitalize  text-white border border-[#bef264]/20">
                  <option value="">All Categories</option>
                  {behavioralCats.map(c => <option key={c.name} value={c.name}>{c.name.replace('-', ' ')}</option>)}
                </select>
              )}

              {activeFilters.domain !== 'behavioral' && (
                <>
                  <select value={activeFilters.type} onChange={(e) => handleFilterChange("type", e.target.value)} className="w-full p-2 bg-zinc-800 rounded">
                    <option value="">All Types</option>
                    <option value="coding">Coding</option>
                    <option value="theoretical">Theory</option>
                  </select>

                  <select value={activeFilters.difficulty} onChange={(e) => handleFilterChange("difficulty", e.target.value)} className="w-full p-2 bg-zinc-800 rounded">
                    <option value="">Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  <select value={activeFilters.skill} onChange={(e) => handleFilterChange("skill", e.target.value)} className="w-full p-2 bg-zinc-800 rounded capitalize">
                    <option value="">Skill</option>
                    {filters.skills.map(s => <option key={s}>{s}</option>)}
                  </select>

                  <select value={activeFilters.company} onChange={(e) => handleFilterChange("company", e.target.value)} className="w-full p-2 bg-zinc-800 rounded capitalize">
                    <option value="">Company</option>
                    {filters.companies.map(c => <option key={c}>{c}</option>)}
                  </select>
                </>
              )}

              {activeFilters.domain === 'behavioral' && (
                <select value={activeFilters.difficulty} onChange={(e) => handleFilterChange("difficulty", e.target.value)} className="w-full p-2 bg-zinc-800 rounded">
                  <option value="">Any Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              )}

              <button onClick={() => setSearchParams({})} className="text-xs text-zinc-400 hover:text-white">
                Reset Filters
              </button>
            </div>

            <div className="hidden lg:block">
              <GoogleAdsBlock slotId="sidebar-ad" />
            </div>

          </div>
        </div>

        {/* CENTER LIST */}
        <div className="lg:col-span-6 space-y-4">

          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <QuestionSkeleton key={i} />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              No questions found
            </div>
          ) : (
            questions.map(q => (
              <Link key={q._id} to={`/questions/${q._id}`} state={{ from: location.pathname + location.search }}>
                <div className="p-4 bg-zinc-900 mb-2 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition flex justify-between items-center">

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#bef264]/10 text-[#bef264] flex items-center justify-center rounded-lg text-lg">
                      {getQuestionIcon(q)}
                    </div>

                    <div>
                      <h2 className="font-semibold text-white">{q.title}</h2>

                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>

                        {q.companies?.slice(0, 2).map(c => (
                          <span key={c} className="text-xs bg-zinc-700 px-2 py-1 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-[#bef264] text-sm">Solve →</span>
                </div>
              </Link>
            ))
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <button 
                disabled={page === 1} 
                onClick={() => {
                  setPage(p => p - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg disabled:opacity-50 text-sm"
              >
                Prev
              </button>
              <span className="flex items-center text-sm text-zinc-400">
                {page} / {totalPages}
              </span>
              <button 
                disabled={page === totalPages} 
                onClick={handleNextPage}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg disabled:opacity-50 text-sm"
              >
                Next
              </button>
            </div>
          )}

        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-3 hidden lg:block space-y-4">

          <div className='flex flex-col items-center gap-4 sticky top-24'>
          <div className="bg-zinc-900  p-4 rounded-xl border border-zinc-800">
            <h3 className="font-semibold mb-2">🔥 Improve Faster</h3>
            <p className="text-sm text-zinc-400">
              Practice with AI mock interviews & real feedback.
            </p>
            <button className="mt-3 w-full bg-[#bef264] text-black py-2 rounded">
              Start Now
            </button>
          </div>
          <GoogleAdsBlock slotId="right-ad"  />
</div>
        </div>

      </div>
    </div>
  );
};

export default QuestionBankList;