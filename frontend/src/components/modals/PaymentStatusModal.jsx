import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import UniversalPopup from '../common/UniversalPopup';

const PaymentStatusModal = ({
    isOpen,
    onClose,
    tier,
    status = 'success',
    planId
}) => {
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setVerifying(true);
            // Simulate a brief verification and UI buffer
            const timer = setTimeout(() => {
                setVerifying(false);
            }, 1800);
            return () => clearTimeout(timer);
        }
    }, [isOpen, status]);

    if (!isOpen) return null;

    const isSuccess = status === 'success';
    const isRefunded = status === 'refunded';
    const isTopup = planId?.startsWith('topup_') || ['quick_boost', 'power_pack', 'pro_master'].includes(planId);

    const getTitle = () => {
        if (verifying) return "Verifying Payment...";
        if (isRefunded) return "Refund Initiated";
        if (isSuccess) {
            if (isTopup) return "Credits Loaded! 🚀";
            if (tier === 'Infinite Elite') return "Welcome to the Elite 💎";
            if (tier === 'Placement Pro') return "Welcome to the Pro Club 🎖️";
            if (tier === 'Student Flash') return "Welcome aboard! ⛵";
            return "Payment Successful! 🎉";
        }
        return "Payment Failed";
    };

    const getDescription = () => {
        if (verifying) return "Please wait while we confirm your transaction securely.";
        if (isRefunded) return "Your refund request has been received. Your status will update shortly.";
        if (isSuccess) {
            if (isTopup) return "Your new credits are ready for use. Go crush that next session!";
            return `You've successfully unlocked the ${tier} tier. Your account has been upgraded and all premium features are now active.`;
        }
        return "We couldn't process your payment. Please double-check your method and try again.";
    };

    return (
        <UniversalPopup
            isOpen={isOpen}
            onClose={() => {
                if (!verifying) {
                    onClose();
                    if (isSuccess && !isRefunded && !isTopup) {
                        if (window.location.pathname !== '/dashboard') {
                            window.location.href = '/dashboard';
                        } else {
                            window.location.reload();
                        }
                    }
                }
            }}
            maxWidth="max-w-sm"
            padding="p-0"
            showClose={!verifying}
        >
            {/* 👑 Celebration Glows */}
            {!verifying && isSuccess && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#bef264]/10 rounded-full blur-[80px] animate-pulse"></div>
                </div>
            )}

            <div className={`relative px-6 pt-12 pb-6 flex flex-col items-center overflow-hidden transition-all duration-500`}>
                {/* 🎖️ Central Illustration (The "Medal") */}
                <div className="relative mb-8 flex items-center justify-center">
                    {/* Outer Rings */}
                    {!verifying && (
                        <>
                            <div className="absolute w-40 h-40 rounded-full border-2 border-[#bef264]/10 scale-[1.2] animate-pulse"></div>
                            <div className="absolute w-40 h-40 rounded-full border border-[#bef264]/20 scale-[1.1] animate-ping-slow opacity-20"></div>
                        </>
                    )}

                    {/* Main Medal Body */}
                    <div className={`
                        relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 z-10
                        ${verifying ? 'bg-zinc-800 border border-white/10' : (isSuccess ? 'bg-gradient-to-br from-[#bef264] to-[#84cc16] shadow-[0_0_60px_rgba(190,242,100,0.3)] scale-100' : 'bg-red-500 scale-100 shadow-[0_0_60px_rgba(239,68,68,0.3)]')}
                    `}>
                        {/* Shine Effect (Only for success/fail) */}
                        {!verifying && (
                            <>
                                <div className="absolute inset-2 border-2 border-white/20 rounded-full"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full"></div>
                            </>
                        )}

                        {/* Icon */}
                        {verifying ? (
                            <FiLoader className="w-12 h-12 text-[#bef264] animate-spin" />
                        ) : isSuccess ? (
                            <FiCheckCircle className="w-14 h-14 text-black drop-shadow-lg animate-bounce" />
                        ) : (
                            <FiXCircle className="w-14 h-14 text-white drop-shadow-lg animate-pulse" />
                        )}
                    </div>
                </div>

                {/* 📝 Text Content */}
                <div className="w-full text-center z-10 relative">
                    <h2 className={`
                        text-2xl font-black mb-2 text-white tracking-tight transition-all duration-500
                    `}>
                        {getTitle()}
                    </h2>

                    <p className={`
                        text-zinc-500 text-sm font-bold leading-relaxed transition-all duration-500
                        ${verifying ? 'mb-2' : 'mb-6'}
                    `}>
                        {getDescription()}
                    </p>

                    <div className={`
                        w-full transition-all duration-500 overflow-hidden
                        ${verifying ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100 pt-6 border-t border-white/5 mt-6'}
                    `}>
                        <button
                            onClick={() => {
                                onClose();
                                if (isSuccess) {
                                    if (window.location.pathname !== '/dashboard') {
                                        window.location.href = '/dashboard';
                                    } else {
                                        window.location.reload();
                                    }
                                }
                            }}
                            className={`
                                w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-xl
                                ${isSuccess ? 'bg-[#bef264]/10 text-[#bef264] hover:bg-[#bef264]/20 hover:text-[#d9ff96]' : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'}
                            `}
                        >
                            {isSuccess ? 'Got it, Thanks!' : 'Go Back'}
                        </button>
                    </div>
                </div>
            </div>
        </UniversalPopup>
    );
};

export default PaymentStatusModal;
