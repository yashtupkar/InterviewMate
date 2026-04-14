import React from "react";
import UniversalPopup from "./UniversalPopup";
import { X } from "lucide-react";

const AIUpgradePopup = ({ isOpen, onClose }) => {
  return (
    <UniversalPopup
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      className="!bg-zinc-900 !border-zinc-800 !rounded-[2rem] shadow-2xl relative overflow-hidden"
      showClose={false}
      padding="p-0"
    >
      <div className="p-8 flex flex-col items-start relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black text-white mb-4 tracking-tight">
          AI Writing Features
        </h2>

        <p className="text-zinc-400 text-base font-medium mb-10 leading-relaxed text-left">
          Get help with writing suggestions, rewrites, and grammar corrections.
          This feature is available on paid plans.
        </p>

        <button
          className="bg-lime-400 hover:bg-lime-500 text-zinc-950 px-8 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_10px_30px_rgba(190,242,100,0.1)]"
          onClick={() => (window.location.href = "/pricing")}
        >
          Upgrade Plan
          <span className="text-lg">🚀</span>
        </button>
      </div>
    </UniversalPopup>
  );
};

export default AIUpgradePopup;
