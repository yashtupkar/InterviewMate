import React, { useState } from 'react';
import { FiRefreshCw, FiTrendingUp, FiUsers, FiClock } from 'react-icons/fi';

const ToolAnalysis = () => {
  const [analytics] = useState({
    ats: {
      totalScans: 1245,
      avgScore: 72.5,
      commonIssues: [
        { issue: 'Formatting Issues', count: 345, percentage: 27 },
        { issue: 'Keyword Gaps', count: 312, percentage: 25 },
        { issue: 'ATS Keywords Missing', count: 278, percentage: 22 },
        { issue: 'Length Issues', count: 245, percentage: 19 },
      ],
      topCompanies: [
        { company: 'Google', count: 234 },
        { company: 'Microsoft', count: 198 },
        { company: 'Amazon', count: 187 },
        { company: 'Apple', count: 156 },
      ],
    },
    resumeBuilder: {
      totalResumes: 892,
      avgTimeSpent: 45,
      mostUsedTemplate: 'Modern',
      exportedCount: 654,
      completionRate: 73,
    },
    gd: {
      totalSessions: 456,
      avgScore: 7.2,
      mostUsedTopic: 'Current Affairs',
      avgDuration: 12,
      topAgents: [
        { name: 'Alex', usage: 234 },
        { name: 'Jordan', usage: 189 },
        { name: 'Casey', usage: 167 },
      ],
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tools Analytics</h1>
          <p className="text-zinc-400 mt-1">Platform tool usage and performance metrics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
          <FiRefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ATS Analyzer Stats */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">ATS Analyzer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-zinc-400 text-sm font-medium">Total Scans</p>
                <p className="text-3xl font-bold text-white mt-2">{analytics.ats.totalScans.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                <FiTrendingUp size={20} />
              </div>
            </div>
          </div>

          <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-zinc-400 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-white mt-2">{analytics.ats.avgScore}%</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                <FiTrendingUp size={20} />
              </div>
            </div>
          </div>

          <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-zinc-400 text-sm font-medium">Pass Rate</p>
                <p className="text-3xl font-bold text-green-400 mt-2">68%</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400">
                <FiTrendingUp size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Most Common Issues</h3>
          <div className="space-y-3">
            {analytics.ats.commonIssues.map((issue, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{issue.issue}</p>
                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-primary" style={{ width: `${issue.percentage}%` }} />
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-white font-semibold">{issue.count}</p>
                  <p className="text-xs text-zinc-500">{issue.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Target Companies</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {analytics.ats.topCompanies.map((company, idx) => (
              <div key={idx} className="bg-surface rounded-lg p-4 border border-white/5">
                <p className="text-white font-medium">{company.company}</p>
                <p className="text-2xl font-bold text-primary mt-2">{company.count}</p>
                <p className="text-xs text-zinc-500 mt-1">scans</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Builder Stats */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Resume Builder</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
            <p className="text-zinc-400 text-sm font-medium">Total Resumes</p>
            <p className="text-3xl font-bold text-white mt-2">{analytics.resumeBuilder.totalResumes}</p>
            <p className="text-xs text-green-400/70 mt-2">↑ 12% this month</p>
          </div>

          <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
            <p className="text-zinc-400 text-sm font-medium">Avg Time Spent</p>
            <p className="text-3xl font-bold text-white mt-2">{analytics.resumeBuilder.avgTimeSpent}m</p>
            <p className="text-xs text-zinc-500 mt-2">per resume</p>
          </div>

          <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
            <p className="text-zinc-400 text-sm font-medium">Exported</p>
            <p className="text-3xl font-bold text-white mt-2">{analytics.resumeBuilder.exportedCount}</p>
            <p className="text-xs text-zinc-500 mt-2">{analytics.resumeBuilder.completionRate}% completion</p>
          </div>

          <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
            <p className="text-zinc-400 text-sm font-medium">Most Used Template</p>
            <p className="text-3xl font-bold text-primary mt-2">{analytics.resumeBuilder.mostUsedTemplate}</p>
            <p className="text-xs text-zinc-500 mt-2">template</p>
          </div>
        </div>
      </div>

      {/* GD Session Stats */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Group Discussion Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-zinc-400 text-sm font-medium">Total Sessions</p>
                <p className="text-3xl font-bold text-white mt-2">{analytics.gd.totalSessions}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                <FiUsers size={20} />
              </div>
            </div>
          </div>

          <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-zinc-400 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-white mt-2">{analytics.gd.avgScore}/10</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                <FiTrendingUp size={20} />
              </div>
            </div>
          </div>

          <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-zinc-400 text-sm font-medium">Avg Duration</p>
                <p className="text-3xl font-bold text-white mt-2">{analytics.gd.avgDuration}m</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                <FiClock size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Top Agents */}
        <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Most Used Agents</h3>
          <div className="space-y-3">
            {analytics.gd.topAgents.map((agent, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <p className="text-white font-medium">{agent.name}</p>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(agent.usage / analytics.gd.topAgents[0].usage) * 100}%` }}
                    />
                  </div>
                  <p className="text-white font-semibold w-12">{agent.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Used Topic */}
        <div className="bg-surface-alt border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Popular Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface rounded-lg p-4 border border-white/5">
              <p className="text-white font-medium">Current Affairs</p>
              <p className="text-2xl font-bold text-primary mt-2">127</p>
              <p className="text-xs text-zinc-500 mt-1">sessions</p>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-white/5">
              <p className="text-white font-medium">Technical</p>
              <p className="text-2xl font-bold text-primary mt-2">98</p>
              <p className="text-xs text-zinc-500 mt-1">sessions</p>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-white/5">
              <p className="text-white font-medium">General</p>
              <p className="text-2xl font-bold text-primary mt-2">85</p>
              <p className="text-xs text-zinc-500 mt-1">sessions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolAnalysis;
