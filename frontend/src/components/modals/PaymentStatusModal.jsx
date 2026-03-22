import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiZap, FiArrowRight, FiPlus, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const PaymentStatusModal = ({ 
    isOpen, 
    onClose, 
    tier, 
    status = 'success', 
    planId 
}) => {
    const navigate = useNavigate();
    const [animationTrigger, setAnimationTrigger] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setAnimationTrigger(true), 100);
        } else {
            setAnimationTrigger(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isSuccess = status === 'success';
    const isRefunded = status === 'refunded';
    const isTopup = planId?.startsWith('topup_');

    const getTitle = () => {
        if (isRefunded) return "Refund Initiated";
        if (isSuccess) {
            if (isTopup) return "Credits Loaded! 🚀";
            if (tier === 'Infinite Elite') return "Welcome to the Elite 💎";
            if (tier === 'Placement Pro') return "Welcome to the Pro Club 🎖️";
            if (tier === 'Student Flash') return "Welcome aboard! ⛵";
            return "Welcome to the Pro Club! 🎉";
        }
        return "Payment Failed";
    };

    const getDescription = () => {
        if (isRefunded) return "Your refund request has been received. Your status will update shortly.";
        if (isSuccess) {
            if (isTopup) return "Your new credits are ready for use. Go crush that next session!";
            return `You've successfully unlocked the ${tier} tier. Your account has been upgraded and all premium features are now active.`;
        }
        return "We couldn't process your payment. Please double-check your method and try again.";
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl transition-all duration-500 overflow-hidden">
            {/* 👑 Celebration Glows */}
            {isSuccess && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#bef264]/5 rounded-full blur-[120px] animate-pulse"></div>
                    {/* Floating Glow Orbs */}
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#bef264]/10 blur-3xl animate-bounce-slow"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-[#bef264]/5 blur-3xl animate-bounce-slow" style={{ animationDelay: '2s' }}></div>
                </div>
            )}

            <div className={`
                relative bg-zinc-900 border border-white/10 rounded-[2.5rem] p-4 max-w-sm w-full shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] 
                transition-all duration-700 transform flex flex-col items-center overflow-hidden
                ${animationTrigger ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-90 opacity-0'}
            `}>
                {/* 🎖️ Central Illustration (The "Medal") */}
                <div className="relative mt-10 mb-8 flex items-center justify-center">
                    {/* Outer Rings */}
                    <div className={`
                        absolute w-44 h-44 rounded-full border-2 border-[#bef264]/10 scale-[1.2] transition-transform duration-1000
                        ${animationTrigger ? 'scale-[1.3] opacity-50' : 'scale-0 opacity-0'}
                    `}></div>
                    <div className={`
                        absolute w-44 h-44 rounded-full border border-[#bef264]/20 scale-[1.1] animate-ping-slow opacity-20
                    `}></div>
                    
                    {/* Main Medal Body */}
                    <div className={`
                        relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-700 
                        ${animationTrigger ? 'scale-100' : 'scale-0'}
                        ${isSuccess ? 'bg-gradient-to-br from-[#bef264] to-[#84cc16] shadow-[0_0_60px_rgba(190,242,100,0.3)]' : 'bg-red-500'}
                    `}>
                        {/* Shine Effect */}
                        <div className="absolute inset-2 border-2 border-white/20 rounded-full"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full"></div>
                        
                        {/* The Large Checkmark */}
                        {isSuccess ? (
                            <FiCheckCircle className="w-16 h-16 text-black drop-shadow-lg" />
                        ) : (
                            <FiXCircle className="w-16 h-16 text-white drop-shadow-lg" />
                        )}
                    </div>
                </div>

                {/* 📝 Text Content */}
                <div className="px-6 pb-6 text-center">
                    <h2 className={`
                        text-2xl font-black mb-3 text-white tracking-tight transition-all duration-700 delay-300
                        ${animationTrigger ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                    `}>
                        {getTitle()}
                    </h2>
                    
                    <p className={`
                        text-zinc-500 text-sm font-bold leading-relaxed mb-10 transition-all duration-700 delay-500
                        ${animationTrigger ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                    `}>
                        {getDescription()}
                    </p>

                    <div className={`
                        w-full transition-all duration-700 delay-700 pt-6 border-t border-white/5
                        ${animationTrigger ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                    `}>
                        <button
                            onClick={() => {
                                onClose();
                                if (isSuccess) navigate('/dashboard');
                            }}
                            className={`
                                w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300
                                ${isSuccess ? 'text-[#bef264] hover:text-[#d9ff96]' : 'text-zinc-500 hover:text-white'}
                            `}
                        >
                            {isSuccess ? 'Got it, Thanks!' : 'Go Back'}
                            <div className="h-0.5 w-12 mx-auto mt-1 bg-current opacity-30"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatusModal;
