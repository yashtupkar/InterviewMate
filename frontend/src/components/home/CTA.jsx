import React from 'react';
import { SignedOut, SignInButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto w-full mb-10">
      <div className="bg-gradient-to-r from-[#bef264] via-[#7cff67] to-[#00f5a0] rounded-[3rem] flex flex-col items-center justify-center text-center p-12 md:p-24 relative overflow-hidden shadow-[0_0_50px_rgba(190,242,100,0.2)]">
        {/* Abstract shapes/glows within CTA */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/30 blur-[100px] rounded-full -z-0 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 blur-[100px] rounded-full -z-0 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
        <h2 className="text-4xl md:text-6xl font-black text-[#09090b] mb-8 relative z-10 max-w-3xl leading-tight">
          Take the First Step Towards Your Next Big Offer
        </h2>
        <p className="text-black/70 font-bold text-xl md:text-2xl mb-12 max-w-2xl relative z-10 leading-relaxed">
          Sign up now to access voice mock interviews, dynamic group discussions, and personalized feedback engineered to elevate your career.
        </p>
        
        <SignedOut>
          <SignInButton mode="modal">
            <button className="relative z-10 px-10 py-5 rounded-full bg-[#09090b] text-white font-bold text-xl hover:bg-gray-800 transition-all transform hover:scale-105 shadow-2xl">
              Get Started Now - It's Free
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </section>
  );
};

export default CTA;
