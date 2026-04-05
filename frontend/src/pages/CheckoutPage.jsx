import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiLoader, FiLock, FiShield, FiCreditCard, FiCheck } from 'react-icons/fi';
import useRazorpay from '../hooks/useRazorpay';
import toast from 'react-hot-toast';
import Background from '../components/common/Background';
import PaymentStatusContent from '../components/common/PaymentStatusContent';

const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const planId = searchParams.get('planId');
    const redirectBack = searchParams.get('redirectBack') || '/billing';
    
    // Status State
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failure' | null
    const [resultData, setResultData] = useState(null);
    const [isTriggered, setIsTriggered] = useState(false);
    
    // Use a ref to prevent multiple initiations in StrictMode
    const initiated = useRef(false);

    const { initiatePayment, isLoading: hookLoading } = useRazorpay({
        onPaymentSuccess: (data) => {
            setPaymentStatus('success');
            setResultData(data);
            setIsTriggered(false);
            // Persist success state for reloads
            if (planId) {
                sessionStorage.setItem(`checkout_success_${planId}`, JSON.stringify(data));
            }
        },
        onPaymentFailure: (err) => {
            console.error('Payment failed:', err);
            setPaymentStatus('failure');
            setIsTriggered(false);
        }
    });

    useEffect(() => {
        if (!planId) {
            toast.error('Invalid plan selected.');
            navigate(redirectBack);
            return;
        }

        // Check if we already have a success result in this session to prevent re-initiation
        const savedResult = sessionStorage.getItem(`checkout_success_${planId}`);
        if (savedResult) {
            setPaymentStatus('success');
            setResultData(JSON.parse(savedResult));
            return;
        }

        if (!initiated.current) {
            initiated.current = true;
            // Delay initiation slightly to allow UI to settle if needed, 
            // but the user wants the card to hide "when popup opens"
            setIsTriggered(true);
            initiatePayment(planId);
        }
    }, [planId, initiatePayment, navigate, redirectBack]);

    const handleDashboardRedirect = () => {
        if (planId) {
            sessionStorage.removeItem(`checkout_success_${planId}`);
        }
        navigate('/dashboard');
    };

    const getTierName = (id) => {
        if (!id) return 'Premium';
        const topupMap = {
            'quick_boost': 'Quick Boost',
            'power_pack': 'Power Pack',
            'pro_master': 'Pro Master',
            'student_test': 'Test Pack'
        };
        if (topupMap[id]) return topupMap[id];
        if (id.includes('student_flash')) return 'Student Flash';
        if (id.includes('placement_pro')) return 'Placement Pro';
        if (id.includes('infinite_elite')) return 'Infinite Elite';
        return 'Premium Plan';
    };

    const tierDisplayName = resultData?.tier || getTierName(planId);

    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background */}
            <Background />
                               
            <div className="max-w-md w-full relative z-10 px-4">
                {/* 1. Result State (Success/Failure) */}
                {paymentStatus ? (
                    <div className="space-y-8 flex flex-col items-center animate-in fade-in duration-700">
                        <PaymentStatusContent 
                            status={paymentStatus}
                            tier={tierDisplayName}
                            resultData={resultData}
                            planId={planId}
                            isModal={false}
                            onClose={handleDashboardRedirect}
                        />
                        
                    
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full">
                        {/* 2. Processing State (Shown while popup is active) */}
                        {isTriggered ? (
                             <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-500">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-2 border-[#bef264]/10 animate-ping absolute inset-0"></div>
                                    <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center relative z-10 shadow-2xl">
                                        <FiLoader className="w-10 h-10 text-[#bef264] animate-spin" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-[0.2em]">Secure Checkout</h2>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em] max-w-[280px]">
                                        Please complete your transaction in the secure payment window.
                                    </p>
                                </div>
                             </div>
                        ) : (
                            /* 3. Initializing State (Shown before initiation) */
                            <div className="w-full animate-in fade-in zoom-in-95 duration-500">
                                <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-[#bef264]/10 rounded-3xl flex items-center justify-center mb-8 relative">
                                        <div className="absolute inset-0 bg-[#bef264]/20 rounded-3xl blur-xl animate-pulse" />
                                        <FiCreditCard className="w-10 h-10 text-[#bef264] relative z-10" />
                                    </div>

                                    <h1 className="text-xl font-bold mb-3 tracking-tight text-white uppercase tracking-[0.1em]">Preparing Gateway</h1>
                                    <p className="text-zinc-500 text-xs font-bold leading-relaxed mb-10 max-w-[240px]">
                                        Please wait while we connect you to our secure payment providers.
                                    </p>

                                    <div className="w-full pt-6 border-t border-white/5">
                                        <div className="flex items-center justify-center gap-6 text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em]">
                                            <div className="flex items-center gap-2 font-bold"><FiLock className="w-3 h-3" /> SSL Secured</div>
                                            <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                            <div className="flex items-center gap-2 font-bold"><FiShield className="w-3 h-3" /> PCI Compliant</div>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate(redirectBack)}
                                    className="mt-10 text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all w-full flex items-center justify-center gap-3 group"
                                >
                                    <div className="w-8 h-[1px] bg-zinc-800 group-hover:bg-white/20 transition-all" />
                                    Cancel & Return
                                    <div className="w-8 h-[1px] bg-zinc-800 group-hover:bg-white/20 transition-all" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
