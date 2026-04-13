import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
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
  FiX,
  FiMail,
  FiMessageCircle,
  FiSend,
  FiLink,
} from "react-icons/fi";
import { SiWhatsapp, SiLinkedin } from "react-icons/si";
import toast from "react-hot-toast";

const Referrals = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/referrals/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
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

  const shareMessage = `🎯 Join me on InterviewMate - your ultimate interview preparation platform! Use my referral link and get 50 FREE credits:\n${referralLink}`;

  const copyToClipboard = (text, message = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const shareVia = (platform) => {
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=Join InterviewMate - Get 50 Free Credits&body=${encodeURIComponent(shareMessage)}`,
      copy: null,
    };

    if (platform === "copy") {
      copyToClipboard(referralLink, "Link copied to clipboard!");
      setShowShareMenu(false);
    } else if (urls[platform]) {
      window.open(urls[platform], "_blank");
      setShowShareMenu(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-[#bef264]/10 rounded-full">
            <FiLoader className="w-8 h-8 text-[#bef264] animate-spin" />
          </div>
          <p className="text-zinc-400 text-sm font-medium">
            Loading referral data...
          </p>
        </div>
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
            <span className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">
              Growth Program
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Refer a Friend, <br />
              <span className="text-[#bef264]">Earn Rewards.</span>
            </h1>
            <p className="text-zinc-500 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
              Helping others prepare for their dream job? Get rewarded for it.
              Share your unique code and boost both of your preparation credits.
            </p>
          </div>

          {/* Main Share Card - Minimal & Clean */}
          <div className="bg-gradient-to-br from-[#bef264]/5 to-transparent border border-[#bef264]/20 rounded-2xl p-8 mb-12">
            <div className="space-y-6">
              {/* Share Link Input */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 block">
                  Your Referral Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-[#bef264]/50"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(referralLink, "Link copied!")
                    }
                    disabled={referralLink === "Generating link..."}
                    className="px-4 py-3 bg-[#bef264] text-black rounded-lg font-black hover:bg-[#d9ff96] transition-all disabled:opacity-50"
                  >
                    <FiCopy />
                  </button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-full py-3 px-4 bg-[#bef264] text-black rounded-lg font-black uppercase tracking-widest hover:bg-[#d9ff96] transition-all flex items-center justify-center gap-2"
                >
                  <FiShare2 className="w-4 h-4" />
                  Share Link
                </button>

                {/* Share Menu Dropdown */}
                {showShareMenu && (
                  <div className="absolute top-full mt-2 right-0 z-50 bg-zinc-900 border border-white/10 rounded-lg shadow-xl p-2 min-w-[200px]">
                    <button
                      onClick={() => shareVia("whatsapp")}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium"
                    >
                      <SiWhatsapp className="w-4 h-4 text-green-400" /> WhatsApp
                    </button>
                    <button
                      onClick={() => shareVia("linkedin")}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium"
                    >
                      <SiLinkedin className="w-4 h-4 text-blue-400" /> LinkedIn
                    </button>
                    <button
                      onClick={() => shareVia("email")}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium"
                    >
                      <FiMail className="w-4 h-4 text-zinc-400" /> Email
                    </button>
                    <div className="h-px bg-white/10 my-2" />
                    <button
                      onClick={() => shareVia("copy")}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium"
                    >
                      <FiCopy className="w-4 h-4 text-zinc-400" /> Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rewards Info - Minimal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-[#bef264]/10 rounded-lg">
                  <FiUsers className="w-4 h-4 text-[#bef264]" />
                </div>
                <h3 className="text-sm font-black uppercase">
                  Your Friend Gets
                </h3>
              </div>
              <p className="text-2xl font-black text-[#bef264] mb-1">
                50 Credits
              </p>
              <p className="text-xs text-zinc-400">Instantly upon signup</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-[#bef264]/10 rounded-lg">
                  <FiGift className="w-4 h-4 text-[#bef264]" />
                </div>
                <h3 className="text-sm font-black uppercase">You Get</h3>
              </div>
              <p className="text-2xl font-black text-[#bef264] mb-1">
                50 Credits
              </p>
              <p className="text-xs text-zinc-400">
                After they complete first session
              </p>
            </div>
          </div>

          {/* Referral History */}
          <div className="mb-12">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <FiUsers className="w-6 h-6 text-[#bef264]" />
              Referral History
            </h2>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {stats?.history?.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {stats.history.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={ref.referee?.avatar}
                          className="w-8 h-8 rounded-full border border-white/10"
                          alt=""
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {ref.referee?.firstName} {ref.referee?.lastName}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {new Date(ref.createdAt).toDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${
                            ref.status === "rewarded"
                              ? "bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/20"
                              : "bg-zinc-800/50 text-zinc-400 border border-white/5"
                          }`}
                        >
                          {ref.status === "rewarded" ? (
                            <FiCheckCircle />
                          ) : (
                            <FiClock />
                          )}
                          {ref.status === "rewarded" ? "Rewarded" : "Pending"}
                        </span>
                        <span
                          className={`text-xs font-black ${ref.status === "rewarded" ? "text-[#bef264]" : "text-zinc-600"}`}
                        >
                          {ref.status === "rewarded" ? "+50" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="p-4 bg-[#bef264]/10 rounded-lg w-fit mx-auto mb-3">
                    <FiGift className="w-6 h-6 text-[#bef264]" />
                  </div>
                  <p className="text-zinc-400">
                    No referrals yet. Share your link to get started!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <p className="text-xs text-zinc-400 font-bold uppercase mb-1">
                Total Referrals
              </p>
              <p className="text-2xl font-black text-[#bef264]">
                {stats?.totalReferrals || 0}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <p className="text-xs text-zinc-400 font-bold uppercase mb-1">
                Rewarded
              </p>
              <p className="text-2xl font-black text-[#bef264]">
                {stats?.rewardedReferrals || 0}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <p className="text-xs text-zinc-400 font-bold uppercase mb-1">
                Pending
              </p>
              <p className="text-2xl font-black text-zinc-400">
                {stats?.potentialRewards || 0}
              </p>
            </div>
          </div>

          {/* Terms Modal */}
          {showTerms && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowTerms(false)}
              ></div>
              <div className="relative bg-zinc-900 border border-white/10 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-fade-in shadow-2xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 sticky top-0">
                  <h2 className="text-xl font-black tracking-tight">
                    Program <span className="text-[#bef264]">Terms</span>
                  </h2>
                  <button
                    onClick={() => setShowTerms(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                  <TermSection
                    title="1. ELIGIBILITY"
                    items={[
                      "Rewards only for first-time new signups with valid referral link/code.",
                      "Referrer must have completed their account setup.",
                      "Existing users cannot be referred.",
                    ]}
                  />
                  <TermSection
                    title="2. REWARDS"
                    items={[
                      "Friend gets 50 credits immediately upon successful signup.",
                      "You get 50 credits after they complete their first session.",
                      "Credits auto-added to subscription balance.",
                    ]}
                  />
                  <TermSection
                    title="3. ANTI-FRAUD"
                    items={[
                      "Creating multiple accounts to exploit rewards is prohibited.",
                      "Suspicious activity may result in reward forfeiture.",
                      "Credits are non-transferable and have no cash value.",
                    ]}
                  />
                  <TermSection
                    title="4. CHANGES"
                    items={[
                      "We reserve the right to modify or end this program anytime.",
                      "Changes take effect immediately upon posting.",
                    ]}
                  />
                </div>
                <div className="p-6 border-t border-white/5 bg-zinc-900/50">
                  <button
                    onClick={() => setShowTerms(false)}
                    className="w-full py-3 bg-[#bef264] text-black rounded-lg font-black uppercase tracking-widest text-sm hover:bg-[#d9ff96] transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Terms Button */}
          <button
            onClick={() => setShowTerms(true)}
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-zinc-400"
          >
            View Program Terms
          </button>
        </div>
      </div>
    </>
  );
};

const TermSection = ({ title, items }) => (
  <div className="space-y-3">
    <h4 className="text-[#bef264] text-[9px] font-black uppercase tracking-widest">
      {title}
    </h4>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-2 text-xs text-zinc-400 font-medium leading-relaxed"
        >
          <span className="flex-shrink-0 mt-1 w-1 h-1 rounded-full bg-[#bef264]/60"></span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default Referrals;
