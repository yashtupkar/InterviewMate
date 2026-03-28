import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, Check } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const WaitlistSection = () => {
    const [email, setEmail] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    const [isJoined, setIsJoined] = useState(false);

    useEffect(() => {
        const joined = localStorage.getItem('waitlistJoined');
        if (joined === 'true') {
            setIsJoined(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter a valid email');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/waitlist/join`, { email });
            if (response.data.success) {
                toast.success(response.data.message);
                setIsJoined(true);
                setEmail('');
                localStorage.setItem('waitlistJoined', 'true');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Waitlist Join Error:', error);
            toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="py-32 px-6 max-w-7xl mx-auto relative overflow-hidden">
       
            <div className="relative overflow-hidden text-center">
            
                <div className="max-w-3xl mx-auto flex flex-col items-center">
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-pulse" />
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Early Access • Launching 2026</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                        Get Early Access of <br />PlaceMate<span className=" text-[#bef264]">AI</span>
                    </h2>

                    <p className="text-gray-400 text-base md:text-lg font-medium max-w-xl mb-10 leading-relaxed">
                        Join our exclusive waitlist today. Get early access to AI-powered insights and tools designed to make you unstoppable.
                    </p>

                    {isJoined ? (
                        <div className="w-full max-w-lg mb-8 p-8 rounded-3xl bg-zinc-900 border border-[#bef264]/20 shadow-2xl shadow-[#bef264]/5 animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex flex-col items-center gap-5">
                                <div className="w-16 h-16 rounded-full bg-[#bef264]/10 flex items-center justify-center border border-[#bef264]/20 group">
                                    <div className="w-10 h-10 rounded-full bg-[#bef264] flex items-center justify-center shadow-[0_0_20px_rgba(190,242,100,0.5)]">
                                        <Check className="text-black" size={24} strokeWidth={3} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white tracking-tight">You're in the inner circle!</h3>
                                    <p className="text-gray-400 font-medium">We'll notify you as soon as we ready for you.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form 
                            onSubmit={handleSubmit}
                            className="relative w-full max-w-lg mb-8"
                        >
                            <div className=' p-0.5 w-full bg-gradient-to-r from-[#bef264]/50 via-transparent to-[#bef264] rounded-2xl'>
                                <div className="relative flex items-center p-1 bg-zinc-900 rounded-2xl focus-within:border-[#bef264]/40 transition-all duration-300">
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        className="w-full bg-transparent px-5 py-3.5 text-white placeholder:text-gray-600 outline-none font-medium text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-3.5 w-fit whitespace-nowrap rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 bg-[#bef264] text-black hover:bg-[#d9ff96] active:scale-95"
                                    >
                                        {isLoading ? (
                                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            <div className='flex items-center gap-2 w-fit'>
                                                Join Waitlist
                                                <ChevronRight size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm group cursor-default transition-all duration-300 hover:border-[#bef264]/20">
                        <div className="flex -space-x-2.5">
                            {[1, 2, 3, 4].map((i) => (
                                <img 
                                    key={i}
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 892}`} 
                                    alt="User" 
                                    className="w-6 h-6 rounded-full border border-[#121214] bg-[#1f2022]"
                                />
                            ))}
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <p className="text-gray-500 text-[10px] font-bold tracking-tight uppercase">
                            Be the Next <span className="text-[#bef264]">Elite</span> Candidate
                        </p>
                    </div>

                </div>
            </div>
            <Toaster position="bottom-right" />
        </section>
    );
};

export default WaitlistSection;
