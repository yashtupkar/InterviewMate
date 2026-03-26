import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheck, FiZap, FiStar, FiPlus, FiLoader } from "react-icons/fi";
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import useRazorpay from '../../hooks/useRazorpay';
import PaymentStatusModal from '../modals/PaymentStatusModal';

/**
 * PricingSection
 *
 * Props:
 *   showHeader   — show the title/subtitle/toggle (default true)
 *   showTopUps   — show Quick Top-ups section (default false)
 */
const PricingSection = ({
  showHeader = true,
  showTopUps = false,
}) => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  
  const { getToken, isSignedIn } = useAuth();
  const [currentTier, setCurrentTier] = useState(null);
  const [statusModal, setStatusModal] = useState({ 
      isOpen: false, 
      tier: '', 
      status: 'success',
      planId: null
  });

  const fetchTier = useCallback(async () => {
      if (!isSignedIn) return;
      try {
          const token = await getToken();
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentTier(res.data.tier);
      } catch {
          // Non-critical
      }
  }, [getToken, isSignedIn]);

  useEffect(() => { fetchTier(); }, [fetchTier]);

  const { initiatePayment, isLoading: paymentLoading } = useRazorpay({
      onPaymentSuccess: (data) => {
          fetchTier();
          setStatusModal({ 
              isOpen: true, 
              status: 'success', 
              tier: data?.tier || 'Pro', 
              planId: data?.planId 
          });
      },
      onPaymentFailure: () => {
           setStatusModal({ isOpen: true, status: 'failure', tier: '', planId: null });
      }
  });

  const onPlanSelect = isSignedIn ? initiatePayment : null;
  const onTopUpSelect = isSignedIn ? initiatePayment : null;

  const plans = [
    {
      name: "Student Flash",
      monthlyPlanId: "student_flash_monthly",
      yearlyPlanId: "student_flash_yearly",
      monthlyPrice: "199",
      yearlyPrice: "1,999",
      credits: "200 Credits",
      description: "Perfect for a quick preparation boost.",
      features: [
       
        "Mock Interviews (10 Credits)",
        "GD Sessions (8 Credits)",
        "Expert AI Feedback",
        "Practice Coding Problems",
        "24/7 AI Mentor Access",
      ],
      recommended: false,
    },
    {
      name: "Placement Pro",
      monthlyPlanId: "placement_pro_monthly",
      yearlyPlanId: "placement_pro_yearly",
      monthlyPrice: "499",
      yearlyPrice: "4,999",
      credits: "600 Credits",
      description: "Complete package for serious job seekers.",
      features: [
      
        "Mock Interviews (10 Credits)",
        "GD Sessions (8 Credits)",
        "Expert AI Feedback",
        "LinkedIn & Resume Tools",
        "Priority AI Processing",
        "Career Analytics Pro",
        "Advanced Flash 2.0 AI",
      ],
      recommended: true,
    },
    {
      name: "Infinite Elite",
      monthlyPlanId: "infinite_elite_monthly",
      yearlyPlanId: "infinite_elite_yearly",
      monthlyPrice: "899",
      yearlyPrice: "8,999",
      credits: "1,200 Credits",
      description: "The ultimate unlimited preparation experience.",
      features: [
     
        "Mock Interviews (10 Credits)",
        "GD Sessions (8 Credits)",
        "LinkedIn & Resume Pro",
        "WhatsApp Career Support",
        "Early Access to Features",
        "Expert AI Mock Reviews",
      ],
      recommended: false,
    },
    {
      name: "Free",
      monthlyPlanId: null,
      yearlyPlanId: null,
      monthlyPrice: "0",
      yearlyPrice: "0",
      credits: "30 Credits",
      description: "Get started with PlaceMateAI.",
      features: [
        "Mock Interviews (10 Credits)", 
        "GD Sessions (8 Credits)", 
        "Basic Feedback", 
        "Practice Coding Problems"
      ],
      recommended: false,
    },
  ];

  const topUps = [
    { planId: "quick_boost", name: "Quick Boost", price: "₹29", credits: "30 Credits" },
    { planId: "power_pack", name: "Power Pack", price: "₹49", credits: "70 Credits" },
    { planId: "pro_master", name: "Pro Master", price: "₹99", credits: "200 Credits" },
  ];

  const getPlanId = (plan) =>
    billingCycle === "yearly" ? plan.yearlyPlanId : plan.monthlyPlanId;

  const isCurrentPlan = (plan) => currentTier && plan.name === currentTier;
  const isFree = (plan) => plan.name === "Free";

  const getButtonLabel = (plan) => {
    if (isFree(plan)) return "Always Free";
    if (isCurrentPlan(plan)) return "✓ Current Plan";
    return `Get ${plan.name}`;
  };

  const handlePlanClick = (plan) => {
    const planId = getPlanId(plan);
    if (!planId || isFree(plan)) return;
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
  };

  return (
    <section id="pricing" className="py-16 relative overflow-hidden">
      <PaymentStatusModal 
          isOpen={statusModal.isOpen} 
          onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
          tier={statusModal.tier}
          status={statusModal.status}
          planId={statusModal.planId}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {showHeader && (
          <div className="text-center mb-12">
            <h2 className="text-[#bef264] font-bold tracking-wider uppercase text-xs mb-3">
              Pricing &amp; Plans
            </h2>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              Elevate your performance.
            </h3>
            <p className="text-zinc-400 text-base max-w-xl mx-auto mb-8">
              Discover our flexible pricing plans designed to meet the needs of students, job seekers, and professionals.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${billingCycle === "monthly" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-zinc-800 ring-1 ring-white/10"
                role="switch"
                aria-checked={billingCycle === "yearly"}
              >
                <span
                  style={{ transform: billingCycle === "yearly" ? "translateX(20px)" : "translateX(0px)" }}
                  className="pointer-events-none inline-block h-5 w-5 rounded-full bg-[#bef264] shadow ring-0 transition-transform duration-200 ease-in-out"
                />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`text-xs font-bold uppercase tracking-widest transition-colors ${billingCycle === "yearly" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Yearly
                </button>
                <span 
                  onClick={() => setBillingCycle("yearly")}
                  className="bg-[#bef264]/10 text-[#bef264] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-[#bef264]/20 animate-pulse cursor-pointer"
                >
                  Save 20%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 rounded-[1.5rem] flex flex-col ${plan.name === "Free" && "col-span-3 md:col-span-1 hidden"} transition-all duration-300 hover:translate-y-[-4px] ${
                plan.recommended
                  ? "bg-[#121214] border-2 border-[#bef264] shadow-[0_0_40px_rgba(190,242,100,0.1)] scale-105 z-20"
                  : "bg-[#121214] border border-white/5 shadow-xl"
              }`}
            >
              {plan.name === "Free" && <span className="hidden"></span>}
              {plan.name !== "Free" && (
                <>
                {plan.recommended && (
                    <div className="absolute top-4 right-4">
                    <span className="bg-[#bef264] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Recommended
                    </span>
                    </div>
                )}
                {/* {isCurrentPlan(plan) && (
                    <div className="absolute top-4 left-4">
                    <span className="bg-zinc-700 text-zinc-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Current
                    </span>
                    </div>
                )} */}

                <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                    <p className="text-zinc-400 text-xs h-10 leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">
                        ₹{billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                        </span>
                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                    </div>
                    <div className="mt-1 text-[#bef264] text-[11px] font-black uppercase tracking-[0.1em] px-2 py-0.5 bg-[#bef264]/10 rounded-md w-fit">
                        {plan.credits}
                    </div>
                </div>

                {onPlanSelect ? (
                    <button
                    onClick={() => handlePlanClick(plan)}
                    disabled={paymentLoading || isCurrentPlan(plan)}
                    className={`w-full py-3 rounded-lg font-bold text-center mb-6 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 ${
                        isCurrentPlan(plan)
                        ? "bg-white/5 border border-white/10 text-zinc-500 cursor-not-allowed"
                        : plan.recommended
                        ? "bg-[#bef264] text-black hover:bg-[#d9ff96]"
                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    } disabled:opacity-60`}
                    >
                    {paymentLoading && !isCurrentPlan(plan) ? (
                        <FiLoader className="animate-spin w-4 h-4" />
                    ) : null}
                    {getButtonLabel(plan)}
                    </button>
                ) : (
                    <Link
                    to="/sign-up"
                    className={`w-full py-3 rounded-lg font-bold text-center mb-6 transition-all active:scale-[0.98] text-sm ${
                        plan.recommended
                        ? "bg-[#bef264] text-black hover:bg-[#d9ff96]"
                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    }`}
                    >
                    Get {plan.name}
                    </Link>
                )}

                <ul className="space-y-3 flex-grow">
                    {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-zinc-400">
                        <FiCheck className="w-4 h-4 text-[#bef264] flex-shrink-0" />
                        <span className="text-xs font-medium">{feature}</span>
                    </li>
                    ))}
                </ul>
                </>
              )}
            </div>
          ))}
        </div>

        {showTopUps && (
          <div className="max-w-3xl mx-auto p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 text-center">
            <h3 className="text-xl font-black flex items-center justify-center gap-2 mb-2">
              <FiPlus className="text-[#bef264]" />
              Quick Top-ups
            </h3>
            <p className="text-zinc-400 text-xs font-semibold mb-6">
              Buy single credits instantly — no plan required.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {topUps.map((item) =>
                onTopUpSelect ? (
                  <button
                    key={item.planId}
                    onClick={() => onTopUpSelect(item.planId)}
                    disabled={paymentLoading}
                    className="px-6 py-3 rounded-2xl bg-zinc-800/30 border border-white/5 hover:border-[#bef264]/30 transition-all cursor-pointer group/item flex flex-col items-center"
                  >
                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 group-hover/item:text-zinc-400">
                      {item.name}
                    </div>
                    <div className="text-[10px] font-black text-[#bef264]">
                      {item.price}
                    </div>
                    <div className="text-[8px] font-bold text-zinc-400 mt-1">
                      {item.credits}
                    </div>
                  </button>
                ) : (
                  <Link
                    key={item.planId}
                    to="/sign-up"
                    className="px-6 py-3 rounded-2xl bg-zinc-800/30 border border-white/5 hover:border-[#bef264]/30 transition-all"
                  >
                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                      {item.name}
                    </div>
                    <div className="text-sm font-black text-[#bef264]">{item.price}</div>
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#bef264] opacity-[0.02] blur-[120px] pointer-events-none rounded-full" />
    </section>
  );
};

export default PricingSection;
