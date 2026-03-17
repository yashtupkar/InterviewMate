import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Layout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
        <div className="flex gap-8 items-center">
          <a href="#features" className="text-gray-300 hover:text-white font-medium transition-colors hidden md:block">Features</a>
          <a href="#about" className="text-gray-300 hover:text-white font-medium transition-colors hidden md:block">About</a>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-gradient-to-r from-[#bef264] via-[#7cff67] to-[#00f5a0] text-black px-6 py-2 rounded-lg font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(190,242,100,0.15)] hover:transform hover:scale-105 border-none">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/"/>
          </SignedIn>
        </div>
      </nav>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm border-t border-white/5 bg-[#09090b]">
        <p>&copy; 2026 PriPareAi. Built with MERN Stack.</p>
      </footer>
    </div>
  );
};

export default Layout;
