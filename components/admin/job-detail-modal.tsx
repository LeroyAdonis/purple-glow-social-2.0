'use client';

import React from 'react';

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

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onRetry?: () => Promise<void>;
}

export default function JobDetailModal({ job, onClose, onRetry }: JobDetailModalProps) {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const formatJson = (data: unknown) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="aerogel-card p-8 rounded-3xl w-full max-w-2xl relative z-10 animate-enter max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-2xl mb-2">Job Details</h3>
            <p className="text-gray-400 text-sm font-mono">{job.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold border ${getStatusColor(job.status)}`}>
            <i className={
              job.status === 'pending' ? 'fa-solid fa-clock' :
              job.status === 'running' ? 'fa-solid fa-spinner fa-spin' :
              job.status === 'completed' ? 'fa-solid fa-check-circle' :
              job.status === 'failed' ? 'fa-solid fa-times-circle' :
              'fa-solid fa-ban'
            }></i>
            {job.status.toUpperCase()}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/5 border border-glass-border">
            <p className="text-xs font-mono text-gray-400 mb-1">FUNCTION</p>
            <p className="font-medium">{job.functionName}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-glass-border">
            <p className="text-xs font-mono text-gray-400 mb-1">RETRY COUNT</p>
            <p className="font-medium">{job.retryCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-glass-border">
            <p className="text-xs font-mono text-gray-400 mb-1">CREATED</p>
            <p className="font-medium text-sm">
              {new Date(job.createdAt).toLocaleString('en-ZA')}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-glass-border">
            <p className="text-xs font-mono text-gray-400 mb-1">UPDATED</p>
            <p className="font-medium text-sm">
              {new Date(job.updatedAt).toLocaleString('en-ZA')}
            </p>
          </div>
        </div>

        {/* Inngest Event ID */}
        {job.inngestEventId && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-glass-border">
            <p className="text-xs font-mono text-gray-400 mb-1">INNGEST EVENT ID</p>
            <p className="font-mono text-sm break-all">{job.inngestEventId}</p>
          </div>
        )}

        {/* Error Message */}
        {job.errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs font-mono text-red-400 mb-2">ERROR MESSAGE</p>
            <pre className="text-sm text-red-300 whitespace-pre-wrap break-all font-mono">
              {job.errorMessage}
            </pre>
          </div>
        )}

        {/* Payload */}
        {job.payload && Object.keys(job.payload).length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-mono text-gray-400 mb-2">PAYLOAD</p>
            <div className="p-4 rounded-xl bg-white/5 border border-glass-border max-h-48 overflow-auto">
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                {formatJson(job.payload)}
              </pre>
            </div>
          </div>
        )}

        {/* Result */}
        {job.result && Object.keys(job.result).length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-mono text-gray-400 mb-2">RESULT</p>
            <div className="p-4 rounded-xl bg-white/5 border border-glass-border max-h-48 overflow-auto">
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                {formatJson(job.result)}
              </pre>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-glass-border">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-glass-border rounded-xl hover:bg-white/5 transition-colors"
          >
            Close
          </button>
          {job.status === 'failed' && onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1 py-3 bg-neon-grape rounded-xl hover:bg-opacity-90 transition-colors font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isRetrying ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Retrying...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-rotate-right"></i>
                  Retry Job
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
