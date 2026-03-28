import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

import { MdOutlineDoubleArrow } from "react-icons/md";

const Hero = ({ backendStatus }) => {
  const [currentBadge, setCurrentBadge] = useState(0);
  const badges = [
    { emoji: "🔥", text: "Launching Soon" },
    { emoji: "✨", text: "AI Mock Interviews" },
    { emoji: "👨‍👦‍👦", text: "AI Group Discussions" },
    { emoji: "📜", text: "Resume Builder" },
    { emoji: "💯", text: "ATS Resume Checker" },
    { emoji: "🚀", text: "Honest Preparation" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBadge((prev) => (prev + 1) % badges.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full pt-20 md:pt-32 pb-20 flex flex-col items-center justify-center text-center overflow-hidden">
      <div className="flex flex-col items-center text-center px-4 sm:px-6">

        {/* Badge */}
        <div
          key={currentBadge}
          className="inline-flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#121214] border border-white/5 mb-6 sm:mb-8 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-500"
        >
          <span className="text-base sm:text-lg animate-pulse">
            {badges[currentBadge].emoji}
          </span>
          <span className="text-xs sm:text-sm font-bold tracking-tight bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-clip-text text-transparent">
            {badges[currentBadge].text}
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-tight max-w-4xl text-white mb-3">
          Become{" "}
          <span className="italic text-[#bef264]">Unstoppable</span>{" "}
          <br className="hidden sm:block" />
          Crack Your{" "}
          <span className="italic">Dream Job</span>{" "}
          with AI
        </h1>

        {/* Brand Line */}
        <p className="text-xs sm:text-sm text-gray-300 mb-4">
          We Don’t Help You Cheat — We Help You Become Unstoppable
        </p>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-md sm:max-w-xl md:max-w-2xl mb-8 sm:mb-10 leading-relaxed">
          Everything you need to get placed — from mock interviews and AI feedback to
          resume tools and more.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center mb-4 md:mb-8">

          <SignedOut>
            <Link to="/signup" className="w-full sm:w-auto">
              <button className="w-fit flex items-center mx-auto gap-2 sm:w-auto px-5 py-3 rounded-xl bg-[#bef264] text-black font-semibold text-sm sm:text-base hover:brightness-110 transition-all transform hover:scale-105 shadow-[0_0_25px_rgba(190,242,100,0.3)]">
                Start Practicing Free <MdOutlineDoubleArrow/>
              </button>
            </Link>
          </SignedOut>

          <SignedIn>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <button className="w-fit flex items-center gap-2 mx-auto sm:w-auto px-5 py-3 rounded-xl bg-[#bef264] text-black font-semibold text-sm sm:text-base hover:brightness-110 transition-all transform hover:scale-105 shadow-[0_0_25px_rgba(190,242,100,0.3)]">
                Start Preparing Now <MdOutlineDoubleArrow />
              </button>
            </Link>
          </SignedIn>

          {/* <a
            href="#features"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm sm:text-base hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm group"
          >
            <Play size={18} className="text-primary group-hover:scale-110 transition-transform" />
            See How It Works
          </a> */}

        </div>
      </div>

      {/* Social Proof
      <div className="flex flex-col sm:flex-row items-center gap-6 z-10 mb-20 bg-[#09090b]/40 border border-white/5 p-4 pr-6 rounded-3xl backdrop-blur-md">
        <div className="flex -space-x-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#121214] bg-gray-800 flex items-center justify-center text-xs font-bold object-cover overflow-hidden"><img src="https://i.pravatar.cc/100?img=1" alt="user" /></div>
          <div className="w-12 h-12 rounded-full border-2 border-[#121214] bg-gray-800 flex items-center justify-center text-xs font-bold object-cover overflow-hidden"><img src="https://i.pravatar.cc/100?img=2" alt="user" /></div>
          <div className="w-12 h-12 rounded-full border-2 border-[#121214] bg-gray-800 flex items-center justify-center text-xs font-bold object-cover overflow-hidden"><img src="https://i.pravatar.cc/100?img=3" alt="user" /></div>
          <div className="w-12 h-12 rounded-full border-2 border-[#121214] bg-gray-800 flex items-center justify-center text-xs font-bold object-cover overflow-hidden"><img src="https://i.pravatar.cc/100?img=4" alt="user" /></div>
          <div className="w-12 h-12 rounded-full border-2 border-[#121214] bg-gray-700 flex items-center justify-center text-xs font-bold shadow-inner">10k+</div>
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1 text-primary mb-1">
            <Star size={16} fill="currentColor" stroke="none"/>
            <Star size={16} fill="currentColor" stroke="none"/>
            <Star size={16} fill="currentColor" stroke="none"/>
            <Star size={16} fill="currentColor" stroke="none"/>
            <Star size={16} fill="currentColor" stroke="none"/>
          </div>
          <span className="text-sm text-gray-300 font-medium tracking-wide">Loved by 10,000+ candidates globally</span>
        </div>
      </div> */}

      <div className="w-full px-4 sm:px-6 mt-6 sm:mt-10">
        <div className="relative mx-auto w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl rounded-2xl border-y border-[#bef264] overflow-hidden shadow-[0_0_80px_-20px_rgba(190,242,100,0.35)] group">

          {/* Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#bef264]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-2xl" />
          {/* Image */}
          <img
            src="/assets/homePageAssets/heroImg.png"
            alt="Platform Preview"
            className="w-full h-auto object-contain relative z-10"
            loading="lazy"
          />

        </div>
      </div>
   
{/* 
      <div className="mt-12 flex items-center gap-2 text-sm text-gray-500 font-medium z-10 relative bg-[#09090b]/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
        <span className={`w-2 h-2 rounded-full ${backendStatus.includes("online") || backendStatus.includes("running") ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"}`}></span>
        System API Status: {backendStatus}
      </div> */}

    </section>
  );
};

export default Hero;
