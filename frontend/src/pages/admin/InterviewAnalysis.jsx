import React, { useState } from 'react';
import { FiSearch, FiFilter, FiDownload, FiChevronLeft, FiChevronRight, FiEye, FiFlag } from 'react-icons/fi';
import toast from 'react-hot-toast';

const InterviewAnalysis = () => {
  const [sessions, setSessions] = useState(generateMockSessions());
  const [selectedType, setSelectedType] = useState('');
  const [minScore, setMinScore] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  function generateMockSessions() {
    return [
      {
        _id: '1',
        user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        type: 'Interview',
        interviewType: 'technical',
        score: 8.5,
        duration: 12,
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        report: {
          strengths: ['Problem solving', 'Communication'],
          weaknesses: ['Time management'],
          suggestions: ['Practice more problems'],
        },
      },
      {
        _id: '2',
        user: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
        type: 'GD',
        interviewType: 'general',
        score: 7.2,
        duration: 15,
        status: 'completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        report: {
          strengths: ['Leadership', 'Teamwork'],
          weaknesses: ['Deep technical knowledge'],
          suggestions: ['Improve technical depth'],
        },
      },
    ];
  }

  const handleExportCSV = () => {
    const headers = ['User', 'Type', 'Score', 'Duration', 'Status', 'Date'];
    const csv = [
      headers.join(','),
      ...sessions.map(s =>
        [
          `${s.user?.firstName} ${s.user?.lastName}`,
          s.type,
          s.score,
          s.duration,
          s.status,
          new Date(s.createdAt).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interviews-${new Date().toISOString().split('T')[0]}.csv`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Interview & GD Analysis</h1>
          <p className="text-zinc-400 mt-1">Review interview and group discussion sessions</p>
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
          <p className="text-zinc-400 text-sm">Total Sessions</p>
          <p className="text-2xl font-bold text-white mt-2">{sessions.length}</p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Avg Score</p>
          <p className="text-2xl font-bold text-white mt-2">
            {(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length).toFixed(1)}
          </p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Avg Duration</p>
          <p className="text-2xl font-bold text-white mt-2">
            {Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length)}m
          </p>
        </div>
        <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Completion Rate</p>
          <p className="text-2xl font-bold text-green-400 mt-2">100%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-alt border border-white/10 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none"
          >
            <option value="">All Types</option>
            <option value="Interview">Interview</option>
            <option value="GD">Group Discussion</option>
          </select>

          <input
            type="number"
            placeholder="Min Score"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            min="0"
            max="10"
            className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:border-primary/50 outline-none"
          />

          <button
            onClick={() => {
              setSelectedType('');
              setMinScore('');
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <FiFilter size={16} className="inline mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-surface-alt border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-surface">
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">USER</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">TYPE</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">SCORE</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">DURATION</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">DATE</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">STATUS</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    {session.user?.firstName} {session.user?.lastName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-medium">
                      {session.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-white">{session.score}/10</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{session.duration}m</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{formatDate(session.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-medium">
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="text-zinc-400 hover:text-primary transition-colors" title="View Report">
                      <FiEye size={16} />
                    </button>
                    <button className="text-zinc-400 hover:text-yellow-400 transition-colors" title="Flag">
                      <FiFlag size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">Page {currentPage}</p>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors">
            <FiChevronLeft size={16} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewAnalysis;
