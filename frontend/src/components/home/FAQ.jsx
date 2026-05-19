import { useState } from 'react';
import { Plus, Minus, Sparkles } from 'lucide-react';
import { FAQS } from '../../constants/company';

const FAQ = ({ category = "home" }) => {
  const faqs = FAQS[category] || FAQS.home;

  const headings = {
    home: {
      badge: "FAQ's",
      title: "Answers to the Most ",
      highlight: "Common",
      suffix: " Questions"
    },
    pricing: {
      badge: "Pricing FAQ",
      title: "Got ",
      highlight: "Questions?",
      suffix: ""
    },
    help: {
      badge: "Support FAQ",
      title: "How can we ",
      highlight: "help",
      suffix: " you?"
    }
  };

  const headingInfo = headings[category] || headings.home;

  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-16 md:py-20 px-4 md:px-6 overflow-hidden ">

      <div className="max-w-4xl mx-auto flex text-center flex-col items-center">
        {/* Badge */}
        <div className="text-[#bef264] font-bold tracking-wider  text-xs mb-3">
        
          <span>{headingInfo.badge}</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight max-w-3xl leading-[1.1]">
          {headingInfo.title} <span className="text-primary">{headingInfo.highlight}</span>{headingInfo.suffix}
        </h2>

        {/* FAQ List */}
        <div className="w-full space-y-3 mt-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`group transition-all duration-300  rounded-2xl overflow-hidden ${
                openIndex === idx 
                ? ' bg-[#1f2022] shadow-xl shadow-primary/5' 
                  : ' bg-[#1f2022] hover:bg-zinc-800'
              }`}
            >
              <button 
                className="w-full px-4 md:px-6 py-3 flex items-center justify-between text-left focus:outline-none"
                onClick={() => toggleAccordion(idx)}
              >
                <span className={`font-semibold text-sm md:text-lg transition-colors duration-300 ${
                  openIndex === idx ? 'text-white' : 'text-white group-hover:text-zinc-200'
                }`}>
                  {faq.q}
                </span>
                
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  openIndex === idx 
                    ? 'bg-primary text-black' 
                    : 'bg-zinc-800 text-zinc-400 md:group-hover:bg-zinc-700'
                }`}>
                  {openIndex === idx ? <Minus size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2} />}
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 pt-0">
                  <div className="h-px w-full bg-white/5 mb-4" />
                  <p className="text-zinc-400 text-start text-sm md:text-base leading-relaxed font-medium max-w-[95%]">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom indicator */}
        <div className="mt-12 w-10 h-1 bg-primary/20 rounded-full blur-[2px] animate-pulse" />
      </div>
    </section>
  );
};

export default FAQ;

