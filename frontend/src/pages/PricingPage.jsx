import React, { useState } from 'react';
import { Helmet } from "react-helmet-async";
import { 
  FiCheck, 
  FiZap, 
 
  FiStar, 
  FiShield, 
  FiCheckCircle,
  FiTrendingUp,
  FiPlus
} from "react-icons/fi";

const PricingPage = () => {
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            name: "Free",
            price: "₹0",
            description: "Quick practice.",
            features: [
                "20m Talk Time",
                "2 Mock Interviews",
                "3 GD Sessions",
                "Basic Feedback"
            ],
            icon: <FiZap className="w-6 h-6 text-zinc-500" />,
            buttonText: "Current Plan",
            buttonStyle: "bg-zinc-800 text-zinc-400 cursor-not-allowed",
            highlight: false
        },
        {
            name: "Pro",
            price: isAnnual ? "₹5,999" : "₹599",
            period: isAnnual ? "/yr" : "/mo",
            description: "Serious job seekers.",
            features: [
                "150m Talk Time",
                "10 Mock Interviews",
                "15 GD Sessions",
                "AI Coaching",
                "Flash 2.0 AI"
            ],
            icon: <FiStar className="w-6 h-6 text-[#bef264]" />,
            buttonText: "Upgrade to Pro",
            buttonStyle: "bg-[#bef264] text-black hover:bg-[#d9ff96] shadow-[0_0_20px_rgba(190,242,100,0.1)]",
            highlight: true,
            savings: "Save ~₹1,200"
        },
        {
            name: "Elite",
            price: isAnnual ? "₹12,499" : "₹1,299",
            period: isAnnual ? "/yr" : "/mo",
            description: "Ultimate package.",
            features: [
                "Unlimited* Talk Time",
                "Unlimited Sessions",
                "SOTA Models",
                "LinkedIn AI",
                "WhatsApp Support"
            ],
            icon: <FiStar className="w-6 h-6 text-purple-400" />,
            buttonText: "Go Elite",
            buttonStyle: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
            highlight: false,
            savings: "Save ~₹3,100"
        }
    ];

    const topUps = [
        { name: "Single Interview", price: "₹149" },
        { name: "Single GD", price: "₹79" },
        { name: "Starter Pack", price: "₹499" },
        { name: "Power Pack", price: "₹999" }
    ];

    return (
        <>
            <Helmet>
                <title>Pricing | PriPareAI</title>
            </Helmet>
            <div className="min-h-screen  text-white py-12 px-4 animate-fade-in">
                <div className="max-w-5xl mx-auto text-center">
                <div className="mb-10">
                    <span className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Pricing & Plans</span>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                        Elevate your performance.
                    </h1>
                    <p className="text-zinc-500 font-medium max-w-lg mx-auto text-sm md:text-base">
                        Choose a plan that fits your preparation goals. Simple, transparent pricing for everyone.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <span className={`text-xs font-bold uppercase tracking-widest ${!isAnnual ? 'text-white' : 'text-zinc-500'}`}>Monthly</span>
                    <button 
                        onClick={() => setIsAnnual(!isAnnual)}
                        className="w-12 h-6 bg-zinc-800 rounded-full p-1 relative transition-all"
                    >
                        <div className={`w-4 h-4 bg-[#bef264] rounded-full transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-xs font-bold uppercase tracking-widest ${isAnnual ? 'text-white' : 'text-zinc-500'}`}>Annual</span>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {plans.map((plan, idx) => (
                        <div 
                            key={idx}
                            className={`p-6 rounded-[2rem] border transition-all ${plan.highlight ? 'border-[#bef264]/10 bg-[#bef264]/20 ring-1 ring-[#bef264]' : 'border-[#bef264]/50 bg-zinc-800/40'} flex flex-col text-left group hover:bg-zinc-800/80`}
                        >
                            <div className="flex items-center justify-between ">
                          
                                {isAnnual && plan.savings && (
                                    <span className="text-[9px] font-black text-[#bef264] bg-[#bef264]/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                                        {plan.savings}
                                    </span>
                                )}
                            </div>
                            
                            <h2 className="text-xl font-black mb-1">{plan.name}</h2>
                            <p className="text-zinc-500 text-xs font-medium mb-6">{plan.description}</p>
                            
                            <div className="mb-8">
                                <span className="text-3xl font-black">{plan.price}</span>
                                <span className="text-zinc-500 text-sm font-bold"> {plan.period}</span>
                            </div>

                            <ul className="space-y-3 mb-10 flex-grow">
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                                        <FiCheck className="w-4 h-4 text-[#bef264] flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${plan.buttonStyle}`}>
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Top-ups Section */}
                <div className="max-w-3xl mx-auto p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                        <div className="text-left">
                            <h3 className="text-xl font-black flex items-center gap-2 mb-2">
                                <FiPlus className="text-[#bef264]" />
                                Quick Top-ups
                            </h3>
                            <p className="text-zinc-500 text-xs font-semibold max-w-sm">Need a few more sessions? Buy single credits or packs instantly.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                            {topUps.map((item, idx) => (
                                <div key={idx} className="px-5 py-3 rounded-2xl bg-zinc-800/30 border border-white/5 hover:border-[#bef264]/30 transition-all cursor-pointer text-center group/item hover:bg-[#bef264]/5">
                                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 group-hover/item:text-zinc-400">{item.name}</div>
                                    <div className="text-sm font-black text-[#bef264]">{item.price}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#bef264] opacity-[0.01] blur-3xl -mr-16 -mt-16 rounded-full group-hover:opacity-[0.03] transition-opacity"></div>
                </div>

                <div className="mt-12 text-zinc-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    *Elite fair use: 500 mins Talk Time / mo. <br />
                    Secure payments via Razorpay. No hidden charges.
                </div>
                </div>
            </div>
        </>
    );
};

export default PricingPage;
