import React, { useState, useEffect } from "react";
import { FiX, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const TopBanner = ({
  message = "Welcome to PlaceMateAI beta!",
  linkText = "Learn More",
  linkTo = "/",
  onClose,
  storageKey = "topBannerDismissed",
  type = "info", // "info", "success", "warning"
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(storageKey);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, [storageKey]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, "true");
    if (onClose) onClose();
  };

  const bgColorMap = {
    info: "bg-[#bef264]", // match brand primary color
    success: "bg-green-500",
    warning: "bg-yellow-500",
  };

  const textColorMap = {
    info: "text-black",
    success: "text-white",
    warning: "text-black",
  };

  return (
    <div
      className={`w-full py-2 px-4 flex items-center justify-between relative z-[110] transition-all duration-300 ${
        bgColorMap[type] || bgColorMap.info
      } ${textColorMap[type] || textColorMap.info}`}
    >
      <div className="flex-1 flex justify-center items-center gap-2 text-sm font-semibold">
        <span>{message}</span>
        {linkTo && (
          <Link
            to={linkTo}
            className="flex items-center gap-1 hover:underline underline-offset-2 opacity-90 hover:opacity-100 transition-opacity"
          >
            {linkText}
            <FiArrowRight size={14} />
          </Link>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 rounded-full hover:bg-black/10 transition-colors absolute right-4"
        aria-label="Dismiss banner"
      >
        <FiX size={16} />
      </button>
    </div>
  );
};

export default TopBanner;
