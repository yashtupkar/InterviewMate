import React from "react";
import { FiAlertTriangle } from "react-icons/fi";
import UniversalPopup from "../common/UniversalPopup";
import { IoAlertCircleSharp } from "react-icons/io5";

const CustomInterviewConfirmEndModal = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <UniversalPopup
      isOpen={isOpen}
      onClose={onCancel}
      maxWidth="max-w-md"
      showClose={false}
      padding="p-5 sm:px-6 sm:py-10"
      overlayClassName="p-3 sm:p-4"
    >
      <div className="text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-4 sm:mb-4 shadow-lg relative">
          <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl" />
          <IoAlertCircleSharp
            className="text-orange-400 relative z-10"
            size={36}
          />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
          End Interview?
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mb-6 font-medium leading-relaxed">
          Are you sure you want to end this interview now? The current session
          will be concluded immediately.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 text-xs sm:text-sm"
          >
            Yes, End Interview
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-xl transition-all border border-zinc-700 active:scale-95 text-xs sm:text-sm"
          >
            Continue Interview
          </button>
        </div>
      </div>
    </UniversalPopup>
  );
};

export default CustomInterviewConfirmEndModal;
