import React from 'react';
import { UserPlus, Mic, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus size={32} className="text-[#09090b]" />,
    num: "01",
    title: "Create Free Account",
    desc: "Sign up instantly and set up your profile with your target roles and experience level."
  },
  {
    icon: <Mic size={32} className="text-[#09090b]" />,
    num: "02",
    title: "Practice with AI",
    desc: "Engage in realistic voice-based mock interviews or group discussions tailored to you."
  },
  {
    icon: <TrendingUp size={32} className="text-[#09090b]" />,
    num: "03",
    title: "Review & Improve",
    desc: "Get detailed analytics, actionable feedback, and AI-driven insights to ace the real one."
  }
];

const Steps = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto flex flex-col items-center">
      <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-gray-800 bg-gray-900/50 text-xs text-primary mb-6 uppercase tracking-wider font-bold">
        How it works
      </div>
      <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white max-w-2xl">
        Ace Your Dream Job in Just <br className="hidden md:block" /> 3 Simple Steps
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {steps.map((step, idx) => (
          <div key={idx} className="relative bg-[#121214] border border-gray-800 rounded-[2rem] p-8 md:p-10 hover:border-primary/50 transition-all group overflow-hidden shadow-xl">
            <div className="absolute top-4 right-6 text-7xl font-black text-gray-800/30 group-hover:text-primary/10 transition-colors pointer-events-none">
              {step.num}
            </div>
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#bef264] via-[#7cff67] to-[#00f5a0] flex items-center justify-center mb-10 shadow-[0_0_20px_rgba(190,242,100,0.2)] transform group-hover:scale-110 transition-transform">
              {step.icon}
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{step.title}</h3>
            <p className="text-gray-400 relative z-10 leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Steps;
