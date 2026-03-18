import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet-async";
import axios from 'axios';
import { useAuth, useUser } from "@clerk/clerk-react";
import { 
  FiGift, 
  FiCopy, 
  FiUsers, 
  FiCheckCircle, 
  FiClock, 
  FiArrowRight,
  FiShare2,
  FiLoader,
  FiInfo,
  FiX
} from "react-icons/fi";
import toast from 'react-hot-toast';

const Referrals = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [showTerms, setShowTerms] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = await getToken();
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/referrals/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data.stats);
            } catch (err) {
                console.error("Error fetching referral stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [getToken]);

    const referralLink = stats?.referralCode 
        ? `${window.location.origin}?ref=${stats.referralCode}`
        : "Generating link...";

    const copyToClipboard = (text, message = "Copied to clipboard!") => {
        navigator.clipboard.writeText(text);
        toast.success(message);
    };

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
                <title>Referrals | PlaceMateAI</title>
            </Helmet>
            <div className="min-h-screen text-white py-12 px-4 md:px-8 border-l border-white/5 animate-fade-in custom-scrollbar overflow-y-auto">
                <div className="max-w-5xl mx-auto pb-24">
                    {/* Header */}
                    <div className="mb-12">
                        <span className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">Growth Program</span>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Refer a Friend, <br /><span className="text-[#bef264]">Earn Rewards.</span></h1>
                        <p className="text-zinc-500 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
                            Helping others prepare for their dream job? Get rewarded for it. Share your unique code and boost both of your preparation credits.
                        </p>
                    </div>

                    {/* Compact Reward Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        <div className="bg-purple-500/5 border-y border-purple-500 rounded-3xl p-6 relative overflow-hidden group">
                           <div className="relative z-10 flex items-start gap-4 ">
                                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 shrink-0">
                                    <FiUsers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black mb-1">For Them</h3>
                                    <p className="text-zinc-500 text-xs font-bold mb-3">Instant credits upon signup.</p>
                                    <div className="flex gap-2">
                                        <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-[9px] font-black uppercase tracking-widest">+1 Interview</span>
                                        <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-[9px] font-black uppercase tracking-widest">+1 GD Session</span>
                                    </div>
                                </div>
                           </div>
                        </div>

                        <div className="bg-[#bef264]/5 border-y border-[#bef264] rounded-3xl p-6 relative overflow-hidden group">
                           <div className="relative z-10 flex items-start gap-4">
                                <div className="p-3 bg-[#bef264]/10 rounded-2xl text-[#bef264] shrink-0">
                                    <FiGift className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black mb-1">For You</h3>
                                    <p className="text-zinc-500 text-xs font-bold mb-3">Credits after their first session.</p>
                                    <div className="flex gap-2">
                                        <span className="px-2.5 py-1 bg-[#bef264]/10 border border-[#bef264]/20 rounded-lg text-[#bef264] text-[9px] font-black uppercase tracking-widest">+1 Interview</span>
                                        <span className="px-2.5 py-1 bg-[#bef264]/10 border border-[#bef264]/20 rounded-lg text-[#bef264] text-[9px] font-black uppercase tracking-widest">+1 GD Session</span>
                                    </div>
                                </div>
                           </div>
                        </div>
                    </div>


                    {/* Inline Terms & FAQ */}
                    <div className="pt-12 border-t border-white/5 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1">
                                <h4 className="text-lg font-black mb-4">Referral <span className="text-[#bef264]">Terms</span></h4>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-4">
                                    Program rules & eligibility
                                </p>
                                <button
                                    onClick={() => setShowTerms(true)}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-4"
                                >
                                    View Detailed Terms
                                </button>
                                <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Last Updated</p>
                                    <p className="text-xs text-white font-black">March 17, 2026</p>
                                </div>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                <TermSection
                                    title="1. ELIGIBILITY"
                                    items={[
                                        "Only valid for first-time signups.",
                                        "Referrer must have a verified account.",
                                        "Existing users cannot be referred."
                                    ]}
                                />
                                <TermSection
                                    title="2. DISTRIBUTION"
                                    items={[
                                        "Referee gets credits immediately.",
                                        "Referrer after first voice/GD session.",
                                        "Added automatically to subscription."
                                    ]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Share Link Card */}
                    <div className="bg-zinc-900 border border-white/5 rounded-[3rem] p-10 mb-12 shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-black mb-4">Your Referral Link</h3>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-sm text-zinc-300 break-all select-all flex items-center justify-between group/link">
                                        {referralLink}
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => referralLink !== "Generating link..." && copyToClipboard(referralLink, "Link copied!")}
                                                disabled={referralLink === "Generating link..."}
                                                className={`p-2 rounded-lg transition-colors ${referralLink === "Generating link..." ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5 text-zinc-500 hover:text-[#bef264]'}`}
                                            >
                                                <FiCopy />
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => stats?.referralCode && copyToClipboard(stats.referralCode, "Code copied!")}
                                        disabled={!stats?.referralCode}
                                        className={`sm:w-auto w-full px-8 py-4 bg-[#bef264] text-black rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(190,242,100,0.15)] flex items-center justify-center gap-3 active:scale-95 ${!stats?.referralCode ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#d9ff96]'}`}
                                    >
                                        <FiShare2 /> Share Code
                                    </button>
                                </div>
                                <p className="mt-4 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">Or use code: <span className="text-zinc-400 select-all">{stats?.referralCode}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="mb-20">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black tracking-tight">Referral History</h3>
                            <div className="flex gap-4">
                                <StatItem label="Referred" value={stats?.totalReferrals || 0} icon={<FiUsers />} />
                                <StatItem label="Rewarded" value={stats?.rewardedReferrals || 0} icon={<FiCheckCircle />} color="#bef264" />
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                                        <th className="px-8 py-5">Friend</th>
                                        <th className="px-8 py-5">Joined</th>
                                        <th className="px-8 py-5 text-center">Status</th>
                                        <th className="px-8 py-5 text-right">Reward</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-bold">
                                    {stats?.history?.length > 0 ? (
                                        stats.history.map((ref, idx) => (
                                            <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group/row">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <img src={ref.referee?.avatar} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                                                        <div>
                                                            <div className="text-white">{ref.referee?.firstName} {ref.referee?.lastName}</div>
                                                            <div className="text-[10px] text-zinc-500 font-mono">{ref.referee?.email?.slice(0, 3)}***@***.com</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-zinc-400">
                                                    {new Date(ref.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${
                                                        ref.status === 'rewarded' ? 'bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/20' : 'bg-zinc-800 text-zinc-500 border border-white/5'
                                                    }`}>
                                                        {ref.status === 'rewarded' ? <FiCheckCircle /> : <FiClock />}
                                                        {ref.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className={ref.status === 'rewarded' ? 'text-[#bef264]' : 'text-zinc-600'}>
                                                        {ref.status === 'rewarded' ? '+1/+1 Credits' : 'Pending First Act'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-4 bg-zinc-800 rounded-full text-zinc-600">
                                                        <FiInfo className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-zinc-500 font-medium max-w-xs">No referrals yet. Start sharing your link to earn credits together!</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>


                    {/* Terms Modal */}
                    {showTerms && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowTerms(false)}></div>
                            <div className="relative bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-fade-in shadow-2xl">
                                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0">
                                    <h2 className="text-2xl font-black tracking-tight">Referral <span className="text-[#bef264]">Terms</span></h2>
                                    <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-500">
                                        <FiX className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                                    <TermSection 
                                        title="1. ELIGIBILITY" 
                                        items={[
                                            "Referral rewards are only available for first-time signups who use a valid referral code/link.",
                                            "The referrer must have a verified account on PlaceMateAI.",
                                            "Existing users cannot be referred by others."
                                        ]} 
                                    />
                                    <TermSection 
                                        title="2. REWARD DISTRIBUTION" 
                                        items={[
                                            "Referee (the friend) receives +1 Interview and +1 GD credit immediately upon successful signup.",
                                            "Referrer receives +1 Interview and +1 GD credit ONLY AFTER the referee completes their first voice interview or group discussion session.",
                                            "Credits are added automatically to your current subscription balance."
                                        ]} 
                                    />
                                    <TermSection 
                                        title="3. LIMITATIONS & FRAUD" 
                                        items={[
                                            "Creating multiple accounts or botting to exploit the referral system is strictly prohibited.",
                                            "PlaceMateAI reserves the right to withhold rewards if we detect suspicious activity.",
                                            "Credits have no cash value and are non-transferable."
                                        ]} 
                                    />
                                    <TermSection 
                                        title="4. MODIFICATIONS" 
                                        items={[
                                            "PlaceMateAI reserves the right to modify or terminate the referral program at any time without prior notice.",
                                            "Any changes will be effective immediately upon posting on this page."
                                        ]} 
                                    />
                                    
                                    <div className="pt-4 pb-8 text-center">
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Last Updated: March 17, 2026</p>
                                    </div>
                                </div>
                                <div className="p-8 border-t border-white/5 bg-zinc-900/50 backdrop-blur-md">
                                    <button 
                                        onClick={() => setShowTerms(false)}
                                        className="w-full py-4 bg-[#bef264] text-black rounded-2xl font-black uppercase tracking-widest hover:bg-[#d9ff96] transition-all"
                                    >
                                        I Understand
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const TermSection = ({ title, items }) => (
    <div className="space-y-4">
        <h4 className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.2em]">{title}</h4>
        <ul className="space-y-3">
            {items.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-400 font-medium leading-relaxed">
                    <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[#bef264]/40"></span>
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

const StatItem = ({ label, value, icon, color = "zinc-500" }) => (
    <div className="flex items-center gap-3 bg-zinc-900 border border-white/5 px-6 py-3 rounded-2xl group">
        <span className="text-zinc-500 group-hover:text-white transition-colors">{icon}</span>
        <div className="flex flex-col leading-none">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">{label}</span>
            <span className="text-xl font-black" style={{ color: color !== "zinc-500" ? color : '' }}>{value}</span>
        </div>
    </div>
);

export default Referrals;
