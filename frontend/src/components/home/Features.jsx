import React from 'react';
import { CheckCircle2, PlayCircle, Users, BarChart, FileText, BookOpen } from 'lucide-react';

const featuresList = [
  {
    subtitle: "INTERVIEW PREPARATION",
    title: "AI Mock Interviews",
    description: "Experience zero-latency conversations with AI personas that mirror real interviewers. Our models analyze your tone, pace, and content to adapt their questioning strategy on the fly.",
    bullets: [
      "Adaptive questioning based on your narrative arc.",
      "Real-time stress level assessment."
    ],
    icon: PlayCircle,
    reverse: false
  },
  {
    subtitle: "COLLABORATIVE DYNAMICS",
    title: "AI GD Simulator",
    description: "Practice collaborative problem-solving with multiple AI personas simulating a real group dynamic. Master the subtle cues of conversation flow, interruption management, and consensus building.",
    bullets: [
      "Realistic multi-participant simulations.",
      "Conflict resolution and leadership tracking."
    ],
    icon: Users,
    reverse: true
  },
  {
    subtitle: "DEEP ANALYTICS",
    title: "AI Expert Feedback",
    description: "Stop guessing where you went wrong. Our engine provides a line-by-line breakdown of your responses, identifying power words, confidence gaps, and missed opportunities.",
    bullets: [
      "Visual heatmap of vocal confidence.",
      "Industry-standard STAR method optimization."
    ],
    icon: BarChart,
    reverse: false
  },
  {
    subtitle: "CAREER FOUNDATION",
    title: "Resume Builder",
    description: "Craft a professional, ATS-friendly resume from scratch. Our AI evaluates job descriptions to provide tailored bullet point suggestions and structural optimizations.",
    bullets: [
      "Guaranteed ATS compliance scores.",
      "Smart keyword optimization for your industry."
    ],
    icon: FileText,
    reverse: true
  },
  {
    subtitle: "KNOWLEDGE REPOSITORY",
    title: "Interview Question Bank",
    description: "Access a massive repository of company-specific and role-specific interview questions. Each question comes with AI-generated model answers and detailed evaluation rubrics.",
    bullets: [
      "FAANG-level technical deep dives.",
      "Role-specific behavioral question sets."
    ],
    icon: BookOpen,
    reverse: false
  }
];

const Features = () => {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto flex flex-col items-center relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 w-full max-w-[1000px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 -translate-x-1/2 -translate-y-1/2" />

      <div className="flex flex-col items-center mb-24 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black text-primary mb-6 uppercase tracking-[0.2em]">
          Core Capabilities
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight max-w-3xl leading-[1.1]">
          Everything you need to <span className="text-primary">break through</span>
        </h2>
        <p className="text-gray-400 max-w-xl text-lg font-medium leading-relaxed">
          Powerful AI-driven tools engineered to give you the edge in today's competitive job market.
        </p>
      </div>

      <div className="w-full space-y-32">
        {featuresList.map((feature, index) => (
          <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${feature.reverse ? 'lg:flex-row-reverse' : ''}`}>
            
            {/* Content Half */}
            <div className="flex-1 space-y-6 w-full">
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{feature.subtitle}</div>
              <h3 className="text-3xl md:text-[2.75rem] font-bold text-white leading-[1.15] tracking-tight">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                {feature.description}
              </p>
              <ul className="space-y-4 pt-4">
                {feature.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-black fill-primary shrink-0 mt-0.5" /> 
                    <span className="text-[15px] font-medium text-gray-300">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Video Box Half */}
            <div className="flex-1 w-full">
              <div className="aspect-[4/3] md:aspect-video bg-[#0d0d0f] border border-white/5 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Simulated Video Placeholder */}
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                  <feature.icon size={28} className="text-gray-500 group-hover:text-white transition-colors duration-500" />
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
