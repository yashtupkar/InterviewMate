import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { FiSearch, FiFilter, FiDownload, FiChevronLeft, FiChevronRight, FiEdit2, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const SubscriptionManagement = () => {
  const { getToken } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSubscriptions();
  }, [getToken, selectedTier, selectedStatus, currentPage]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(selectedTier && { tier: selectedTier }),
        ...(selectedStatus && { status: selectedStatus }),
      });

      const res = await axios.get(`${backendURL}/api/admin/subscriptions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setSubscriptions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
      // Mock data
      setSubscriptions(generateMockSubscriptions());
    } finally {
      setLoading(false);
    }
  };

  const generateMockSubscriptions = () => [
    {
      _id: '1',
      user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      tier: 'Placement Pro',
      credits: 50,
      planExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      billingCycle: 'monthly',
      lastPaymentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      _id: '2',
      user: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      tier: 'Student Flash',
      credits: 20,
      planExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      billingCycle: 'monthly',
      lastPaymentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
  ];

  const handleExportCSV = () => {
    const headers = ['User', 'Email', 'Tier', 'Credits', 'Expiry', 'Status'];
    const csv = [
      headers.join(','),
      ...subscriptions.map(s =>
        [
          `${s.user?.firstName} ${s.user?.lastName}`,
          s.user?.email,
          s.tier,
          s.credits,
          new Date(s.planExpiry).toLocaleDateString(),
          s.status,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpiringSoon = (expiryDate) => {
    const daysUntilExpiry = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
          <p className="text-zinc-400 mt-1">Manage user subscriptions and billing</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
        >
          <FiDownload size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Active Subscriptions</p>
          <p className="text-2xl font-bold text-white mt-2">{subscriptions.length}</p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Monthly Revenue</p>
          <p className="text-2xl font-bold text-white mt-2">$5,420</p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Expiring Soon</p>
          <p className="text-2xl font-bold text-yellow-400 mt-2">3</p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Average Tier</p>
          <p className="text-2xl font-bold text-white mt-2">Pro</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-alt border border-white/10 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedTier}
            onChange={(e) => {
              setSelectedTier(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none transition-colors"
          >
            <option value="">All Tiers</option>
            <option value="Free">Free</option>
            <option value="Student Flash">Student Flash</option>
            <option value="Placement Pro">Placement Pro</option>
            <option value="Infinite Elite">Infinite Elite</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="expiring">Expiring Soon</option>
          </select>

          <button
            onClick={() => {
              setSelectedTier('');
              setSelectedStatus('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <FiFilter size={16} className="inline mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-surface-alt border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-surface">
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">USER</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">EMAIL</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">TIER</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">CREDITS</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">EXPIRES</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">STATUS</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td colSpan="7" className="px-6 py-4">
                          <div className="h-4 bg-zinc-800 rounded w-32 animate-pulse" />
                        </td>
                      </tr>
                    ))
                : subscriptions.map((sub) => (
                    <tr key={sub._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        {sub.user?.firstName} {sub.user?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{sub.user?.email}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full font-medium">
                          {sub.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{sub.credits}</td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{formatDate(sub.planExpiry)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            isExpired(sub.planExpiry)
                              ? 'bg-red-500/20 text-red-400'
                              : isExpiringSoon(sub.planExpiry)
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {isExpired(sub.planExpiry) ? 'Expired' : isExpiringSoon(sub.planExpiry) ? 'Expiring Soon' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-zinc-400 hover:text-primary transition-colors" title="Edit">
                          <FiEdit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && subscriptions.length > 0 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-sm text-zinc-500">Page {currentPage}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
              >
                <FiChevronLeft size={16} />
              </button>
              <button onClick={() => setCurrentPage(currentPage + 1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;
