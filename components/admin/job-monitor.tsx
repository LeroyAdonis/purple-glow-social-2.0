'use client';

import React, { useState } from 'react';

interface Job {
  id: string;
  inngestEventId: string | null;
  functionName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  payload: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

interface JobMonitorProps {
  jobs: Job[];
  stats: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
    averageRetries: number;
  };
  onRetry: (jobId: string) => Promise<void>;
  onViewDetails: (job: Job) => void;
  isLoading?: boolean;
}

export default function JobMonitor({ jobs, stats, onRetry, onViewDetails, isLoading }: JobMonitorProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'running' | 'failed'>('all');
  const [retrying, setRetrying] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="aerogel-card p-6 rounded-2xl animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-xl"></div>
      </div>
    );
  }

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const handleRetry = async (jobId: string) => {
    setRetrying(jobId);
    try {
      await onRetry(jobId);
    } finally {
      setRetrying(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'running': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'fa-solid fa-clock';
      case 'running': return 'fa-solid fa-spinner fa-spin';
      case 'completed': return 'fa-solid fa-check-circle';
      case 'failed': return 'fa-solid fa-times-circle';
      case 'cancelled': return 'fa-solid fa-ban';
      default: return 'fa-solid fa-question-circle';
    }
  };

  const formatFunctionName = (name: string) => {
    // Convert camelCase or kebab-case to readable format
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/-/g, ' ')
      .replace(/\./g, ' → ')
      .trim();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="aerogel-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <i className="fa-solid fa-list text-lg text-gray-400"></i>
          </div>
          <p className="text-2xl font-display font-bold">{stats.total}</p>
          <p className="text-xs text-gray-400">Total Jobs</p>
        </div>
        
        <div className="aerogel-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <i className="fa-solid fa-clock text-lg text-yellow-400"></i>
          </div>
          <p className="text-2xl font-display font-bold text-yellow-400">{stats.pending}</p>
          <p className="text-xs text-gray-400">Pending</p>
        </div>
        
        <div className="aerogel-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <i className="fa-solid fa-spinner text-lg text-blue-400"></i>
          </div>
          <p className="text-2xl font-display font-bold text-blue-400">{stats.running}</p>
          <p className="text-xs text-gray-400">Running</p>
        </div>
        
        <div className="aerogel-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <i className="fa-solid fa-check-circle text-lg text-green-400"></i>
          </div>
          <p className="text-2xl font-display font-bold text-green-400">{stats.completed}</p>
          <p className="text-xs text-gray-400">Completed</p>
        </div>
        
        <div className="aerogel-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <i className="fa-solid fa-times-circle text-lg text-red-400"></i>
          </div>
          <p className="text-2xl font-display font-bold text-red-400">{stats.failed}</p>
          <p className="text-xs text-gray-400">Failed</p>
        </div>
        
        <div className="aerogel-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <i className="fa-solid fa-rotate-right text-lg text-mzansi-gold"></i>
          </div>
          <p className="text-2xl font-display font-bold">{stats.averageRetries.toFixed(1)}</p>
          <p className="text-xs text-gray-400">Avg Retries</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'running', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-neon-grape text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'failed' && stats.failed > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs">
                {stats.failed}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="aerogel-card rounded-2xl overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <i className="fa-solid fa-check-circle text-4xl text-green-400 mb-4"></i>
            <p className="text-gray-400">No {filter === 'all' ? '' : filter} jobs</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-glass-border">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Function</th>
                  <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Retries</th>
                  <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Error</th>
                  <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {filteredJobs.slice(0, 20).map((job) => (
                  <tr key={job.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(job.status)}`}>
                        <i className={getStatusIcon(job.status)}></i>
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{formatFunctionName(job.functionName)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(job.createdAt).toLocaleString('en-ZA', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-mono ${job.retryCount > 0 ? 'text-mzansi-gold' : 'text-gray-500'}`}>
                        {job.retryCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {job.errorMessage ? (
                        <span className="text-sm text-red-400 truncate max-w-[200px] block" title={job.errorMessage}>
                          {job.errorMessage.slice(0, 50)}...
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetails(job)}
                          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        {job.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(job.id)}
                            disabled={retrying === job.id}
                            className="p-2 rounded-lg hover:bg-neon-grape/20 text-neon-grape hover:text-white transition-colors disabled:opacity-50"
                            title="Retry Job"
                          >
                            {retrying === job.id ? (
                              <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fa-solid fa-rotate-right"></i>
                            )}
                          </button>
                        )}
                      </div>
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
