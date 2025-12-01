'use client';

/**
 * API Hooks using React Query
 * 
 * Custom hooks for data fetching with caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, cacheTimes } from './query-client';

// Generic fetch wrapper
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }

  return response.json();
}

// ============ User Hooks ============

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => fetchAPI<{
      id: string;
      name: string;
      email: string;
      tier: string;
      credits: number;
      image?: string;
    }>('/api/user/profile'),
    ...cacheTimes.user,
  });
}

export function useUserCredits() {
  return useQuery({
    queryKey: queryKeys.user.credits(),
    queryFn: () => fetchAPI<{ credits: number }>('/api/user/credits'),
    ...cacheTimes.user,
  });
}

// ============ Posts Hooks ============

interface Post {
  id: string;
  content: string;
  platform: string;
  status: string;
  scheduledDate?: string;
  createdAt: string;
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function usePosts(filters?: { status?: string; platform?: string; page?: number }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.platform) params.set('platform', filters.platform);
  if (filters?.page) params.set('page', String(filters.page));

  return useQuery({
    queryKey: queryKeys.posts.list(filters),
    queryFn: () => fetchAPI<PostsResponse>(`/api/user/posts?${params}`),
    ...cacheTimes.posts,
  });
}

export function useScheduledPosts() {
  return useQuery({
    queryKey: queryKeys.posts.scheduled(),
    queryFn: () => fetchAPI<PostsResponse>('/api/user/posts?status=scheduled'),
    ...cacheTimes.posts,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Post>) =>
      fetchAPI<Post>('/api/user/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate posts queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      fetchAPI<{ success: boolean }>(`/api/user/posts?id=${postId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

// ============ Automation Hooks ============

interface AutomationRule {
  id: string;
  coreTopic: string;
  frequency: string;
  platforms: string[];
  tone: string;
  language: string;
  isActive: boolean;
}

export function useAutomationRules() {
  return useQuery({
    queryKey: queryKeys.automation.rules(),
    queryFn: () => fetchAPI<{ rules: AutomationRule[] }>('/api/user/automation-rules'),
    ...cacheTimes.automation,
  });
}

export function useCreateAutomationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AutomationRule>) =>
      fetchAPI<AutomationRule>('/api/user/automation-rules', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.automation.all });
    },
  });
}

export function useToggleAutomationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetchAPI<AutomationRule>('/api/user/automation-rules', {
        method: 'PATCH',
        body: JSON.stringify({ id, isActive }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.automation.all });
    },
  });
}

// ============ Admin Hooks ============

interface AdminUser {
  id: string;
  name: string;
  email: string;
  tier: string;
  credits: number;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  postsCreated: number;
}

export function useAdminUsers(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.admin.users(page),
    queryFn: () => fetchAPI<{ users: AdminUser[]; pagination: any }>(`/api/admin/users?page=${page}`),
    ...cacheTimes.admin,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => fetchAPI<AdminStats>('/api/admin/stats'),
    ...cacheTimes.admin,
  });
}

// ============ Billing Hooks ============

interface Invoice {
  id: string;
  date: string;
  plan: string;
  amount: number;
  total: number;
  status: string;
}

export function useBillingHistory() {
  return useQuery({
    queryKey: queryKeys.billing.history(),
    queryFn: () => fetchAPI<{ invoices: Invoice[] }>('/api/user/billing-history'),
    ...cacheTimes.billing,
  });
}

// ============ Connected Accounts Hooks ============

interface ConnectedAccount {
  platform: string;
  connected: boolean;
  username?: string;
  connectedAt?: string;
}

export function useConnectedAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.list(),
    queryFn: () => fetchAPI<{ accounts: ConnectedAccount[] }>('/api/user/connected-accounts'),
    ...cacheTimes.automation, // Same as automation - rarely changes
  });
}
