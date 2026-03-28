import React from "react";
import { Link } from "react-router-dom";
import Logo from "../common/Logo";
import SocialLinks from "../common/SocialLinks";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const sections = [
        {
            title: "Product",
            links: [
                { name: "AI Interviews", path: "/interview" },
                { name: "Group Discussions", path: "/gd" },
                { name: "LinkedIn Pro", path: "/dashboard/linkedin" },
                { name: "Pricing Plans", path: "/pricing" }
            ]
        },
        {
            title: "Resources",
            links: [
                { name: "Help Center", path: "/help" },
                { name: "Interview Tips", path: "#" },
                { name: "Success Stories", path: "/#testimonials" },
                { name: "API Status", path: "#" }
            ]
        },
        {
            title: "Company",
            links: [
                { name: "About Us", path: "/about" },
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
                { name: "Contact Us", path: "/contact" }
            ]
        }
    ];

    return (
        <footer className="relative z-10 w-full pt-20 pb-10 border-t border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link to="/" className="flex items-center gap-3 transition-transform active:scale-95 w-fit">
                            <div className="p-2 rounded-2xl bg-primary/10 border border-primary/20">
                                <Logo size={28} />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">
                                PlaceMate<span className="text-primary italic">AI</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Empowering candidates to conquer their dream interviews with state-of-the-art AI simulations and real-time feedback.
                        </p>
                        <SocialLinks />
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12">
                        {sections.map((column) => (
                            <div key={column.title} className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-40">
                                    {column.title}
                                </h4>
                                <ul className="space-y-4">
                                    {column.links.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                to={link.path}
                                                className="text-gray-400 hover:text-primary transition-colors text-sm font-medium flex items-center gap-2 group"
                                            >
                                                <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.15em]">
                        &copy; {currentYear} PlaceMateAI. All rights reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <span className="hidden sm:inline opacity-20">|</span>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                            Made with <span className="text-red-500 animate-pulse">❤️</span> for candidates
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
