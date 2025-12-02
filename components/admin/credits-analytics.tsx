'use client';

import React from 'react';

interface CreditsAnalyticsProps {
  data: {
    totalCreditsUsed: number;
    byPlatform: Record<string, number>;
    byContentType: Record<string, number>;
    generationVsPublishing: {
      generations: number;
      published: number;
    };
    byDay: Array<{ date: string; credits: number }>;
  };
  isLoading?: boolean;
}

export default function CreditsAnalytics({ data, isLoading }: CreditsAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="aerogel-card p-6 rounded-2xl animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-xl"></div>
      </div>
    );
  }

  const platforms = ['instagram', 'facebook', 'twitter', 'linkedin'];
  const platformColors: Record<string, string> = {
    instagram: 'from-pink-500 to-purple-500',
    facebook: 'from-blue-500 to-blue-600',
    twitter: 'from-sky-400 to-sky-500',
    linkedin: 'from-blue-600 to-blue-700',
  };

  const platformIcons: Record<string, string> = {
    instagram: 'fa-brands fa-instagram',
    facebook: 'fa-brands fa-facebook',
    twitter: 'fa-brands fa-x-twitter',
    linkedin: 'fa-brands fa-linkedin',
  };

  const maxCreditsPerPlatform = Math.max(...platforms.map(p => data.byPlatform[p] || 0), 1);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-coins text-2xl text-mzansi-gold"></i>
          </div>
          <p className="text-3xl font-display font-bold">{data.totalCreditsUsed.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">Total Credits Used</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-wand-magic-sparkles text-2xl text-neon-grape"></i>
          </div>
          <p className="text-3xl font-display font-bold">{data.generationVsPublishing.generations.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">AI Generations</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-paper-plane text-2xl text-joburg-teal"></i>
          </div>
          <p className="text-3xl font-display font-bold">{data.generationVsPublishing.published.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">Published Posts</p>
        </div>
        
        <div className="aerogel-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <i className="fa-solid fa-percent text-2xl text-green-400"></i>
          </div>
          <p className="text-3xl font-display font-bold">
            {data.generationVsPublishing.generations > 0 
              ? Math.round((data.generationVsPublishing.published / data.generationVsPublishing.generations) * 100) 
              : 0}%
          </p>
          <p className="text-sm text-gray-400 mt-1">Publish Rate</p>
        </div>
      </div>

      {/* Credits by Platform */}
      <div className="aerogel-card p-6 rounded-2xl">
        <h3 className="font-display font-bold text-xl mb-6">Credits by Platform</h3>
        <div className="space-y-4">
          {platforms.map((platform) => {
            const credits = data.byPlatform[platform] || 0;
            const percentage = (credits / maxCreditsPerPlatform) * 100;
            
            return (
              <div key={platform} className="flex items-center gap-4">
                <div className="w-8 flex justify-center">
                  <i className={`${platformIcons[platform]} text-xl text-gray-400`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium capitalize">{platform}</span>
                    <span className="text-gray-400 font-mono">{credits.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${platformColors[platform]} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credits by Content Type */}
      <div className="aerogel-card p-6 rounded-2xl">
        <h3 className="font-display font-bold text-xl mb-6">Credits by Content Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.byContentType).map(([type, count]) => (
            <div key={type} className="text-center p-4 rounded-xl bg-white/5 border border-glass-border">
              <p className="text-2xl font-display font-bold text-neon-grape">{count.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-1 capitalize">{type.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Trend */}
      {data.byDay.length > 0 && (
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-6">Daily Credit Usage (Last 7 Days)</h3>
          <div className="h-48 flex items-end justify-around gap-2">
            {data.byDay.slice(-7).map((day, i) => {
              const maxCredits = Math.max(...data.byDay.map(d => d.credits), 1);
              const height = (day.credits / maxCredits) * 100;
              const date = new Date(day.date);
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-400 font-mono">{day.credits}</div>
                  <div
                    className="w-full bg-gradient-to-t from-neon-grape to-joburg-teal rounded-t-lg transition-all hover:opacity-80 cursor-pointer min-h-[4px]"
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
