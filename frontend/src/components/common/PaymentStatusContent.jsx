import React, { useEffect, useState, useMemo } from 'react';
import { 
    FiCheck, 
    FiX, 
    FiLoader, 
    FiCreditCard, 
    FiShield, 
    FiAward,
    FiPrinter,
    FiCheckCircle
} from 'react-icons/fi';
import { useUser } from '@clerk/clerk-react';
import { generateInvoicePDF } from '../../utils/InvoiceGenerator';

const PaymentStatusContent = ({
    tier,
    status = 'success',
    planId,
    onClose,
    isModal = false,
    resultData = null // Pass the actual Razorpay result if available
}) => {
    const { user } = useUser();
    const [verifying, setVerifying] = useState(true);

    // Format date like "21 May, 2025"
    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Mock/Real transaction data
    const transactionData = useMemo(() => {
        const base = {
            refId: resultData?.razorpayPaymentId || resultData?.razorpay_payment_id || "Processing...",
            transId: resultData?.razorpayOrderId || resultData?.razorpay_order_id || "Processing...",
            // Add explicitly for InvoiceGenerator
            razorpayPaymentId: resultData?.razorpayPaymentId || resultData?.razorpay_payment_id,
            razorpayOrderId: resultData?.razorpayOrderId || resultData?.razorpay_order_id,
            invoiceId: resultData?.invoiceId || "INV-" + Math.floor(100000 + Math.random() * 900000).toString(),
            time: new Date().toLocaleString('en-US', { 
                hour: 'numeric', 
                minute: 'numeric', 
                hour12: true,
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            effectiveFrom: formatDate(new Date()),
            effectiveTo: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            // Amount in paise for the generator
            amount: resultData?.amount || (planId?.includes('student_flash') ? 19900 : planId?.includes('placement_pro') ? 49900 : planId?.includes('infinite_elite') ? 89900 : 4900),
            planId: planId,
            planName: tier || (planId?.includes('boost') ? 'Quick Boost' : 'Premium Plan'),
            currency: 'INR'
        };
        return base;
    }, [planId, resultData, tier]);

    useEffect(() => {
        setVerifying(true);
        const timer = setTimeout(() => {
            setVerifying(false);
        }, 2200);
        return () => clearTimeout(timer);
    }, [status]);

    const isSuccess = status === 'success';
    const isTopup = planId?.startsWith('topup_') || ['quick_boost', 'power_pack', 'pro_master', 'student_test'].includes(planId);

    const handleDownload = async () => {
        try {
            await generateInvoicePDF(transactionData, user);
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    if (verifying) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-[#bef264]/10 animate-ping absolute inset-0"></div>
                    <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center relative z-10">
                        <FiLoader className="w-8 h-8 text-[#bef264] animate-spin" />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white mb-2 tracking-tight uppercase tracking-[0.2em]">Verifying</h2>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Confirming with secure gateway...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
            {/* Status Header */}
            <div className="mb-10 text-center">
                <div className="inline-block relative mb-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center relative z-10 shadow-2xl transition-all duration-700
                        ${isSuccess ? 'bg-gradient-to-br from-[#bef264] to-[#a3e635] text-black shadow-[#bef264]/30' : 'bg-red-500 text-white shadow-red-500/30'}`}>
                        {isSuccess ? <FiCheck className="w-10 h-10" /> : <FiX className="w-10 h-10" />}
                    </div>
                    <div className={`absolute -inset-2 rounded-full blur-xl opacity-20 ${isSuccess ? 'bg-[#bef264]' : 'bg-red-500'}`}></div>
                </div>
                
                <h1 className="text-2xl font-black text-white mb-2 tracking-tight uppercase tracking-[0.1em]">
                    {isSuccess ? 'Payment Successful' : 'Payment Failed'}
                </h1>
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] px-4">
                    {isSuccess 
                        ? `Receipt for ${transactionData.planName}`
                        : 'Please try again later or contact support.'}
                </p>
            </div>

            {/* Minimal Receipt Card */}
            <div className="w-full bg-[#121214] border border-white/5 rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 relative">
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${isSuccess ? 'bg-gradient-to-r from-[#bef264] to-transparent' : 'bg-red-500'}`}></div>
                
                <div className="p-5 space-y-6">
                    {/* Main Amount & Plan */}
                    <div className="text-center">
                        <div className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-2">Total Amount Paid</div>
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">
                             ₹{transactionData.amount / 100}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 rounded-full border border-white/10">
                            <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-[#bef264]' : 'bg-red-500'}`}></span>
                            <span className="text-[8px] text-zinc-400 font-black uppercase tracking-widest leading-none">
                                {isSuccess ? 'Success' : 'Failed'}
                            </span>
                        </div>
                    </div>

                    {/* Concise Details Block */}
                    <div className="grid grid-cols-2 gap-y-4 pt-3 border-t border-white/5">
                        <div className="space-y-0.5">
                            <div className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.2em]">Plan</div>
                            <div className="text-[14px] text-white font-bold">{transactionData.planName}</div>
                        </div>
                        <div className="space-y-0.5 text-right">
                            <div className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.2em]">Reference ID</div>
                            <div className="text-[14px] text-white font-bold tracking-tight">{transactionData.refId}</div>
                        </div>
                        <div className="col-span-2 space-y-0.5">
                            <div className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.2em]">Transaction Date</div>
                            <div className="text-[14px] text-white font-bold">{transactionData.time}</div>
                        </div>
                    </div>

                    {/* Action Button (Seamless) */}
                    {isSuccess && (
                        <div className="pt-1">
                            <button 
                                onClick={handleDownload}
                                className="w-full py-3.5 bg-[#bef264] hover:bg-[#a3e635] text-black rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-lg shadow-[#bef264]/10"
                            >
                                <FiPrinter className="w-3.5 h-3.5" /> 
                                Download Invoice
                            </button>
                        </div>
                    )}
                </div>

                {/* Secure Badge */}
                <div className="px-6 py-2.5 bg-zinc-900/50 border-t border-white/5 flex items-center justify-center gap-2">
                    <FiShield className="w-3 h-3 text-zinc-600" />
                    <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Secure Bank-Grade Payment</span>
                </div>
            </div>
            
            {/* Close / Return Action */}
            {onClose && (
                <button 
                    onClick={onClose}
                    className="mt-8 text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em] hover:text-white transition-colors"
                >
                    Return to Dashboard
                </button>
            )}
        </div>
    );

};

export default PaymentStatusContent;
