import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet-async";
import axios from 'axios';
import { useAuth, useUser } from "@clerk/clerk-react";
import { 
  FiCheck, 
  FiZap, 
  FiStar, 
  FiPlus,
  FiCreditCard,
  FiActivity,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiGift,
  FiChevronDown,
  FiHelpCircle,
  FiMail,
  FiExternalLink,
  FiCopy,
  FiArrowRight,
} from "react-icons/fi";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Billing = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);
    const [isAnnual, setIsAnnual] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const token = await getToken();
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSubscription(res.data);
            } catch (err) {
                console.error("Error fetching subscription:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscription();
    }, [getToken]);

    const plans = [
        {
            name: "Free",
            price: "₹0",
            description: "Quick practice.",
            features: ["20m Talk Time", "2 Mock Interviews", "3 GD Sessions", "Basic Feedback"],
            icon: <FiZap className="w-6 h-6 text-zinc-500" />,
            highlight: false
        },
        {
            name: "Pro",
            price: isAnnual ? "₹5,999" : "₹599",
            period: isAnnual ? "/yr" : "/mo",
            description: "Serious job seekers.",
            features: ["150m Talk Time", "10 Mock Interviews", "15 GD Sessions", "AI Coaching", "Flash 2.0 AI"],
            icon: <FiStar className="w-6 h-6 text-[#bef264]" />,
            highlight: true,
            savings: "Save ~₹1,200"
        },
        {
            name: "Elite",
            price: isAnnual ? "₹12,499" : "₹1,299",
            period: isAnnual ? "/yr" : "/mo",
            description: "Ultimate package.",
            features: ["Unlimited* Talk Time", "Unlimited Sessions", "SOTA Models", "LinkedIn AI", "WhatsApp Support"],
            icon: <FiStar className="w-6 h-6 text-purple-400" />,
            highlight: false,
            savings: "Save ~₹3,100"
        }
    ];

    const faqItems = [
        {
            q: "How does Talk Time work?",
            a: "Talk Time is the total duration you can spend interacting with our AI interviewers. It resets every month on your billing date. Unused talk time does not carry over to the next month."
        },
        {
            q: "Can I cancel my subscription anytime?",
            a: "Yes, you can cancel your subscription at any time from this page. You will continue to have access to your plan's features until the end of your current billing period."
        },
        {
            q: "What are SOTA Models?",
            a: "SOTA (State-of-the-Art) models refer to the latest and most advanced AI models like GPT-4o or specialized fine-tuned models that provide more realistic and nuanced interview feedback."
        },
        {
            q: "Is there a refund policy?",
            a: "We offer a 7-day money-back guarantee for our Pro and Elite plans if you're not satisfied with the experience, provided you haven't used more than 10% of your talk time."
        }
    ];

    const comparisonFeatures = [
        { name: "Talk Time (min/mo)", free: "20", pro: "150", elite: "500" },
        { name: "Mock Interviews", free: "2", pro: "10", elite: "100" },
        { name: "GD Sessions", free: "3", pro: "15", elite: "100" },
        { name: "AI Coaching", free: "Basic", pro: "Advanced", elite: "Premium" },
        { name: "AI Models", free: "Standard", pro: "Flash 2.0", elite: "SOTA (Ultra)" },
        { name: "LinkedIn AI Tools", free: "No", pro: "No", elite: "Yes" },
        { name: "WhatsApp Support", free: "No", pro: "No", elite: "Yes" },
        { name: "Custom Feedback", free: "Standard", pro: "Detailed", elite: "In-depth + Analysis" },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FiLoader className="w-8 h-8 text-[#bef264] animate-spin" />
            </div>
        );
    }

    const currentPlan = plans.find(p => p.name === subscription?.tier) || plans[0];

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied!");
    };

    return (
        <>
            <Helmet>
                <title>Billing | PlaceMateAI</title>
            </Helmet>
            <div className="min-h-screen text-white py-12 px-4 md:px-8 border-l border-white/5 animate-fade-in custom-scrollbar overflow-y-auto">
                <div className="max-w-6xl mx-auto pb-24">
                    {/* Header */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <span className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Workspace</span>
                            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Plans & Billing</h1>
                            <p className="text-zinc-500 font-medium text-sm md:text-base max-w-lg">
                                Manage your subscription, usage, and billing history. Everything you need to scale your prep.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-black uppercase tracking-widest transition-all border border-white/5 flex items-center gap-2">
                                <FiMail /> Support
                            </button>
                            <Link to="/pricing" className="px-5 py-2.5 rounded-xl bg-[#bef264] text-black hover:bg-[#d9ff96] text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(190,242,100,0.1)] flex items-center gap-2">
                                <FiStar /> View Pricing
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                        {/* Left Column: Current Plan & Usage */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Current Plan Card */}
                            <div className="bg-[#bef264]/5 border-y border-[#bef264] rounded-[2rem] p-4 relative overflow-hidden group">
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 ">
                                        <div className="flex items-center gap-4">
                                          
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-2xl font-black">{subscription?.tier} Plan</h3>
                                                    <span className="bg-[#bef264]/10 text-[#bef264] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#bef264]/20">Active</span>
                                                </div>
                                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-70">
                                                    {subscription?.planExpiry ? `Auto-renews on ${new Date(subscription.planExpiry).toLocaleDateString()}` : 'Lifetime Free Access'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-right min-w-[120px]">
                                            <div className="text-2xl font-black text-[#bef264]">{currentPlan.price}</div>
                                            <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest opacity-60">{currentPlan.period || 'No Cost'}</div>
                                        </div>
                                    </div>

                                    {/* Usage Metrics */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <UsageMetric 
                                            label="Talk Time" 
                                            value={subscription?.credits?.talkTime} 
                                            max={subscription?.limits?.talkTime} 
                                            unit="m" 
                                            color="#bef264"
                                            icon={<FiClock />}
                                        />
                                        <UsageMetric 
                                            label="Interviews" 
                                            value={subscription?.credits?.interviews} 
                                            max={subscription?.limits?.interviews} 
                                            color="#60a5fa"
                                            icon={<FiActivity />}
                                        />
                                        <UsageMetric 
                                            label="GD Sessions" 
                                            value={subscription?.credits?.gdSessions} 
                                            max={subscription?.limits?.gdSessions} 
                                            color="#a78bfa"
                                            icon={<FiPlus />}
                                        />
                                    </div>
                                    <button className="px-5 py-2.5 rounded-xl self-end bg-[#bef264] text-black hover:bg-[#d9ff96] text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(190,242,100,0.1)] flex items-center gap-2">Upgrade Plan</button>

                                </div>
                            </div>

                            {/* Referral Section */}
                            <div className="bg-gradient-to-br from-purple-500/10 to-[#bef264]/10 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="text-left">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-[#bef264]/20 rounded-lg text-[#bef264]">
                                                <FiGift className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-xl font-black">Refer & Earn Credits</h3>
                                        </div>
                                        <p className="text-zinc-400 text-sm font-medium max-w-md">
                                            Invite your friends to PlaceMateAI and earn bonus credits for every successful referral.
                                        </p>
                                    </div>
                                    <Link 
                                        to="/referrals"
                                        className="w-full md:w-auto px-8 py-4 bg-[#bef264] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#d9ff96] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(190,242,100,0.1)]"
                                    >
                                        Get Referral Link <FiArrowRight />
                                    </Link>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#bef264]/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-[#bef264]/20 transition-all"></div>
                            </div>

                            {/* Billing History */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden">
                                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black flex items-center gap-3">
                                            <FiCreditCard className="text-[#bef264]" />
                                            Billing History
                                        </h3>
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1 tracking-widest">Recent transactions and orders</p>
                                    </div>
                                    <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                                        Download All <FiExternalLink />
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                                                <th className="px-8 py-5">Date</th>
                                                <th className="px-8 py-5">Order ID</th>
                                                <th className="px-8 py-5">Amount</th>
                                                <th className="px-8 py-5">Status</th>
                                                <th className="px-8 py-5">Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm font-bold">
                                            {(subscription?.paymentHistory?.length > 0) ? (
                                                subscription.paymentHistory.map((payment, idx) => (
                                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group/row">
                                                        <td className="px-8 py-5 text-zinc-300">
                                                            {new Date(payment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-8 py-5 text-zinc-500 font-mono text-xs">
                                                            {payment.orderId.slice(0, 15)}...
                                                        </td>
                                                        <td className="px-8 py-5 text-white">
                                                            ₹{payment.amount.toLocaleString()}
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${
                                                                payment.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                                                payment.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                                                'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                                            }`}>
                                                                <span className={`w-1 h-1 rounded-full ${ payment.status === 'completed' ? 'bg-green-400 animate-pulse' : 'bg-current' }`} />
                                                                {payment.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            {payment.status === 'completed' ? (
                                                                <button className="text-[#bef264] hover:text-[#d9ff96] text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                                    View
                                                                </button>
                                                            ) : (
                                                                <span className="text-zinc-700">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-8 py-16 text-center text-zinc-600 font-medium italic">
                                                        No transactions found yet. Your journey starts here!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Upgrades & Add-ons */}
                        <div className="space-y-6">
                            {/* Comparison Mini Table
                            <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8">
                                <h3 className="text-lg font-black mb-6 flex items-center justify-between">
                                    Feature Comparison
                                    <span className="text-[10px] font-black text-[#bef264] uppercase cursor-pointer hover:underline">Full Table</span>
                                </h3>
                                <div className="space-y-4">
                                    {comparisonFeatures.slice(0, 6).map((feat, idx) => (
                                        <div key={idx} className="flex flex-col gap-2">
                                            <div className="flex justify-between text-[10px] items-center">
                                                <span className="text-zinc-500 font-bold uppercase tracking-widest">{feat.name}</span>
                                                <div className="flex gap-2 font-black">
                                                    <span className={`px-1.5 py-0.5 rounded ${subscription?.tier === 'Free' ? 'bg-[#bef264] text-black' : 'text-zinc-600'}`}>F</span>
                                                    <span className={`px-1.5 py-0.5 rounded ${subscription?.tier === 'Pro' ? 'bg-[#bef264] text-black' : 'text-zinc-600'}`}>P</span>
                                                    <span className={`px-1.5 py-0.5 rounded ${subscription?.tier === 'Elite' ? 'bg-[#bef264] text-black' : 'text-zinc-600'}`}>E</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-0.5 h-1.5 rounded-full overflow-hidden bg-white/5 border border-white/5">
                                                <div className={`h-full ${subscription?.tier === 'Free' ? 'bg-[#bef264]' : 'bg-transparent'}`} />
                                                <div className={`h-full ${subscription?.tier === 'Pro' ? 'bg-[#bef264]' : 'bg-transparent'}`} />
                                                <div className={`h-full ${subscription?.tier === 'Elite' ? 'bg-[#bef264]' : 'bg-transparent'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div> */}

                            {/* Quick Top-ups */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                    <FiPlus className="text-[#bef264]" />
                                    Quick Top-ups
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { name: "Single Interview", price: "₹149" },
                                        { name: "Single GD", price: "₹79" },
                                        { name: "Starter Pack", price: "₹499" },
                                        { name: "Power Pack", price: "₹999" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-zinc-800/30 border border-white/5 hover:border-[#bef264]/30 transition-all cursor-pointer flex items-center justify-between group/topup hover:bg-[#bef264]/5">
                                            <div>
                                                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5 group-hover/topup:text-zinc-400">{item.name}</div>
                                                <div className="text-sm font-black text-white">{item.price}</div>
                                            </div>
                                            <button className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover/topup:bg-[#bef264] group-hover/topup:text-black transition-all">
                                                <FiPlus />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Compact Upgrade Section
                            <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8">
                                <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Level Up</h3>
                                
                                <div className="flex items-center justify-between gap-4 mb-8 bg-zinc-800/20 p-2 rounded-2xl border border-white/5">
                                    <button 
                                        onClick={() => setIsAnnual(false)}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isAnnual ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Monthly
                                    </button>
                                    <button 
                                        onClick={() => setIsAnnual(true)}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isAnnual ? 'bg-[#bef264] text-black shadow-lg shadow-[#bef264]/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Annual
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {plans
                                        .filter(plan => plan.name !== subscription?.tier && plan.name !== "Free")
                                        .map((plan, idx) => (
                                        <div 
                                            key={idx}
                                            className="p-5 rounded-[2rem] border border-white/5 bg-zinc-800/30 hover:border-[#bef264]/30 hover:bg-zinc-800/50 transition-all duration-300 group/plan relative overflow-hidden shadow-sm"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl group-hover/plan:scale-110 transition-transform duration-500">{plan.icon}</span>
                                                    <h4 className="font-black text-sm tracking-tight">{plan.name}</h4>
                                                </div>
                                            </div>
                                            <div className="flex items-baseline gap-1 mb-4">
                                                <span className="text-2xl font-black">{plan.price}</span>
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{plan.period}</span>
                                            </div>
                                            <Link 
                                                to="/pricing"
                                                className="w-full py-4 rounded-2xl block text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-white/5 text-white hover:bg-[#bef264] hover:text-black hover:shadow-lg group-hover/plan:shadow-[#bef264]/10"
                                            >
                                                Upgrade Now
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* FAQ & Support Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 border-t border-white/5 pt-20">
                        {/* FAQ Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 shadow-inner">
                                    <FiHelpCircle className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight">Billing FAQ</h2>
                            </div>
                            <div className="space-y-4">
                                {faqItems.map((faq, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`rounded-[1.5rem] border transition-all duration-300 cursor-pointer overflow-hidden ${activeFaq === idx ? 'border-[#bef264]/40 bg-[#bef264]/5 shadow-sm' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'}`}
                                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                    >
                                        <div className="px-6 py-5 flex items-center justify-between gap-4">
                                            <h4 className={`text-sm font-bold transition-colors ${activeFaq === idx ? 'text-[#bef264]' : 'text-zinc-200'}`}>{faq.q}</h4>
                                            <FiChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-[#bef264]' : ''}`} />
                                        </div>
                                        <div 
                                            className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Comparison Table / Matrix */}
                        <div>
                           <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-[#bef264]/10 rounded-2xl text-[#bef264]">
                                    <FiActivity className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight">Comparison Matrix</h2>
                            </div>
                            <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/30">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Feature</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-zinc-200 uppercase tracking-widest text-center">Free</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-zinc-200 uppercase tracking-widest text-center">Pro</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-zinc-200 uppercase tracking-widest text-center">Elite</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[11px] font-bold">
                                        {comparisonFeatures.map((feat, idx) => (
                                            <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                                                <td className="px-6 py-4 text-zinc-400 font-bold uppercase tracking-tight">{feat.name}</td>
                                                <td className={`px-6 py-4 text-center ${subscription?.tier === 'Free' ? 'text-[#bef264] bg-[#bef264]/5 font-black' : 'text-zinc-600'}`}>{feat.free}</td>
                                                <td className={`px-6 py-4 text-center ${subscription?.tier === 'Pro' ? 'text-[#bef264] bg-[#bef264]/5 font-black' : 'text-zinc-600'}`}>{feat.pro}</td>
                                                <td className={`px-6 py-4 text-center ${subscription?.tier === 'Elite' ? 'text-[#bef264] bg-[#bef264]/5 font-black' : 'text-zinc-600'}`}>{feat.elite}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-8 p-6 rounded-[2rem] bg-zinc-800/40 border border-white/5 flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-black mb-1">Still confused?</h4>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Talk to our experts for custom solutions.</p>
                                </div>
                                <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest">
                                    Contact
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const UsageMetric = ({ label, value = 0, max = 1, unit = "", color, icon }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const size = 96;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white/[0.03] py-2 pl-2 px-4 rounded-[2rem] border border-white/5 flex items-center gap-6 shadow-sm hover:shadow-md transition-all group/metric relative overflow-hidden">
            <div className="relative flex-shrink-0">
                <svg className="w-20 h-20 transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                    <circle
                        cx={size/2}
                        cy={size/2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        className="text-white/5"
                    />
                    <circle
                        cx={size/2}
                        cy={size/2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        style={{ 
                            strokeDashoffset: offset,
                            filter: `drop-shadow(0 0 6px ${color}40)`
                        }}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xl text-zinc-400 group-hover/metric:text-white transition-colors">
                    {icon}
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover/metric:text-zinc-400 transition-colors">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{value}{unit}</span>
                    <span className="text-sm font-black text-zinc-500">/ {max}{unit}</span>
                </div>
            </div>
            
            <div 
                className="absolute top-0 right-0 w-24 h-24 opacity-[0.02] blur-3xl rounded-full pointer-events-none transition-opacity group-hover/metric:opacity-[0.05]"
                style={{ backgroundColor: color }}
            ></div>
        </div>
    );
};

export default Billing;
