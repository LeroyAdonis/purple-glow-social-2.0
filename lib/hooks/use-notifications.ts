'use client';

/**
 * Notifications Hook
 * 
 * Custom hook for fetching and managing user notifications
 * Uses React Query for caching and automatic refetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query key for notifications
export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
};

// Notification type
export interface Notification {
  id: string;
  userId: string;
  type: 'low_credits' | 'credits_expiring' | 'post_skipped' | 'post_failed' | 'tier_limit_reached';
  title: string;
  message: string;
  read: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}

// Fetch notifications
async function fetchNotifications(): Promise<NotificationsResponse> {
  const response = await fetch('/api/notifications', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch notifications' }));
    throw new Error(error.message || error.error || 'Failed to fetch notifications');
  }
  
  return response.json();
}

// Mark notification as read
async function markAsRead(notificationId: string): Promise<{ success: boolean }> {
  const response = await fetch('/api/notifications/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ notificationId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
  
  return response.json();
}

// Mark all notifications as read
async function markAllAsRead(): Promise<{ success: boolean }> {
  const response = await fetch('/api/notifications/read-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
  
  return response.json();
}

// Dismiss notification
async function dismissNotification(notificationId: string): Promise<{ success: boolean }> {
  const response = await fetch('/api/notifications/dismiss', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ notificationId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to dismiss notification');
  }
  
  return response.json();
}

/**
 * Hook to fetch user notifications
 * Polls every 30 seconds for updates
 */
export function useNotifications(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: fetchNotifications,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    refetchOnWindowFocus: true,
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to get just the unread count
 */
export function useUnreadNotificationCount() {
  const { data, isLoading, error } = useNotifications();
  
  return {
    count: data?.unreadCount ?? 0,
    isLoading,
    error,
  };
}

/**
 * Hook to mark a single notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      // Invalidate notifications to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllAsRead,
    onMutate: async () => {
      // Optimistically update the cache
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      
      const previousData = queryClient.getQueryData<NotificationsResponse>(notificationKeys.list());
      
      if (previousData) {
        queryClient.setQueryData<NotificationsResponse>(notificationKeys.list(), {
          ...previousData,
          notifications: previousData.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        });
      }
      
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(notificationKeys.list(), context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to dismiss (delete) a notification
 */
export function useDismissNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dismissNotification,
    onMutate: async (notificationId) => {
      // Optimistically remove from cache
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      
      const previousData = queryClient.getQueryData<NotificationsResponse>(notificationKeys.list());
      
      if (previousData) {
        const dismissed = previousData.notifications.find(n => n.id === notificationId);
        const wasUnread = dismissed && !dismissed.read;
        
        queryClient.setQueryData<NotificationsResponse>(notificationKeys.list(), {
          ...previousData,
          notifications: previousData.notifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? previousData.unreadCount - 1 : previousData.unreadCount,
        });
      }
      
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(notificationKeys.list(), context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
