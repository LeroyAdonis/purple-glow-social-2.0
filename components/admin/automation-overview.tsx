'use client';

import React from 'react';

interface AutomationRule {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  frequency: string;
  coreTopic: string | null;
  isActive: boolean;
  creditsConsumed?: number;
  postsGenerated?: number;
  nextRun?: string | null;
  createdAt: string;
}

interface AutomationOverviewProps {
  rules: AutomationRule[];
  stats: {
    totalRules: number;
    activeRules: number;
    totalCreditsConsumed: number;
    totalPostsGenerated: number;
  };
  isLoading?: boolean;
}

export default function AutomationOverview({ rules, stats, isLoading }: AutomationOverviewProps) {
  if (isLoading) {
    return (
      <div className="aerogel-card p-6 rounded-2xl animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Group rules by user
  const rulesByUser: Record<string, AutomationRule[]> = {};
  rules.forEach(rule => {
    const key = rule.userEmail || rule.userId;
    if (!rulesByUser[key]) {
      rulesByUser[key] = [];
    }
    rulesByUser[key].push(rule);
  });

  const topUsers = Object.entries(rulesByUser)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-robot text-2xl text-neon-grape"></i>
          </div>
          <p className="text-3xl font-display font-bold">{stats.totalRules}</p>
          <p className="text-sm text-gray-400 mt-1">Total Rules</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-play-circle text-2xl text-green-400"></i>
          </div>
          <p className="text-3xl font-display font-bold text-green-400">{stats.activeRules}</p>
          <p className="text-sm text-gray-400 mt-1">Active Rules</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-coins text-2xl text-mzansi-gold"></i>
          </div>
          <p className="text-3xl font-display font-bold">{stats.totalCreditsConsumed.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">Credits Consumed</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-paper-plane text-2xl text-joburg-teal"></i>
          </div>
          <p className="text-3xl font-display font-bold">{stats.totalPostsGenerated.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">Posts Generated</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Users with Automation */}
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-6">Top Users by Rules</h3>
          {topUsers.length > 0 ? (
            <div className="space-y-4">
              {topUsers.map(([userKey, userRules], i) => (
                <div key={userKey} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                  <span className="w-6 h-6 rounded-full bg-neon-grape/20 text-neon-grape text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userKey}</p>
                    <p className="text-xs text-gray-500">
                      {userRules.filter(r => r.isActive).length} active of {userRules.length} rules
                    </p>
                  </div>
                  <span className="font-mono text-sm text-gray-400">{userRules.length}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <i className="fa-solid fa-robot text-3xl mb-3 opacity-50"></i>
              <p>No automation rules created yet</p>
            </div>
          )}
        </div>

        {/* Active Rules Distribution */}
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-6">Rules Status</h3>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-40 h-40">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  className="text-white/10"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - stats.activeRules / Math.max(stats.totalRules, 1))}`}
                  className="text-green-400 transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-bold">
                  {stats.totalRules > 0 ? Math.round((stats.activeRules / stats.totalRules) * 100) : 0}%
                </span>
                <span className="text-xs text-gray-400">Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-400"></div>
              <span className="text-sm text-gray-400">Active ({stats.activeRules})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-white/10"></div>
              <span className="text-sm text-gray-400">Paused ({stats.totalRules - stats.activeRules})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Rules List */}
      <div className="aerogel-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-glass-border">
          <h3 className="font-display font-bold text-xl">Active Automation Rules</h3>
        </div>
        {rules.filter(r => r.isActive).length === 0 ? (
          <div className="text-center py-12">
            <i className="fa-solid fa-pause-circle text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400">No active automation rules</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-glass-border">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Topic</th>
                  <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Frequency</th>
                  <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Next Run</th>
                  <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Credits Used</th>
                  <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {rules.filter(r => r.isActive).slice(0, 10).map((rule) => (
                  <tr key={rule.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{rule.userEmail || rule.userName || 'Unknown'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{rule.coreTopic || 'No topic'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-white/10 text-xs font-medium capitalize">
                        {rule.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {rule.nextRun ? new Date(rule.nextRun).toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-mzansi-gold">{rule.creditsConsumed || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
