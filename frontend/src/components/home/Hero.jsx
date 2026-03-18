import React from 'react';
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";

const Hero = ({ backendStatus }) => {
  return (
    <section className="relative w-full pt-32 pb-20 flex flex-col items-center justify-center text-center overflow-hidden">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-800 bg-gray-900/50 backdrop-blur-sm text-sm text-gray-300 mb-8 font-medium">
        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#bef264] via-[#7cff67] to-[#00f5a0] animate-pulse shadow-[0_0_8px_rgba(190,242,100,0.8)]"></span>
        Introducing Group Discussions & LinkedIn Optimization
      </div>

      <h1 className="text-5xl md:text-6xl  font-black tracking-tighter max-w-5xl leading-[1.05] mb-6 text-white drop-shadow-xl">
        You Don't Have To Fear <br className="hidden md:block"/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bef264] via-[#7cff67] to-[#00f5a0] drop-shadow-[0_0_15px_rgba(190,242,100,0.4)]">
          Interviews Anymore!
        </span>
      </h1>

      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed px-4">
        Simulate high-pressure voice interviews, participate in dynamic group discussions, and optimize your LinkedIn profile with real-time actionable feedback.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full justify-center px-4 mb-16">
        <SignedOut>
          <Link to="/signup" className="w-full sm:w-auto">
            <button className="px-4 py-3 w-full rounded-xl bg-[#bef264]  text-black font-bold text-sm hover:brightness-110 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(190,242,100,0.3)] border-none">
              Start Practicing Free
            </button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <button className="px-4 py-3 w-full rounded-xl bg-[#bef264]  text-black font-bold text-sm hover:brightness-110 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(190,242,100,0.3)] border-none">
              Go to Dashboard
            </button>
          </Link>
        </SignedIn>
        
        <a href="#features" className="px-4 py-3 w-full sm:w-auto rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm group">
          <Play size={18} className="text-primary group-hover:scale-110 transition-transform" />
          See How It Works
        </a>
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

      <div className="rounded-2xl sm:max-w-3xl md:max-w-5xl lg:max-w-6xl border-y border-[#bef264]  mx-auto ">
        <img
          src="/assets/homePageAssets/heroImg.png"
          alt="Platform Preview"
          className="w-full h-full object-cover rounded-2xl "
        />
      </div>
   

      <div className="mt-12 flex items-center gap-2 text-sm text-gray-500 font-medium z-10 relative bg-[#09090b]/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
        <span className={`w-2 h-2 rounded-full ${backendStatus.includes("online") || backendStatus.includes("running") ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"}`}></span>
        System API Status: {backendStatus}
      </div>

    </section>
  );
};

export default Hero;
