import React from "react";
import { Link } from "react-router-dom";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import UniversalPopup from "./UniversalPopup";
import Logo from "./Logo";

const QuestionBankAuthPopup = ({
  isOpen,
  onClose,
  redirectUrl,
  title = "Sign in to see more",
  subtitle,
  features,
  socialProof = "1,200+ joined this week · 100% free",
}) => {
  const defaultFeatures = [
    "Unlimited access to all questions",
    "Full solutions with code examples",
    "CodeSpace for hands-on coding practice",
    "AI-powered mock interviews",
    "Company-specific question sets",
  ];

  const featureList = features?.length ? features : defaultFeatures;

  return (
    <UniversalPopup
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      padding="p-0"
    >
      <div className="relative bg-gradient-to-br from-[#bef264]/15 via-zinc-900 to-zinc-900 px-6 pt-7 pb-5">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative text-center">
          <Logo size={34} className="mx-auto mb-2" />
          <h3 className="text-xl font-black text-white mb-1 tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-zinc-500 text-sm font-medium">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 pt-4">
        <div className="space-y-2.5 mb-5">
          {featureList.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#bef264]/15 flex items-center justify-center shrink-0">
                <svg
                  className="w-3 h-3 text-[#bef264]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm text-zinc-300 font-medium">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          <Link
            to={`/signin?redirect_url=${encodeURIComponent(redirectUrl)}`}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full bg-[#bef264] text-black py-3 rounded-xl font-black text-sm hover:bg-[#d4ff7e] transition-all active:scale-[0.97] hover:shadow-[0_0_24px_rgba(190,242,100,0.25)]"
          >
            <FiLogIn className="w-4 h-4" />
            Continue with Sign In
          </Link>
          <Link
            to={`/signup?redirect_url=${encodeURIComponent(redirectUrl)}`}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full bg-zinc-800/80 text-white py-3 rounded-xl font-bold text-sm border border-white/5 hover:bg-zinc-700 transition-all active:scale-[0.97]"
          >
            <FiUserPlus className="w-4 h-4" />
            Create Free Account
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-2.5">
          <div className="flex -space-x-2">
            {[
              "bg-emerald-500",
              "bg-blue-500",
              "bg-amber-500",
              "bg-violet-500",
            ].map((color, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full ${color} border-2 border-zinc-900 flex items-center justify-center text-[8px] text-white font-black`}
              >
                {["Y", "A", "R", "S"][i]}
              </div>
            ))}
          </div>
          <span className="text-zinc-500 text-xs font-semibold">
            {socialProof}
          </span>
        </div>
      </div>
    </UniversalPopup>
  );
};

export default QuestionBankAuthPopup;
