import React from 'react';

const Features = () => {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto flex flex-col items-center">
      <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-gray-800 bg-gray-900/50 text-xs text-primary mb-6 uppercase tracking-wider font-bold">
        Core Features
      </div>
      <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white max-w-2xl">
        Discover Powerful Ways to Prepare <br className="hidden md:block"/> on PlaceMateAI
      </h2>

      <div className="w-full flex flex-col gap-8">
        
        {/* Feature 1 */}
        <div className="bg-[#121214] border border-gray-800 rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 hover:border-gray-700 transition-colors relative overflow-hidden group">
          <div className="flex-1 z-10 w-full text-center md:text-left">
            <h3 className="text-3xl font-bold text-white mb-4">Voice Mock Interviews</h3>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto md:mx-0">
              Experience the pressure of real interviews through our seamless voice border interaction. Our AI adjusts difficulty and asks realistic follow-up questions based on your responses.
            </p>
            <div className="inline-flex items-center gap-4 bg-gray-900/50 px-5 py-3 rounded-2xl border border-gray-800">
               <span className="text-sm text-gray-400">Improvement Rate</span>
               <span className="text-primary font-bold text-xl">Up to 80%</span>
            </div>
          </div>
          <div className="flex-1 w-full bg-[#18181b] rounded-3xl border border-gray-800 p-8 flex items-center justify-center relative shadow-2xl z-10">
             <div className="w-full max-w-sm rounded-[1.5rem] bg-[#09090b] border border-gray-800 overflow-hidden shadow-2xl flex flex-col">
               <div className="h-10 border-b border-gray-800 flex items-center px-5 gap-2 bg-[#121214]">
                 <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
               </div>
               <div className="p-8 flex flex-col gap-5 flex-1 bg-gradient-to-b from-transparent to-primary/5">
                 <div className="h-4 w-1/3 bg-gray-800 rounded-lg"></div>
                 <div className="h-2 w-3/4 bg-gray-800 rounded-lg"></div>
                 <div className="h-2 w-1/2 bg-gray-800 rounded-lg mb-2"></div>
                 
                 <div className="flex justify-center my-6">
                    <div className="w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(190,242,100,0.2)]">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-[#09090b]">
                         {/* Mic placeholder */}
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                      </div>
                    </div>
                 </div>
                 
                 <div className="h-12 w-full bg-[#181818] border border-gray-800 rounded-xl flex items-center justify-center font-semibold text-gray-500 text-sm mt-auto">
                   Listening...
                 </div>
               </div>
             </div>
             {/* Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 blur-[80px] rounded-full -z-10 group-hover:bg-primary/30 transition-colors"></div>
          </div>
        </div>

        {/* Feature 2 (Reversed layout) */}
        <div className="bg-[#121214] border border-gray-800 rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row-reverse items-center gap-10 hover:border-gray-700 transition-colors relative overflow-hidden group">
          <div className="flex-1 z-10 w-full text-center md:text-left md:pl-10">
            <h3 className="text-3xl font-bold text-white mb-4">Group Discussions</h3>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto md:mx-0">
              Participate in simulated group discussions. Our multi-agent system provides a realistic and dynamic collaborative environment with unique participant personas to challenge your leadership.
            </p>
            <div className="inline-flex items-center gap-4 bg-gray-900/50 px-5 py-3 rounded-2xl border border-gray-800">
               <span className="text-sm text-gray-400">Collaboration</span>
               <span className="text-primary font-bold text-xl">Top Tier</span>
            </div>
          </div>
          <div className="flex-1 w-full flex items-center justify-center relative">
            <div className="w-full max-w-lg grid grid-cols-2 gap-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className={`bg-[#18181b] border ${i === 2 ? 'border-primary/50 bg-primary/5' : 'border-gray-800'} rounded-[1.5rem] p-6 flex flex-col items-center justify-center gap-4 aspect-square shadow-xl relative overflow-hidden transition-all transform hover:scale-105`}>
                   <div className={`w-20 h-20 rounded-full ${i === 2 ? 'bg-primary/20 border-primary' : 'bg-[#27272a] border-gray-700'} border-2 flex flex-col justify-end overflow-hidden pb-2`}>
                      <div className={`w-8 h-8 ${i === 2 ? 'bg-primary/60' : 'bg-gray-600'} rounded-full mx-auto mb-1`}></div>
                      <div className={`w-14 h-8 ${i === 2 ? 'bg-primary/40' : 'bg-gray-600'} rounded-t-full mx-auto`}></div>
                   </div>
                   <div className="flex flex-col items-center gap-2 w-full px-4">
                     <div className={`h-3 ${i === 2 ? 'bg-primary/80' : 'bg-gray-700'} w-20 rounded-full`}></div>
                     <div className="h-2 bg-gray-800 w-12 rounded-full px-2"></div>
                   </div>
                   {i === 2 && (
                     <div className="absolute top-4 right-4 text-primary">
                       <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                     </div>
                   )}
                </div>
              ))}
            </div>
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -z-10 group-hover:bg-primary/20 transition-colors"></div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="bg-[#121214] border border-gray-800 rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 hover:border-gray-700 transition-colors relative overflow-hidden group">
          <div className="flex-1 z-10 w-full text-center md:text-left">
            <h3 className="text-3xl font-bold text-white mb-4">LinkedIn Optimization</h3>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto md:mx-0">
              Stand out to recruiters before the interview even begins. Analyze your profile and let our AI optimize your headlines, summaries, and experience sections with industry-standard keywords.
            </p>
            <div className="inline-flex items-center gap-4 bg-gray-900/50 px-5 py-3 rounded-2xl border border-gray-800">
               <span className="text-sm text-gray-400">Profile Views</span>
               <span className="text-primary font-bold text-xl">+120% Boost</span>
            </div>
          </div>
          <div className="flex-1 w-full bg-[#18181b] rounded-3xl border border-gray-800 p-8 flex items-center justify-center relative shadow-2xl z-10">
              <div className="w-full max-w-sm rounded-[1.5rem] bg-[#0a66c2]/10 border border-[#0a66c2]/30 p-8 flex flex-col gap-6 transform group-hover:-translate-y-2 transition-transform shadow-2xl backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#0a66c2] rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shrink-0">in</div>
                  <div className="flex-1 pt-1">
                    <div className="h-4 w-3/4 bg-blue-100/20 rounded-lg mb-3"></div>
                    <div className="h-2 w-1/2 bg-blue-100/10 rounded-lg"></div>
                  </div>
                </div>
                <div className="space-y-3 mt-2 bg-[#09090b]/50 p-4 rounded-xl border border-white/5">
                   <div className="h-2 w-full bg-gray-500/30 rounded-full"></div>
                   <div className="h-2 w-[90%] bg-gray-500/30 rounded-full"></div>
                   <div className="h-2 w-[70%] bg-gray-500/30 rounded-full"></div>
                </div>
                <div className="mt-2 py-3 px-4 rounded-xl bg-primary/10 border border-primary/20 text-center flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-primary text-sm font-bold tracking-wide">AI OPTIMIZED</span>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#0a66c2]/20 blur-[80px] rounded-full -z-10 group-hover:bg-[#0a66c2]/30 transition-colors"></div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Features;
