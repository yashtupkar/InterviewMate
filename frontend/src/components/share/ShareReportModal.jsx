import React, { useRef, useState, useEffect } from "react";
import { FiX, FiDownload, FiShare2 } from "react-icons/fi";
import ShareCard from "./ShareCard";
import CaptionEditor from "./CaptionEditor";
import PlatformShareGrid from "./PlatformShareGrid";
import {
  buildCaption,
  getShareUrl,
  downloadShareImage,
} from "../../hooks/useShareReport";

/**
 * ShareReportModal
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - type: "interview" | "gd"
 *  - score: number
 *  - role?: string        (interview)
 *  - topic?: string       (gd)
 *  - scoreBreakdown: Record<string, number>
 *  - sessionId: string
 *  - date?: string
 */
const ShareReportModal = ({
  isOpen,
  onClose,
  type,
  score,
  role,
  topic,
  scoreBreakdown,
  sessionId,
  date,
}) => {
  // cardRef points to the hidden off-screen card — no CSS transforms applied
  const cardRef = useRef(null);
  const subject = type === "interview" ? role || "Mock Interview" : topic || "Group Discussion";
  const shareUrl = sessionId ? getShareUrl(type, sessionId) : "";
  const [caption, setCaption] = useState("");
  const [toast, setToast] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Initialise caption when modal opens
  useEffect(() => {
    if (isOpen) {
      setCaption(buildCaption(type, score, role || topic, shareUrl, "professional"));
    }
  }, [isOpen, type, score, role, topic, shareUrl]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleShared = (platformLabel, wasCopied) => {
    if (wasCopied) showToast("Link copied to clipboard!");
    else showToast(`Opened in ${platformLabel}`);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await downloadShareImage(cardRef, `placemate-${type}-${score}.png`);
    setIsDownloading(false);
    showToast("Image downloaded!");
  };

  const cardProps = { type, score, role, topic, scoreBreakdown, sessionId, date };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/*
       * Hidden off-screen card — NO CSS scale transform.
       * html2canvas reads this element to produce a clean 600×315 PNG.
       */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: "-9999px",
          width: 600,
          height: 315,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <ShareCard ref={cardRef} {...cardProps} />
      </div>

      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl animate-fade">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FiShare2 size={16} className="text-[#bef264]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bef264]">
                Share Achievement
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Share Your Report
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5 font-medium">
              Like LeetCode's achievement sharing — show off your progress!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-zinc-400 hover:text-white flex-shrink-0"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left — Card preview + download */}
          <div className="flex flex-col gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
              Preview
            </div>

            {/*
             * Visual-only scaled preview — separate ShareCard instance with NO ref.
             * CSS scale transform is applied here for display only; never touched by html2canvas.
             */}
            <div className="w-full rounded-2xl overflow-hidden border border-white/5 bg-black/20">
              <div
                style={{
                  width: "100%",
                  paddingTop: `${(315 / 600) * 100}%`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 600,
                    height: 315,
                    transform: "scale(var(--card-scale, 1))",
                    transformOrigin: "top left",
                  }}
                  ref={(el) => {
                    if (el) {
                      const scale = el.parentElement.offsetWidth / 600;
                      el.style.setProperty("--card-scale", scale);
                    }
                  }}
                >
                  <ShareCard {...cardProps} />
                </div>
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-sm font-black text-zinc-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              {isDownloading ? (
                <div className="w-4 h-4 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
              ) : (
                <FiDownload size={16} />
              )}
              {isDownloading ? "Generating…" : "Download Image"}
            </button>

            {/* URL chip */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-500 font-mono break-all">
              <span className="text-[#bef264] flex-shrink-0 font-black text-[10px] uppercase tracking-wider">Link</span>
              <span className="truncate">{shareUrl}</span>
            </div>
          </div>

          {/* Right — Caption + platforms */}
          <div className="flex flex-col gap-5">
            {/* Caption */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                Caption
              </div>
              <CaptionEditor
                caption={caption}
                setCaption={setCaption}
                score={score}
                subject={subject}
                shareUrl={shareUrl}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Platforms */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                Share On
              </div>
              <PlatformShareGrid
                caption={caption}
                shareUrl={shareUrl}
                cardRef={cardRef}
                onShared={handleShared}
              />
            </div>

            {/* Instagram note */}
            <p className="text-[10px] text-zinc-600 font-medium leading-relaxed">
              💡 <strong className="text-zinc-500">Instagram tip:</strong> Download the image, then upload it manually. On compatible mobile devices, the native share sheet will open automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-[#1a1a1a] border border-[#bef264]/30 text-[#bef264] text-sm font-black shadow-2xl shadow-black/50 animate-fade z-[60] flex items-center gap-2">
          <span>✓</span> {toast}
        </div>
      )}
    </div>
  );
};

export default ShareReportModal;
