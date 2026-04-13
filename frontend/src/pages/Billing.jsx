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

    // The user wants the popup on another route, so we'll redirect for EVERYTHING.
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

    // Filter top-ups: hide adminOnly unless role is admin
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

            <div className="min-h-screen text-white py-12 px-4 md:px-8 border-l border-white/5 animate-fade-in custom-scrollbar overflow-y-auto">
                <div className="max-w-5xl mx-auto pb-24">
                    {/* Header - Referrals Style */}
                    <div className="mb-12">
                        <span className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">Billing</span>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Manage Your <br /><span className="text-[#bef264]">Subscription.</span></h1>
                        <p className="text-zinc-500 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
                            Monitor your prep economy, access premium features, and keep your credits topped up for the next big interview.
                        </p>
                    </div>

                    {/* Main Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                        {/* LEFT CARD: Plan Details */}
                        <div className="bg-zinc-800 border border-white/5 rounded-3xl p-6 flex flex-col justify-between group hover:border-white/10 transition-all duration-300">
                           <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold">{subscription?.tier} Plan</h3>
                                    <span className="text-lg font-black text-[#bef264]">
                                        {subscription?.tier === 'Free' ? '$0' : ('₹' + (subscription?.currentPlanAmount || '0'))} <span className="text-zinc-500 text-xs font-medium">/ {subscription?.billingCycle || 'month'}</span>
                                    </span>
                                </div>
                                <p className="text-zinc-500 text-sm mb-8">
                                    {subscription?.tier === 'Free' ? 'Free for learners use up to 30 credits.' : `Reset at ${new Date(subscription.planExpiry).toLocaleDateString()}`}
                                </p>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-white uppercase tracking-wider">{Math.round(subscription?.credits || 0)} / {subscription?.limits?.credits || 260} credits used</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-[#bef264] to-yellow-300 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(251,146,60,0.3)]"
                                            style={{ width: `${Math.min(100, ((subscription?.credits || 0) / (subscription?.limits?.credits || 200)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                           </div>
                           
                           <div className="mt-8 flex justify-end">
                                {subscription?.tier === 'Free' ? (
                                    <button 
                                        onClick={() => navigate('/pricing')}
                                        className="px-6 py-2.5 bg-white text-black hover:bg-[#bef264] rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                                    >
                                        Upgrade
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleCancelSubscription}
                                        className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-red-500/20"
                                    >
                                        Cancel Subscription
                                    </button>
                                )}
                           </div>
                        </div>

                        {/* TOP-UP CARD (Conditional) */}
                        {subscription?.topupCredits > 0 && (
                            <div className="bg-zinc-800 border-2 border-[#bef264]/20 rounded-3xl p-6 flex flex-col justify-between group hover:border-[#bef264]/40 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 px-4 py-1 bg-[#bef264] text-black text-[8px] font-black uppercase tracking-widest rounded-bl-xl"> Active Top-up </div>
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold">Active Top-up Pack</h3>
                                        <div className="p-2 bg-[#bef264]/10 rounded-xl text-[#bef264]">
                                            <FiPlus className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-zinc-500 text-sm mb-8">
                                        Extra credits pool for your interview prep. No expiry.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-white uppercase tracking-wider">{Math.round(subscription?.topupCredits)} Credits Available</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#bef264] rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(190,242,100,0.4)]"
                                                style={{ width: '100%' }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    <FiActivity className="w-3 h-3 text-[#bef264]" /> Ready to use
                                </div>
                            </div>
                        )}

                        {/* ACTION CARD: Buy/Upgrade */}
                        <div className={`bg-zinc-900 border border-white/5 rounded-3xl p-6 flex flex-col group hover:border-white/10 transition-all duration-300 ${subscription?.topupCredits > 0 ? 'lg:col-span-2' : ''}`}>
                            {subscription?.tier === 'Free' ? (
                                <>
                                    <h3 className="text-xl font-bold mb-2">Upgrade to Premium</h3>
                                    <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                                        Unlock advanced AI features, unlimited ATS scans, and get 10x more credits for your interview prep.
                                    </p>
                                    <div className="mt-auto">
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#bef264]/10 rounded-lg text-[#bef264]">
                                                    <FiZap className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold">Pro Features Active?</div>
                                                    <div className="text-[10px] text-zinc-500">Upgrade to find out</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => navigate('/pricing')}
                                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold mb-1">Need more Credits?</h3>
                                    <p className="text-zinc-500 text-sm mb-4">Experience uninterrupted prep with instant top-ups.</p>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        {visibleTopups.map((item) => (
                                            <button
                                                key={item.planId}
                                                onClick={() => handleTopUpClick(item.planId)}
                                                disabled={loadingPlanId === item.planId}
                                                className="bg-zinc-800/50 border border-white/5 rounded-2xl p-4 hover:border-[#bef264]/30 hover:bg-[#bef264]/5 transition-all text-left flex items-center justify-between group disabled:opacity-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/5 rounded-xl text-[#bef264]">
                                                        <FiPlus className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-[#bef264]">{item.credits} Credits</div>
                                                        <div className="text-sm font-bold">₹{item.price}</div>
                                                    </div>
                                                </div>
                                                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#bef264] group-hover:text-black transition-all">
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
                    <div className="mt-16">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-2">Invoices</h2>
                                <p className="text-zinc-500 text-sm font-medium">Access and download all your previous transactions.</p>
                            </div>
                          
                        </div>

                        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                                            <th className="px-8 py-5">Invoice</th>
                                            <th className="px-8 py-5">Date</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5">Amount</th>
                                            <th className="px-8 py-5">Plan</th>
                                            <th className="px-8 py-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-medium">
                                        {subscription?.paymentHistory?.length > 0 ? (
                                            subscription.paymentHistory
                                                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                .map((order, idx) => (
                                                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-red-500/5 text-red-400 rounded-lg group-hover:bg-red-500/10 transition-all">
                                                                <FiFileText className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-white font-bold tracking-tight">Invoice #{order.razorpayOrderId?.slice(-5).toUpperCase() || idx + 1}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-zinc-400">
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <StatusBadge status={order.status} />
                                                    </td>
                                                    <td className="px-8 py-6 text-zinc-200">
                                                        ₹{((order.amount || 0) / 100).toLocaleString()}
                                                    </td>
                                                    <td className="px-8 py-6 text-zinc-400 text-xs">
                                                        {order.planName || 'Credits Top-up'}
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {order.status === 'paid' && (
                                                            <button 
                                                                onClick={() => generateInvoicePDF(order, user)}
                                                                className="text-[#bef264] hover:underline text-xs font-black uppercase tracking-widest flex items-center justify-end gap-1 ml-auto"
                                                            >
                                                                Download <FiDownload className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-8 py-20 text-center text-zinc-600 font-medium italic">
                                                    No transactions found for this account.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="px-8 py-5 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            className="p-2 bg-white/5 border border-white/5 rounded-lg text-zinc-400 hover:text-white hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FiArrowLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            className="p-2 bg-white/5 border border-white/5 rounded-lg text-zinc-400 hover:text-white hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FiArrowRight className="w-4 h-4" />
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
                    <div className="p-5 bg-red-500/5 rounded-2xl border border-red-500/10 border-dashed">
                        <div className="flex items-start gap-4">
                            <FiAlertTriangle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Important Notice</h4>
                                <p className="text-zinc-500 text-[11px] font-medium leading-relaxed">
                                    {subscription?.refundEligible 
                                        ? "Refunds typically take 5-7 business days to reflect in your source account. No further charges will occur."
                                        : subscription?.topupCredits > 0 
                                            ? `Cancellation will result in the immediate forfeiture of ${Math.round(subscription.topupCredits)} top-up credits. We recommend using them first.`
                                            : "This action is immediate. We recommend using your remaining credits before cancelling your plan."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                        <button
                            onClick={() => setIsCancelModalOpen(false)}
                            className="flex-1 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            Keep My Plan
                        </button>
                        <button
                            onClick={performCancellation}
                            className="flex-1 px-8 py-4 bg-red-500 hover:bg-red-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_15px_30px_rgba(239,68,68,0.2)]"
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
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${c.cls}`}>
            <span className={`w-1 h-1 rounded-full ${c.cls.split(' ')[1].replace('text-', 'bg-')}`}></span>
            {c.label}
        </span>
    );
};

export default Billing;
