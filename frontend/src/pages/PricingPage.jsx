import React, { useState } from 'react';
import { Helmet } from "react-helmet-async";
import PricingSection from '../components/home/PricingSection';
import { 
    FiChevronDown, 
    FiHelpCircle,
} from "react-icons/fi";

const PricingPage = () => {
    const [activeFaq, setActiveFaq] = useState(null);

    const faqItems = [
        {
            q: "How do Credits work?",
            a: "PlaceMateAI uses a unified credit system (1 Credit = ₹1). Mock Interviews cost 10 credits (flat), GD Sessions cost 8 credits (flat), and AI tools (Resume/LinkedIn) cost 2 credits per use. Credits provided in monthly plans reset each billing cycle, while Top-up credits never expire."
        },
        {
            q: "Can I get a refund?",
            a: "Yes! We offer a full refund within 24 hours of purchase if you have used less than 10% of your plan credits. Use the 'Request Refund' link in your billing settings. Refunds are processed automatically within 5-7 business days."
        },
        {
            q: "Can I cancel my subscription anytime?",
            a: "Yes, you can cancel anytime. You will continue to have access to your plan's features until the end of your current billing period."
        },
        {
            q: "What are SOTA Models?",
            a: "SOTA (State-of-the-Art) models refer to the latest and most advanced AI models like GPT-4o or specialized fine-tuned models that provide more realistic and nuanced interview feedback."
        },
    ];

    return (
        <>
            <Helmet>
                <title>Pricing | PlaceMateAI</title>
            </Helmet>
            <div className="min-h-screen bg-background text-white animate-fade-in pb-20">

                <PricingSection
                    showHeader={true}
                    showTopUps={true}
                />

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto px-4 mt-20">
                    <div className="flex items-center justify-center gap-3 mb-10 text-center">
                        <div className="p-2 bg-[#bef264]/10 rounded-xl text-[#bef264]">
                            <FiHelpCircle className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">Got Questions?</h2>
                    </div>
                    <div className="space-y-4">
                        {faqItems.map((faq, idx) => (
                            <div 
                                key={idx} 
                                className={`rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden ${activeFaq === idx ? 'border-[#bef264]/40 bg-[#bef264]/5' : 'border-white/5 hover:border-white/10'}`}
                                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                            >
                                <div className="px-8 py-6 flex items-center justify-between gap-4">
                                    <h4 className={`text-sm md:text-md font-bold transition-colors ${activeFaq === idx ? 'text-[#bef264]' : 'text-zinc-200'}`}>{faq.q}</h4>
                                    <FiChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 flex-shrink-0 ${activeFaq === idx ? 'rotate-180 text-[#bef264]' : ''}`} />
                                </div>
                                <div className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-60 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-zinc-500 text-sm leading-relaxed font-medium">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 pt-20 text-center">
                    <div className="text-zinc-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        *Infinite Elite: Unlimited Interviews & GDs for fair personal use. <br />
                        🔒 Secure payments via Razorpay. No hidden charges. Full refund within 24h if &lt;10% credits used.
                    </div>
                </div>
            </div>
        </>
    );
};

export default PricingPage;
