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
  FiAlertCircle,
  FiRotateCcw,
} from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useRazorpay from '../hooks/useRazorpay';
import PaymentStatusModal from '../components/modals/PaymentStatusModal';

const Billing = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);
    
    // Status Modal State
    const [statusModal, setStatusModal] = useState({ 
        isOpen: false, 
        tier: '', 
        status: 'success',
        planId: null
    });

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

    // ── Razorpay hook ──────────────────────────────────────────────────────────
    const { initiatePayment, isLoading: paymentLoading } = useRazorpay({
        onPaymentSuccess: (data) => {
            fetchSubscription();
            setStatusModal({ 
                isOpen: true, 
                status: 'success', 
                tier: data?.tier || 'Pro', 
                planId: data?.planId 
            });
        },
        onPaymentFailure: () => {
            setStatusModal({ isOpen: true, status: 'failure', tier: '', planId: null });
        },
    });

    const topups = [
        { planId: "student_test", name: "Student Test", price: "1", credits: "200" },
        { planId: "quick_boost", name: "Quick Boost", price: "29", credits: "30" },
        { planId: "power_pack",  name: "Power Pack",  price: "49", credits: "70" },
        { planId: "pro_master",  name: "Pro Master",  price: "99", credits: "200" },
    ];

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

            <PaymentStatusModal 
                isOpen={statusModal.isOpen} 
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                tier={statusModal.tier}
                status={statusModal.status}
                planId={statusModal.planId}
            />

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

                    {/* Current Plan Card - border-y style from Referrals */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
                        <div className="bg-[#bef264]/5 border-y border-[#bef264] rounded-3xl p-8 relative overflow-hidden group hover:bg-[#bef264]/10 transition-all duration-500">
                           <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-[#bef264]/10 rounded-2xl text-[#bef264] shrink-0">
                                        <FiZap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black">{subscription?.tier} Tier</h3>
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                            {subscription?.planExpiry
                                                ? `Expires ${new Date(subscription.planExpiry).toLocaleDateString()}`
                                                : 'Active Status'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col w-full gap-3 mt-2">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#bef264] shadow-[0_0_8px_#bef264]"></div>
                                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Prep Economy Usage</span>
                                        </div>
                                        <span className="text-white text-base font-black italic tracking-tight">
                                            {Math.round(subscription?.credits || 0)} <span className="text-zinc-500 mx-1 not-italic opacity-50">/</span> {subscription?.limits?.credits || 200} <span className="text-[10px] text-[#bef264] uppercase ml-1 not-italic tracking-widest">Credits</span>
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                                        <div 
                                            className="h-full bg-gradient-to-r from-[#bef264] via-[#dcfc9f] to-white rounded-full shadow-[0_0_15px_rgba(190,242,100,0.3)] transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min(100, ((subscription?.credits || 0) / (subscription?.limits?.credits || 200)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                           </div>
                        </div>

                        <div className="bg-white/5 border-y border-white/10 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden group">
                           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-black mb-2 leading-tight">Ready to level up?</h3>
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">Unlock advanced AI & Unlimited prep sessions.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/pricing')}
                                    className="w-full md:w-auto px-8 py-4 bg-white text-black hover:bg-[#bef264] rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Upgrade Now <FiArrowRight />
                                </button>
                           </div>
                        </div>
                    </div>

                    {/* Quick Top-ups - Compact cards like Referrals rewards */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-8">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#bef264]"></div>
                             <h3 className="text-2xl font-black tracking-tight uppercase">Add Top-ups</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {topups.map((item) => (
                                <button
                                    key={item.planId}
                                    onClick={() => initiatePayment(item.planId)}
                                    disabled={paymentLoading}
                                    className="bg-zinc-800 border border-white/5 rounded-2xl p-6 hover:border-[#bef264]/30 hover:bg-[#bef264]/5 transition-all text-left flex items-center justify-between group disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/5 rounded-xl text-zinc-500 group-hover:text-[#bef264] transition-colors">
                                            <FiPlus className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">{item.name}</div>
                                            <div className="text-lg font-black italic">₹{item.price}</div>
                                            <div className="text-[9px] font-bold text-[#bef264] mt-1">{item.credits} Credits</div>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#bef264] group-hover:text-black transition-all">
                                        {paymentLoading ? <FiLoader className="animate-spin" /> : <FiArrowRight />}
                                    </div>
                                </button>
                            ))}

                            <div className="bg-zinc-900 border border-white/5 rounded-[2rem] p-6 flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                    <FiAlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Need Help?</div>
                                    <a href="mailto:support@placemate.ai" className="text-xs font-black uppercase tracking-[0.1em] text-white hover:text-[#bef264] transition-all flex items-center gap-1">
                                        Contact Support <FiMail className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Billing History Section - Table style from Referrals */}
                    <div className="mb-20">
                        <h3 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-3">
                            <FiRotateCcw className="text-zinc-500" /> Transactions
                        </h3>
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-8 py-5">Product</th>
                                        <th className="px-8 py-5">Amount</th>
                                        <th className="px-8 py-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-bold">
                                    {subscription?.paymentHistory?.length > 0 ? (
                                        subscription.paymentHistory.map((order, idx) => (
                                            <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-6 text-zinc-400">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-6 text-white uppercase tracking-wider font-black">
                                                    {order.planName || 'Add-on'}
                                                </td>
                                                <td className="px-8 py-6 text-zinc-200">
                                                    ₹{((order.amount || 0) / 100).toLocaleString()}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <StatusBadge status={order.status} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center text-zinc-600 font-medium italic">
                                                No transactional history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Info / Support - TermSection style from Referrals */}
                    <div className="pt-12 border-t border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                             <div className="space-y-4">
                                <h4 className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em]">Support & Policy</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-xs text-zinc-500 font-medium leading-relaxed">
                                        <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full bg-[#bef264]/40"></span>
                                        Full refund within 24h if &lt;10% credits used.
                                    </li>
                                    <li className="flex gap-3 text-xs text-zinc-500 font-medium leading-relaxed">
                                        <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full bg-[#bef264]/40"></span>
                                        Secure payment processing via Razorpay.
                                    </li>
                                </ul>
                             </div>
                             <div className="space-y-4">
                                <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Payment Issues?</h4>
                                <p className="text-zinc-500 text-xs font-bold leading-relaxed underline underline-offset-4 decoration-white/10 cursor-pointer hover:text-white transition-all">
                                    reach out to support@placemate.ai for instant resolution.
                                </p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// ── Shared Sub-components ─────────────────────────────────────────────────────────────



const StatusBadge = ({ status }) => {
    const config = {
        paid:     { cls: 'bg-[#bef264]/10 text-[#bef264] border-[#bef264]/20',   label: 'Success' },
        failed:   { cls: 'bg-red-500/10 text-red-400 border-red-500/20',         label: 'Failed' },
        refunded: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',      label: 'Refunded' },
        created:  { cls: 'bg-white/5 text-zinc-500 border-white/5',             label: 'Created' },
    };
    const c = config[status] || config.created;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${c.cls}`}>
            {c.label}
        </span>
    );
};

export default Billing;
