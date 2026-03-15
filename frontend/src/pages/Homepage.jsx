import React from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Homepage = ({ backendStatus }) => {
  return (
    <main className="hero-section">
      <div className="hero-content animate-fade">
        <h1 className="hero-title">
          Master Your Next <br />
          <span className="gradient-text">Interview Performance</span>
        </h1>
        <p className="hero-subtitle">
          The ultimate platform to prepare, practice, and perfect your interview
          skills with AI-driven insights.
        </p>
        <div className="hero-actions">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-primary large">
                Get Started for Free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard">
              <button className="btn-primary large">Go to Dashboard</button>
            </Link>
          </SignedIn>
          <button className="btn-secondary large">Watch Demo</button>
        </div>

        <div className="status-badge">
          <span
            className={`status-dot ${backendStatus.includes("online") || backendStatus.includes("running") ? "green" : "red"}`}
          ></span>
          System Status: {backendStatus}
        </div>
      </div>

      <div className="hero-visual animate-fade">
        <div className="glass-card mockup">
          <div className="mockup-header">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <div className="mockup-body">
            <div className="skeleton line large"></div>
            <div className="skeleton line medium"></div>
            <div className="skeleton line small"></div>
            <div className="skeleton-circle"></div>
          </div>
        </div>
        <div className="glow-effect"></div>
      </div>
    </main>
  );
};

export default Homepage;
