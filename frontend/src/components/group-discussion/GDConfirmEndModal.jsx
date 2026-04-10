import React from "react";
import UniversalPopup from "../common/UniversalPopup";
import { FiAlertTriangle } from "react-icons/fi";

const GDConfirmEndModal = ({ showEndConfirm, confirmEndSession, cancelEndSession }) => {
  return (
    <UniversalPopup
      isOpen={showEndConfirm}
      onClose={cancelEndSession}
      maxWidth="max-w-sm"
      showClose={false}
      padding="p-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg relative">
          <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl" />
          <FiAlertTriangle className="text-orange-400 relative z-10" size={28} />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
          Conclude Discussion?
        </h2>
        <p className="text-zinc-400 text-sm mb-6 font-medium leading-relaxed">
          Are you sure you want to end the group discussion now? This will stop all current activity and generate your report.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={confirmEndSession}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 text-sm"
          >
            Yes, Conclude Now
          </button>
          <button
            onClick={cancelEndSession}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-xl transition-all border border-zinc-700 active:scale-95 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </UniversalPopup>
  );
};

export default GDConfirmEndModal;
