import React from "react";
import { FiGift, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import UniversalPopup from "../components/common/UniversalPopup";

// ===== CONFIGURATION =====
const REFERRAL_REWARD = 50; // Sync with backend

export const WelcomePopup = ({ referrerName, onSignIn, onClose }) => {
  return (
    <UniversalPopup
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-md"
      showClose={true}
      overlayClassName="bg-black/80 backdrop-blur-sm"
      className="border-[#bef264]/20"
    >
      <div className="text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center p-4 bg-[#bef264]/10 rounded-3xl text-[#bef264]">
            <FiGift className="w-8 h-8" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-2xl font-black mb-2 tracking-tight">
          You've Been Referred!
        </h2>
        <p className="text-zinc-400 font-medium mb-6 leading-relaxed">
          <span className="text-white font-black">
            {referrerName || "Your friend"}
          </span>{" "}
          wants you to ace your next interview. Sign up now to claim your
          welcome credits!
        </p>

        {/* Credits Badge */}
        <div className="bg-[#bef264]/10 border border-[#bef264]/20 rounded-2xl p-4 mb-6">
          <p className="text-[#bef264] text-2xl font-black mb-1">
            +{REFERRAL_REWARD}
          </p>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
            Welcome Credits Added
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onSignIn}
            className="w-full py-4 bg-[#bef264] text-black rounded-lg font-black uppercase tracking-widest text-sm hover:bg-[#d9ff96] transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Claim My Rewards <FiArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </UniversalPopup>
  );
};

export const SuccessPopup = ({ onClose }) => {
  return (
    <UniversalPopup
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-md"
      showClose={true}
      overlayClassName="bg-black/80 backdrop-blur-sm"
      className="border-[#bef264]/20"
    >
      <div className="text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center p-4 bg-[#bef264]/10 rounded-3xl text-[#bef264] shadow-[0_0_30px_rgba(190,242,100,0.2)]">
            <FiCheckCircle className="w-10 h-10" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-3xl font-black mb-2 tracking-tight">
          Boom! <span className="text-[#bef264]">Credits Added.</span>
        </h2>
        <p className="text-zinc-400 font-medium mb-6 leading-relaxed">
          The referral was successful. We've added your bonus credits to your
          account. Go crush it!
        </p>

        {/* Credits Badge */}
        <div className="flex justify-center mb-6">
          <span className="px-6 py-2 bg-[#bef264]/10 border border-[#bef264]/20 rounded-lg text-[#bef264] text-[10px] font-black uppercase tracking-widest">
            +{REFERRAL_REWARD} Bonus Credits
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-4 bg-[#bef264] text-black rounded-lg font-black uppercase tracking-widest text-sm hover:bg-[#d9ff96] transition-all active:scale-95"
        >
          Let's Go
        </button>
      </div>
    </UniversalPopup>
  );
};
