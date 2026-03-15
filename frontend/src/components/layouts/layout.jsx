import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="logo">Interview<span>Mate</span></Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-primary">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/"/>
          </SignedIn>
        </div>
      </nav>

      {children}

      <footer className="footer">
        <p>&copy; 2026 InterviewMate. Built with MERN Stack.</p>
      </footer>
    </div>
  );
};

export default Layout;
