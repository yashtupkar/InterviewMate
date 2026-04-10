import React from "react";
import UniversalPopup from "../common/UniversalPopup";
import { FiCheckCircle, FiArrowRight, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const GDEndedOverlay = ({ sessionEnded, sessionId }) => {
  const navigate = useNavigate();

  return (
    <UniversalPopup
      isOpen={sessionEnded}
      onClose={() => {}}
      maxWidth="max-w-sm"
      showClose={false}
      padding="p-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[#bef264]/10 border border-[#bef264]/30 flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
          <div className="absolute inset-0 bg-[#bef264]/10 rounded-full blur-xl" />
          <FiCheckCircle className="text-[#bef264] drop-shadow-md relative z-10" size={28} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
          GD is <span className="text-[#bef264] italic">Concluded!</span>
        </h2>
        <p className="text-zinc-400 text-sm mb-6 font-medium leading-relaxed">
          Your group discussion has ended successfully. Review your performance analysis now.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(`/gd/result/${sessionId}`)}
            className="w-full bg-[#bef264] hover:bg-[#bef264]/90 text-black font-black py-3 px-4 rounded-xl transition-all shadow-xl shadow-[#bef264]/20 active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            View Performance Analysis
            <FiArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate(`/dashboard/reports`)}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-xl transition-all border border-zinc-700 active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            <FiLogOut size={16} />
            Exit to Reports
          </button>
        </div>
      </div>
    </UniversalPopup>
  );
};

export default GDEndedOverlay;
