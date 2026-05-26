import React from "react";
import { Helmet } from "react-helmet-async";
import { FiClock, FiMail, FiHeart } from "react-icons/fi";
import { COMPANY_DETAILS } from "../constants/company";
import FAQ from "../components/home/FAQ";
import SocialLinks from "../components/common/SocialLinks";

const HelpPage = () => {
  return (
    <>
      <Helmet>
        <title>Help & Support | {COMPANY_DETAILS.name}</title>
      </Helmet>

      <div className="min-h-[calc(100vh-80px)] md:min-h-screen text-white py-6 px-4 sm:px-6 md:px-8 border-l border-white/5 animate-fade-in custom-scrollbar overflow-y-auto flex items-center justify-center">
        <div className="w-full max-w-3xl mt-20 mx-auto pb-10">
          <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
            <span className="text-[#bef264] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">
              HELP CENTER
            </span>

            <h1 className="text-2xl sm:text-3xl   text-white mb-2">
              Welcome to <span className="text-[#bef264]">{COMPANY_DETAILS.name} Support</span>
            </h1>
            <p className="text-sm md:text-base mb-4 text-zinc-400 leading-relaxed">
              We would love to help you.
            </p>
            <SocialLinks />
          </div>

          <div className="text-left mb-4 rounded-2xl border border-white/10 bg-white/10 p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#bef264]/20 bg-[#bef264]/10 text-[#bef264] shrink-0">
              <FiHeart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-zinc-200 text-sm sm:text-base leading-relaxed mb-4">
                {COMPANY_DETAILS.name} is an innovative AI-powered interview preparation platform designed to help job seekers excel in their interviews. We provide mock interviews, detailed resume ATS scoring, and personalized feedback to empower you to land your dream job with confidence.
              </p>
          
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <a
              href={`mailto:${COMPANY_DETAILS.email}`}
              className="rounded-2xl border border-[#bef264]/15 bg-white/10 p-5 sm:p-6 transition-colors hover:border-[#bef264]/25 hover:bg-[#bef264]/[0.04]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#bef264]/20 bg-[#bef264]/10 text-[#bef264] shrink-0">
                  <FiMail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#bef264] mb-1 font-bold">
                    EMAIL SUPPORT
                  </p>
                  <h2 className="text-base font-semibold text-white break-all sm:break-normal mb-1">
                    {COMPANY_DETAILS.email}
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Best for account, billing, and technical issues.
                  </p>
                </div>
              </div>
            </a>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 shrink-0">
                  <FiClock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-1 font-bold">
                    RESPONSE TIME
                  </p>
                  <h2 className="text-base font-semibold text-white mb-1">
                    Within 24 hours
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Monday to Friday, with slower turnaround on weekends.
                  </p>
                </div>
              </div>
            </div>
          </div>
       

          <div className="border-t border-white/10 mt-8 sm:mt-10 pt-6 text-left">
            <FAQ category="help" />
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpPage;
