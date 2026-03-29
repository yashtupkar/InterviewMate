import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiExternalLink, FiInfo } from 'react-icons/fi';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const GoogleAdsBlock = ({ slotId, className = "" }) => {
  const { getToken } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }
        
        const res = await axios.get(`${backendURL}/api/subscription/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data && res.data.tier !== 'Free') {
          setIsPremium(true);
        }
      } catch (err) {
        console.error("Failed to check subscription for ads:", err);
      } finally {
        setLoading(false);
      }
    };
    checkSubscription();
  }, [getToken]);

  if (loading) return null;

  // Premium users see no ads!
  if (isPremium) return null;

  return (
    <div className={`w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px] text-zinc-500 overflow-hidden relative group transition-all hover:border-[#bef264]/20 ${className}`}>
      
      {/* Google Ads Branding Mockup */}
      <div className="absolute top-3 right-4 flex items-center gap-1 opacity-30 text-[9px] uppercase tracking-tighter font-bold">
        <span>Ads by Google</span>
        <FiInfo size={10} />
      </div>

      <div className="flex flex-col items-center gap-3 relative z-10 text-center">
        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-[#bef264]/40 border border-white/5 group-hover:scale-110 transition-transform duration-500">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
        </div>
        
        <div className="space-y-1">
          <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#bef264]/60">Advertisement</span>
          <p className="text-[11px] text-zinc-500 max-w-[200px]">Interested in going Ad-Free? Upgrade to Placement Pro today.</p>
        </div>

        <Link 
          to="/billing" 
          className="mt-2 flex items-center gap-2 text-[10px] font-bold text-white bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-[#bef264] hover:text-black hover:border-[#bef264] transition-all"
        >
          REMOVE ADS <FiExternalLink size={10} />
        </Link>
      </div>

      {/* Background patterns to make it look "real" */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      </div>
      
      <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    </div>
  );
};

export default GoogleAdsBlock;
