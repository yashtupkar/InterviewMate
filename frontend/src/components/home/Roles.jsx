import React from 'react';
import { Code2, BriefcaseBusiness, Palette, DatabaseZap } from 'lucide-react';

const Roles = () => {
  const roles = [
    { name: "Software Eng", icon: <Code2 size={24} className="text-[#09090b]"/> },
    { name: "Product Mgmt", icon: <BriefcaseBusiness size={24} className="text-[#09090b]"/> },
    { name: "Data Science", icon: <DatabaseZap size={24} className="text-[#09090b]"/> },
    { name: "UI/UX Design", icon: <Palette size={24} className="text-[#09090b]"/> },
  ];

  return (
    <section className="py-20 px-6 max-w-5xl mx-auto flex flex-col items-center">
      <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-gray-800 bg-gray-900/50 text-xs text-primary mb-6 uppercase tracking-wider font-bold">
        Supported Roles
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
        Prepare For Any Discipline
      </h2>
      <p className="text-gray-400 text-center max-w-2xl mb-14 text-lg">
        Our AI is trained on vast datasets of real-world interviews across engineering, product, and data domains to give you accurate role-specific prep.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full">
        {roles.map((role, idx) => (
          <div key={idx} className="bg-[#121214] border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center gap-5 hover:border-primary/50 transition-colors shadow-lg group cursor-default">
            <div className="w-14 h-14 bg-gradient-to-br from-[#bef264] via-[#7cff67] to-[#00f5a0] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(190,242,100,0.2)]">
              {role.icon}
            </div>
            <span className="text-gray-200 font-bold text-sm md:text-base whitespace-nowrap text-center">{role.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Roles;
