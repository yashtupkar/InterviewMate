import React from 'react';
import { SignedOut, SignInButton } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import { SignedIn } from '@clerk/clerk-react';
import { ArrowRight, Sparkles, Rocket, Zap } from 'lucide-react';
import Logo from '../common/Logo';

const CTA = () => {
  return (
    <section className="py-20 px-6 relative overflow-hidden bg-transparent">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-primary/50 blur-[130px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
      <Logo size={42}/>

        <h2 className="text-3xl md:text-5xl mt-4 font-bold text-white mb-6 leading-tight tracking-tight px-4">
          Ready to Transform <br />
          <span className="text-primary italic">Your Career Path?</span>
        </h2>

        <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium px-4">
          Join thousands of professionals who have already streamlined 
          their interview preparation with our AI Assistant.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <SignedOut>
            <Link
              to="/sign-up"
              className="group relative px-8 py-4 bg-primary text-black font-bold text-sm rounded-full hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(190,242,100,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center gap-3 overflow-hidden"
            >
              Get Started
              <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </SignedOut>
          
          <SignedIn>
            <Link
              to="/dashboard"
              className="group relative px-8 py-4 bg-primary text-black font-bold text-sm rounded-full hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(190,242,100,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center gap-3"
            >
              Start Preparation Now
            </Link>
          </SignedIn>
        </div>
      </div>


    </section>
  );
};

export default CTA;
