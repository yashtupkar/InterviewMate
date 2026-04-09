import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { FiSearch, FiFilter, FiDownload, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const FeedbackManagement = () => {
  const { getToken } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minRating, setMinRating] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFeedbacks();
  }, [getToken, minRating, currentPage]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(minRating && { minRating }),
      });

      const res = await axios.get(`${backendURL}/api/admin/feedback?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
      setFeedbacks(generateMockFeedbacks());
    } finally {
      setLoading(false);
    }
  };

  const generateMockFeedbacks = () => [
    {
      _id: '1',
      user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      rating: 5,
      feedback: 'Excellent platform for interview preparation!',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      _id: '2',
      user: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      rating: 4,
      feedback: 'Great features, could use better UI.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      _id: '3',
      user: { firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com' },
      rating: 3,
      feedback: 'Good but needs more interview types.',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  ];

  const handleExportCSV = () => {
    const headers = ['User', 'Email', 'Rating', 'Feedback', 'Date'];
    const csv = [
      headers.join(','),
      ...feedbacks.map(f =>
        [
          `${f.user?.firstName} ${f.user?.lastName}`,
          f.user?.email,
          f.rating,
          `"${f.feedback}"`,
          new Date(f.createdAt).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${new Date().toISOString().split('T')[0]}.csv`;
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

  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : 0;

  const ratingDistribution = {
    5: feedbacks.filter(f => f.rating === 5).length,
    4: feedbacks.filter(f => f.rating === 4).length,
    3: feedbacks.filter(f => f.rating === 3).length,
    2: feedbacks.filter(f => f.rating === 2).length,
    1: feedbacks.filter(f => f.rating === 1).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Feedback Management</h1>
          <p className="text-zinc-400 mt-1">Review user feedback and ratings</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
          <p className="text-zinc-400 text-sm">Average Rating</p>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-4xl font-bold text-primary">{avgRating}</p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={16} className={i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
          <p className="text-zinc-400 text-sm mb-4">Rating Distribution</p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-6">{rating}★</span>
                <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${(ratingDistribution[rating] / (feedbacks.length || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400 w-8 text-right">{ratingDistribution[rating]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">Filter by minimum rating:</span>
          <select
            value={minRating}
            onChange={(e) => {
              setMinRating(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none transition-colors"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>
        </div>
      </div>

      {/* Feedback Cards */}
      <div className="space-y-4">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-surface-alt border border-white/10 rounded-xl p-4 h-24 animate-pulse" />
            ))
        ) : feedbacks.length > 0 ? (
          feedbacks.map((feedback) => (
            <div key={feedback._id} className="bg-surface-alt border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-white">{feedback.user?.firstName} {feedback.user?.lastName}</p>
                  <p className="text-xs text-zinc-500">{feedback.user?.email}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={14}
                      className={i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-zinc-300">{feedback.feedback}</p>
              <p className="text-xs text-zinc-500 mt-3">{formatDate(feedback.createdAt)}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-zinc-500">No feedback found</div>
        )}
      </div>

      {/* Pagination */}
      {!loading && feedbacks.length > 0 && (
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

export default FeedbackManagement;
