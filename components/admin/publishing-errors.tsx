'use client';

import React, { useState } from 'react';

interface PublishingError {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  content: string;
  status: 'failed';
  errorMessage: string | null;
  retryCount?: number;
  scheduledDate: string | null;
  createdAt: string;
}

interface PublishingErrorsProps {
  errors: PublishingError[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onRetry?: (postId: string) => Promise<void>;
}

export default function PublishingErrors({ errors, isLoading, onRefresh, onRetry }: PublishingErrorsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'facebook' | 'instagram' | 'twitter' | 'linkedin'>('all');
  const [retrying, setRetrying] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="aerogel-card p-6 rounded-2xl animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const platformIcons: Record<string, string> = {
    instagram: 'fa-brands fa-instagram',
    facebook: 'fa-brands fa-facebook',
    twitter: 'fa-brands fa-x-twitter',
    linkedin: 'fa-brands fa-linkedin',
  };

  const platformColors: Record<string, string> = {
    instagram: 'text-pink-400',
    facebook: 'text-blue-400',
    twitter: 'text-sky-400',
    linkedin: 'text-blue-600',
  };

  const filteredErrors = errors.filter(error => {
    const matchesSearch = !searchQuery || 
      error.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.errorMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlatform = platformFilter === 'all' || error.platform === platformFilter;
    
    return matchesSearch && matchesPlatform;
  });

  // Count errors by platform
  const errorsByPlatform: Record<string, number> = {};
  errors.forEach(error => {
    errorsByPlatform[error.platform] = (errorsByPlatform[error.platform] || 0) + 1;
  });

  const handleRetry = async (postId: string) => {
    if (!onRetry) return;
    setRetrying(postId);
    try {
      await onRetry(postId);
    } finally {
      setRetrying(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-triangle-exclamation text-2xl text-red-400"></i>
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-refresh"></i>
              </button>
            )}
          </div>
          <p className="text-3xl font-display font-bold text-red-400">{errors.length}</p>
          <p className="text-sm text-gray-400 mt-1">Total Failed</p>
        </div>
        
        {['instagram', 'facebook', 'twitter', 'linkedin'].map((platform) => (
          <div key={platform} className="aerogel-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <i className={`${platformIcons[platform]} text-2xl ${platformColors[platform]}`}></i>
            </div>
            <p className="text-2xl font-display font-bold">{errorsByPlatform[platform] || 0}</p>
            <p className="text-sm text-gray-400 mt-1 capitalize">{platform}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="aerogel-card p-4 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by content or error..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-grape transition-colors"
            />
          </div>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as any)}
            className="bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter/X</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
      </div>

      {/* Errors List */}
      <div className="aerogel-card rounded-2xl overflow-hidden">
        {filteredErrors.length === 0 ? (
          <div className="text-center py-12">
            <i className="fa-solid fa-check-circle text-4xl text-green-400 mb-4"></i>
            <p className="text-gray-400">No publishing errors found</p>
            <p className="text-gray-500 text-sm mt-1">All posts are being published successfully!</p>
          </div>
        ) : (
          <div className="divide-y divide-glass-border">
            {filteredErrors.map((error) => (
              <div key={error.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5`}>
                    <i className={`${platformIcons[error.platform]} text-xl ${platformColors[error.platform]}`}></i>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium">{error.userEmail || 'Unknown User'}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-400">
                        {new Date(error.createdAt).toLocaleString('en-ZA', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                      {error.retryCount !== undefined && error.retryCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-mzansi-gold/20 text-mzansi-gold text-xs font-bold">
                          {error.retryCount} retries
                        </span>
                      )}
                    </div>
                    
                    {/* Post Content Preview */}
                    <div className="bg-white/5 border border-glass-border rounded-xl p-3 mb-3">
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {error.content}
                      </p>
                    </div>
                    
                    {/* Error Message */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3">
                      <p className="text-red-400 text-sm font-mono">
                        {error.errorMessage || 'Unknown error'}
                      </p>
                    </div>
                    
                    {/* Scheduled Info */}
                    {error.scheduledDate && (
                      <p className="text-xs text-gray-500">
                        <i className="fa-solid fa-clock mr-1"></i>
                        Was scheduled for: {new Date(error.scheduledDate).toLocaleString('en-ZA')}
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  {onRetry && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleRetry(error.id)}
                        disabled={retrying === error.id}
                        className="px-4 py-2 rounded-lg bg-neon-grape/20 text-neon-grape hover:bg-neon-grape hover:text-white transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        {retrying === error.id ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Retrying...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-rotate-right"></i>
                            Retry
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
