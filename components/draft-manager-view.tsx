'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DraftCard from './draft-card';
import PostCreationModal from './modals/post-creation-modal';
import SchedulePostModal from './modals/schedule-post-modal';

/**
 * DraftManagerView Component
 * 
 * A cyberpunk/neo-brutalism styled view for managing all user drafts.
 * Features platform filtering, sorting, pagination, and empty states.
 * 
 * @component
 */

interface DraftManagerViewProps {
  onEditDraft?: (draftId: string) => void;
  onScheduleDraft?: (draftId: string) => void;
}

interface Draft {
  id: string;
  content: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  topic?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

type Platform = 'all' | 'facebook' | 'instagram' | 'twitter' | 'linkedin';
type SortOrder = 'newest' | 'oldest';

// Platform filter configuration
const platformFilters: { key: Platform; label: string; icon?: string; color: string }[] = [
  { key: 'all', label: 'All', color: '#9D4EDD' },
  { key: 'instagram', label: 'Instagram', icon: 'fa-instagram', color: '#E4405F' },
  { key: 'twitter', label: 'X', icon: 'fa-x-twitter', color: '#1DA1F2' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'fa-linkedin-in', color: '#0A66C2' },
  { key: 'facebook', label: 'Facebook', icon: 'fa-facebook-f', color: '#1877F2' },
];

export default function DraftManagerView({
  onEditDraft,
  onScheduleDraft,
}: DraftManagerViewProps) {
  // State
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [totalDrafts, setTotalDrafts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Pagination
  const [platformFilter, setPlatformFilter] = useState<Platform>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 12;

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [scheduleModalDraft, setScheduleModalDraft] = useState<Draft | null>(null);
  
  // Deletion state
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);

  // Fetch drafts
  const fetchDrafts = useCallback(async (reset = false, signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = reset ? 0 : offset;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: currentOffset.toString(),
        sort: sortOrder,
      });
      
      if (platformFilter !== 'all') {
        params.append('platform', platformFilter);
      }

      const response = await fetch(`/api/posts/drafts?${params}`, { signal });
      const data = await response.json();

      if (signal?.aborted) return;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch drafts');
      }

      const fetchedDrafts = data.drafts.map((d: Draft) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt),
      }));

      if (reset) {
        setDrafts(fetchedDrafts);
        setOffset(0);
      } else {
        setDrafts(prev => [...prev, ...fetchedDrafts]);
      }

      setTotalDrafts(data.total);
      setHasMore(data.pagination.hasMore);

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;
      if (error instanceof Error) {
        setError(error.message || 'Failed to load drafts');
      } else {
        setError('Failed to load drafts');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [offset, platformFilter, sortOrder, limit]);

  // Initial fetch and filter changes
  useEffect(() => {
    const controller = new AbortController();
    fetchDrafts(true, controller.signal);
    return () => controller.abort();
  }, [platformFilter, sortOrder, fetchDrafts]);

  // Handle load more
  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
    fetchDrafts(false);
  };

  // Handle delete draft
  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;

    setDeletingDraftId(draftId);

    try {
      const response = await fetch(`/api/posts/drafts/${draftId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete draft');
      }

      // Remove from local state with animation delay
      setTimeout(() => {
        setDrafts(prev => prev.filter(d => d.id !== draftId));
        setTotalDrafts(prev => prev - 1);
        setDeletingDraftId(null);
      }, 300);

    } catch (err: any) {
      setError(err.message || 'Failed to delete draft');
      setDeletingDraftId(null);
    }
  };

  // Handle edit draft
  const handleEditDraft = (draft: Draft) => {
    setEditingDraft(draft);
    setEditingDraftId(draft.id);
    setIsCreateModalOpen(true);
    onEditDraft?.(draft.id);
  };

  // Handle schedule draft
  const handleScheduleDraft = (draft: Draft) => {
    setScheduleModalDraft(draft);
    onScheduleDraft?.(draft.id);
  };

  // Handle publish draft
  const handlePublishDraft = async (draftId: string) => {
    try {
      const response = await fetch('/api/posts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: draftId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish');
      }

      // Remove from drafts (it's now posted)
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      setTotalDrafts(prev => prev - 1);

    } catch (err: any) {
      setError(err.message || 'Failed to publish');
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingDraftId(null);
    setEditingDraft(null);
  };

  // Handle draft save from modal
  const handleDraftSave = (draft: Draft) => {
    if (editingDraftId) {
      // Update existing draft
      setDrafts(prev => prev.map(d => d.id === draft.id ? {
        ...draft,
        createdAt: new Date(draft.createdAt),
        updatedAt: new Date(draft.updatedAt),
      } : d));
    } else {
      // Add new draft at beginning
      setDrafts(prev => [{
        ...draft,
        createdAt: new Date(draft.createdAt),
        updatedAt: new Date(draft.updatedAt),
      }, ...prev]);
      setTotalDrafts(prev => prev + 1);
    }
  };

  // Filtered draft count for display
  const displayCount = drafts.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Title with holographic effect */}
          <h1 className="">
            Drafts
          </h1>
          
          {/* Count Badge */}
          <div className="">
            {totalDrafts}
          </div>
        </div>

        {/* New Draft Button */}
        <button
          onClick={() => {
            setEditingDraft(null);
            setEditingDraftId(null);
            setIsCreateModalOpen(true);
          }}
          className=""
        >
          <i className="fa-solid fa-plus"></i>
          New Draft
        </button>
      </div>

      {/* Filter Bar */}
      <div className="">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Platform Filters */}
          <div className="flex flex-wrap gap-2">
            {platformFilters.map((filter) => {
              const isActive = platformFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setPlatformFilter(filter.key)}
                  className={`
                    px-4 py-2 rounded-xl
                    border-2 transition-all duration-200
                    font-bold text-sm uppercase tracking-wide
                    flex items-center gap-2
                    ${isActive 
                      ? 'border-transparent text-white shadow-[0_0_15px_rgba(157,78,221,0.4)]' 
                      : 'border-gray-600 text-gray-400 hover:border-gray-400 bg-transparent'
                    }
                  `}
                  style={isActive ? { 
                    backgroundColor: filter.color,
                    boxShadow: `0 0 20px ${filter.color}66`
                  } : undefined}
                >
                  {filter.icon && <i className={`fa-brands ${filter.icon}`}></i>}
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm font-bold uppercase">Sort:</span>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className=""
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[#9D4EDD] pointer-events-none"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-exclamation-circle text-xl"></i>
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && drafts.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <DraftCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && drafts.length === 0 && (
        <div className="">
          {/* Icon */}
          <div className="">
            <i className="fa-solid fa-file-lines text-4xl text-[#9D4EDD]/50"></i>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">
            No drafts yet
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Start by generating AI content or creating a new post manually. 
            Your drafts will appear here.
          </p>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className=""
          >
            <i className="fa-solid fa-plus"></i>
            Create Your First Draft
          </button>
        </div>
      )}

      {/* Draft Grid */}
      {drafts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {drafts.map((draft, index) => (
            <div
              key={draft.id}
              className="animate-[fadeIn_0.3s_ease-out]"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <DraftCard
                draft={draft}
                onEdit={() => handleEditDraft(draft)}
                onDelete={() => handleDeleteDraft(draft.id)}
                onSchedule={() => handleScheduleDraft(draft)}
                onPublish={() => handlePublishDraft(draft.id)}
                isDeleting={deletingDraftId === draft.id}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            className=""
          >
            <i className="fa-solid fa-arrow-down"></i>
            Load More
          </button>
        </div>
      )}

      {/* Loading More Indicator */}
      {isLoading && drafts.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-3 text-[#9D4EDD]">
            <i className="fa-solid fa-spinner fa-spin text-xl"></i>
            <span className="font-bold">Loading more drafts...</span>
          </div>
        </div>
      )}

      {/* Post Creation Modal */}
      <PostCreationModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        editDraftId={editingDraftId || undefined}
        initialContent={editingDraft?.content}
        initialPlatform={editingDraft?.platform}
        initialTopic={editingDraft?.topic}
        initialImageUrl={editingDraft?.imageUrl}
        onSave={handleDraftSave}
      />

      {/* Schedule Modal */}
      {scheduleModalDraft && (
        <SchedulePostModal
          isOpen={!!scheduleModalDraft}
          onClose={() => setScheduleModalDraft(null)}
          postId={scheduleModalDraft.id}
          postContent={scheduleModalDraft.content}
          platform={scheduleModalDraft.platform}
          onScheduleSuccess={() => {
            // Remove from drafts (now scheduled)
            setDrafts(prev => prev.filter(d => d.id !== scheduleModalDraft.id));
            setTotalDrafts(prev => prev - 1);
            setScheduleModalDraft(null);
          }}
        />
      )}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Draft Card Skeleton Component
 * Loading placeholder with cyberpunk styling
 */
function DraftCardSkeleton() {
  return (
    <div className="">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#9D4EDD]/20"></div>
          <div className="h-4 w-24 rounded bg-[#9D4EDD]/20"></div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/5"></div>
      </div>

      {/* Body Skeleton */}
      <div className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-[#9D4EDD]/10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded bg-white/10"></div>
            <div className="h-3 rounded bg-white/10 w-5/6"></div>
            <div className="h-3 rounded bg-white/10 w-4/6"></div>
            <div className="flex gap-2 mt-3">
              <div className="h-4 w-16 rounded bg-[#FFCC00]/10"></div>
              <div className="h-4 w-20 rounded bg-[#FFCC00]/10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
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

      {/* Scanline overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(157,78,221,0.03) 2px, rgba(157,78,221,0.03) 4px)',
        }}
      />
    </div>
  );
}
