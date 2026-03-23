import React from 'react';
import UniversalPopup from '../common/UniversalPopup';
import { FiStar, FiHeart, FiCheckCircle } from 'react-icons/fi';

/**
 * Example usage of UniversalPopup for a Welcome/Onboarding message
 */
const WelcomePopup = ({ isOpen, onClose, userName = 'there' }) => {
    const footer = (
        <button 
            onClick={onClose}
            className="w-full py-4 text-xs font-black uppercase tracking-[0.3em] text-[#bef264] hover:text-white transition-all transform hover:scale-105 active:scale-95 border-t border-white/5 pt-8 mt-4"
        >
            Let's Get Started
        </button>
    );

    return (
        <UniversalPopup 
            isOpen={isOpen} 
            onClose={onClose}
            footer={footer}
            maxWidth="max-w-md"
            className="text-center"
        >
            <div className="flex flex-col items-center py-2">
                {/* Visual element */}
                <div className="relative mb-4">
                    <div className="absolute inset-0 bg-[#bef264]/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl rotate-3 transform hover:rotate-0 transition-transform duration-500">
                        <FiHeart className="w-10 h-10 text-[#bef264] fill-[#bef264]/10" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">
                    Welcome to <br />
                    PlaceMate<span className="text-[#bef264]">AI</span> PRO
                </h2>
                
                <p className="text-zinc-500 font-medium leading-relaxed mb-8 max-w-[280px] mx-auto">
                    We're thrilled to have you here, <span className="text-white capitalize">{userName}</span>! Ready to master your next interview?
                </p>

                {/* Micro-features list */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
                    {[
                        'AI Feedback',
                        'Real-time GD',
                        'Voice Analysis',
                        'Skill Matrix'
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <FiCheckCircle className="w-3 h-3 text-[#bef264]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </UniversalPopup>
    );
};

export default WelcomePopup;
