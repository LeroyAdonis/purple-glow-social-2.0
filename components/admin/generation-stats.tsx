'use client';

import React from 'react';

interface GenerationStatsProps {
  data: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    byPlatform: Record<string, number>;
    topTopics: Array<{ topic: string; count: number }>;
    byDay: Array<{ date: string; count: number }>;
    errorsByType: Record<string, number>;
  };
  isLoading?: boolean;
}

export default function GenerationStats({ data, isLoading }: GenerationStatsProps) {
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

  const platforms = ['instagram', 'facebook', 'twitter', 'linkedin'];
  const platformIcons: Record<string, string> = {
    instagram: 'fa-brands fa-instagram',
    facebook: 'fa-brands fa-facebook',
    twitter: 'fa-brands fa-x-twitter',
    linkedin: 'fa-brands fa-linkedin',
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-wand-magic-sparkles text-2xl text-neon-grape"></i>
          </div>
          <p className="text-3xl font-display font-bold">{data.total.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">Total Generations</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-check-circle text-2xl text-green-400"></i>
          </div>
          <p className="text-3xl font-display font-bold">{data.successful.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">Successful</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-times-circle text-2xl text-red-400"></i>
          </div>
          <p className="text-3xl font-display font-bold">{data.failed.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">Failed</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-percentage text-2xl text-joburg-teal"></i>
          </div>
          <p className="text-3xl font-display font-bold">{data.successRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-400 mt-1">Success Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generations by Platform */}
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-6">By Platform</h3>
          <div className="space-y-4">
            {platforms.map((platform) => {
              const count = data.byPlatform[platform] || 0;
              const percentage = data.total > 0 ? (count / data.total) * 100 : 0;
              
              return (
                <div key={platform} className="flex items-center gap-4">
                  <div className="w-8 flex justify-center">
                    <i className={`${platformIcons[platform]} text-xl text-gray-400`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium capitalize">{platform}</span>
                      <span className="text-gray-400 font-mono">{count.toLocaleString()} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neon-grape rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Topics */}
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-6">Top Topics</h3>
          {data.topTopics.length > 0 ? (
            <div className="space-y-3">
              {data.topTopics.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-glass-border">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-neon-grape/20 text-neon-grape text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm truncate max-w-[200px]">{item.topic}</span>
                  </div>
                  <span className="text-sm font-mono text-gray-400">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <i className="fa-solid fa-clipboard-list text-3xl mb-3 opacity-50"></i>
              <p>No topics tracked yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Types */}
      {Object.keys(data.errorsByType).length > 0 && (
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-6">Errors by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.errorsByType).map(([type, count]) => (
              <div key={type} className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-2xl font-display font-bold text-red-400">{count}</p>
                <p className="text-sm text-gray-400 mt-1 capitalize">{type.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Trend */}
      {data.byDay.length > 0 && (
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-6">Generation Trend (Last 7 Days)</h3>
          <div className="h-48 flex items-end justify-around gap-2">
            {data.byDay.slice(-7).map((day, i) => {
              const maxCount = Math.max(...data.byDay.map(d => d.count), 1);
              const height = (day.count / maxCount) * 100;
              const date = new Date(day.date);
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-400 font-mono">{day.count}</div>
                  <div
                    className="w-full bg-gradient-to-t from-neon-grape to-neon-grape/50 rounded-t-lg transition-all hover:opacity-80 cursor-pointer min-h-[4px]"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 font-mono">
                    {date.toLocaleDateString('en-ZA', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
