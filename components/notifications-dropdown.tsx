'use client';

/**
 * Notifications Dropdown Component
 * 
 * Displays user notifications with read/dismiss functionality
 * South African styled messaging
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNotifications, useMarkAllRead, useDismissNotification } from '@/lib/hooks/use-notifications';

interface Notification {
  id: string;
  type: 'low_credits' | 'credits_expiring' | 'post_skipped' | 'post_failed' | 'tier_limit_reached';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const NOTIFICATION_ICONS: Record<Notification['type'], { icon: string; color: string }> = {
  low_credits: { icon: 'fa-coins', color: 'text-mzansi-gold' },
  credits_expiring: { icon: 'fa-clock', color: 'text-amber-400' },
  post_skipped: { icon: 'fa-forward', color: 'text-gray-400' },
  post_failed: { icon: 'fa-circle-exclamation', color: 'text-red-400' },
  tier_limit_reached: { icon: 'fa-lock', color: 'text-neon-grape' },
};

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const dismissNotification = useDismissNotification();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format relative time
  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      timeZone: 'Africa/Johannesburg',
    });
  }

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dismissNotification.mutate(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <i className="fa-regular fa-bell text-xl text-gray-300 hover:text-white transition-colors"></i>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-neon-grape rounded-full text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-hidden rounded-xl border border-glass-border bg-black/90 backdrop-blur-xl shadow-2xl z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
            <h3 className="font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-joburg-teal hover:text-white transition-colors cursor-pointer"
                disabled={markAllRead.isPending}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-500"></i>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <i className="fa-regular fa-bell-slash text-3xl text-gray-600 mb-3"></i>
                <p className="text-gray-400 text-sm">No notifications</p>
                <p className="text-gray-500 text-xs mt-1">You're all caught up, sharp sharp!</p>
              </div>
            ) : (
              notifications.map((notification: Notification) => {
                const { icon, color } = NOTIFICATION_ICONS[notification.type] || { icon: 'fa-bell', color: 'text-gray-400' };
                
                return (
                  <div
                    key={notification.id}
                    className={`flex gap-3 px-4 py-3 border-b border-glass-border/50 hover:bg-white/5 transition-colors ${!notification.read ? 'bg-white/5' : ''}`}
                    role="menuitem"
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ${color}`}>
                      <i className={`fa-solid ${icon} text-sm`}></i>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => handleDismiss(notification.id, e)}
                          className="flex-shrink-0 text-gray-500 hover:text-white transition-colors cursor-pointer p-1"
                          aria-label="Dismiss notification"
                        >
                          <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
                      <span className="text-[10px] text-gray-500 mt-1 block">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    
                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-joburg-teal mt-2"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-glass-border text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
