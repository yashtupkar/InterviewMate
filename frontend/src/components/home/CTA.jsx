import React from 'react';
import { SignedOut, SignInButton } from "@clerk/clerk-react";

import { Link } from 'react-router-dom';
import { SignedIn } from '@clerk/clerk-react';
import { ArrowRight, Sparkles, Rocket } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="relative overflow-hidden bg-[#18181b] rounded-[3rem] border border-primary/20 p-12 md:p-24 text-center shadow-[0_0_80px_rgba(190,242,100,0.05)]">
        {/* Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-[10px] font-black text-primary mb-8 uppercase tracking-[0.2em] animate-pulse">
            <Sparkles size={14} fill="currentColor" /> Limited Time Offer
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.1]">
            Ready to land your <span className="text-primary italic">dream offer?</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
            Join thousands of candidates who are already using PlaceMateAI to
            outperform their competition and secure high-paying roles.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <SignedOut>
              <Link
                to="/sign-up"
                className="group relative px-10 py-5 bg-primary text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-[#d9ff96] whitespace-nowrap transition-all duration-300 shadow-[0_20px_40px_rgba(190,242,100,0.2)] flex items-center gap-3"
              >
                Get Started Free
                <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/interview"
                className="group relative px-10 py-5 bg-primary text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-[#d9ff96] whitespace-nowrap transition-all duration-300 shadow-[0_20px_40px_rgba(190,242,100,0.2)] flex items-center gap-3"
              >
                Start Practice Now
                <Rocket size={18} className="group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500" />
              </Link>
            </SignedIn>
          </div>

          <div className="mt-12 flex items-center justify-center gap-4 text-xs font-black text-gray-500 uppercase tracking-widest">
            <span>No credit card required</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>30 free credits instantly</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
