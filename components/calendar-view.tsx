'use client';

import React, { useState } from 'react';

interface ScheduledPost {
  id: string;
  title: string;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook';
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
  content: string;
}

interface CalendarViewProps {
  scheduledPosts?: ScheduledPost[];
}

const platformColors = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
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

export default function CalendarView({ scheduledPosts = [] }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get posts for a specific day
  const getPostsForDay = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledTime);
      return (
        postDate.getDate() === targetDate.getDate() &&
        postDate.getMonth() === targetDate.getMonth() &&
        postDate.getFullYear() === targetDate.getFullYear()
      );
    });
  };

  // Check if day is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days array
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="aerogel-card rounded-2xl p-8">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-joburg-teal border border-joburg-teal rounded-lg hover:bg-joburg-teal hover:text-white transition-colors"
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-glass-border hover:bg-white/10 text-white transition-colors"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            onClick={nextMonth}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-glass-border hover:bg-white/10 text-white transition-colors"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const postsForDay = getPostsForDay(day);
          const isTodayCell = isToday(day);

          return (
            <div
              key={day}
              className={`
                aspect-square border rounded-lg p-2 transition-all hover:shadow-md
                ${isTodayCell ? 'bg-joburg-teal/10 border-joburg-teal border-2' : 'bg-white/5 border-glass-border'}
              `}
            >
              {/* Day Number */}
              <div className={`
                text-sm font-semibold mb-1
                ${isTodayCell ? 'text-joburg-teal' : 'text-gray-300'}
              `}>
                {day}
              </div>

              {/* Posts for this day */}
              <div className="space-y-1">
                {postsForDay.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center mt-2">
                    No posts
                  </div>
                ) : (
                  postsForDay.slice(0, 3).map(post => (
                    <div
                      key={post.id}
                      className="relative"
                      onMouseEnter={() => setHoveredPost(post.id)}
                      onMouseLeave={() => setHoveredPost(null)}
                    >
                      <div
                        className={`
                          ${platformColors[post.platform]}
                          text-white text-xs px-2 py-1 rounded flex items-center gap-1
                          cursor-pointer hover:scale-105 transition-transform
                        `}
                      >
                        <i className={`${platformIcons[post.platform]} text-[10px]`}></i>
                        <span className="truncate flex-1">
                          {new Date(post.scheduledTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>

                      {/* Hover Tooltip */}
                      {hoveredPost === post.id && (
                        <div className="absolute z-50 left-0 top-full mt-1 w-64 bg-white border border-glass-border rounded-lg shadow-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <i className={`${platformIcons[post.platform]} text-lg`}></i>
                            <span className="font-semibold text-sm text-white">
                              {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2 line-clamp-3">
                            {post.content}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              {new Date(post.scheduledTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                            <span className={`
                              px-2 py-0.5 rounded-full
                              ${post.status === 'scheduled' ? 'bg-joburg-teal/10 text-joburg-teal' : ''}
                              ${post.status === 'published' ? 'bg-green-100 text-green-700' : ''}
                              ${post.status === 'failed' ? 'bg-red-100 text-red-700' : ''}
                            `}>
                              {post.status}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {/* Show "+N more" if there are more than 3 posts */}
                {postsForDay.length > 3 && (
                  <div className="text-xs text-gray-500 text-center font-medium">
                    +{postsForDay.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className={`${platformColors.instagram} w-4 h-4 rounded`}></div>
          <span className="text-gray-400">Instagram</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`${platformColors.twitter} w-4 h-4 rounded`}></div>
          <span className="text-gray-400">Twitter</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`${platformColors.linkedin} w-4 h-4 rounded`}></div>
          <span className="text-gray-400">LinkedIn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`${platformColors.facebook} w-4 h-4 rounded`}></div>
          <span className="text-gray-400">Facebook</span>
        </div>
      </div>
    </div>
  );
}

