import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from "react-helmet-async";
import axios from 'axios';
import { useAuth, useUser } from "@clerk/clerk-react";
import { 
  FiZap, 
  FiPlus, 
  FiCreditCard, 
  FiActivity, 
  FiClock, 
  FiLoader, 
  FiMail, 
  FiArrowRight, 
  FiArrowLeft,
  FiAlertCircle, 
  FiRotateCcw, 
  FiPrinter, 
  FiTrash2, 
  FiAlertTriangle,
  FiFileText,
  FiDownload
} from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useRazorpay from '../hooks/useRazorpay';
import { generateInvoicePDF } from '../utils/InvoiceGenerator';
import UniversalPopup from '../components/common/UniversalPopup';
import { billingTopUps, FEATURE_COSTS } from '../constants/pricing';

const Billing = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);
    const [loadingPlanId, setLoadingPlanId] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil((subscription?.paymentHistory?.length || 0) / itemsPerPage);
    
    // ── Fetch subscription status ──────────────────────────────────────────────
    const fetchSubscription = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
           
            setSubscription(res.data);
        } catch (err) {
            console.error("Error fetching subscription:", err);
            toast.error("Failed to load subscription status.");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

    const { isLoading: paymentLoading } = useRazorpay();

    const isExpired = subscription?.planExpiry && new Date(subscription.planExpiry) < new Date();
    const isLowOnCredits = (subscription?.credits || 0) < FEATURE_COSTS.mockInterview;
    const showTopUps = (subscription?.tier !== 'Free') || isExpired || isLowOnCredits;
    const userRole = subscription?.role || 'user';

    const handleTopUpClick = (planId) => {
        setLoadingPlanId(planId);
        const redirectBack = window.location.pathname;
        navigate(`/checkout?planId=${planId}&redirectBack=${redirectBack}`);
    };

    const handleCancelSubscription = () => {
        setIsCancelModalOpen(true);
    };

    const performCancellation = async () => {
        setIsCancelModalOpen(false);
        setCancelling(true);
        try {
            const token = await getToken();
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success(res.data.message, { duration: 5000 });
                fetchSubscription();
            }
        } catch (err) {
            console.error("Error cancelling subscription:", err);
            toast.error(err.response?.data?.message || "Failed to cancel subscription.");
        } finally {
            setCancelling(false);
        }
    };

    const visibleTopups = billingTopUps.filter(t => !t.adminOnly || userRole === 'admin');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FiLoader className="w-8 h-8 text-[#bef264] animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Billing | PlaceMateAI</title>
            </Helmet>

            <div className="min-h-screen text-white py-8 px-4 md:px-8 border-l border-white/5 animate-fade-in custom-scrollbar overflow-y-auto">
                <div className="max-w-4xl mx-auto pb-16">
                    {/* Header */}
                    <div className="mb-8">
                        <span className="text-[#bef264] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">Billing</span>
                        <h1 className="text-2xl md:text-3xl  mb-2 tracking-tight">Manage Your <span className="text-[#bef264]">Subscription.</span></h1>
                        <p className="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
                            Monitor your prep economy, access premium features, and keep your credits topped up for the next big interview.
                        </p>
                    </div>

                    {/* Main Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                        {/* LEFT CARD: Plan Details */}
                        <div className="bg-white/10 border border-white/10 rounded-2xl p-5 flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
                           <div>
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-lg font-semibold">{subscription?.tier} Plan</h3>
                                    <span className="text-base font-bold text-[#bef264]">
                                        {subscription?.tier === 'Free' ? '$0' : ('₹' + (subscription?.currentPlanAmount || '0'))} <span className="text-zinc-500 text-xs font-medium">/ {subscription?.billingCycle || 'month'}</span>
                                    </span>
                                </div>
                                <p className="text-zinc-400 text-xs mb-6">
                                    {subscription?.tier === 'Free' ? 'Free for learners use up to 30 credits.' : `Reset at ${new Date(subscription.planExpiry).toLocaleDateString()}`}
                                </p>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                                        <span>{Math.round(subscription?.credits || 0)} / {subscription?.limits?.credits || 260} credits used</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-[#bef264] to-yellow-300 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(251,146,60,0.3)]"
                                            style={{ width: `${Math.min(100, ((subscription?.credits || 0) / (subscription?.limits?.credits || 200)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                           </div>
                           
                           <div className="mt-6 flex justify-end">
                                {subscription?.tier === 'Free' ? (
                                    <button 
                                        onClick={() => navigate('/pricing')}
                                        className="px-5 py-2 bg-white text-black hover:bg-[#bef264] rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md"
                                    >
                                        Upgrade
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleCancelSubscription}
                                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-500 hover:text-white rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all border border-red-500/20"
                                    >
                                        Cancel Subscription
                                    </button>
                                )}
                           </div>
                        </div>

                        {/* TOP-UP CARD (Conditional) */}
                        {subscription?.topupCredits > 0 && (
                            <div className="bg-white/10 border border-[#bef264]/30 rounded-2xl p-5 flex flex-col justify-between group hover:border-[#bef264]/50 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 px-3 py-1 bg-[#bef264] text-black text-[9px] font-bold uppercase tracking-widest rounded-bl-xl"> Active Top-up </div>
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg font-semibold">Active Top-up Pack</h3>
                                        <div className="p-1.5 bg-[#bef264]/10 rounded-lg text-[#bef264]">
                                            <FiPlus className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className="text-zinc-400 text-xs mb-6">
                                        Extra credits pool for your interview prep. No expiry.
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                                            <span>{Math.round(subscription?.topupCredits)} Credits Available</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#bef264] rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: '100%' }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                    <FiActivity className="w-3 h-3 text-[#bef264]" /> Ready to use
                                </div>
                            </div>
                        )}

                        {/* ACTION CARD: Buy/Upgrade */}
                        <div className={`bg-white/10 border border-white/10 rounded-2xl p-5 flex flex-col group hover:border-white/20 transition-all duration-300 ${subscription?.topupCredits > 0 ? 'md:col-span-2' : ''}`}>
                            {subscription?.tier === 'Free' ? (
                                <>
                                    <h3 className="text-lg font-semibold mb-1">Upgrade to Premium</h3>
                                    <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
                                        Unlock advanced AI features, unlimited ATS scans, and get 10x more credits for your interview prep.
                                    </p>
                                    <div className="mt-auto">
                                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#bef264]/10 rounded-lg text-[#bef264]">
                                                    <FiZap className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold">Pro Features Active?</div>
                                                    <div className="text-[10px] text-zinc-500">Upgrade to find out</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => navigate('/pricing')}
                                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold mb-1">Need more Credits?</h3>
                                    <p className="text-zinc-400 text-xs mb-4">Experience uninterrupted prep with instant top-ups.</p>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        {visibleTopups.map((item) => (
                                            <button
                                                key={item.planId}
                                                onClick={() => handleTopUpClick(item.planId)}
                                                disabled={loadingPlanId === item.planId}
                                                className="bg-white/10 border border-white/5 rounded-xl p-3 hover:border-[#bef264]/30 hover:bg-[#bef264]/5 transition-all text-left flex items-center justify-between group disabled:opacity-50"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-white/5 rounded-lg text-[#bef264]">
                                                        <FiPlus className="w-3 h-3" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-bold uppercase tracking-widest text-[#bef264]">{item.credits} Credits</div>
                                                        <div className="text-xs font-semibold">₹{item.price}</div>
                                                    </div>
                                                </div>
                                                <div className="p-1.5  rounded-lg bg-[#bef264] text-black transition-all">
                                                    {loadingPlanId === item.planId ? <FiLoader className="animate-spin w-3 h-3" /> : <FiArrowRight className="w-3 h-3" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* INVOICES SECTION */}
                    <div className="mt-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight mb-1">Invoices</h2>
                                <p className="text-zinc-400 text-xs font-medium">Access and download all your previous transactions.</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-white/10 bg-white/[0.02]">
                                            <th className="px-6 py-4">Invoice</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Plan</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {subscription?.paymentHistory?.length > 0 ? (
                                            subscription.paymentHistory
                                                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                .map((order, idx) => (
                                                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-red-500/5 text-red-400 rounded-md group-hover:bg-red-500/10 transition-all">
                                                                <FiFileText className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="text-zinc-200 font-medium text-xs">#{order.razorpayOrderId?.slice(-5).toUpperCase() || idx + 1}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-zinc-400 text-xs">
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge status={order.status} />
                                                    </td>
                                                    <td className="px-6 py-4 text-zinc-200 text-xs font-medium">
                                                        ₹{((order.amount || 0) / 100).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-zinc-400 text-xs">
                                                        {order.planName || 'Credits Top-up'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {order.status === 'paid' && (
                                                            <button 
                                                                onClick={() => generateInvoicePDF(order, user)}
                                                                className="text-[#bef264] hover:underline text-[10px] font-bold uppercase tracking-wider flex items-center justify-end gap-1 ml-auto"
                                                            >
                                                                Download <FiDownload className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-16 text-center text-zinc-500 text-xs font-medium italic">
                                                    No transactions found for this account.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            className="p-1.5 bg-white/5 border border-white/5 rounded-md text-zinc-400 hover:text-white hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FiArrowLeft className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            className="p-1.5 bg-white/5 border border-white/5 rounded-md text-zinc-400 hover:text-white hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FiArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Subscription Custom Popup */}
            <UniversalPopup
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title={subscription?.refundEligible ? "Refund & End Plan?" : "End Subscription?"}
                description={
                    subscription?.refundEligible 
                        ? "You are within the 24-hour refund window. By cancelling, you will receive a full refund and your account will revert to the Free tier immediately."
                        : `Your ${subscription?.tier} plan will end immediately. You will lose access to premium AI features and any unused credits${subscription?.topupCredits > 0 ? ' (including active top-up packs)' : ''}.`
                }
                maxWidth="max-w-md"
            >
                <div className="flex flex-col gap-4">
                    <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 border-dashed">
                        <div className="flex items-start gap-3">
                            <FiAlertTriangle className="text-red-500 w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">Important Notice</h4>
                                <p className="text-zinc-400 text-[10px] leading-relaxed">
                                    {subscription?.refundEligible 
                                        ? "Refunds typically take 5-7 business days to reflect in your source account. No further charges will occur."
                                        : subscription?.topupCredits > 0 
                                            ? `Cancellation will result in the immediate forfeiture of ${Math.round(subscription.topupCredits)} top-up credits. We recommend using them first.`
                                            : "This action is immediate. We recommend using your remaining credits before cancelling your plan."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <button
                            onClick={() => setIsCancelModalOpen(false)}
                            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                            Keep My Plan
                        </button>
                        <button
                            onClick={performCancellation}
                            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-[0_10px_20px_rgba(239,68,68,0.15)]"
                        >
                            End Subscription
                        </button>
                    </div>
                </div>
            </UniversalPopup >
        </>
    );
};

// ── Shared Sub-components ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const config = {
        paid:     { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',   label: 'Paid' },
        failed:   { cls: 'bg-red-500/10 text-red-400 border-red-500/20',               label: 'Failed' },
        refunded: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',            label: 'Refunded' },
        unpaid:   { cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20',      label: 'Unpaid' },
        created:  { cls: 'bg-white/5 text-zinc-500 border-white/5',                   label: 'Pending' },
    };
    const c = config[status] || config.created;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${c.cls}`}>
            <span className={`w-1 h-1 rounded-full ${c.cls.split(' ')[1].replace('text-', 'bg-')}`}></span>
            {c.label}
        </span>
    );
};

export default Billing;
