'use client';

import React, { useState } from 'react';
import CalendarView from './calendar-view';
import SmartSuggestions from './smart-suggestions';
import { MOCK_SCHEDULED_POSTS, MockScheduledPost } from '../lib/mock-data';

interface ScheduledPost {
  id: string;
  title: string;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook';
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
  content: string;
}

interface ScheduleViewProps {
  onSchedulePost?: () => void;
}

// Convert mock data to component format
const convertMockPosts = (mockPosts: MockScheduledPost[]): ScheduledPost[] => {
  return mockPosts.map(post => ({
    id: post.id,
    title: post.topic,
    platform: post.platform,
    scheduledTime: post.scheduledDate.toISOString(),
    status: post.status === 'posted' ? 'published' : post.status,
    content: post.content,
  }));
};

const mockScheduledPosts: ScheduledPost[] = convertMockPosts(MOCK_SCHEDULED_POSTS);

type ViewMode = 'calendar' | 'list' | 'timeline';
type DateFilter = 'week' | 'month' | 'custom';

const platformColors = {
  instagram: 'from-purple-500 to-pink-500',
  twitter: 'bg-[#1DA1F2]',
  linkedin: 'bg-[#0A66C2]',
  facebook: 'bg-[#1877F2]',
};

const platformIcons = {
  instagram: 'fa-brands fa-instagram',
  twitter: 'fa-brands fa-twitter',
  linkedin: 'fa-brands fa-linkedin',
  facebook: 'fa-brands fa-facebook',
};

export default function ScheduleView({ onSchedulePost }: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  const togglePlatformFilter = (platform: string) => {
    setPlatformFilters(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const filteredPosts = mockScheduledPosts.filter(post =>
    platformFilters.length === 0 || platformFilters.includes(post.platform)
  );

  const scheduleSelected = () => {
    alert(`Scheduling ${selectedPosts.length} posts`);
    setSelectedPosts([]);
  };

  const deleteSelected = () => {
    alert(`Deleting ${selectedPosts.length} posts`);
    setSelectedPosts([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="aerogel-card rounded-2xl p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">
              <i className="fa-regular fa-calendar mr-3 text-joburg-teal"></i>
              Content Schedule
            </h1>
            <p className="text-gray-400">Plan, schedule, and manage your social media posts across all platforms</p>
          </div>
          <button
            onClick={onSchedulePost}
            className="px-6 py-3 bg-gradient-to-r from-neon-grape to-joburg-teal text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <i className="fa-solid fa-calendar-plus mr-2"></i>
            Schedule New Post
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="aerogel-card rounded-xl p-6 border-l-4 border-joburg-teal">
          <div className="text-3xl font-display font-bold text-white mb-1">{filteredPosts.length}</div>
          <div className="text-sm text-gray-400">Scheduled Posts</div>
        </div>
        <div className="aerogel-card rounded-xl p-6 border-l-4 border-green-500">
          <div className="text-3xl font-display font-bold text-white mb-1">
            {filteredPosts.filter(p => {
              const today = new Date();
              const postDate = new Date(p.scheduledTime);
              return postDate.toDateString() === today.toDateString();
            }).length}
          </div>
          <div className="text-sm text-gray-400">Today's Posts</div>
        </div>
        <div className="aerogel-card rounded-xl p-6 border-l-4 border-blue-500">
          <div className="text-3xl font-display font-bold text-white mb-1">
            {filteredPosts.filter(p => {
              const today = new Date();
              const postDate = new Date(p.scheduledTime);
              const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
              return postDate > today && postDate <= weekFromNow;
            }).length}
          </div>
          <div className="text-sm text-gray-400">This Week</div>
        </div>
        <div className="aerogel-card rounded-xl p-6 border-l-4 border-purple-500">
          <div className="text-3xl font-display font-bold text-white mb-1">
            {new Set(filteredPosts.map(p => p.platform)).size}
          </div>
          <div className="text-sm text-gray-400">Active Platforms</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="aerogel-card rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-gradient-to-r from-neon-grape to-joburg-teal text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-glass-border'
              }`}
            >
              <i className="fa-regular fa-calendar mr-2"></i>
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-neon-grape to-joburg-teal text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-glass-border'
              }`}
            >
              <i className="fa-solid fa-list mr-2"></i>
              List
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-gradient-to-r from-neon-grape to-joburg-teal text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-glass-border'
              }`}
            >
              <i className="fa-solid fa-timeline mr-2"></i>
              Timeline
            </button>
          </div>

          {/* Platform Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['instagram', 'twitter', 'linkedin', 'facebook'] as const).map(platform => (
              <button
                key={platform}
                onClick={() => togglePlatformFilter(platform)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  platformFilters.includes(platform)
                    ? `bg-gradient-to-r ${platformColors[platform]} text-white shadow-lg`
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-glass-border'
                }`}
              >
                <i className={`${platformIcons[platform]} mr-1`}></i>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedPosts.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={scheduleSelected}
                className="px-4 py-2 bg-gradient-to-r from-neon-grape to-joburg-teal text-white rounded-lg font-bold hover:shadow-xl transition-all cursor-pointer"
              >
                <i className="fa-regular fa-calendar-check mr-2"></i>
                Schedule ({selectedPosts.length})
              </button>
              <button
                onClick={deleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-trash mr-2"></i>
                Delete ({selectedPosts.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Views */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {viewMode === 'calendar' && (
            <CalendarView scheduledPosts={filteredPosts} />
          )}

          {viewMode === 'list' && (
            <div className="aerogel-card rounded-2xl p-8">
              <h2 className="text-3xl font-display font-bold text-white mb-6">Scheduled Posts</h2>
              {Object.entries(
                filteredPosts.reduce((acc, post) => {
                  const date = new Date(post.scheduledTime).toLocaleDateString();
                  if (!acc[date]) acc[date] = [];
                  acc[date].push(post);
                  return acc;
                }, {} as Record<string, ScheduledPost[]>)
              ).map(([date, posts]) => (
                <div key={date} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                    <i className="fa-regular fa-calendar text-joburg-teal"></i>
                    {date}
                  </h3>
                  <div className="space-y-4">
                    {posts.map(post => (
                      <div key={post.id} className="bg-white/5 border border-glass-border rounded-xl p-6 hover:bg-white/10 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedPosts.includes(post.id)}
                              onChange={() => {}}
                              className="mt-1 w-4 h-4 text-joburg-teal rounded focus:ring-joburg-teal cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${platformColors[post.platform]} text-white text-sm font-medium flex items-center gap-1`}>
                                  <i className={platformIcons[post.platform]}></i>
                                  {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                                </span>
                                <span className="text-sm font-semibold text-white">
                                  {new Date(post.scheduledTime).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-joburg-teal/10 text-joburg-teal text-xs font-medium">
                                  {post.status}
                                </span>
                              </div>
                              <p className="text-gray-300 mb-3">{post.content}</p>
                              <div className="flex gap-3">
                                <button className="text-sm text-joburg-teal hover:underline font-medium cursor-pointer">
                                  <i className="fa-solid fa-edit mr-1"></i> Edit
                                </button>
                                <button className="text-sm text-red-400 hover:underline font-medium cursor-pointer">
                                  <i className="fa-solid fa-trash mr-1"></i> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'timeline' && (
            <div className="aerogel-card rounded-2xl p-8">
              <h2 className="text-3xl font-display font-bold text-white mb-8">Timeline View</h2>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-glass-border"></div>
                
                <div className="space-y-8">
                  {filteredPosts.map((post, index) => (
                    <div key={post.id} className="relative pl-20">
                      {/* Timeline Dot */}
                      <div className={`absolute left-6 w-5 h-5 rounded-full bg-gradient-to-r ${platformColors[post.platform]} border-4 border-void`}></div>
                      
                      {/* Time Label */}
                      <div className="absolute left-0 top-0 text-sm font-semibold text-gray-400">
                        {new Date(post.scheduledTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                      
                      {/* Post Card */}
                      <div className="bg-white/5 border border-glass-border rounded-xl p-6 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <i className={`${platformIcons[post.platform]} text-xl`}></i>
                          <span className="font-semibold text-white">
                            {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{post.status}</span>
                        </div>
                        <p className="text-gray-300">{post.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Smart Suggestions */}
        <div className="lg:col-span-1">
          <SmartSuggestions />
        </div>
      </div>
    </div>
  );
}
