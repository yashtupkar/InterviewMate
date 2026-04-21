import React from "react";

const PeerHubStyles = () => (
  <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes scan {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .glass-panel {
      background: rgba(18, 18, 20, 0.4);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .hero-gradient {
      background: radial-gradient(circle at 20% 30%, rgba(190, 242, 100, 0.05) 0%, transparent 40%),
                  radial-gradient(circle at 80% 70%, rgba(129, 140, 248, 0.05) 0%, transparent 40%);
    }
    @keyframes roulette {
      0% { transform: scale(0.8) translateY(20px); opacity: 0; }
      100% { transform: scale(1) translateY(0); opacity: 1; }
    }
    .roulette-item {
      animation: roulette 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
  `}</style>
);

export default PeerHubStyles;
