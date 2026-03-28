import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiUser, FiLogOut, FiSettings, FiLayout, FiCreditCard, FiGift, FiTwitter, FiLinkedin, FiYoutube, FiGithub, FiMenu, FiX } from "react-icons/fi";
import Logo from "../common/Logo";

import Footer from "./Footer";

const Layout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const handleFeatureClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const element = document.getElementById("features");
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
      <nav className={`fixed lg:top-2 top-0 left-1/2 -translate-x-1/2 w-full lg:w-[80%] z-[100] transition-all duration-500 ease-in-out ${isMobileMenuOpen
        ? "h-screen bg-zinc-900 md:h-auto lg:bg-black/20 lg:backdrop-blur-lg overflow-hidden"
        : isScrolled
          ? "h-[72px] md:h-auto bg-black/50 lg:bg-zinc-900/50 border-b border-[#bef264] backdrop-blur-lg shadow-2xl lg:rounded-full"
          : "h-[72px] md:h-auto bg-transparent lg:border-b border-transparent lg:rounded-full"
        }`}>

        {/* Navbar Header (Logo & Actions) */}
        <div className="flex justify-between items-center px-4 md:px-8 lg:px-16 h-[72px] w-full">
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <Link to="/" className="text-2xl font-semibold tracking-tight text-white">
              PlaceMate<span className="text-primary">AI</span>
            </Link>
          </div>

          <div className="hidden md:flex gap-8 text-sm items-center">
            <Link to="/about" className="text-white  hover:text-primary transition-colors">About</Link>
            <Link to="/#features" onClick={handleFeatureClick} className="text-white  hover:text-primary transition-colors">Features</Link>
            <Link to="/#pricing" onClick={handlePricingClick} className="text-white  hover:text-primary transition-colors">Pricing</Link>
            <Link to="/contact" className="text-white  hover:text-primary transition-colors">Contact</Link>
          </div>

          <div className="flex gap-4 items-center">
            <SignedOut>
              <Link to="/signin" className="hidden md:block">
                <button className="bg-[#bef264] text-black px-4 py-2 rounded-lg font-bold hover:brightness-110 transition-all text-sm">
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

              {/* Custom Profile Dropdown (Desktop) */}
              <div className="relative hidden  md:flex items-center gap-4" ref={menuRef}>
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
                  <div className="absolute z-50 top-14 right-0 w-64 bg-zinc-900  rounded-2xl shadow-2xl shadow-zinc-700/50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                    <div className="flex px-4 py-2  items-start gap-2 border-b border-white/5 mb-2">
                      <img
                      src={user?.imageUrl}
                      alt={user?.firstName}
                      className="w-8 h-8 rounded-full object-cover shadow-lg"
                    />
                    <div className=" ">
                        <p className="text-white text-sm capitalize font-bold truncate">{user?.fullName}</p>
                      <p className="text-zinc-300 text-[10px] truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                      </div>
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
                    {/* ... other profile links ... */}
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

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-zinc-300  "
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Expanded Menu Content */}
        <div className={`md:hidden flex flex-col px-8 py-4 gap-8 transition-all duration-500 ${isMobileMenuOpen ? "opacity-100 translate-y-0 text-[18px]" : "opacity-0 -translate-y-10 pointer-events-none"}`}>
          <nav className="flex flex-col gap-8">
            {[
              { label: "Home", to: "/" },
              { label: "About", to: "/about" },
              { label: "Features", to: "/features" },
              { label: "Pricing", to: "/#pricing", onClick: handlePricingClick },
              { label: "Testimonials", to: "/#testimonials" },
              { label: "Contact", to: "/contact" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={(e) => { link.onClick?.(e); setIsMobileMenuOpen(false); }}
                className="text-white text-sm hover:text-primary transition-all font-semibold"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="h-px bg-white/5" />

          <div className="flex flex-col gap-6">
            <SignedIn>
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-black bg-[#bef264] px-4 py-2 rounded-lg text-sm text-center transition-all font-semibold"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { openUserProfile(); setIsMobileMenuOpen(false); }}
                className="text-white text-sm text-center hover:text-primary bg-zinc-800 px-4 py-2 rounded-lg transition-all font-semibold text-left"
              >
                Manage Profile
              </button>
              <button
                onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                className="text-red-400 text-sm hover:text-red-300 text-center bg-zinc-800 px-4 py-2 rounded-lg transition-all font-semibold text-left"
              >
                Log Out
              </button>
            </SignedIn>
            <SignedOut>
              <Link
                to="/signin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-primary transition-all font-semibold"
              >
                Sign In
              </Link>
            </SignedOut>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full relative z-0">
        {children}
      </main>

      <Footer />
    </div>
  );
};


export default Layout;
