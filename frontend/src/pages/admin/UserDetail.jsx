import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { FiArrowLeft, FiUser, FiActivity, FiVideo, FiUsers, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(`${backendURL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-zinc-400 py-12">
        <p>User not found</p>
      </div>
    );
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/users')}
          className="p-2 bg-zinc-900 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
        >
          <FiArrowLeft className="text-white" size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">User Details</h1>
          <p className="text-zinc-400 mt-1">Detailed overview of user activity and status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-zinc-900 border border-white/10 rounded-[32px] p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 border-2 border-primary/30 overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-primary">{user.firstName[0]}</span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{user.firstName} {user.lastName}</h2>
          <p className="text-zinc-400 mb-6">{user.email}</p>
          
          <div className="flex gap-3 mb-8 w-full justify-center">
            <span className={`px-3 py-1 text-xs rounded-full font-semibold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-zinc-300'}`}>
              {user.role}
            </span>
            <span className={`px-3 py-1 text-xs rounded-full font-semibold uppercase tracking-wider ${
              user.status === 'active' ? 'bg-green-500/20 text-green-400' : 
              user.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400' : 
              'bg-red-500/20 text-red-400'
             }`}>
               {user.status}
             </span>
          </div>

          <div className="w-full space-y-4 text-left border-t border-white/5 pt-6">
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Joined</p>
              <p className="text-sm text-zinc-200">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Last Login</p>
              <p className="text-sm text-zinc-200">{user.lastLogin ? formatDate(user.lastLogin) : 'No login recorded'}</p>
            </div>
          </div>
        </div>

        {/* Details & Platform Usage */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Subscription Info */}
          <div className="bg-zinc-900 border border-white/10 rounded-[32px] p-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <FiActivity className="text-primary" /> Subscription Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Plan</p>
                <p className="text-lg font-bold text-primary">{user.subscription?.tier || 'Free'}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Credits</p>
                <p className="text-lg font-mono font-bold text-white">{user.subscription?.credits || 0}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 col-span-2 md:col-span-2">
                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Expiry</p>
                <p className="text-lg font-medium text-white">
                  {user.subscription?.planExpiry ? formatDate(user.subscription.planExpiry) : 'No Expiry'}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Overviews */}
          <div className="bg-zinc-900 border border-white/10 rounded-[32px] p-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <FiClock className="text-primary" /> Platform Usage
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-black/30 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
                  <FiVideo size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{user.interviewCount || 0}</p>
                  <p className="text-sm text-zinc-400">Mock Interviews</p>
                </div>
              </div>

              <div className="bg-black/30 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
                  <FiUsers size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{user.gdSessionCount || 0}</p>
                  <p className="text-sm text-zinc-400">GD Sessions</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserDetail;
