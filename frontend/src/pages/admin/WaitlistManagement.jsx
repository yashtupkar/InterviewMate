import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { FiSearch, FiDownload, FiChevronLeft, FiChevronRight, FiMail, FiCheckCircle, FiTrash2, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const WaitlistManagement = () => {
  const { getToken } = useAuth();
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [emailTemplate, setEmailTemplate] = useState('launch');

  useEffect(() => {
    fetchWaitlist();
  }, [getToken, search, selectedStatus, currentPage]);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(search && { search }),
        ...(selectedStatus && { status: selectedStatus }),
      });

      const res = await axios.get(`${backendURL}/api/admin/waitlist?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setWaitlist(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch waitlist:', err);
      setWaitlist(generateMockWaitlist());
    } finally {
      setLoading(false);
    }
  };

  const generateMockWaitlist = () => [
    {
      _id: '1',
      email: 'user1@example.com',
      status: 'pending',
      joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      _id: '2',
      email: 'user2@example.com',
      status: 'contacted',
      joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      _id: '3',
      email: 'user3@example.com',
      status: 'accepted',
      joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  const handleExportCSV = () => {
    const headers = ['Email', 'Status', 'Joined Date'];
    const csv = [
      headers.join(','),
      ...waitlist.map(w =>
        [
          w.email,
          w.status,
          new Date(w.joinedAt).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmails(waitlist.map(w => w.email));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSelectEmail = (email) => {
    setSelectedEmails(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleSendBulkEmail = async () => {
    if (selectedEmails.length === 0) {
      toast.error('Select at least one email');
      return;
    }

    try {
      const token = await getToken();
      const res = await axios.post(
        `${backendURL}/api/admin/waitlist/send-notification`,
        { recipients: selectedEmails, template: emailTemplate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(`Email sent to ${selectedEmails.length} recipients`);
        setShowEmailModal(false);
        setSelectedEmails([]);
      }
    } catch (err) {
      console.error('Failed to send emails:', err);
      toast.error('Failed to send emails');
    }
  };

  const handleGrantAccess = async () => {
    if (selectedEmails.length === 0) {
      toast.error('Select at least one email');
      return;
    }

    try {
      const token = await getToken();
      const res = await axios.post(
        `${backendURL}/api/admin/waitlist/grant-access`,
        { emails: selectedEmails, tier: 'Student Flash' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(`Access granted to ${selectedEmails.length} users`);
        setSelectedEmails([]);
        fetchWaitlist();
      }
    } catch (err) {
      console.error('Failed to grant access:', err);
      toast.error('Failed to grant access');
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to remove this entry from the waitlist?')) return;

    try {
      const token = await getToken();
      await axios.delete(`${backendURL}/api/admin/waitlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Waitlist entry removed');
      fetchWaitlist();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to remove entry');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusCounts = {
    pending: waitlist.filter(w => w.status === 'pending').length,
    contacted: waitlist.filter(w => w.status === 'contacted').length,
    accepted: waitlist.filter(w => w.status === 'accepted').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Waitlist Management</h1>
          <p className="text-zinc-400 mt-1">Manage early access signups</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Waitlist', value: waitlist.length, color: 'text-white' },
          { label: 'Pending', value: statusCounts.pending, color: 'text-yellow-400' },
          { label: 'Accepted', value: statusCounts.accepted, color: 'text-green-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface-alt border border-white/10 rounded-xl p-4 shadow-lg shadow-black/20">
            <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedEmails.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <p className="text-primary font-medium">{selectedEmails.length} recipients selected</p>
          <div className="flex gap-2">
            <button
              onClick={handleGrantAccess}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-bold text-sm"
            >
              <FiCheckCircle size={16} />
              Grant Access
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors font-bold text-sm"
            >
              <FiMail size={16} />
              Email
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:border-primary/50 outline-none transition-colors"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none transition-colors"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>
      </div>

      {/* Waitlist Table */}
      <div className="bg-surface-alt border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-surface">
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedEmails.length === waitlist.length && waitlist.length > 0}
                    className="w-4 h-4 rounded border-white/20 bg-surface text-primary focus:ring-0"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5 animate-pulse bg-surface">
                    <td colSpan="5" className="px-6 py-4">
                      <div className="h-4 bg-zinc-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : waitlist.length > 0 ? (
                waitlist.map((entry) => (
                  <tr key={entry._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(entry.email)}
                        onChange={() => handleSelectEmail(entry.email)}
                        className="w-4 h-4 rounded border-white/20 bg-surface text-primary focus:ring-0"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{entry.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        entry.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                        entry.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' : 
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{formatDate(entry.joinedAt)}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDeleteEntry(entry._id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" 
                        title="Remove"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-zinc-500">No entries found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && waitlist.length > 0 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-sm text-zinc-500">Page {currentPage}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors text-white"
              >
                <FiChevronLeft size={16} />
              </button>
              <button onClick={() => setCurrentPage(currentPage + 1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-alt border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-surface">
              <h2 className="text-xl font-bold text-white">Send Notification</h2>
              <button onClick={() => setShowEmailModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">Email Template</label>
                <select
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none transition-colors"
                >
                  <option value="launch">Platform Launch</option>
                  <option value="early_access">Early Access Offer</option>
                  <option value="welcome">Welcome</option>
                </select>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <p className="text-sm text-primary">Sending to <strong>{selectedEmails.length}</strong> recipients.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendBulkEmail}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-black rounded-xl hover:bg-primary-hover transition-all font-bold shadow-lg shadow-primary/20"
                >
                  <FiSend size={16} />
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitlistManagement;
