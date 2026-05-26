import React from 'react';
import { Helmet } from "react-helmet-async";
import PricingSection from '../components/home/PricingSection';
import FAQ from '../components/home/FAQ';

const PricingPage = () => {


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
                <div className="mt-8">
                    <FAQ category="pricing" />
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
