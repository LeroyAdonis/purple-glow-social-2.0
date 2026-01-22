'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ImageUploader from '../image-uploader';

/**
 * PostCreationModal Component
 * 
 * A cyberpunk/neo-brutalism styled modal for creating and editing draft posts.
 * Features neon glows, glassmorphism, and chunky neo-brutalist buttons.
 * 
 * @component
 */

interface PostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editDraftId?: string;
  initialContent?: string;
  initialPlatform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  initialTopic?: string;
  initialImageUrl?: string;
  onSave?: (draft: any) => void;
}

type Platform = 'facebook' | 'instagram' | 'twitter' | 'linkedin';

// Platform configuration with character limits
const platformConfig: Record<Platform, {
  icon: string;
  name: string;
  color: string;
  bgGradient: string;
  charLimit: number;
}> = {
  facebook: {
    icon: 'fa-facebook-f',
    name: 'Facebook',
    color: '#1877F2',
    bgGradient: 'from-[#1877F2] to-[#0D5BBE]',
    charLimit: 63206,
  },
  instagram: {
    icon: 'fa-instagram',
    name: 'Instagram',
    color: '#E4405F',
    bgGradient: 'from-[#833AB4] via-[#FD1D1D] to-[#F56040]',
    charLimit: 2200,
  },
  twitter: {
    icon: 'fa-x-twitter',
    name: 'X / Twitter',
    color: '#1DA1F2',
    bgGradient: 'from-[#1DA1F2] to-[#0C85D0]',
    charLimit: 280,
  },
  linkedin: {
    icon: 'fa-linkedin-in',
    name: 'LinkedIn',
    color: '#0A66C2',
    bgGradient: 'from-[#0A66C2] to-[#004182]',
    charLimit: 3000,
  },
};

export default function PostCreationModal({
  isOpen,
  onClose,
  editDraftId,
  initialContent = '',
  initialPlatform = 'twitter',
  initialTopic = '',
  initialImageUrl,
  onSave,
}: PostCreationModalProps) {
  const [platform, setPlatform] = useState<Platform>(initialPlatform);
  const [content, setContent] = useState(initialContent);
  const [topic, setTopic] = useState(initialTopic);
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'save' | 'schedule' | 'publish' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const isEditMode = !!editDraftId;
  const charLimit = platformConfig[platform].charLimit;
  const charCount = content.length;
  const charPercentage = (charCount / charLimit) * 100;

  // Reset form when modal opens with new initial values
  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setPlatform(initialPlatform);
      setTopic(initialTopic);
      setImageUrl(initialImageUrl);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialContent, initialPlatform, initialTopic, initialImageUrl]);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    contentRef.current?.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Get character count color based on percentage
  const getCharCountColor = (): string => {
    if (charPercentage >= 100) return 'text-red-500 border-red-500';
    if (charPercentage >= 90) return 'text-yellow-500 border-yellow-500';
    return 'text-green-500 border-green-500';
  };

  // Handle save as draft
  const handleSaveDraft = async () => {
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setIsSubmitting(true);
    setSubmitAction('save');
    setError(null);

    try {
      const endpoint = editDraftId 
        ? `/api/posts/drafts/${editDraftId}`
        : '/api/posts/drafts';
      
      const method = editDraftId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          platform,
          topic: topic.trim() || undefined,
          imageUrl: imageUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save draft');
      }

      setSuccess('Draft saved successfully!');
      onSave?.(data.draft);
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
      setSubmitAction(null);
    }
  };

  // Handle schedule (opens schedule modal)
  const handleSchedule = async () => {
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    // First save as draft, then user can schedule from draft
    setIsSubmitting(true);
    setSubmitAction('schedule');
    setError(null);

    try {
      const endpoint = editDraftId 
        ? `/api/posts/drafts/${editDraftId}`
        : '/api/posts/drafts';
      
      const method = editDraftId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          platform,
          topic: topic.trim() || undefined,
          imageUrl: imageUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save draft');
      }

      setSuccess('Draft saved! Opening scheduler...');
      onSave?.(data.draft);
      
      // TODO: Open schedule modal with draft ID
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
      setSubmitAction(null);
    }
  };

  // Handle publish now
  const handlePublishNow = async () => {
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setIsSubmitting(true);
    setSubmitAction('publish');
    setError(null);

    try {
      // First create/update draft, then publish
      const draftEndpoint = editDraftId 
        ? `/api/posts/drafts/${editDraftId}`
        : '/api/posts/drafts';
      
      const draftMethod = editDraftId ? 'PATCH' : 'POST';

      const draftResponse = await fetch(draftEndpoint, {
        method: draftMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          platform,
          topic: topic.trim() || undefined,
          imageUrl: imageUrl || undefined,
        }),
      });

      const draftData = await draftResponse.json();

      if (!draftResponse.ok) {
        throw new Error(draftData.error || 'Failed to save draft');
      }

      // Now publish the draft
      const publishResponse = await fetch('/api/posts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: draftData.draft.id,
        }),
      });

      const publishData = await publishResponse.json();

      if (!publishResponse.ok) {
        throw new Error(publishData.error || 'Failed to publish');
      }

      setSuccess('Published successfully! 🚀');
      onSave?.(draftData.draft);
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to publish');
    } finally {
      setIsSubmitting(false);
      setSubmitAction(null);
    }
  };

  // Handle image upload
  const handleImageUpload = useCallback((url: string) => {
    setImageUrl(url);
  }, []);

  // Handle image remove
  const handleImageRemove = useCallback(() => {
    setImageUrl(undefined);
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0D0F1C]/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#1A1F3A]/90 backdrop-blur-xl border-4 border-[#9D4EDD] rounded-2xl shadow-[0_0_60px_rgba(157,78,221,0.4)] overflow-hidden"
      >
        {/* Animated grid background */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(157,78,221,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(157,78,221,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />

        {/* Header */}
        <div className="p-6 border-b border-[#9D4EDD]/30">
          <div className="flex items-center justify-between">
            <h2 
              id="modal-title"
              className="text-2xl font-bold bg-gradient-to-r from-[#9D4EDD] to-[#00E0FF] bg-clip-text text-transparent"
            >
              {isEditMode ? 'Edit Draft' : 'Create New Post'}
            </h2>
            
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="relative overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6 custom-scrollbar">
          {/* Platform Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
              Platform
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(platformConfig) as Platform[]).map((p) => {
                const config = platformConfig[p];
                const isSelected = platform === p;
                
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    disabled={isSubmitting}
                    className={`
                      relative px-4 py-3 rounded-xl
                      border-3 transition-all duration-200
                      flex items-center justify-center gap-2
                      font-bold text-sm uppercase tracking-wide
                      ${isSelected 
                        ? `bg-gradient-to-br ${config.bgGradient} border-transparent text-white shadow-[0_0_20px_${config.color}66]` 
                        : 'bg-white/5 border-gray-600 text-gray-400 hover:border-gray-400'
                      }
                      disabled:opacity-50
                    `}
                    aria-pressed={isSelected}
                  >
                    <i className={`fa-brands ${config.icon}`}></i>
                    <span className="hidden sm:inline">{config.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label 
              htmlFor="topic-input"
              className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider"
            >
              Topic <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g., Summer Sale, Product Launch"
              maxLength={200}
              className="w-full px-4 py-3 bg-[#0D0F1C]/50 backdrop-blur-sm border border-[#9D4EDD]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#9D4EDD] focus:ring-2 focus:ring-[#9D4EDD]/20 transition-all"
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label 
              htmlFor="content-textarea"
              className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider"
            >
              Content
            </label>
            <div className="relative">
              <textarea
                id="content-textarea"
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                placeholder="Write your post content here... Use #hashtags and @mentions"
                rows={6}
                className={`
                  w-full px-4 py-3 rounded-xl
                  bg-[#0D0F1C]/50 backdrop-blur-sm
                  border-2 ${charPercentage >= 100 ? 'border-red-500' : charPercentage >= 90 ? 'border-yellow-500' : 'border-[#9D4EDD]/30'}
                  text-white placeholder-gray-500
                  focus:border-[#9D4EDD] focus:shadow-[0_0_20px_rgba(157,78,221,0.3)]
                  focus:outline-none
                  transition-all duration-300
                  resize-none
                  disabled:opacity-50
                `}
              />
              
              {/* Character Count */}
              <div className={`
                absolute bottom-3 right-3
                px-3 py-1 rounded-lg
                bg-[#0D0F1C]/80 border
                text-xs font-mono
                ${getCharCountColor()}
              `}>
                {charCount.toLocaleString()} / {charLimit.toLocaleString()}
              </div>
            </div>
            
            {charPercentage >= 100 && (
              <p className="mt-2 text-red-400 text-sm flex items-center gap-2">
                <i className="fa-solid fa-exclamation-triangle"></i>
                Content exceeds {platformConfig[platform].name} character limit
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
              Image <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <ImageUploader
              currentImage={imageUrl}
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              <i className="fa-solid fa-exclamation-circle text-xl"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
              <i className="fa-solid fa-check-circle text-xl"></i>
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="p-6 border-t border-[#9D4EDD]/30">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Save Draft Button */}
            <button
              onClick={handleSaveDraft}
              disabled={isSubmitting || !content.trim() || charPercentage >= 100}
              className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && submitAction === 'save' ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i>
                  Save Draft
                </>
              )}
            </button>

            {/* Schedule Button */}
            <button
              onClick={handleSchedule}
              disabled={isSubmitting || !content.trim() || charPercentage >= 100}
              className="flex-1 px-6 py-3 bg-[#00E0FF]/20 hover:bg-[#00E0FF]/30 border border-[#00E0FF] rounded-lg font-bold text-[#00E0FF] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && submitAction === 'schedule' ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fa-regular fa-calendar"></i>
                  Schedule
                </>
              )}
            </button>

            {/* Publish Now Button */}
            <button
              onClick={handlePublishNow}
              disabled={isSubmitting || !content.trim() || charPercentage >= 100}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#9D4EDD] to-[#00E0FF] hover:shadow-[0_0_30px_rgba(157,78,221,0.5)] rounded-lg font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && submitAction === 'publish' ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Publishing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-rocket"></i>
                  Publish Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
