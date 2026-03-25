import React from 'react';
import { Code2, BriefcaseBusiness, Palette, DatabaseZap, Terminal, Cpu, LineChart, Layers } from 'lucide-react';

const roles = [
  { 
    name: "Software Engineering", 
    icon: <Code2 size={24} />, 
    desc: "Frontend, Backend, & Fullstack",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400"
  },
  { 
    name: "Product Management", 
    icon: <BriefcaseBusiness size={24} />, 
    desc: "Strategy, Roadmap, & Execution",
    color: "from-indigo-500/20 to-purple-500/20",
    iconColor: "text-indigo-400"
  },
  { 
    name: "Data Science", 
    icon: <DatabaseZap size={24} />, 
    desc: "Analytics, ML, & Big Data",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400"
  },
  { 
    name: "UI/UX Design", 
    icon: <Palette size={24} />, 
    desc: "Research, Visuals, & Prototypes",
    color: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400"
  },
];

const Roles = () => {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto flex flex-col items-center">
      <div className="flex flex-col items-center mb-20 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black text-primary mb-6 uppercase tracking-[0.2em]">
          Specializations
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          Tailored for <span className="text-primary italic">Every Discipline</span>
        </h2>
        <p className="text-gray-400 max-w-2xl text-lg font-medium leading-relaxed">
          Our AI models are fine-tuned on discipline-specific datasets, 
          ensuring you get the most relevant prep for your specific career path.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {roles.map((role, idx) => (
          <div key={idx} className="group relative bg-[#121214]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:border-primary/20 transition-all duration-500 hover:translate-y-[-8px] cursor-default overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${role.iconColor} shadow-inner`}>
                {role.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">
                {role.name}
              </h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {role.desc}
              </p>
            </div>

            {/* Corner Accent */}
            <div className="absolute top-4 right-4 text-white/5 group-hover:text-primary/20 transition-colors duration-500">
               <Cpu size={20} />
            </div>
            
            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
      </div>
      
      {/* Footer support text */}
      <div className="mt-16 flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
         <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
            <Terminal size={16} /> Backend
         </div>
         <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
            <LineChart size={16} /> Analytics
         </div>
         <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
            <Layers size={16} /> Devops
         </div>
      </div>
    </section>
  );
};

export default Roles;
