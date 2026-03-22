import React from 'react';
import { FiGift, FiCheckCircle, FiX, FiArrowRight } from 'react-icons/fi';

export const WelcomePopup = ({ referrerName, onSignIn, onClose }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="relative bg-zinc-900 border border-[#bef264]/20 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-scale-up overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#bef264]/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -ml-16 -mb-16"></div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-[#bef264]/10 rounded-3xl text-[#bef264] mb-6">
            <FiGift className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-black mb-2 tracking-tight">You've Been Referred!</h2>
          <p className="text-zinc-400 font-medium mb-8 leading-relaxed">
            <span className="text-white font-black">{referrerName || 'Your friend'}</span> wants you to ace your next interview. Sign up now to claim your welcome credits!
          </p>

            <div className="bg-[#bef264]/10 border border-[#bef264]/20 rounded-2xl p-4 col-span-2">
              <p className="text-[#bef264] text-xl font-black mb-1">+20</p>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Welcome Credits Added</p>
            </div>

          <button 
            onClick={onSignIn}
            className="w-full py-4 bg-[#bef264] text-black rounded-2xl font-black uppercase tracking-widest hover:bg-[#d9ff96] transition-all flex items-center justify-center gap-3 active:scale-95 mb-4"
          >
            Claim My Rewards <FiArrowRight />
          </button>
          
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
            Maybe Later
          </button>
        </div>

        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-500 hover:text-white z-20">
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export const SuccessPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="relative bg-zinc-900 border border-[#bef264]/20 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-scale-up text-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#bef264]"></div>
        
        <div className="inline-flex items-center justify-center p-4 bg-[#bef264]/10 rounded-3xl text-[#bef264] mb-6 shadow-[0_0_30px_rgba(190,242,100,0.2)]">
          <FiCheckCircle className="w-10 h-10" />
        </div>

        <h2 className="text-3xl font-black mb-2 tracking-tight italic">Boom! <span className="text-[#bef264]">Credits Added.</span></h2>
        <p className="text-zinc-400 font-medium mb-8 leading-relaxed">
          The referral was successful. We've added your bonus credits to your account. Go crush it!
        </p>

        <div className="flex gap-4 justify-center mb-8">
            <span className="px-6 py-2 bg-[#bef264]/10 border border-[#bef264]/20 rounded-xl text-[#bef264] text-[10px] font-black uppercase tracking-widest">+20 Bonus Credits</span>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
        >
          Let's Go
        </button>
      </div>
    </div>
  );
};
