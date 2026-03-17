import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiSettings, FiLayout, FiCreditCard, FiGift } from "react-icons/fi";

const Layout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const navigate = useNavigate();
  const menuRef = React.useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative z-10 w-full">
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 flex justify-between items-center px-6 md:px-16 ${
        isScrolled 
          ? "py-3 bg-[#09090b]/50 backdrop-blur-md border-b border-white/5 shadow-2xl" 
          : "py-3 bg-transparent border-b border-transparent"
      }`}>
        <Link to="/" className="text-2xl font-black tracking-tight text-white">
          PriPare<span className="text-primary">Ai</span>
        </Link>
        <div className="flex gap-4 md:gap-8 items-center">
          
          <SignedOut>
            <Link to="/signin">
              <button className="bg-gradient-to-r from-[#bef264] via-[#7cff67] to-[#00f5a0] text-black px-6 py-2 rounded-lg font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(190,242,100,0.15)] hover:transform hover:scale-105 border-none">
                Sign In
              </button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard" className="hidden md:block">
              <button className="bg-[#bef264] text-black px-4 py-2 rounded-lg font-bold hover:brightness-110 transition-all text-sm">
                Dashboard
              </button>
            </Link>

            {/* Custom Profile Dropdown */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-white/10 hover:border-[#bef264]/50 transition-all active:scale-95 bg-white/5"
              >
                <img 
                  src={user?.imageUrl} 
                  alt={user?.firstName} 
                  className="w-8 h-8 rounded-full object-cover shadow-lg"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute top-12 right-0 w-64 bg-[#121214] border-y border-[#bef264] rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-white text-sm font-bold truncate">{user?.fullName}</p>
                    <p className="text-zinc-500 text-[10px] truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                  
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <FiLayout className="text-zinc-500" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { openUserProfile(); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <FiUser className="text-zinc-500" />
                    Manage Profile 
                  </button>
                  <Link 
                    to="/billing"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <FiCreditCard className="text-zinc-500" />
                    Plans & Billing
                  </Link>
                  <Link
                    to="/referrals"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <FiGift className="text-zinc-500" />
                    Referrals
                  </Link>
                  <div className="h-px bg-white/5 my-2" />
                  <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <FiLogOut />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </SignedIn>
        </div>
      </nav>

      <main className="flex-1 w-full relative z-0">
        {children}
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm border-t border-white/5 bg-[#09090b]">
        <div className="flex justify-center gap-6 mb-4">
          <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
        <p>&copy; 2026 PriPareAi. Built with MERN Stack.</p>
      </footer>
    </div>
  );
};

export default Layout;
