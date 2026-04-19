import React, { useState, useEffect, useRef } from "react";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiUser,
  FiLogOut,
  FiLayout,
  FiCreditCard,
  FiGift,
  FiMenu,
  FiX,
  FiChevronDown,
  FiFileText,
  FiCheckSquare,
  FiLinkedin,
  FiBook,
  FiTool,
  FiEdit3,
} from "react-icons/fi";
import Logo from "../common/Logo";

import Footer from "./Footer";
import Background from "../common/Background";

const Layout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const toolsRef = useRef(null);

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
      if (toolsRef.current && !toolsRef.current.contains(event.target)) {
        setIsToolsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsToolsOpen(false);
  }, [location.pathname]);

  const toolsMenuItems = [
    {
      label: "Resume Builder",
      to: "/resume-builder",
      icon: <FiFileText size={15} />,
      desc: "Build ATS-friendly resumes",
      isProtected: true,
    },
    {
      label: "ATS Scorer",
      to: "/ats-scorer",
      icon: <FiCheckSquare size={15} />,
      desc: "Check resume compatibility",
      isProtected: true,
    },
    {
      label: "LinkedIn Optimizer",
      to: "/dashboard/linkedin",
      icon: <FiLinkedin size={15} />,
      desc: "Optimize your LinkedIn profile",
      isProtected: true,
    },
  ];

  const scrollToWaitlist = () => {
    setIsToolsOpen(false);
    setIsMobileMenuOpen(false);
    const el = document.getElementById("waitlist");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#waitlist");
    }
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");
  const isQuestionBankActive =
    location.pathname.startsWith("/interview-questions") ||
    location.pathname.startsWith("/interview-question") ||
    location.pathname.startsWith("/questions");
  const isBlogActive = location.pathname.startsWith("/blog");

  return (
    <div className="flex flex-col min-h-screen relative z-10 w-full">
      <nav
        className={`fixed  top-0 left-1/2 -translate-x-1/2 w-full  z-[100] transition-all duration-500 ease-in-out ${
          isMobileMenuOpen
            ? "h-screen bg-zinc-900 md:h-auto lg:bg-black/20 lg:backdrop-blur-lg overflow-hidden"
            : isScrolled
              ? "h-[72px] md:h-auto bg-black/50 lg:bg-zinc-900/50  backdrop-blur-lg shadow-2xl lg:rounded-full"
              : "h-[72px] md:h-auto bg-transparent  border-transparent "
        }`}
      >
        {/* Navbar Header (Logo & Actions) */}
        <div className="flex justify-between items-center px-4 md:px-8 lg:px-16 h-[72px] w-full">
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <Link
              to="/"
              className="text-2xl font-semibold tracking-tight text-white"
            >
              PlaceMate<span className="text-primary">AI</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-7 text-sm items-center">
            <Link
              to="/interview-questions"
              className={`flex items-center gap-1.5 font-medium transition-colors ${isQuestionBankActive ? "text-[#bef264]" : "text-white hover:text-[#bef264]"}`}
            >
              <FiBook size={15} />
              Question Bank
            </Link>

            <Link
              to="/blog"
              className={`flex items-center gap-1.5 font-medium transition-colors ${isBlogActive ? "text-[#bef264]" : "text-white hover:text-[#bef264]"}`}
            >
              <FiEdit3 size={15} />
              Blog
            </Link>

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`flex items-center gap-1.5 font-medium transition-colors ${isToolsOpen ? "text-[#bef264]" : "text-white hover:text-[#bef264]"}`}
              >
                <FiTool size={14} />
                Tools
                <FiChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isToolsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isToolsOpen && (
                <div className="absolute z-50 top-10 left-1/2 -translate-x-1/2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                  {toolsMenuItems.map((item) => {
                    const handleToolClick = (e) => {
                      if (item.isProtected && !user) {
                        e.preventDefault();
                        scrollToWaitlist();
                      } else {
                        setIsToolsOpen(false);
                      }
                    };
                    return (
                      <Link
                        key={item.label}
                        to={item.isProtected && !user ? "#" : item.to}
                        onClick={handleToolClick}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#bef264]/10 text-[#bef264] flex items-center justify-center shrink-0 group-hover:bg-[#bef264]/20 transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-[#bef264] transition-colors">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              to="/#pricing"
              onClick={handlePricingClick}
              className="text-white font-medium hover:text-[#bef264] transition-colors"
            >
              Pricing
            </Link>

            <Link
              to="/about"
              className={`font-medium transition-colors ${isActive("/about") ? "text-[#bef264]" : "text-white hover:text-[#bef264]"}`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-white  hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="flex gap-4 items-center">
            <SignedOut>
              <button
                onClick={() => {
                  const el = document.getElementById("waitlist");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    navigate("/#waitlist");
                  }
                }}
                className="hidden md:block bg-[#bef264] text-black px-4 py-2 rounded-lg font-bold hover:brightness-110 transition-all text-sm"
              >
                Join Waitlist
              </button>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard" className="hidden md:block">
                <button className="bg-[#bef264] text-black px-4 py-2 rounded-lg font-bold hover:brightness-110 transition-all text-sm">
                  Dashboard
                </button>
              </Link>

              {/* Custom Profile Dropdown (Desktop) */}
              <div
                className="relative hidden md:flex items-center gap-4"
                ref={menuRef}
              >
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
                  <div className="absolute z-50 top-14 right-0 w-64 bg-zinc-900 rounded-2xl shadow-2xl shadow-zinc-700/50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                    <div className="flex px-4 py-2 items-start gap-2 border-b border-white/5 mb-2">
                      <img
                        src={user?.imageUrl}
                        alt={user?.firstName}
                        className="w-8 h-8 rounded-full object-cover shadow-lg"
                      />
                      <div>
                        <p className="text-white text-sm capitalize font-bold truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-zinc-300 text-[10px] truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
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
                      onClick={() => {
                        openUserProfile();
                        setIsProfileOpen(false);
                      }}
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

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-zinc-300"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Expanded Menu Content */}
        <div
          className={`md:hidden flex flex-col px-8 py-4 gap-6 transition-all duration-500 ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"}`}
        >
          {/* Product Links */}
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
            Explore
          </p>
          <nav className="flex flex-col gap-5">
            <Link
              to="/interview-questions"
              className="text-white text-sm hover:text-[#bef264] transition-all font-semibold flex items-center gap-2.5"
            >
              <FiBook size={16} className="text-[#bef264]/60" />
              Question Bank
            </Link>
            <Link
              to="/blog"
              className="text-white text-sm hover:text-[#bef264] transition-all font-semibold flex items-center gap-2.5"
            >
              <FiEdit3 size={16} className="text-[#bef264]/60" />
              Blog
            </Link>
            {user ? (
              <Link
                to="/resume-builder"
                className="text-white text-sm hover:text-[#bef264] transition-all font-semibold flex items-center gap-2.5"
              >
                <FiFileText size={16} className="text-[#bef264]/60" />
                Resume Builder
              </Link>
            ) : (
              <button
                onClick={scrollToWaitlist}
                className="text-white text-sm hover:text-[#bef264] transition-all font-semibold flex items-center gap-2.5 text-left"
              >
                <FiFileText size={16} className="text-[#bef264]/60" />
                Resume Builder
              </button>
            )}
            {user ? (
              <Link
                to="/ats-scorer"
                className="text-white text-sm hover:text-[#bef264] transition-all font-semibold flex items-center gap-2.5"
              >
                <FiCheckSquare size={16} className="text-[#bef264]/60" />
                ATS Scorer
              </Link>
            ) : (
              <button
                onClick={scrollToWaitlist}
                className="text-white text-sm hover:text-[#bef264] transition-all font-semibold flex items-center gap-2.5 text-left"
              >
                <FiCheckSquare size={16} className="text-[#bef264]/60" />
                ATS Scorer
              </button>
            )}
            {user ? (
              <Link
                to="/dashboard/linkedin"
                className="text-white text-sm hover:text-[#bef264] transition-all font-semibold flex items-center gap-2.5"
              >
                <FiLinkedin size={16} className="text-[#bef264]/60" />
                LinkedIn Optimizer
              </Link>
            ) : (
              <button
                onClick={scrollToWaitlist}
                className="text-white text-sm hover:text-[#bef264] transition-all font-semibold flex items-center gap-2.5 text-left"
              >
                <FiLinkedin size={16} className="text-[#bef264]/60" />
                LinkedIn Optimizer
              </button>
            )}
          </nav>

          <div className="h-px bg-white/5" />

          {/* General Links */}
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
            Company
          </p>
          <nav className="flex flex-col gap-5">
            <Link
              to="/#pricing"
              onClick={handlePricingClick}
              className="text-white text-sm hover:text-[#bef264] transition-all font-semibold"
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="text-white text-sm hover:text-[#bef264] transition-all font-semibold"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-white text-sm hover:text-[#bef264] transition-all font-semibold"
            >
              Contact
            </Link>
          </nav>

          <div className="h-px bg-white/5" />

          {/* Auth Actions */}
          <div className="flex flex-col gap-4">
            <SignedIn>
              <Link
                to="/dashboard"
                className="text-black bg-[#bef264] px-4 py-2.5 rounded-xl text-sm text-center transition-all font-bold"
              >
                Dashboard
              </Link>
              <button
                onClick={() => openUserProfile()}
                className="text-white text-sm text-center hover:text-[#bef264] bg-zinc-800 px-4 py-2.5 rounded-xl transition-all font-semibold"
              >
                Manage Profile
              </button>
              <button
                onClick={() => signOut()}
                className="text-red-400 text-sm hover:text-red-300 text-center bg-zinc-800 px-4 py-2.5 rounded-xl transition-all font-semibold"
              >
                Log Out
              </button>
            </SignedIn>
            <SignedOut>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  const el = document.getElementById("waitlist");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    navigate("/#waitlist");
                  }
                }}
                className="text-black bg-[#bef264] px-4 py-2.5 rounded-xl text-sm text-center transition-all font-bold"
              >
                Join Waitlist
              </button>
            </SignedOut>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full relative z-0">
        <Background />
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
