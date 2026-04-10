import React from "react";
import { FiInfo } from "react-icons/fi";

const GDTopicContext = ({ description }) => {
  return (
    <div className="hidden lg:block dark:bg-zinc-900/80 bg-white/90 p-6 rounded-2xl border dark:border-white/5 border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#bef264]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
      
      <h3 className="text-[11px] font-black dark:text-white text-black mb-4 flex items-center uppercase tracking-widest relative z-10">
        <FiInfo className="mr-3 text-[#bef264] text-lg drop-shadow-md" /> Topic
        Context
      </h3>
      <p className="text-[14px] dark:text-zinc-400 text-gray-500 leading-relaxed font-medium relative z-10">
        {description ||
          "Contribute your points precisely. Agents will react to your tone and logic. The session will automatically conclude after 10 minutes or when you signal a wrap-up."}
      </p>
    </div>
  );
};

export default GDTopicContext;
