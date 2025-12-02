'use client';

/**
 * Lazy Loading Utilities
 * 
 * Dynamic imports for code splitting heavy components
 */

import dynamic from 'next/dynamic';
import React, { ComponentType, ReactNode, ReactElement } from 'react';

// Loading fallback component
function LoadingFallback({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-neon-grape mb-3"></i>
        <p className="text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

// Skeleton loading for cards
function CardSkeleton() {
  return (
    <div className="aerogel-card p-6 rounded-xl animate-pulse">
      <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-white/10 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-white/10 rounded w-2/3"></div>
    </div>
  );
}

// Generic lazy load wrapper
export function lazyLoad<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: ReactNode;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: () => (options?.loading as ReactElement) || <LoadingFallback />,
    ssr: options?.ssr ?? true,
  });
}

// ============ Lazy Loaded Components ============

// Admin Dashboard (heavy with charts)
export const LazyAdminDashboard = dynamic(
  () => import('@/components/admin-dashboard-view'),
  {
    loading: () => <LoadingFallback message="Loading admin dashboard..." />,
    ssr: false, // Admin dashboard doesn't need SSR
  }
);

// AI Content Studio (heavy with AI features)
export const LazyAIContentStudio = dynamic(
  () => import('@/components/ai-content-studio'),
  {
    loading: () => <LoadingFallback message="Loading AI studio..." />,
    ssr: false,
  }
);

// Automation View
export const LazyAutomationView = dynamic(
  () => import('@/components/automation-view'),
  {
    loading: () => <LoadingFallback message="Loading automation..." />,
    ssr: false,
  }
);

// Schedule View
export const LazyScheduleView = dynamic(
  () => import('@/components/schedule-view'),
  {
    loading: () => <LoadingFallback message="Loading schedule..." />,
    ssr: false,
  }
);

// Settings View
export const LazySettingsView = dynamic(
  () => import('@/components/settings-view'),
  {
    loading: () => <LoadingFallback message="Loading settings..." />,
    ssr: false,
  }
);

// Analytics View - TODO: Create this component when analytics feature is implemented
// export const LazyAnalyticsView = dynamic(
//   () => import('@/components/analytics-view'),
//   {
//     loading: () => <LoadingFallback message="Loading analytics..." />,
//     ssr: false,
//   }
// );

// ============ Lazy Loaded Modals ============

// Credit Topup Modal
export const LazyCreditTopupModal = dynamic(
  () => import('@/components/modals/credit-topup-modal'),
  {
    loading: () => null, // Modals don't show loading state
    ssr: false,
  }
);

// Subscription Modal
export const LazySubscriptionModal = dynamic(
  () => import('@/components/modals/subscription-modal'),
  {
    loading: () => null,
    ssr: false,
  }
);

// Export loading components for reuse
export { LoadingFallback, CardSkeleton };
