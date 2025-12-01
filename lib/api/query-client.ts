'use client';

/**
 * React Query Client Configuration
 * 
 * Centralized configuration for data fetching and caching
 */

import { QueryClient } from '@tanstack/react-query';

// Create a client with default options
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: how long data is considered fresh (5 minutes)
        staleTime: 5 * 60 * 1000,
        
        // Cache time: how long inactive data stays in cache (30 minutes)
        gcTime: 30 * 60 * 1000,
        
        // Retry failed requests 2 times
        retry: 2,
        
        // Refetch on window focus for fresh data
        refetchOnWindowFocus: true,
        
        // Don't refetch on reconnect by default
        refetchOnReconnect: false,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
}

// Browser-side query client (singleton)
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * Query keys for consistent caching
 */
export const queryKeys = {
  // User queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    credits: () => [...queryKeys.user.all, 'credits'] as const,
    subscription: () => [...queryKeys.user.all, 'subscription'] as const,
  },
  
  // Posts queries
  posts: {
    all: ['posts'] as const,
    list: (filters?: { status?: string; platform?: string }) => 
      [...queryKeys.posts.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.posts.all, 'detail', id] as const,
    scheduled: () => [...queryKeys.posts.all, 'scheduled'] as const,
  },
  
  // Automation queries
  automation: {
    all: ['automation'] as const,
    rules: () => [...queryKeys.automation.all, 'rules'] as const,
    rule: (id: string) => [...queryKeys.automation.all, 'rule', id] as const,
  },
  
  // Connected accounts
  accounts: {
    all: ['accounts'] as const,
    list: () => [...queryKeys.accounts.all, 'list'] as const,
    platform: (platform: string) => [...queryKeys.accounts.all, platform] as const,
  },
  
  // Admin queries
  admin: {
    all: ['admin'] as const,
    users: (page?: number) => [...queryKeys.admin.all, 'users', page] as const,
    stats: () => [...queryKeys.admin.all, 'stats'] as const,
    transactions: (page?: number) => [...queryKeys.admin.all, 'transactions', page] as const,
  },
  
  // Billing
  billing: {
    all: ['billing'] as const,
    history: () => [...queryKeys.billing.all, 'history'] as const,
  },
};

/**
 * Cache times for different data types
 */
export const cacheTimes = {
  // User data: short stale time, user might upgrade/change credits
  user: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // Posts: medium stale time
  posts: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Automation rules: longer, rarely change
  automation: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // Admin stats: short, need fresh data
  admin: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  
  // Billing history: long, rarely changes
  billing: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
};
