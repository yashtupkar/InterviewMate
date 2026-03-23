import React from "react";
import { FiShare2 } from "react-icons/fi";

/**
 * ShareReportButton — small trigger button, drop it anywhere in a result page.
 *
 * Props:
 *  - onClick: () => void
 *  - className?: string   (extra classes for positioning)
 */
const ShareReportButton = ({ onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#bef264]/30 text-sm font-black text-zinc-300 hover:text-white transition-all active:scale-95 shadow-lg group ${className}`}
  >
    <FiShare2
      size={16}
      className="text-[#bef264] group-hover:scale-110 transition-transform"
    />
    Share Achievement
  </button>
);

export default ShareReportButton;
