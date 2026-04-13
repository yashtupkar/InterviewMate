import React from "react";
import { FiAlertTriangle, FiRotateCcw } from "react-icons/fi";

const ReloadSessionPrompt = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-primary/30 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3 bg-primary px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black/10">
            <FiAlertTriangle className="text-black" size={20} />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight text-black">
              Reload interview?
            </h3>
            <p className="mt-0.5 text-[11px] font-semibold text-black/70">
              This session will reset if you continue.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-relaxed text-zinc-300">
            If you reload, your live interview session will reset and the current call state may be lost.
            Only continue if you are sure you want to restart from scratch.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onConfirm}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-black transition-all hover:brightness-110 active:scale-[0.99]"
            >
              <FiRotateCcw size={16} />
              Confirm Reload
            </button>
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.99]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReloadSessionPrompt;