import React, { useState } from "react";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import { FiLayout, FiUser, FiCreditCard, FiGift, FiLogOut } from "react-icons/fi";
import Logo from "../components/common/Logo";
import Footer from "../components/layouts/Footer";
import GoogleAdsBlock from "../components/common/GoogleAdsBlock";
import Background from "../components/common/Background";

const QuestionBankLayout = ({ children }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col min-h-screen  w-full">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] h-[72px] bg-black/90 border-b border-white/10 backdrop-blur-xl">
        <div className="flex justify-between items-center px-6 lg:px-12 h-full w-full max-w-[1400px] mx-auto">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-white/80 transition-colors">
              PlaceMate<span className="text-[#bef264]">AI</span>
            </Link>
            <div className="hidden md:flex ml-4 pl-4 border-l border-white/10 text-sm font-semibold text-zinc-400">
               Question Bank <span className="text-[10px] ml-2 px-1.5 py-0.5 bg-[#bef264]/10 text-[#bef264] rounded border border-[#bef264]/20">FREE</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex gap-4 items-center">
            
            <SignedOut>
              <Link to="/signin">
                <button className="bg-[#bef264] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#a3d94d] transition-all text-sm">
                  Sign In
                </button>
              </Link>
            </SignedOut>
            
            <SignedIn>
              <Link to="/dashboard" className="hidden sm:block">
                <button className="bg-zinc-800 text-white px-4 py-2 rounded-lg font-semibold border border-white/10 hover:bg-zinc-700 transition-all text-sm">
                  Dashboard
                </button>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative flex items-center" ref={menuRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center border border-white/10 hover:border-[#bef264]/50 transition-all rounded-full bg-white/5 active:scale-95"
                >
                  <img
                    src={user?.imageUrl}
                    alt={user?.firstName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute top-12 right-0 w-60 bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex px-4 py-3 items-center gap-3 border-b border-white/5 mb-1">
                      <img src={user?.imageUrl} alt={user?.firstName} className="w-10 h-10 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="text-white text-sm font-bold truncate capitalize">{user?.fullName}</p>
                        <p className="text-zinc-400 text-[10px] truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </div> 

                    <Link
                      to="/dashboard"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <FiLayout className="text-zinc-500" /> Dashboard
                    </Link>
                    
                    <button
                      onClick={() => { openUserProfile(); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <FiUser className="text-zinc-500" /> Manage Profile
                    </button>
                    
                    <Link
                      to="/billing"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <FiCreditCard className="text-zinc-500" /> Plans & Billing
                    </Link>
                    
                    <Link
                      to="/referrals"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <FiGift className="text-zinc-500" /> Referrals
                    </Link>
                    
                    <div className="h-px bg-white/5 my-1" />
                    
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <FiLogOut /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Main Content Space */}
      <main className="flex-1 w-full pt-[72px]">
        <Background />
        {children}
        
        {/* Persistent Ad Banner */}
        <div className="max-w-7xl mx-auto px-6 py-12">
           <GoogleAdsBlock slotId="global-layout-footer" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuestionBankLayout;
