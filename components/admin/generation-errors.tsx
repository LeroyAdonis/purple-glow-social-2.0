'use client';

import React, { useState } from 'react';

interface GenerationError {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  topic: string | null;
  tone: string | null;
  language: string | null;
  errorMessage: string | null;
  createdAt: string;
}

interface GenerationErrorsProps {
  errors: GenerationError[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function GenerationErrors({ errors, isLoading, onRefresh }: GenerationErrorsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'facebook' | 'instagram' | 'twitter' | 'linkedin'>('all');

  if (isLoading) {
    return (
      <div className="aerogel-card p-6 rounded-2xl animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
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

  const filteredErrors = errors.filter(error => {
    const matchesSearch = !searchQuery || 
      error.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.errorMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlatform = platformFilter === 'all' || error.platform === platformFilter;
    
    return matchesSearch && matchesPlatform;
  });

  // Group errors by type
  const errorTypes: Record<string, number> = {};
  errors.forEach(error => {
    const type = error.errorMessage?.split(':')[0] || 'Unknown';
    errorTypes[type] = (errorTypes[type] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <p className="text-sm text-gray-400 mt-1">Total Errors</p>
        </div>
        
        {Object.entries(errorTypes).slice(0, 3).map(([type, count]) => (
          <div key={type} className="aerogel-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <i className="fa-solid fa-bug text-xl text-gray-500"></i>
            </div>
            <p className="text-2xl font-display font-bold">{count}</p>
            <p className="text-sm text-gray-400 mt-1 truncate" title={type}>{type}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="aerogel-card p-4 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search errors..."
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
            <p className="text-gray-400">No generation errors found</p>
            <p className="text-gray-500 text-sm mt-1">All AI generations are running smoothly!</p>
          </div>
        ) : (
          <div className="divide-y divide-glass-border">
            {filteredErrors.map((error) => (
              <div key={error.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <i className={`${platformIcons[error.platform]} text-lg text-gray-400`}></i>
                      <span className="text-sm text-gray-400">
                        {new Date(error.createdAt).toLocaleString('en-ZA', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                      {error.userEmail && (
                        <span className="text-sm text-gray-500">• {error.userEmail}</span>
                      )}
                    </div>
                    
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-3">
                      <p className="text-red-400 text-sm font-mono">
                        {error.errorMessage || 'Unknown error'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {error.topic && (
                        <span>
                          <i className="fa-solid fa-tag mr-1"></i>
                          {error.topic}
                        </span>
                      )}
                      {error.tone && (
                        <span>
                          <i className="fa-solid fa-palette mr-1"></i>
                          {error.tone}
                        </span>
                      )}
                      {error.language && (
                        <span>
                          <i className="fa-solid fa-language mr-1"></i>
                          {error.language}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
