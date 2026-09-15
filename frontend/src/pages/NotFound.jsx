import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#bef264]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="glass-card p-12 md:p-16 rounded-3xl max-w-2xl w-full text-center relative z-10 border border-white/10 shadow-2xl animate-fade">
        {/* Glitch Effect 404 */}
        <div className="relative inline-block mb-6">
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#bef264] to-white opacity-90 animate-pulse">
            404
          </h1>
          <div className="absolute -inset-2 bg-gradient-to-r from-[#bef264]/20 to-transparent blur-xl -z-10" />
        </div>

        <h2 className="text-3xl font-semibold text-white mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
          The page you're looking for seems to have wandered off into the digital void. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all duration-300 w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#bef264] hover:bg-[#a3e635] text-black font-semibold transition-all duration-300 w-full sm:w-auto primary-glow"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
      
      {/* Footer text */}
      <div className="mt-12 text-sm text-gray-500 flex items-center gap-2">
        <Search className="w-4 h-4" /> Error code: 404_NOT_FOUND
      </div>
    </div>
  );
};

export default NotFound;
