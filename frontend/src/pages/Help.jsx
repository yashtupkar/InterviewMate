import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { FiChevronDown, FiClock, FiHelpCircle, FiMail } from "react-icons/fi";

const HelpPage = () => {
  const [selectedFaq, setSelectedFaq] = useState(null);

  const faqs = [
    {
      q: "How do I contact support?",
      a: "Send an email to support@placemateai.com with a short description of the issue and any relevant session details.",
    },
    {
      q: "How long does a response take?",
      a: "Most requests are reviewed within 24 hours on business days.",
    },
    {
      q: "I have a technical issue during a session.",
      a: "If a session is interrupted, include the session ID and a brief note about what happened so we can investigate quickly.",
    },
    {
      q: "Can I cancel or change my plan?",
      a: "Yes. Plan changes and cancellations can be handled from the billing area in your dashboard.",
    },
  ];

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
              href="mailto:support@placemateai.com"
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
                    support@placemateai.com
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

          <div className="border-t border-white/10 pt-8 sm:pt-10">
            <div className="mb-5 sm:mb-6 flex items-center gap-3">
              <FiHelpCircle className="h-5 w-5 text-primary/70" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-white">
                FAQ
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = selectedFaq === index;

                return (
                  <div
                    key={faq.q}
                    className={`rounded-2xl overflow-hidden border ${isOpen ? "border-primary/20 bg-primary/[0.03]" : "border-white/10 bg-white/[0.02]"}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 px-4 sm:px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
                    >
                      <span
                        className={`text-sm sm:text-[15px] font-medium leading-snug ${isOpen ? "text-primary" : "text-zinc-200"}`}
                      >
                        {faq.q}
                      </span>
                      <FiChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : "text-zinc-500"}`}
                      />
                    </button>

                    <div
                      className={`grid transition-all duration-200 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-4 sm:px-5 pb-4 pt-0 text-sm leading-relaxed text-zinc-400">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-primary/15 px-4 sm:px-5 py-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Still need help? Email support@placemateai.com and we will route
              it from there.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpPage;
