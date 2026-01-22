import React from 'react';

// Generic skeleton component
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// Calendar loading skeleton
export const CalendarSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>

    {/* Day names */}
    <div className="grid grid-cols-7 gap-2 mb-2">
      {[...Array(7)].map((_, i) => (
        <Skeleton key={i} className="h-6" />
      ))}
    </div>

    {/* Calendar grid */}
    <div className="grid grid-cols-7 gap-2">
      {[...Array(35)].map((_, i) => (
        <div key={i} className="aspect-square">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

// Post list loading skeleton
export const PostListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-4 h-4 mt-1" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Automation rule card skeleton
export const AutomationRuleSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-6 w-24 rounded" />
        </div>
      </div>
      <Skeleton className="w-14 h-8 rounded-full" />
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-200">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-6 w-12 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>

    <div className="flex gap-2">
      <Skeleton className="flex-1 h-10 rounded-lg" />
      <Skeleton className="flex-1 h-10 rounded-lg" />
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
  </div>
);

// Stats card skeleton
export const StatsCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-300">
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-4 w-32" />
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>

    {/* Main content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CalendarSkeleton />
      </div>
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
          <Skeleton className="h-6 w-32 mb-4" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 border-b border-gray-200 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {[...Array(cols)].map((_, i) => (
          <Skeleton key={i} className="h-5" />
        ))}
      </div>
    </div>

    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {[...Array(cols)].map((_, j) => (
              <Skeleton key={j} className="h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Modal skeleton
export const ModalSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="w-8 h-8 rounded-full" />
    </div>

    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      <Skeleton className="h-32 w-full rounded-lg" />
    </div>

    <div className="flex justify-between pt-4 border-t border-gray-200">
      <Skeleton className="h-10 w-24 rounded-lg" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  </div>
);

// Draft Card skeleton - Cyberpunk/Neo-Brutalism style
export const DraftCardSkeleton: React.FC = () => (
  <div className="">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#9D4EDD]/20"></div>
        <div className="h-4 w-24 rounded bg-[#9D4EDD]/20"></div>
      </div>
      <div className="w-8 h-8 rounded-lg bg-white/5"></div>
    </div>

    {/* Body */}
    <div className="p-4">
      <div className="flex gap-4">
        <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-[#9D4EDD]/10"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded bg-white/10"></div>
          <div className="h-3 rounded bg-white/10 w-5/6"></div>
          <div className="h-3 rounded bg-white/10 w-4/6"></div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="px-4 pb-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 rounded-full bg-[#9D4EDD]/10"></div>
        <div className="h-4 w-20 rounded bg-gray-700"></div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 rounded-lg bg-white/5"></div>
        ))}
      </div>
    </div>
  </div>
);

// Draft Manager skeleton - Full view
export const DraftManagerSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-10 w-32 rounded bg-[#9D4EDD]/20 animate-pulse"></div>
        <div className="h-8 w-12 rounded-full bg-[#9D4EDD]/20 animate-pulse"></div>
      </div>
      <div className="h-12 w-36 rounded-xl bg-[#9D4EDD]/30 animate-pulse"></div>
    </div>

    {/* Filter Bar */}
    <div className="p-4 rounded-xl bg-[#1A1F3A]/40 border-2 border-[#9D4EDD]/30">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-24 rounded-xl bg-white/5 animate-pulse"></div>
          ))}
        </div>
        <div className="h-10 w-40 rounded-xl bg-white/5 animate-pulse"></div>
      </div>
    </div>

    {/* Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <DraftCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Smart Suggestions skeleton
export const SmartSuggestionsSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
      <Skeleton className="h-6 w-48 mb-2" />
      <Skeleton className="h-4 w-64" />
    </div>

    <div className="flex border-b border-gray-200 bg-gray-50">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="flex-1 h-12 m-2 rounded" />
      ))}
    </div>

    <div className="p-4 space-y-3">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-lg" />
      ))}
    </div>
  </div>
);
