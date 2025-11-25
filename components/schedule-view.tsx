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
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [posts, setPosts] = useState<ScheduledPost[]>(mockScheduledPosts);

  const togglePlatformFilter = (platform: string) => {
    if (platformFilters.includes(platform)) {
      setPlatformFilters(platformFilters.filter(p => p !== platform));
    } else {
      setPlatformFilters([...platformFilters, platform]);
    }
  };

  const togglePostSelection = (postId: string) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (platformFilters.length === 0) return true;
    return platformFilters.includes(post.platform);
  });

  const groupPostsByDate = () => {
    const grouped: { [key: string]: ScheduledPost[] } = {};
    filteredPosts.forEach(post => {
      const date = new Date(post.scheduledTime).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(post);
    });
    return grouped;
  };

  const deleteSelected = () => {
    if (confirm(`Delete ${selectedPosts.length} selected post(s)?`)) {
      setPosts(posts.filter(post => !selectedPosts.includes(post.id)));
      setSelectedPosts([]);
    }
  };

  const scheduleSelected = () => {
    alert(`Bulk scheduling ${selectedPosts.length} posts with staggered times...`);
    setSelectedPosts([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-joburg-teal to-pretoria-blue rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Content Schedule</h1>
            <p className="text-white/90">Plan, schedule, and manage your social media posts</p>
          </div>
          <button
            onClick={onSchedulePost}
            className="px-6 py-3 bg-white text-joburg-teal rounded-lg font-semibold hover:shadow-xl transition-all"
          >
            <i className="fa-regular fa-calendar-plus mr-2"></i>
            Schedule Post
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-joburg-teal">
          <div className="text-2xl font-bold text-pretoria-blue">{filteredPosts.length}</div>
          <div className="text-sm text-gray-600">Scheduled Posts</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-pretoria-blue">
            {filteredPosts.filter(p => {
              const today = new Date();
              const postDate = new Date(p.scheduledTime);
              return postDate.toDateString() === today.toDateString();
            }).length}
          </div>
          <div className="text-sm text-gray-600">Today's Posts</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-pretoria-blue">
            {filteredPosts.filter(p => {
              const today = new Date();
              const postDate = new Date(p.scheduledTime);
              const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
              return postDate > today && postDate <= weekFromNow;
            }).length}
          </div>
          <div className="text-sm text-gray-600">This Week</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-pretoria-blue">
            {new Set(filteredPosts.map(p => p.platform)).size}
          </div>
          <div className="text-sm text-gray-600">Platforms</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-joburg-teal text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fa-regular fa-calendar mr-2"></i>
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-joburg-teal text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fa-solid fa-list mr-2"></i>
              List
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-joburg-teal text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fa-solid fa-timeline mr-2"></i>
              Timeline
            </button>
          </div>

          {/* Platform Filters */}
          <div className="flex gap-2">
            {(['instagram', 'twitter', 'linkedin', 'facebook'] as const).map(platform => (
              <button
                key={platform}
                onClick={() => togglePlatformFilter(platform)}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  platformFilters.includes(platform)
                    ? 'bg-joburg-teal text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className={platformIcons[platform]}></i>
              </button>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedPosts.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={scheduleSelected}
                className="px-4 py-2 bg-joburg-teal text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                <i className="fa-regular fa-calendar-check mr-2"></i>
                Schedule {selectedPosts.length}
              </button>
              <button
                onClick={deleteSelected}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                <i className="fa-solid fa-trash mr-2"></i>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main View Area */}
        <div className="lg:col-span-2">
          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <CalendarView scheduledPosts={filteredPosts} />
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-pretoria-blue mb-4">Scheduled Posts</h2>
              {Object.entries(groupPostsByDate()).map(([date, postsForDate]) => (
                <div key={date} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fa-regular fa-calendar"></i>
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <div className="space-y-3">
                    {postsForDate.map(post => (
                      <div
                        key={post.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={selectedPosts.includes(post.id)}
                            onChange={() => togglePostSelection(post.id)}
                            className="mt-1 w-4 h-4 text-joburg-teal rounded focus:ring-joburg-teal"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${platformColors[post.platform]} text-white text-sm font-medium flex items-center gap-1`}>
                                <i className={platformIcons[post.platform]}></i>
                                {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                              </span>
                              <span className="text-sm font-semibold text-gray-700">
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
                            <p className="text-gray-700 mb-2">{post.content}</p>
                            <div className="flex gap-2">
                              <button className="text-sm text-joburg-teal hover:underline">
                                <i className="fa-solid fa-pen mr-1"></i>Edit
                              </button>
                              <button className="text-sm text-red-600 hover:underline">
                                <i className="fa-solid fa-trash mr-1"></i>Delete
                              </button>
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

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-pretoria-blue mb-6">Timeline View</h2>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                
                <div className="space-y-6">
                  {filteredPosts.map((post, index) => (
                    <div key={post.id} className="relative pl-20">
                      {/* Timeline Dot */}
                      <div className={`absolute left-6 w-5 h-5 rounded-full bg-gradient-to-r ${platformColors[post.platform]} border-4 border-white`}></div>
                      
                      {/* Time Label */}
                      <div className="absolute left-0 top-0 text-sm font-semibold text-gray-600">
                        {new Date(post.scheduledTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                      
                      {/* Post Card */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <i className={`${platformIcons[post.platform]} text-lg`}></i>
                          <span className="font-semibold text-pretoria-blue">
                            {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{post.content}</p>
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
