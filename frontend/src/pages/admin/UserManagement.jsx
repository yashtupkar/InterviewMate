import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiFilter, FiDownload, FiChevronLeft, FiChevronRight, 
  FiMoreVertical, FiEye, FiTrash2, FiUserCheck, FiUserX, FiShield, FiDollarSign 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import UniversalPopup from '../../components/common/UniversalPopup';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const UserManagement = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters mapped
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Active User Context
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // Modals state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Quick stats
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });

  useEffect(() => {
    fetchUsers();
    // close dropdown on click outside
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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
        setTotalUsers(res.data.pagination.total);
        
        // Compute basic stats organically currently
        // In real app, you might want to fetch stats specifically
        const data = res.data.data;
        setStats({
          total: res.data.pagination.total,
          active: data.filter(u => u.status === 'active').length,
          suspended: data.filter(u => u.status === 'suspended').length
        });
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleToggleStatus = async (user) => {
    const isActivating = user.status === 'suspended';
    const endpoint = isActivating ? 'activate' : 'suspend';
    
    // Quick confirmation
    if (!window.confirm(`Are you sure you want to ${endpoint} ${user.firstName}?`)) return;

    try {
      const token = await getToken();
      await axios.patch(`${backendURL}/api/admin/users/${user._id}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`User ${endpoint}d successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to ${endpoint} user`);
      console.error(error);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to soft delete this user?')) return;
    try {
      const token = await getToken();
      await axios.delete(`${backendURL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
      console.error(error);
    }
  };

  const handleRoleChange = async (role) => {
    try {
      const token = await getToken();
      await axios.patch(`${backendURL}/api/admin/users/${selectedUser._id}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Role changed to ${role}`);
      setShowRoleModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to change role');
      console.error(error);
    }
  };

  const handleCreditsUpdate = async (amount) => {
    try {
      const token = await getToken();
      await axios.patch(`${backendURL}/api/admin/users/${selectedUser._id}/credits`, { credits: amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Credits updated successfully');
      setShowCreditsModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update credits');
      console.error(error);
    }
  };

  // UI Helpers
  const openActionDropdown = (e, userId) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  };

  const openModal = (user, modalSetter) => {
    setSelectedUser(user);
    modalSetter(true);
    setOpenDropdownId(null);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-zinc-400 mt-1">Manage users, adjust roles, and credit limits</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-alt border border-white/10 px-4 py-2 rounded-xl text-center">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Total</p>
            <p className="text-lg font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-surface-alt border border-white/10 px-4 py-2 rounded-xl text-center">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Active</p>
            <p className="text-lg font-bold text-green-400">{stats.active}</p>
          </div>
          <div className="bg-surface-alt border border-white/10 px-4 py-2 rounded-xl text-center">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Suspended</p>
            <p className="text-lg font-bold text-red-400">{stats.suspended}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:border-primary/50 outline-none"
            />
          </div>
          <select
            value={selectedTier}
            onChange={(e) => { setSelectedTier(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none"
          >
            <option value="">All Plans</option>
            <option value="Free">Free</option>
            <option value="Student Flash">Student Flash</option>
            <option value="Placement Pro">Placement Pro</option>
            <option value="Infinite Elite">Infinite Elite</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>
          <button
            onClick={() => { setSearch(''); setSelectedTier(''); setSelectedStatus(''); setCurrentPage(1); }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition"
          >
            <FiFilter size={16} className="inline mr-2" /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-alt border border-white/10 rounded-xl overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900">
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 font-semibold text-zinc-400">NAME</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">EMAIL</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">ROLE</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">PLAN</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">CREDITS</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">STATUS</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-zinc-500">Loading...</td>
                </tr>
              ) : users.length > 0 ? (
                users.map(user => (
                  <tr 
                    key={user._id} 
                    onClick={() => navigate(`/admin/users/${user._id}`)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary overflow-hidden border border-primary/20">
                           {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.firstName[0]}
                        </div>
                        <span className="font-medium text-white">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-zinc-300'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-primary">{user.subscription?.tier || 'Free'}</td>
                    <td className="px-6 py-4 text-zinc-300 font-mono">{user.subscription?.credits || 0}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                        user.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'
                       }`}>
                         {user.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <button 
                        onClick={(e) => openActionDropdown(e, user._id)}
                        className="p-2 text-zinc-400 hover:text-white rounded-lg transition"
                      >
                        <FiMoreVertical size={16} />
                      </button>

                      {openDropdownId === user._id && (
                        <div className="absolute right-6 top-10 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                           {/* Row Click handled implicitly, removing view details specific button */}
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }}
                             className="w-full text-left px-4 py-2 hover:bg-white/5 text-zinc-300 flex items-center gap-2"
                           >
                             {user.status === 'suspended' ? <FiUserCheck size={14} /> : <FiUserX size={14} />}
                             {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); openModal(user, setShowCreditsModal); }}
                             className="w-full text-left px-4 py-2 hover:bg-white/5 text-zinc-300 flex items-center gap-2"
                           >
                             <FiDollarSign size={14} /> Manage Credits
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); openModal(user, setShowRoleModal); }}
                             className="w-full text-left px-4 py-2 hover:bg-white/5 text-zinc-300 flex items-center gap-2"
                           >
                             <FiShield size={14} /> Change Role
                           </button>
                           <div className="border-t border-white/5 my-1" />
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleDelete(user._id); }}
                             disabled={user.status === 'deleted'}
                             className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 flex items-center gap-2 disabled:opacity-50"
                           >
                             <FiTrash2 size={14} /> Soft Delete
                           </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-zinc-500">No users found match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center bg-surface-alt px-6 py-4 rounded-xl border border-white/10">
         <span className="text-zinc-500 text-sm">Page {currentPage}</span>
         <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10"
            >
              <FiChevronLeft className="text-white" />
            </button>
            <button 
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 bg-white/5 rounded-lg hover:bg-white/10"
            >
              <FiChevronRight className="text-white" />
            </button>
         </div>
      </div>

      {/* Modals using UniversalPopup */}

      {/* 1. View User Modal */}
      <UniversalPopup
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="User Profile"
        description="Detailed view of user statistics"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex gap-4 items-center mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xl font-bold">
                {selectedUser.firstName[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</h3>
                <p className="text-zinc-400">{selectedUser.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-zinc-500 mb-1">Joined</p>
                <p className="text-white font-medium">{formatDate(selectedUser.createdAt)}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-zinc-500 mb-1">Last Login</p>
                <p className="text-white font-medium">{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'N/A'}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-zinc-500 mb-1">Role</p>
                <p className="text-white font-medium capitalize">{selectedUser.role}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-zinc-500 mb-1">Current Plan</p>
                <p className="text-primary font-medium">{selectedUser.subscription?.tier || 'Free'}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </UniversalPopup>

      {/* 2. Credits Modal */}
      <UniversalPopup
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        title="Manage Credits"
        description="Quickly assign credits for AI usage."
      >
        {selectedUser && (
          <div>
            <div className="bg-black/30 p-4 rounded-xl border border-primary/20 mb-6 flex justify-between items-center">
              <span className="text-zinc-400">Current Balance:</span>
              <span className="text-2xl font-black text-white font-mono">
                {selectedUser.subscription?.credits || 0}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => handleCreditsUpdate((selectedUser.subscription?.credits || 0) + 50)}
                className="px-4 py-3 bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/30 transition-all font-bold"
              >
                +50 Credits
              </button>
              <button 
                onClick={() => handleCreditsUpdate((selectedUser.subscription?.credits || 0) + 100)}
                className="px-4 py-3 bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/30 transition-all font-bold"
              >
                +100 Credits
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => handleCreditsUpdate(0)}
                className="flex-1 px-4 py-2 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-all"
              >
                Reset to 0
              </button>
            </div>
          </div>
        )}
      </UniversalPopup>

      {/* 3. Role Modal */}
      <UniversalPopup
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Change Authority Role"
        description="Modify the user's access boundaries."
      >
        {selectedUser && (
          <div className="space-y-4">
             <button 
               onClick={() => handleRoleChange('user')}
               className={`w-full p-4 rounded-xl border text-left flex gap-4 transition-all ${
                 selectedUser.role === 'user' ? 'bg-primary/10 border-primary shadow-sm shadow-primary/20' : 'bg-black/30 border-white/5 hover:border-white/20'
               }`}
             >
               <div className={`p-2 rounded-lg h-fit ${selectedUser.role === 'user' ? 'bg-primary text-black' : 'bg-white/10 text-white'}`}>
                 <FiUserCheck size={20} />
               </div>
               <div>
                  <h4 className="text-white font-bold mb-1">Standard User</h4>
                  <p className="text-xs text-zinc-500">Normal permissions to use the platform naturally.</p>
               </div>
             </button>

             <button 
               onClick={() => handleRoleChange('admin')}
               className={`w-full p-4 rounded-xl border text-left flex gap-4 transition-all ${
                 selectedUser.role === 'admin' ? 'bg-primary/10 border-primary shadow-sm shadow-primary/20' : 'bg-black/30 border-white/5 hover:border-white/20'
               }`}
             >
               <div className={`p-2 rounded-lg h-fit ${selectedUser.role === 'admin' ? 'bg-primary text-black' : 'bg-white/10 text-white'}`}>
                 <FiShield size={20} />
               </div>
               <div>
                  <h4 className="text-white font-bold mb-1">System Administrator</h4>
                  <p className="text-xs text-zinc-500">Unrestricted access. Use with caution.</p>
               </div>
             </button>
          </div>
        )}
      </UniversalPopup>

    </div>
  );
};

export default UserManagement;
