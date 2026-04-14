import React from "react";
import { FiArrowRight, FiCheckCircle, FiLogOut } from "react-icons/fi";
import { FaCircleCheck } from "react-icons/fa6";
import UniversalPopup from "../common/UniversalPopup";

const CustomInterviewEndedModal = ({
  isOpen,
  onGenerateReport,
  onExit,
  isProcessing,
}) => {
  return (
    <UniversalPopup
      isOpen={isOpen}
      onClose={() => {}}
      maxWidth="max-w-md"
      showClose={false}
      padding="p-5 sm:px-6 sm:py-10"
      overlayClassName="p-3 sm:p-4"
    >
      <div className="text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-2xl relative">
          <FaCircleCheck className="text-primary relative z-10" size={36} />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">
          Interview Finished!
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mb-6 font-medium leading-relaxed">
          You have completed this interview session. Generate your detailed
          analysis or exit to reports.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            disabled={isProcessing}
            className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all border border-zinc-700 active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
          
            Exit
          </button>
          <button
            onClick={onGenerateReport}
            disabled={isProcessing}
            className="w-full bg-primary hover:bg-[#a3e14d] disabled:opacity-70 disabled:cursor-not-allowed text-black font-black py-3 px-4 rounded-xl transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            Generate Report
            <FiArrowRight size={16} />
          </button>
        </div>
      </div>
    </UniversalPopup>
  );
};

export default CustomInterviewEndedModal;
