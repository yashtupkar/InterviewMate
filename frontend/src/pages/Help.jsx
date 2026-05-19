import React from "react";
import { Helmet } from "react-helmet-async";
import { FiClock, FiMail } from "react-icons/fi";
import { COMPANY_DETAILS } from "../constants/company";
import FAQ from "../components/home/FAQ";

const HelpPage = () => {

  return (
    <>
      <Helmet>
        <title>Help & Support | PlaceMateAI</title>
      </Helmet>

      <div className="min-h-screen text-white py-10 px-4 sm:px-6 md:px-8 border-l border-white/5 animate-fade-in custom-scrollbar overflow-y-auto">
        <div className="max-w-4xl mx-auto pb-16 sm:pb-20">
          <div className="mb-8 sm:mb-10 max-w-2xl">
            <span className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">
              Help Center
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-white">
              Simple support,{" "}
              <span className="text-primary">clear answers.</span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-zinc-400 leading-relaxed max-w-xl">
              Use the contact details below if you need help. If your question
              is common, the short FAQ should cover it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 sm:mb-12">
            <a
              href={`mailto:${COMPANY_DETAILS.email}`}
              className="rounded-3xl border border-primary/15 bg-primary/[0.02] p-5 sm:p-6 md:p-7 transition-colors hover:border-primary/25 hover:bg-primary/[0.04]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shrink-0">
                  <FiMail className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.3em] text-primary/70 mb-2">
                    Email
                  </p>
                  <h2 className="text-base sm:text-lg font-medium text-white break-all sm:break-normal">
                    {COMPANY_DETAILS.email}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    Best for account, billing, and technical issues.
                  </p>
                </div>
              </div>
            </a>

            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 md:p-7">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-200 shrink-0">
                  <FiClock className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-2">
                    Response time
                  </p>
                  <h2 className="text-base sm:text-lg font-medium text-white">
                    Within 24 hours
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    Monday to Friday, with slower turnaround on weekends.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 sm:mt-10">
            <FAQ category="help" />
          </div>

            <div className="mt-8 rounded-2xl border border-dashed border-primary/15 px-4 sm:px-5 py-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Still need help? Email {COMPANY_DETAILS.email} and we will route
              it from there.
            </div>
          </div>
        </div>
      
    </>
  );
};

export default HelpPage;
