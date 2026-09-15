import React, { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

const ReusableModal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  showCloseButton = true,
  closeOnOutsideClick = true,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidth} bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden mx-4 animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            {title ? (
              <h3 className="text-lg font-bold text-white tracking-tight">
                {title}
              </h3>
            ) : (
              <div /> // Spacer if no title but close button exists
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default ReusableModal;
