import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import GoogleAdsBlock from '../../components/common/GoogleAdsBlock';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = location.state?.from || "/questions";
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState('javascript');
  const [isPlaying, setIsPlaying] = useState(null); // 'problem' or 'answer'

  const cleanMD = (text) => {
    if (!text) return "";
    return text
      .replace(/[#*`_~>]/g, "") // remove basic MD
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // fix links
      .replace(/!\[.*?\]\(.*?\)/g, ""); // remove images
  };

  const speak = (text, id) => {
    if (isPlaying === id) {
      window.speechSynthesis.cancel();
      setIsPlaying(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanMD(text));

    // Sophia Voice Config (Female, US English)
    const voices = window.speechSynthesis.getVoices();
    const keywords = ["Google US English", "Microsoft Aria", "Samantha", "Siri", "Female"];
    let voice = keywords.reduce((acc, kw) => acc || voices.find(v => v.name.includes(kw)), null);
    if (!voice) voice = voices.find(v => v.lang.includes("en"));

    if (voice) utterance.voice = voice;
    utterance.pitch = 1.15;
    utterance.rate = 1.0;

    utterance.onstart = () => setIsPlaying(id);
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/questions/${id}`);
        if (res.data.success) {
          setQuestion(res.data.data);
          if (res.data.data.starterCode) {
            const langs = Object.keys(res.data.data.starterCode);
            if (langs.length > 0) setActiveTab(langs[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load question details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-[#bef264] animate-spin"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold mb-4">Question Not Found</h1>
        <button onClick={() => navigate(-1)} className="text-[#bef264] underline hover:text-white transition-colors">
          Go back to Question Bank
        </button>
      </div>
    );
  }

  const isCoding = question.type === 'coding';
  const availableLangs = isCoding ? Object.keys(question.solutionCode || {}) : [];

  return (
    // ONLY UI UPDATED — logic same

    <div className="min-h-screen  text-white px-4 md:px-8 pt-24">

      <div className="max-w-6xl mx-auto">

        {/* BACK */}
        <Link to={backPath} className="text-sm text-zinc-300 hover:text-white mb-4 inline-flex items-center gap-1">
          ← Back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* LEFT CONTENT */}
          <div className="lg:col-span-8 space-y-2">

            {/* 🧠 QUESTION HEADER CARD */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6">

              <div className="flex justify-between items-start gap-4">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                  {question.title}
                </h1>
                <button
                  onClick={() => speak(question.title + ". " + question.description, 'problem')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${isPlaying === 'problem'
                      ? "bg-[#bef264] text-black"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                >
                  {isPlaying === 'problem' ? (
                    <>
                      <FiVolumeX size={18} />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <FiVolume2 size={18} />
                      <span>Listen</span>
                    </>
                  )}
                </button>
              </div>
              {/* 📄 DESCRIPTION CARD */}
              <div className=" border-t mt-4 border-zinc-800 ">
                <h2 className="text-xl font-semibold mt-2 mb-2">Problem: </h2>

                <div className="prose prose-invert max-w-none text-zinc-300">
                  <ReactMarkdown>{question.description}</ReactMarkdown>
                </div>
              </div>

              {/* TAGS */}
              <div className="flex flex-wrap gap-2 mt-4">

                <span className={`text-xs px-2 py-1 capitalize rounded ${question.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                  question.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                  {question.difficulty}
                </span>

                {/* {question.skills.map(skill => (
                  <span key={skill} className="text-xs bg-zinc-800 px-2 py-1 rounded">
                    {skill}
                  </span>
                ))} */}

                {question.companies.slice(0, 3).map(c => (
                  <span key={c} className="text-xs capitalize bg-[#bef264]/10 text-[#bef264] px-2 py-1 rounded">
                    {c}
                  </span>
                ))}
              </div>
            </div>

  

           
              <GoogleAdsBlock slotId="content-ad" />
            

            {/* 💻 SOLUTION / ANSWER */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 relative overflow-hidden">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {isCoding ? "Solutions" : "Answer"}
                </h2>
                {showAnswer && !isCoding && (
                  <button
                    onClick={() => speak(question.answerMarkdown, 'answer')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${isPlaying === 'answer'
                        ? "bg-[#bef264] text-black"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                  >
                    {isPlaying === 'answer' ? (
                      <>
                        <FiVolumeX size={16} />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <FiVolume2 size={16} />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {isCoding ? (
                <>
                  {/* TABS */}
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {availableLangs.map(lang => (
                      <button
                        key={lang}
                        onClick={() => setActiveTab(lang)}
                        className={`px-4 py-2 rounded-lg text-sm capitalize transition ${activeTab === lang
                          ? "bg-[#bef264] text-black"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  {/* CODE */}
                  {showAnswer ? (
                    <div className="bg-black border border-zinc-800 rounded-xl p-4 overflow-x-auto text-sm font-mono">
                      <pre>{question.solutionCode[activeTab]}</pre>
                    </div>
                  ) : (
                    <div className="bg-black border border-zinc-800 rounded-xl p-10 text-center">
                      <p className="text-zinc-400 mb-4">Try solving first 👇</p>
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="bg-[#bef264] text-black px-6 py-2 rounded-full font-semibold"
                      >
                        Reveal Solution
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {showAnswer ? (
                    <div className="prose prose-invert max-w-none text-zinc-300">
                      <ReactMarkdown>{question.answerMarkdown}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="bg-[#bef264] text-black px-6 py-2 rounded-full font-semibold"
                      >
                        Show Answer
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>

          </div>

          {/* 👉 RIGHT SIDEBAR */}
          <div className="lg:col-span-4 space-y-2">

            <div className="sticky top-24 space-y-2">

              {/* INFO */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-xs uppercase text-white mb-3">About</h3>

                <div className="text-sm space-y-2 capitalize">
                  <p><span className="text-zinc-300 ">Domain:</span>{" "} {question.domains[0]}</p>
                  <p><span className="text-zinc-300 ">Type:</span>{" "} {question.type}</p>
                </div>
              </div>

              {/* TEST CASE */}
              {isCoding && question.testCases?.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl  p-5">
                  <h3 className="text-xs uppercase text-zinc-400 mb-3">Test Cases</h3>

                  {question.testCases.slice(0, 2).map((tc, i) => (
                    <div key={i} className="bg-black p-3 rounded overflow-x-scroll custom-scrollbar mb-2 text-sm font-mono">
                      <div className="text-white">Input: {tc.input}</div>
                      <div className="text-white mt-1">Output: {tc.expectedOutput}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* AD */}
              <GoogleAdsBlock slotId="sidebar-ad" />

              {/* CTA */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="font-semibold mb-2">🔥 Practice More</h3>
                <p className="text-sm text-zinc-400">
                  Try AI mock interviews & get feedback.
                </p>
                <button className="mt-3 w-full bg-[#bef264] text-black py-2 rounded">
                  Start Practice
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default QuestionDetail;
