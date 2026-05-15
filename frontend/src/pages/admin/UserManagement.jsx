import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { FiSearch, FiFilter, FiDownload, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const UserManagement = () => {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [getToken, search, selectedTier, selectedStatus, currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(search && { search }),
        ...(selectedTier && { tier: selectedTier }),
        ...(selectedStatus && { status: selectedStatus }),
      });

      const res = await axios.get(`${backendURL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Failed to load users');
      // Mock data for development
      setUsers(generateMockUsers());
    } finally {
      setLoading(false);
    }
  };

  const generateMockUsers = () => [
    {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      subscription: { tier: 'Placement Pro', credits: 50, expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      status: 'active',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      _id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      subscription: { tier: 'Student Flash', credits: 20, expiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(),
    },
    {
      _id: '3',
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob@example.com',
      subscription: { tier: 'Free', credits: 5, expiry: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  ];

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Tier', 'Credits', 'Status', 'Joined Date'];
    const csv = [
      headers.join(','),
      ...users.map(u =>
        [
          `${u.firstName} ${u.lastName}`,
          u.email,
          u.subscription?.tier || 'N/A',
          u.subscription?.credits || 0,
          u.status,
          new Date(u.createdAt).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-zinc-400 mt-1">Manage platform users and their subscriptions</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
        >
          <FiDownload size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface-alt border border-white/10 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:border-primary/50 outline-none transition-colors"
            />
          </div>

          {/* Tier Filter */}
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

          {/* Status Filter */}
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
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSearch('');
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

      {/* Users Table */}
      <div className="bg-surface-alt border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-surface">
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">NAME</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">EMAIL</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">TIER</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">CREDITS</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">JOINED</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">STATUS</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                      <td colSpan="7" className="px-6 py-4">
                        <div className="h-4 bg-zinc-800 rounded w-32 animate-pulse" />
                      </td>
                    </tr>
                  ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">
                        {user.firstName} {user.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full font-medium">
                        {user.subscription?.tier || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{user.subscription?.credits || 0}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          user.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetail(true);
                        }}
                        className="text-zinc-400 hover:text-primary transition-colors"
                        title="View details"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-zinc-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-sm text-zinc-500">Page {currentPage} - Showing {users.length} users</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
