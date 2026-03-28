import { useState } from 'react';
import { Plus, Minus, Sparkles } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    { 
      q: "What types of AI capabilities does your platform offer?", 
      a: "Our platform features state-of-the-art AI for real-time voice interview simulation, detailed performance analytics, automated resume parsing/scoring, and intelligent group discussion agents with distinct personas." 
    },
    { 
      q: "How does your platform ensure data privacy and security?", 
      a: "We prioritize your data security with end-to-end encryption for all sessions. Your audio and personal data are never used to train global models without explicit consent, and we comply with industry-standard privacy regulations." 
    },
    { 
      q: "Can your platform integrate with our existing software systems?", 
      a: "Yes, we offer flexible API integrations for enterprise partners, allowing you to sync interview results and candidate scores directly with your ATS or HRM systems." 
    },
    { 
      q: "What kind of support and training do you provide to users?", 
      a: "We offer comprehensive onboarding materials, 24/7 technical support, and detailed guides for every feature. Premium users also get access to dedicated account managers for personalized coaching strategies." 
    },
    { 
      q: "How scalable is your platform as our business grows?", 
      a: "PlaceMateAI is built on a cloud-native architecture that scales horizontally. Whether you're a single user or an enterprise conducting thousands of interviews daily, our system handles the load with sub-500ms latency." 
    },
    { 
      q: "Is there a trial period or demo available before committing to a subscription?", 
      a: "Absolutely! We offer a generous free tier that includes basic interview practice and resume scoring. You can also request a personalized demo to explore our advanced enterprise features." 
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-16 md:py-20 px-4 md:px-6 overflow-hidden ">

      <div className="max-w-4xl mx-auto flex text-center flex-col items-center">
        {/* Badge */}
        <div className="text-[#bef264] font-bold tracking-wider  text-xs mb-3">
        
          <span>FAQ's</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight max-w-3xl leading-[1.1]">
          Answers to the Most  <span className="text-primary">Common</span> Questions
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

