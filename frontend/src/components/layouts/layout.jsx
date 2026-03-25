import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiUser, FiLogOut, FiSettings, FiLayout, FiCreditCard, FiGift, FiTwitter, FiLinkedin, FiYoutube, FiGithub } from "react-icons/fi";
import Logo from "../common/Logo";

const Layout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = React.useRef(null);

  const handlePricingClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const element = document.getElementById("pricing");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

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
      <nav className={`fixed top-2 left-1/2 -translate-x-1/2 w-[80%] rounded-full z-[100] transition-all duration-300 flex justify-between items-center px-6 md:px-16 ${isScrolled
        ? "py-3 bg-black/20 border-y border-[#bef264] backdrop-blur-lg  shadow-2xl"
        : "py-3 bg-transparent border-b border-transparent"
        }`}>

        <div className="flex items-center gap-2">
          <Logo size={32} />
          <Link to="/" className="text-2xl font-semibold  tracking-tight text-white">
            PlaceMate<span className="text-primary">AI</span>
          </Link>
        </div>
        <div className="hidden md:flex gap-8 text-sm items-center">
          <Link to="/about" className="text-white font-semibold hover:text-primary transition-colors">About</Link>
          <Link to="/features" className="text-white font-semibold hover:text-primary transition-colors">Features</Link>
          <Link to="/#pricing" onClick={handlePricingClick} className="text-white font-semibold hover:text-primary transition-colors">Pricing</Link>
          <Link to="/contact" className="text-white font-semibold hover:text-primary transition-colors">Contact</Link>
        </div>
        <div className="flex gap-2 md:gap-4 items-center">

          <SignedOut>
            <Link to="/signin">
              <button
                className="bg-[#bef264] text-black px-4 py-2 rounded-lg font-bold hover:brightness-110 transition-all text-sm">                Sign In
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

      <footer className="relative z-10 w-full pt-20 pb-10 border-t border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 transition-transform active:scale-95">
              <div className="p-2 rounded-2xl bg-primary/10">
                <Logo size={28} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                PlaceMate<span className="text-primary italic">AI</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Empowering candidates to conquer their dream interviews with state-of-the-art AI simulations and real-time feedback.
            </p>
            <div className="flex gap-4">
              {[
                { name: 'Twitter', icon: FiTwitter },
                { name: 'LinkedIn', icon: FiLinkedin },
                { name: 'YouTube', icon: FiYoutube },
                { name: 'GitHub', icon: FiGithub }
              ].map((social) => (
                <button key={social.name} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all group">
                  <span className="sr-only">{social.name}</span>
                  <social.icon className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {[
            {
              title: 'Product',
              links: [
                { name: 'AI Interviews', path: '/interview' },
                { name: 'Group Discussions', path: '/gd' },
                { name: 'LinkedIn Pro', path: '/dashboard/linkedin' },
                { name: 'Pricing Plans', path: '/pricing' }
              ]
            },
            {
              title: 'Resources',
              links: [
                { name: 'Help Center', path: '/help' },
                { name: 'Interview Tips', path: '#' },
                { name: 'Success Stories', path: '/#testimonials' },
                { name: 'API Status', path: '#' }
              ]
            },
            {
              title: 'Company',
              links: [
                { name: 'About Us', path: '/about' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Contact Us', path: '/contact' }
              ]
            }
          ].map((column) => (
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

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.1em]">
            &copy; 2026 PlaceMateAI. All rights reserved.
          </p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
            Made with <span className="text-red-500 animate-pulse">❤️</span> for candidates worldwide
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
