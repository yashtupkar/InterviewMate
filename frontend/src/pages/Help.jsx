import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
    FiMessageCircle, FiChevronDown, FiMail,
    FiLinkedin, FiInstagram, FiMessageSquare,
    FiHelpCircle, FiFileText, FiRefreshCw,
    FiPlus, FiMinus
} from 'react-icons/fi';
import { FaWhatsapp, FaDiscord } from 'react-icons/fa';

/**
 * Premium Help Page matching Referrals.jsx UI style
 */
const HelpPage = () => {
    const [selectedFaq, setSelectedFaq] = useState(null);

    const socialLinks = [
        {
            name: "WhatsApp",
            icon: <FaWhatsapp className="w-5 h-5" />,
            handle: "Quick Chat & Support",
            link: "https://wa.me/918888888888",
            color: "text-[#25D366]",
            bgColor: "bg-[#25D366]/5",
            borderColor: "border-[#25D366]"
        },
        {
            name: "LinkedIn",
            icon: <FiLinkedin className="w-5 h-5" />,
            handle: "PlaceMateAI Official",
            link: "https://linkedin.com/company/placemateai",
            color: "text-[#0077B5]",
            bgColor: "bg-[#0077B5]/5",
            borderColor: "border-[#0077B5]"
        },
        {
            name: "Discord",
            icon: <FaDiscord className="w-5 h-5" />,
            handle: "Join our Community",
            link: "https://discord.gg/placemateai",
            color: "text-[#5865F2]",
            bgColor: "bg-[#5865F2]/5",
            borderColor: "border-[#5865F2]"
        },
        {
            name: "Instagram",
            icon: <FiInstagram className="w-5 h-5" />,
            handle: "@placemate_ai",
            link: "https://instagram.com/placemate_ai",
            color: "text-[#E4405F]",
            bgColor: "bg-[#E4405F]/5",
            borderColor: "border-[#E4405F]"
        }
    ];

    const faqs = [
        {
            q: "How does the refund process work?",
            a: "We offer refunds if you experience technical issues during a session that prevent its completion. To request a refund, please email us with your session ID. Refunds are typically processed within 3-5 business days."
        },
        {
            q: "How can I earn free credits?",
            a: "You can earn 10 free credits for every successful referral! Simply share your unique referral link from the 'Referrals' tab with your friends."
        },
        {
            q: "My microphone isn't working in the session",
            a: "Ensure you have granted microphone permissions to PlaceMateAI in your browser. If you're on a laptop, close other applications that might be using the mic (like Zoom or Teams)."
        },
        {
            q: "Can I cancel my subscription?",
            a: "Yes, you can cancel your subscription at any time from the 'Plans & Billing' section. You will continue to have access to your paid features until the end of your billing cycle."
        }
    ];

    return (
        <>
            <Helmet>
                <title>Help & Support | PlaceMateAI</title>
            </Helmet>
            
            <div className="min-h-screen text-white py-12 px-4 md:px-8 border-l border-white/5 animate-fade-in custom-scrollbar overflow-y-auto">
                <div className="max-w-5xl mx-auto pb-24">
                    
                    {/* Header */}
                    <div className="mb-12">
                        <span className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">Support Center</span>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Need Help? <br /><span className="text-[#bef264]">We're here for you.</span></h1>
                        <p className="text-zinc-500 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
                            Have questions about your subscription, credits, or technical issues? Get in touch with our team or find quick answers below.
                        </p>
                    </div>

                    {/* Contact Cards - Styled like Referrals Reward Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        {/* Primary Email Support */}
                        <a 
                            href="mailto:support@placemateai.com"
                            className="bg-[#bef264]/5 border-y border-[#bef264] rounded-3xl p-8 relative overflow-hidden group md:col-span-2 transition-all hover:bg-[#bef264]/10"
                        >
                            <div className="relative z-10 flex items-start gap-6">
                                <div className="p-4 bg-[#bef264]/10 rounded-2xl text-[#bef264] shrink-0 border border-[#bef264]/20">
                                    <FiMail className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black mb-1">Email Support</h3>
                                    <p className="text-zinc-500 text-sm font-bold mb-3">Response time: within 24 hours</p>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1.5 bg-[#bef264]/10 border border-[#bef264]/20 rounded-lg text-[#bef264] text-[10px] font-black uppercase tracking-widest">support@placemateai.com</span>
                                    </div>
                                </div>
                                <div className="hidden sm:flex w-12 h-12 rounded-full bg-black/20 items-center justify-center text-[#bef264] group-hover:scale-110 transition-transform">
                                    <FiArrowRight />
                                </div>
                            </div>
                        </a>

                        {/* Social Contacts */}
                        {socialLinks.map((social, i) => (
                            <a 
                                key={i}
                                href={social.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${social.bgColor} border-y ${social.borderColor} rounded-3xl p-6 relative overflow-hidden group transition-all hover:bg-opacity-10`}
                            >
                                <div className="relative z-10 flex items-start gap-4">
                                    <div className={`p-3 bg-white/5 rounded-2xl ${social.color} shrink-0 border border-white/5`}>
                                        {social.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black mb-1">{social.name}</h3>
                                        <p className="text-zinc-500 text-xs font-bold leading-relaxed">{social.handle}</p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* FAQ & Terms Section - Styled like Referral Terms */}
                    <div className="pt-12 border-t border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* FAQ Sidebar */}
                            <div className="md:col-span-1">
                                <h4 className="text-xl font-black mb-4">Quick <span className="text-[#bef264]">FAQs</span></h4>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">
                                    Find answers to the most common questions instantly.
                                </p>
                                <div className="p-6 bg-zinc-900 border border-white/5 rounded-[2rem] space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Support Policy</p>
                                        <p className="text-xs text-zinc-400 font-medium">We aim to resolve all technical queries within 48 hours of ticket creation.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Operating Hours</p>
                                        <p className="text-xs text-white font-black">Mon - Fri • 9AM - 6PM</p>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ List */}
                            <div className="md:col-span-2 space-y-4">
                                {faqs.map((faq, i) => (
                                    <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden transition-all hover:border-white/10">
                                        <button 
                                            onClick={() => setSelectedFaq(selectedFaq === i ? null : i)}
                                            className="w-full px-8 py-6 flex items-center justify-between text-left transition-colors"
                                        >
                                            <span className="font-bold text-sm text-zinc-300 pr-8">{faq.q}</span>
                                            <div className={`p-2 rounded-xl bg-white/5 text-zinc-500 transition-all ${selectedFaq === i ? 'rotate-180 bg-[#bef264]/10 text-[#bef264]' : ''}`}>
                                                <FiChevronDown className="w-5 h-5" />
                                            </div>
                                        </button>
                                        
                                        <div className={`px-8 overflow-hidden transition-all duration-300 ${selectedFaq === i ? 'max-h-56 pb-8 pt-0 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="h-px w-full bg-white/5 mb-6" />
                                            <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Extra Help Card */}
                                <div className="mt-8 p-8 border border-dashed border-white/10 rounded-3xl text-center bg-white/[0.01]">
                                    <p className="text-zinc-500 text-xs font-medium mb-4">Can't find what you're looking for?</p>
                                    <a href="mailto:support@placemateai.com" className="text-[#bef264] text-xs font-black uppercase tracking-widest hover:underline underline-offset-4 decoration-[#bef264]/30">Open a Support Ticket</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status Branding */}
                    <div className="mt-24 pt-10 border-t border-white/5 text-center flex flex-col items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-pulse mb-3 shadow-[0_0_10px_#bef264]" />
                        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">
                            PlaceMateAI Global Support Network
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
};

// Reusable Arrow icon component
const FiArrowRight = () => (
    <svg stroke="currentColor" fill="none" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

export default HelpPage;
