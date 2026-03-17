import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    { q: "How do I get started with InterviewMate?", a: "Simply sign up for a free account, complete your profile, and start your first AI mock interview instantly." },
    { q: "Is the voice interaction real-time?", a: "Yes, our platform uses cutting-edge speech-to-text and LLM integrations to provide under 500ms latency, mimicking a real conversation." },
    { q: "Are the interview questions actually relevant to my role?", a: "Absolutely. We tailor questions specifically to the role, seniority, and tech stack you specify before starting." },
    { q: "How does the Group Discussion feature work?", a: "You'll join a virtual room populated by distinct AI personas, each programmed with unique behaviors. You interact with them as if they are real participants." },
    { q: "Are there any hidden fees?", a: "We offer a generous free tier for basic practice. Premium advanced analytics and unlimited mock interviews require a subscription, but we're transparent about pricing." }
  ];

  const [open, setOpen] = useState(0);

  return (
    <section className="py-24 px-6 max-w-3xl mx-auto flex flex-col items-center w-full">
      <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-gray-800 bg-gray-900/50 text-xs text-primary mb-6 uppercase tracking-wider font-bold">
        FAQ
      </div>
      <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white">
        Frequently Asked Questions
      </h2>

      <div className="w-full flex flex-col gap-5">
        {faqs.map((faq, idx) => (
          <div 
            key={idx} 
            className={`border ${open === idx ? 'border-primary/30 bg-primary/5' : 'border-gray-800 bg-[#121214]'} rounded-3xl overflow-hidden transition-all duration-300 shadow-lg`}
          >
            <button 
              className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
              onClick={() => setOpen(open === idx ? -1 : idx)}
            >
              <span className={`font-bold text-lg ${open === idx ? 'text-primary' : 'text-white'}`}>
                {faq.q}
              </span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${open === idx ? 'bg-primary/20' : 'bg-gray-800'}`}>
                <ChevronDown 
                  size={20} 
                  className={`transition-transform duration-300 ${open === idx ? 'rotate-180 text-primary' : 'text-gray-400'}`}
                />
              </div>
            </button>
            <div 
              className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${open === idx ? 'max-h-40 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <p className="text-gray-400 text-base leading-relaxed">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
