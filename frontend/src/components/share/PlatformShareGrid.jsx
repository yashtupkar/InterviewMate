import React, { useState } from "react";
import {
  FaLinkedin,
  FaWhatsapp,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { FiLink, FiCheck } from "react-icons/fi";
import { shareToPlatform } from "../../hooks/useShareReport";

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", icon: FaLinkedin, color: "#0077b5" },
  { id: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, color: "#25d366" },
  { id: "facebook", label: "Facebook", icon: FaFacebookF, color: "#1877f2" },
  { id: "twitter", label: "Twitter / X", icon: FaTwitter, color: "#1da1f2" },
  {
    id: "instagram",
    label: "Instagram",
    icon: FaInstagram,
    color: "#e1306c",
    gradient: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
  },
  { id: "copy", label: "Copy Link", icon: FiLink, color: "#52525b" },
];

const PlatformShareGrid = ({ caption, shareUrl, cardRef, onShared }) => {
  const [doneMap, setDoneMap] = useState({});
  const [loading, setLoading] = useState(null);

  const handleShare = async (platform) => {
    setLoading(platform.id);
    try {
      const result = await shareToPlatform(platform.id, caption, shareUrl, cardRef);
      if (result) {
        setDoneMap((p) => ({ ...p, [platform.id]: true }));
        setTimeout(
          () => setDoneMap((p) => { const c = { ...p }; delete c[platform.id]; return c; }),
          3000
        );
        if (onShared) onShared(platform.label, result === "copied");
      }
    } catch (e) {
      console.error("Share error:", e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex w-full items-center gap-2 sm:gap-3">
      {PLATFORMS.map((p) => {
        const Icon = p.icon;
        const isDone = doneMap[p.id];
        const isLoading = loading === p.id;

        return (
          <button
            key={p.id}
            onClick={() => handleShare(p)}
            disabled={isLoading}
            className=" p-2 flex items-center justify-center rounded-lg transition-all active:scale-95 disabled:opacity-60 hover:scale-[1.04] text-white shadow-lg shadow-black/20"
            style={{
              background: isDone ? "#bef264" : p.gradient || p.color,
              color: isDone ? "#0f0f0f" : "#ffffff",
            }}
          >
            {isDone ? (
              <FiCheck size={18} />
            ) : isLoading ? (
              <div
                className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: `currentColor transparent transparent transparent` }}
              />
            ) : (
              <Icon size={24} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PlatformShareGrid;
