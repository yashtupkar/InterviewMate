import React, { useState } from "react";
import UniversalPopup from "../common/UniversalPopup";
import { FiStar, FiSend, FiLoader } from "react-icons/fi";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";

/**
 * Example usage of UniversalPopup for a Feedback Form
 */
const FeedbackPopup = ({ isOpen, onClose }) => {
  const { getToken } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      const token = await getToken();
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/feedback`,
        { rating, feedback },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Thank you for your feedback!");
      onClose();
      // Reset form
      setRating(0);
      setFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit feedback. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex w-full flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">
      <button
        onClick={onClose}
        disabled={isSubmitting}
        className="w-full sm:w-auto px-4 sm:px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 border border-white/5 rounded-2xl"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        className={`w-full sm:w-auto px-5 sm:px-7 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.18em] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(190,242,100,0.15)]
                    ${
                      rating > 0 && !isSubmitting
                        ? "bg-[#bef264] text-black hover:bg-[#d9ff96]"
                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50"
                    }`}
        disabled={rating === 0 || isSubmitting}
      >
        {isSubmitting ? (
          <FiLoader className="w-4 h-4 animate-spin" />
        ) : (
          <FiSend className="w-4 h-4" />
        )}
        {isSubmitting ? "Sending..." : "Send"}
      </button>
    </div>
  );

  return (
    <UniversalPopup
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="block text-xl sm:text-2xl leading-tight">
          Your feedback matters
        </span>
      }
      description={
        <span className="block text-[11px] sm:text-sm leading-relaxed max-w-sm">
          We would love to hear your thoughts and suggestions.
        </span>
      }
      footer={footer}
      maxWidth="max-w-md"
      padding="p-4 sm:p-6"
    >
      <div className="space-y-2.5 py-0.5 sm:py-1">
        {/* Textarea Area */}
        <div className="relative group">
          <textarea
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-3 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-[#bef264]/60 transition-all min-h-[96px] sm:min-h-[120px] resize-none text-[13px] sm:text-[15px] font-medium custom-scrollbar"
            placeholder="Your thoughts..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="absolute top-3 right-3 sm:top-5 sm:right-6 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-800 pointer-events-none group-focus-within:text-[#bef264]/30 transition-colors">
            Optional
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-3">
          <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className={`p-0.5 sm:p-1 transition-all duration-300 transform 
                                    ${(hover || rating) >= star ? "text-[#bef264]" : "text-zinc-800"}`}
              >
                <FiStar
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500 
                                        ${(hover || rating) >= star ? "fill-current " : "fill-none"}`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.24em] text-[#bef264]/60 animate-fade-in text-center">
              {["Poor", "Fair", "Good", "Great", "Awesome!"][rating - 1]}
            </p>
          )}
        </div>
      </div>
    </UniversalPopup>
  );
};

export default FeedbackPopup;
