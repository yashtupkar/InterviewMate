import React from 'react';
import { UserPlus, Mic, TrendingUp, ChevronRight } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus size={28} />,
    num: "01",
    title: "Create Free Account",
    desc: "Sign up instantly and set up your profile with your target roles and experience level.",
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400"
  },
  {
    icon: <Mic size={28} />,
    num: "02",
    title: "Practice with AI",
    desc: "Engage in realistic voice-based mock interviews or group discussions tailored to you.",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400"
  },
  {
    icon: <TrendingUp size={28} />,
    num: "03",
    title: "Review & Improve",
    desc: "Get detailed analytics, actionable feedback, and AI-driven insights to ace the real one.",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400"
  }
];

const Steps = () => {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="flex flex-col items-center mb-20">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black text-primary mb-6 uppercase tracking-[0.2em]">
          Workflow
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-center text-white mb-6 tracking-tight">
          How it <span className="text-primary italic">works</span>
        </h2>
        <p className="text-gray-400 text-center max-w-2xl text-lg font-medium leading-relaxed">
          Our AI-driven process is designed to take you from preparation to placement
          with minimum friction and maximum results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((step, idx) => (
          <div key={idx} className="group relative">
            {/* Connecting Line (Desktop) */}
            {idx < steps.length - 1 && (
              <div className="hidden md:block absolute top-24 -right-4 w-8 h-[2px] bg-gradient-to-r from-gray-800 to-transparent z-0" />
            )}

            <div className="relative bg-[#121214]/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 hover:border-primary/30 transition-all duration-500 hover:translate-y-[-8px] shadow-2xl group-hover:shadow-primary/5 overflow-hidden">
              {/* Decorative Number */}
              <div className="absolute -top-6 -right-6 text-9xl font-black text-white/[0.03] group-hover:text-primary/[0.05] transition-colors duration-500 pointer-events-none italic">
                {step.num}
              </div>

              {/* Icon Container */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} border border-white/10 flex items-center justify-center mb-8 shadow-inner relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <div className={step.iconColor}>
                  {step.icon}
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-primary text-xs font-black tracking-widest uppercase">Step {step.num}</span>
                  <div className="h-[1px] w-8 bg-primary/20" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>

              {/* Bottom Glow */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Steps;
