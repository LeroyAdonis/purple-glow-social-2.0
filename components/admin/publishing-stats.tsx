'use client';

import React from 'react';

interface PublishingStatsProps {
  data: {
    totalPosts: number;
    posted: number;
    scheduled: number;
    failed: number;
    successRate: number;
    retryRate: number;
    byPlatform: Record<string, { posted: number; failed: number }>;
    byDay: Array<{ date: string; posted: number; failed: number }>;
  };
  isLoading?: boolean;
}

export default function PublishingStats({ data, isLoading }: PublishingStatsProps) {
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

  const platformColors: Record<string, string> = {
    instagram: 'text-pink-400',
    facebook: 'text-blue-400',
    twitter: 'text-sky-400',
    linkedin: 'text-blue-600',
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-paper-plane text-2xl text-neon-grape"></i>
          </div>
          <p className="text-3xl font-display font-bold">{data.totalPosts.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">Total Posts</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-check-double text-2xl text-green-400"></i>
          </div>
          <p className="text-3xl font-display font-bold">{data.posted.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">Published</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-clock text-2xl text-mzansi-gold"></i>
          </div>
          <p className="text-3xl font-display font-bold">{data.scheduled.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">Scheduled</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-triangle-exclamation text-2xl text-red-400"></i>
          </div>
          <p className="text-3xl font-display font-bold">{data.failed.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">Failed</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-chart-line text-2xl text-joburg-teal"></i>
          </div>
          <p className="text-3xl font-display font-bold">{data.successRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-400 mt-1">Success Rate</p>
        </div>
      </div>

      {/* Posts by Platform */}
      <div className="aerogel-card p-6 rounded-2xl">
        <h3 className="font-display font-bold text-xl mb-6">Posts by Platform</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {platforms.map((platform) => {
            const stats = data.byPlatform[platform] || { posted: 0, failed: 0 };
            const total = stats.posted + stats.failed;
            const successRate = total > 0 ? (stats.posted / total) * 100 : 100;
            
            return (
              <div key={platform} className="p-4 rounded-xl bg-white/5 border border-glass-border">
                <div className="flex items-center gap-3 mb-4">
                  <i className={`${platformIcons[platform]} text-2xl ${platformColors[platform]}`}></i>
                  <span className="font-bold capitalize">{platform}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Posted</span>
                    <span className="text-green-400 font-mono">{stats.posted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Failed</span>
                    <span className="text-red-400 font-mono">{stats.failed}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                      style={{ width: `${successRate}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">{successRate.toFixed(0)}% success</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retry Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-4">Retry Statistics</h3>
          <div className="flex items-center justify-center py-8">
            <div className="relative w-32 h-32">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/10"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - data.retryRate / 100)}`}
                  className="text-mzansi-gold transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-bold">{data.retryRate.toFixed(1)}%</span>
                <span className="text-xs text-gray-400">Retry Rate</span>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-400 text-sm">
            Percentage of posts that required retry attempts
          </p>
        </div>

        {/* Quick Stats */}
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-gray-400">Average posts/day</span>
              <span className="font-mono font-bold">
                {data.byDay.length > 0 
                  ? Math.round(data.byDay.reduce((a, b) => a + b.posted, 0) / data.byDay.length) 
                  : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-gray-400">Peak day (posts)</span>
              <span className="font-mono font-bold text-green-400">
                {data.byDay.length > 0 
                  ? Math.max(...data.byDay.map(d => d.posted)) 
                  : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-gray-400">Failed today</span>
              <span className="font-mono font-bold text-red-400">
                {data.byDay.length > 0 
                  ? data.byDay[data.byDay.length - 1]?.failed || 0 
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      {data.byDay.length > 0 && (
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-6">Publishing Trend (Last 7 Days)</h3>
          <div className="h-48 flex items-end justify-around gap-2">
            {data.byDay.slice(-7).map((day, i) => {
              const total = day.posted + day.failed;
              const maxCount = Math.max(...data.byDay.map(d => d.posted + d.failed), 1);
              const height = (total / maxCount) * 100;
              const date = new Date(day.date);
              const successHeight = total > 0 ? (day.posted / total) * height : 0;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-400 font-mono">{day.posted}/{day.failed}</div>
                  <div className="w-full relative" style={{ height: `${Math.max(height, 2)}%` }}>
                    <div
                      className="absolute bottom-0 w-full bg-red-500/50 rounded-t-lg"
                      style={{ height: '100%' }}
                    ></div>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg"
                      style={{ height: `${(successHeight / height) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {date.toLocaleDateString('en-ZA', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-xs text-gray-400">Posted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500/50"></div>
              <span className="text-xs text-gray-400">Failed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
