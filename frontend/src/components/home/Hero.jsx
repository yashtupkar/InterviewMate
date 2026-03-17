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
          <SignInButton mode="modal">
            <button className="px-8 py-4 w-full sm:w-auto rounded-full bg-gradient-to-r from-[#bef264] via-[#7cff67] to-[#00f5a0] text-black font-bold text-lg hover:brightness-110 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(190,242,100,0.3)] border-none">
              Start Practicing Free
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <button className="px-8 py-4 w-full rounded-full bg-gradient-to-r from-[#bef264] via-[#7cff67] to-[#00f5a0] text-black font-bold text-lg hover:brightness-110 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(190,242,100,0.3)] border-none">
              Go to Dashboard
            </button>
          </Link>
        </SignedIn>
        
        <a href="#features" className="px-8 py-4 w-full sm:w-auto rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm group">
          <Play size={20} className="text-primary group-hover:scale-110 transition-transform" />
          See How It Works
        </a>
      </div>

      {/* Social Proof */}
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
      </div>

      {/* Mini Mockup / Platform Preview UI */}
      <div className="relative w-full max-w-5xl mx-auto px-4 z-10 hidden md:block perspective-1000">
        <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-y-50 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-t-[2rem] p-2 w-full shadow-2xl relative overflow-hidden transition-transform duration-700 hover:scale-[1.02]">
          
          {/* Mockup Header */}
          <div className="flex items-center px-4 py-3 border-b border-white/5 bg-[#09090b]/50 rounded-t-[1.5rem]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="mx-auto flex items-center gap-2 bg-[#18181b] px-5 py-1.5 rounded-full border border-white/5">
               <span className="text-xs text-gray-400 font-medium">app.interviewmate.ai / voice-session</span>
               <div className="flex items-center gap-1.5 border-l border-white/10 pl-2 ml-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                 <span className="text-[10px] uppercase text-green-500 font-bold tracking-wider">Live</span>
               </div>
            </div>
          </div>
          
          {/* Mockup Content */}
          <div className="grid grid-cols-12 gap-0 relative h-[450px] border-x border-white/5 bg-[#09090b]">
            {/* Sidebar */}
            <div className="col-span-3 border-r border-white/5 p-6 flex flex-col gap-4 bg-[#09090b]/80">
              <div className="h-6 w-2/3 bg-white/10 rounded-lg mb-4"></div>
              <div className="flex flex-col gap-3">
                 <div className="h-10 w-full bg-primary/10 border border-primary/20 rounded-xl flex items-center px-4 gap-3">
                   <div className="w-4 h-4 rounded-full bg-primary/40"></div>
                   <div className="h-2 w-1/2 bg-primary/50 rounded"></div>
                 </div>
                 <div className="h-10 w-full bg-white/5 rounded-xl flex items-center px-4 gap-3">
                   <div className="w-4 h-4 rounded-full bg-white/20"></div>
                   <div className="h-2 w-1/3 bg-white/20 rounded"></div>
                 </div>
                 <div className="h-10 w-full bg-white/5 rounded-xl flex items-center px-4 gap-3">
                   <div className="w-4 h-4 rounded-full bg-white/20"></div>
                   <div className="h-2 w-2/3 bg-white/20 rounded"></div>
                 </div>
              </div>
              <div className="mt-auto h-24 w-full bg-white/5 rounded-2xl flex flex-col items-center justify-center p-4 gap-2">
                <div className="h-2 w-1/2 bg-white/20 rounded-full"></div>
                <div className="h-2 w-3/4 bg-white/20 rounded-full"></div>
                <div className="h-2 w-1/3 bg-white/20 rounded-full"></div>
              </div>
            </div>
            
            {/* Main Center UI */}
            <div className="col-span-9 p-8 flex flex-col items-center justify-center relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]">
              
              {/* Dynamic Aura around Voice UI */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="w-40 h-40 rounded-full border border-primary/20 flex items-center justify-center relative shadow-[0_0_80px_rgba(190,242,100,0.15)] bg-[#18181b]/50 backdrop-blur-md">
                <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping opacity-20"></div>
                <div className="w-28 h-28 rounded-full bg-[#121214] flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden relative z-10">
                   {/* Agent AI Voice Visualizer */}
                   <div className="flex items-center justify-center gap-1.5 h-12">
                     <div className="w-1.5 bg-primary/60 rounded-full animate-[bounce_1s_infinite_0.1s] h-[20%]"></div>
                     <div className="w-1.5 bg-primary/80 rounded-full animate-[bounce_1s_infinite_0.3s] h-[50%]"></div>
                     <div className="w-1.5 bg-primary rounded-full animate-[bounce_1s_infinite_0.5s] h-[100%]"></div>
                     <div className="w-1.5 bg-primary/80 rounded-full animate-[bounce_1s_infinite_0.2s] h-[60%]"></div>
                     <div className="w-1.5 bg-primary/60 rounded-full animate-[bounce_1s_infinite_0.4s] h-[30%]"></div>
                   </div>
                </div>
              </div>
              
              <div className="mt-10 text-center max-w-lg z-10">
                <div className="inline-block px-3 py-1 pb-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">
                  AI Interviewer Active
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Technical System Design</h3>
                <p className="text-base text-gray-400 leading-relaxed">
                  "Let's move on. How would you design a scalable rate limiter for a distributed API gateway? Consider latency..."
                </p>
              </div>
            </div>
            
            {/* Call Controls Floating */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#18181b] border border-white/10 p-2.5 rounded-2xl flex gap-4 shadow-2xl z-20 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center border border-white/5">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center border border-white/5">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors cursor-pointer text-red-500 flex items-center justify-center border border-red-500/30">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
              </div>
            </div>
            
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-2 text-sm text-gray-500 font-medium z-10 relative bg-[#09090b]/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
        <span className={`w-2 h-2 rounded-full ${backendStatus.includes("online") || backendStatus.includes("running") ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"}`}></span>
        System API Status: {backendStatus}
      </div>

    </section>
  );
};

export default Hero;
