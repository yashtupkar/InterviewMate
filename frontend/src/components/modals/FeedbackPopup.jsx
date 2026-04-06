import React, { useState } from 'react';
import UniversalPopup from '../common/UniversalPopup';
import { FiStar, FiSend, FiLoader } from 'react-icons/fi';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Example usage of UniversalPopup for a Feedback Form
 */
const FeedbackPopup = ({ isOpen, onClose }) => {
    const { getToken } = useAuth();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;
        
        setIsSubmitting(true);
        try {
            const token = await getToken();
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/feedback`, 
                { rating, feedback },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            toast.success('Thank you for your feedback!');
            onClose();
            // Reset form
            setRating(0);
            setFeedback('');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <>
            <button 
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
                Cancel
            </button>
            <button 
                onClick={handleSubmit}
                className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_10px_20px_rgba(190,242,100,0.15)]
                    ${rating > 0 && !isSubmitting
                        ? 'bg-[#bef264] text-black hover:bg-[#d9ff96]' 
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'}`}
                disabled={rating === 0 || isSubmitting}
            >
                {isSubmitting ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                    <FiSend className="w-4 h-4" />
                )}
                {isSubmitting ? 'Sending...' : 'Send'}
            </button>
        </>
    );

    return (
        <UniversalPopup 
            isOpen={isOpen} 
            onClose={onClose}
            title="Your feedback matters"
            description="We would love to hear your thoughts, suggestions, and feedback."
            footer={footer}
            maxWidth="max-w-lg"
        >
            <div className="space-y-2 py-2">
                {/* Textarea Area */}
                <div className="relative group">
                    <textarea 
                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-[#bef264]/60  transition-all min-h-[120px] resize-none text-[15px] font-medium custom-scrollbar"
                        placeholder="Your thoughts..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                    <div className="absolute top-6 right-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-800 pointer-events-none group-focus-within:text-[#bef264]/30 transition-colors">
                        Optional
                    </div>
                </div>

                {/* Star Rating */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                                key={star}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                                className={`p-2 transition-all duration-300 transform 
                                    ${(hover || rating) >= star ? 'text-[#bef264]' : 'text-zinc-800'}`}
                            >
                                <FiStar 
                                    className={`w-8 h-8 transition-all duration-500 
                                        ${(hover || rating) >= star ? 'fill-current ' : 'fill-none'}`} 
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#bef264]/60 animate-fade-in">
                            {['Poor', 'Fair', 'Good', 'Great', 'Awesome!'][rating - 1]}
                        </p>
                    )}
                </div>
            </div>
        </UniversalPopup>
    );
};

export default FeedbackPopup;
