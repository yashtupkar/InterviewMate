import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { FiSearch, FiFilter, FiDownload, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2, FiEye, FiX } from 'react-icons/fi';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: '',
    tier: '',
    creditsToAdd: 0,
    extendDays: 0
  });

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
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Update status if changed
      if (editFormData.status !== selectedUser.status) {
        await axios.patch(`${backendURL}/api/admin/users/${selectedUser._id}/status`, 
          { status: editFormData.status }, { headers });
      }

      // Update subscription if needed
      if (editFormData.tier !== selectedUser.subscription?.tier || editFormData.creditsToAdd > 0 || editFormData.extendDays > 0) {
        await axios.patch(`${backendURL}/api/admin/users/${selectedUser._id}/subscription`, 
          { 
            tier: editFormData.tier,
            creditsToAdd: parseInt(editFormData.creditsToAdd),
            extendDays: parseInt(editFormData.extendDays)
          }, { headers });
      }

      toast.success('User updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will set their status to deleted.')) return;

    try {
      const token = await getToken();
      await axios.delete(`${backendURL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User soft-deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete user');
    }
  };

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
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>

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
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">USER</th>
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
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5 bg-surface animate-pulse">
                    <td colSpan="7" className="px-6 py-4">
                      <div className="h-4 bg-zinc-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`} 
                          alt="" 
                          className="w-8 h-8 rounded-full border border-white/5"
                        />
                        <p className="font-medium text-white">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
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
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        user.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                        user.status === 'deleted' ? 'bg-red-500/20 text-red-400' : 
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setEditFormData({
                              status: user.status,
                              tier: user.subscription?.tier || 'Free',
                              creditsToAdd: 0,
                              extendDays: 0
                            });
                            setShowEditModal(true);
                          }}
                          className="text-zinc-400 hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-zinc-400 hover:text-red-400 transition-colors"
                          title="Delete"
                          disabled={user.status === 'deleted'}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-zinc-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
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

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-alt border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-surface">
              <h3 className="text-xl font-bold text-white">Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 mb-6">
                <img 
                  src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.firstName}+${selectedUser.lastName}&background=random`} 
                  alt="" 
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-sm text-zinc-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">User Status</label>
                  <select 
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary/50"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Subscription Tier</label>
                  <select 
                    value={editFormData.tier}
                    onChange={(e) => setEditFormData({...editFormData, tier: e.target.value})}
                    className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary/50"
                  >
                    <option value="Free">Free</option>
                    <option value="Student Flash">Student Flash</option>
                    <option value="Placement Pro">Placement Pro</option>
                    <option value="Infinite Elite">Infinite Elite</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Add Credits</label>
                    <input 
                      type="number"
                      value={editFormData.creditsToAdd}
                      onChange={(e) => setEditFormData({...editFormData, creditsToAdd: e.target.value})}
                      className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary/50"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Extend (Days)</label>
                    <input 
                      type="number"
                      value={editFormData.extendDays}
                      onChange={(e) => setEditFormData({...editFormData, extendDays: e.target.value})}
                      className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary/50"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-black font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
