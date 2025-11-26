'use client';

import React, { useState } from 'react';

interface SmartSuggestionsProps {
  topic?: string;
  platform?: string;
}

const optimalTimes = [
  { time: '08:00 - 09:00', day: 'Weekdays', engagement: 92, icon: '🌅' },
  { time: '12:30 - 13:30', day: 'All Days', engagement: 85, icon: '🍽️' },
  { time: '18:00 - 19:00', day: 'Weekdays', engagement: 95, icon: '🌆' },
  { time: '21:00 - 22:00', day: 'Weekends', engagement: 78, icon: '🌙' },
];

const bestPractices = {
  instagram: [
    'Use 3-5 relevant hashtags for maximum reach',
    'Post carousel content for 3x more engagement',
    'Include a clear call-to-action in your caption',
    'Use Stories to boost post visibility',
  ],
  twitter: [
    'Keep tweets under 280 characters for better engagement',
    'Use 1-2 hashtags maximum',
    'Include visuals - tweets with images get 150% more retweets',
    'Ask questions to encourage replies',
  ],
  linkedin: [
    'Post during business hours (9am-5pm)',
    'Use professional tone and industry insights',
    'Share authentic stories and experiences',
    'Engage with comments within the first hour',
  ],
  facebook: [
    'Posts with emotional content perform best',
    'Use Facebook Live for 6x more interactions',
    'Keep captions concise and scannable',
    'Post when your audience is most active',
  ],
};

const trendingHashtags = [
  { tag: '#SmallBusinessSA', posts: '24.5K', trend: 'up' },
  { tag: '#MzansiMagic', posts: '18.2K', trend: 'up' },
  { tag: '#SouthAfricanBusiness', posts: '12.8K', trend: 'stable' },
  { tag: '#LocalIsLekker', posts: '31.4K', trend: 'up' },
  { tag: '#EntrepreneurSA', posts: '9.6K', trend: 'down' },
];

const contentTypes = [
  { type: 'Image Post', score: 88, icon: '🖼️', reason: 'High visual engagement' },
  { type: 'Video', score: 95, icon: '🎥', reason: 'Trending format' },
  { type: 'Carousel', score: 92, icon: '📱', reason: 'Best for storytelling' },
  { type: 'Text Only', score: 65, icon: '📝', reason: 'Lower engagement' },
];

const toneRecommendations = [
  { time: 'Morning (6-10am)', tone: 'Energetic & Motivational', emoji: '☀️' },
  { time: 'Midday (10am-3pm)', tone: 'Professional & Informative', emoji: '💼' },
  { time: 'Afternoon (3-6pm)', tone: 'Casual & Engaging', emoji: '😊' },
  { time: 'Evening (6pm+)', tone: 'Relaxed & Conversational', emoji: '🌙' },
];

export default function SmartSuggestions({ topic = 'General', platform = 'all' }: SmartSuggestionsProps) {
  const [activeTab, setActiveTab] = useState<'times' | 'practices' | 'hashtags' | 'content' | 'tone'>('times');

  const getPlatformPractices = () => {
    if (platform === 'all') {
      return bestPractices.instagram.slice(0, 2).concat(bestPractices.twitter.slice(0, 1));
    }
    return bestPractices[platform as keyof typeof bestPractices] || bestPractices.instagram;
  };

  return (
    <div className="bg-void rounded-2xl shadow-2xl border border-glass-border overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-neon-grape to-joburg-teal text-white p-6">
        <h3 className="text-2xl font-bold font-display mb-2">AI Pilot Smart Suggestions</h3>
        <p className="text-sm text-white/90 font-body">Powered by audience analytics and engagement patterns</p>
      </div>

      {/* Tab Navigation - Dark Theme */}
      <div className="bg-void/80 border-b border-glass-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab('times')}
            className={`flex-1 px-4 py-4 text-sm font-medium whitespace-nowrap transition-all relative cursor-pointer ${
              activeTab === 'times'
                ? 'text-joburg-teal'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className="fa-regular fa-clock mr-2"></i>
            Best Times
            {activeTab === 'times' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-joburg-teal to-transparent"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('practices')}
            className={`flex-1 px-4 py-4 text-sm font-medium whitespace-nowrap transition-all relative cursor-pointer ${
              activeTab === 'practices'
                ? 'text-joburg-teal'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-lightbulb mr-2"></i>
            Best Practices
            {activeTab === 'practices' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-joburg-teal to-transparent"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('hashtags')}
            className={`flex-1 px-4 py-4 text-sm font-medium whitespace-nowrap transition-all relative cursor-pointer ${
              activeTab === 'hashtags'
                ? 'text-joburg-teal'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-hashtag mr-2"></i>
            Trending
            {activeTab === 'hashtags' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-joburg-teal to-transparent"></div>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-void">
        {/* Optimal Times */}
        {activeTab === 'times' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-4">
              Based on your audience's activity, here are the best times to post:
            </p>
            {optimalTimes.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-glass-border hover:border-neon-grape/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-grape/20 to-joburg-teal/20 flex items-center justify-center text-2xl">
                    {slot.icon}
                  </div>
                  <div>
                    <div className="font-medium text-white font-body">{slot.day}</div>
                    <div className="text-sm text-gray-400">Engagement</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-neon-grape to-joburg-teal bg-clip-text text-transparent">
                    {slot.engagement}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Best Practices */}
        {activeTab === 'practices' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-4">
              Platform-specific tips to maximize your reach and engagement:
            </p>
            {getPlatformPractices().map((practice, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 bg-[#1a1a2e] rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all"
              >
                <i className="fa-solid fa-check-circle text-purple-400 text-lg mt-0.5"></i>
                <p className="text-sm text-gray-300 flex-1">{practice}</p>
              </div>
            ))}
          </div>
        )}

        {/* Trending Hashtags */}
        {activeTab === 'hashtags' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-4">
              Trending hashtags related to "{topic}":
            </p>
            {trendingHashtags.map((hashtag, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 bg-[#1a1a2e] rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-purple-400">{hashtag.tag}</span>
                  <span className="text-sm text-gray-500">{hashtag.posts} posts</span>
                </div>
                <div className="flex items-center gap-2">
                  {hashtag.trend === 'up' && <i className="fa-solid fa-arrow-trend-up text-green-400"></i>}
                  {hashtag.trend === 'down' && <i className="fa-solid fa-arrow-trend-down text-red-400"></i>}
                  {hashtag.trend === 'stable' && <i className="fa-solid fa-minus text-gray-500"></i>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Type Recommendations */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-4">
              Recommended content formats for maximum engagement:
            </p>
            {contentTypes.map((content, index) => (
              <div
                key={index}
                className="p-5 bg-[#1a1a2e] rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{content.icon}</span>
                    <span className="font-semibold text-white">{content.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400">{content.score}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        content.score >= 90 ? 'bg-green-500' :
                        content.score >= 75 ? 'bg-yellow-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${content.score}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">{content.reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tone Recommendations */}
        {activeTab === 'tone' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-4">
              Adjust your tone based on when you're posting:
            </p>
            {toneRecommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-5 bg-white/5 rounded-xl border border-glass-border hover:border-neon-grape/50 transition-all cursor-pointer"
              >
                <span className="text-3xl">{rec.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold text-white font-body">{rec.time}</div>
                  <div className="text-sm text-gray-400">{rec.tone}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-void/80 px-6 py-4 border-t border-glass-border">
        <p className="text-xs text-gray-400 text-center flex items-center justify-center font-mono">
          <span className="mr-2">ℹ️</span>
          Suggestions update based on your audience engagement data
        </p>
      </div>
    </div>
  );
}

