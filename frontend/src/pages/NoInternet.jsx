import React, { useState } from 'react';
import { WifiOff, RefreshCcw, Activity } from 'lucide-react';

const NoInternet = () => {
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = () => {
    setIsChecking(true);
    // Simulate a check if actual refresh doesn't trigger reload
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      
      <div className="glass-card p-10 md:p-14 rounded-[2rem] max-w-lg w-full text-center relative z-10 border border-white/5 shadow-2xl animate-modal-in flex flex-col items-center">
        
        {/* Animated Icon Container */}
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping-slow" />
          <div className="relative z-10 w-20 h-20 bg-[#121214] border border-white/10 rounded-full flex items-center justify-center shadow-lg">
            <WifiOff className="w-10 h-10 text-red-400" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">
          Connection Lost
        </h1>
        
        <p className="text-gray-400 text-lg mb-10">
          It looks like you're offline. Please check your internet connection and try again.
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <RefreshCcw className={`w-5 h-5 ${isChecking ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            {isChecking ? 'Checking connection...' : 'Try Again'}
          </button>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-6">
            <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
            Waiting for network...
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoInternet;
