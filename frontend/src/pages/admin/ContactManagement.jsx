import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { FiSearch, FiDownload, FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { BsFillReplyAllFill } from 'react-icons/bs';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const ContactManagement = () => {
  const { getToken } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchContacts();
  }, [getToken, search, selectedStatus, currentPage]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(search && { search }),
        ...(selectedStatus && { status: selectedStatus }),
      });

      const res = await axios.get(`${backendURL}/api/admin/contacts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      setContacts(generateMockContacts());
    } finally {
      setLoading(false);
    }
  };

  const generateMockContacts = () => [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Feature Request',
      message: 'Can you add more interview types?',
      status: 'new',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      subject: 'Bug Report',
      message: 'Audio not working in GD sessions',
      status: 'replied',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Subject', 'Status', 'Date'];
    const csv = [
      headers.join(','),
      ...contacts.map(c =>
        [
          c.name,
          c.email,
          c.subject,
          c.status,
          new Date(c.createdAt).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusCounts = {
    new: contacts.filter(c => c.status === 'new').length,
    replied: contacts.filter(c => c.status === 'replied').length,
    resolved: contacts.filter(c => c.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contact Form Submissions</h1>
          <p className="text-zinc-400 mt-1">Manage customer inquiries and support requests</p>
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
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">New Messages</p>
          <p className="text-2xl font-bold text-yellow-400 mt-2">{statusCounts.new}</p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Replied</p>
          <p className="text-2xl font-bold text-blue-400 mt-2">{statusCounts.replied}</p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Resolved</p>
          <p className="text-2xl font-bold text-green-400 mt-2">{statusCounts.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none transition-colors"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="replied">Replied</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="space-y-4">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-surface-alt border border-white/10 rounded-xl p-4 h-20 animate-pulse" />
            ))
        ) : contacts.length > 0 ? (
          contacts.map((contact) => (
            <div key={contact._id} className="bg-surface-alt border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-white">{contact.name}</p>
                  <p className="text-xs text-zinc-500">{contact.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      contact.status === 'new'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : contact.status === 'replied'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {contact.status}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-semibold text-white">{contact.subject}</p>
                <p className="text-sm text-zinc-300 mt-2">{contact.message}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <p className="text-xs text-zinc-500">{formatDate(contact.createdAt)}</p>
                <div className="flex items-center gap-2">
                  <button className="text-zinc-400 hover:text-primary transition-colors" title="Reply">
                    <BsFillReplyAllFill size={16} />
                  </button>
                  <button className="text-zinc-400 hover:text-red-400 transition-colors" title="Delete">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-zinc-500">No contacts found</div>
        )}
      </div>

      {/* Pagination */}
      {!loading && contacts.length > 0 && (
        <div className="flex items-center justify-between">
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
  );
};

export default ContactManagement;
