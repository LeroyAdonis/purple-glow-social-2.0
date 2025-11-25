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
    <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
        <div className="flex items-center gap-2 mb-1">
          <i className="fa-solid fa-sparkles text-xl"></i>
          <h3 className="text-lg font-bold">AI Pilot Smart Suggestions</h3>
        </div>
        <p className="text-sm text-white/90">Powered by audience analytics and engagement patterns</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
        <button
          onClick={() => setActiveTab('times')}
          className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'times'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <i className="fa-regular fa-clock mr-2"></i>
          Best Times
        </button>
        <button
          onClick={() => setActiveTab('practices')}
          className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'practices'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <i className="fa-solid fa-lightbulb mr-2"></i>
          Best Practices
        </button>
        <button
          onClick={() => setActiveTab('hashtags')}
          className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'hashtags'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <i className="fa-solid fa-hashtag mr-2"></i>
          Trending
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'content'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <i className="fa-solid fa-photo-film mr-2"></i>
          Content Type
        </button>
        <button
          onClick={() => setActiveTab('tone')}
          className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'tone'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <i className="fa-solid fa-face-smile mr-2"></i>
          Tone
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Optimal Times */}
        {activeTab === 'times' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Based on your audience's activity, here are the best times to post:
            </p>
            {optimalTimes.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{slot.icon}</span>
                  <div>
                    <div className="font-semibold text-pretoria-blue">{slot.time}</div>
                    <div className="text-xs text-gray-600">{slot.day}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">{slot.engagement}%</div>
                  <div className="text-xs text-gray-600">Engagement</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Best Practices */}
        {activeTab === 'practices' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Platform-specific tips to maximize your reach and engagement:
            </p>
            {getPlatformPractices().map((practice, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <i className="fa-solid fa-check-circle text-blue-600 mt-0.5"></i>
                <p className="text-sm text-gray-700 flex-1">{practice}</p>
              </div>
            ))}
          </div>
        )}

        {/* Trending Hashtags */}
        {activeTab === 'hashtags' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Trending hashtags related to "{topic}":
            </p>
            {trendingHashtags.map((hashtag, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-joburg-teal">{hashtag.tag}</span>
                  <span className="text-xs text-gray-600">{hashtag.posts} posts</span>
                </div>
                <div className="flex items-center gap-2">
                  {hashtag.trend === 'up' && <i className="fa-solid fa-arrow-trend-up text-green-600"></i>}
                  {hashtag.trend === 'down' && <i className="fa-solid fa-arrow-trend-down text-red-600"></i>}
                  {hashtag.trend === 'stable' && <i className="fa-solid fa-minus text-gray-400"></i>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Type Recommendations */}
        {activeTab === 'content' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Recommended content formats for maximum engagement:
            </p>
            {contentTypes.map((content, index) => (
              <div
                key={index}
                className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{content.icon}</span>
                    <span className="font-semibold text-pretoria-blue">{content.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">{content.score}</div>
                    <div className="text-xs text-gray-600">Score</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
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
                <p className="text-xs text-gray-600 mt-2">{content.reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tone Recommendations */}
        {activeTab === 'tone' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Adjust your tone based on when you're posting:
            </p>
            {toneRecommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200"
              >
                <span className="text-3xl">{rec.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold text-pretoria-blue">{rec.time}</div>
                  <div className="text-sm text-gray-600">{rec.tone}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-purple-50 px-4 py-3 border-t border-purple-200">
        <p className="text-xs text-gray-600 text-center">
          <i className="fa-solid fa-info-circle mr-1"></i>
          Suggestions update based on your audience engagement data
        </p>
      </div>
    </div>
  );
}
