'use client';

import React, { useState } from 'react';
import Image from 'next/image';

/**
 * DraftCard Component
 * 
 * A cyberpunk/neo-brutalism styled card for displaying draft posts.
 * Features platform-specific styling, neon glows, and chunky shadows.
 * 
 * @component
 */

interface DraftCardProps {
  draft: {
    id: string;
    content: string;
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
    topic?: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  onEdit: () => void;
  onDelete: () => void;
  onSchedule: () => void;
  onPublish: () => void;
  isDeleting?: boolean;
}

// Platform configuration
const platformConfig = {
  facebook: {
    icon: 'fa-facebook-f',
    name: 'Facebook',
    color: '#1877F2',
    bgGradient: 'from-[#1877F2] to-[#0D5BBE]',
    borderColor: 'border-[#1877F2]',
    glowColor: 'shadow-[0_0_20px_rgba(24,119,242,0.4)]',
  },
  instagram: {
    icon: 'fa-instagram',
    name: 'Instagram',
    color: '#E4405F',
    bgGradient: 'from-[#833AB4] via-[#FD1D1D] to-[#F56040]',
    borderColor: 'border-[#E4405F]',
    glowColor: 'shadow-[0_0_20px_rgba(228,64,95,0.4)]',
    isGradientBorder: true,
  },
  twitter: {
    icon: 'fa-x-twitter',
    name: 'X / Twitter',
    color: '#1DA1F2',
    bgGradient: 'from-[#1DA1F2] to-[#0C85D0]',
    borderColor: 'border-[#1DA1F2]',
    glowColor: 'shadow-[0_0_20px_rgba(29,161,242,0.4)]',
  },
  linkedin: {
    icon: 'fa-linkedin-in',
    name: 'LinkedIn',
    color: '#0A66C2',
    bgGradient: 'from-[#0A66C2] to-[#004182]',
    borderColor: 'border-[#0A66C2]',
    glowColor: 'shadow-[0_0_20px_rgba(10,102,194,0.4)]',
  },
};

// Format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
};

// Extract hashtags from content
const extractHashtags = (content: string): string[] => {
  const matches = content.match(/#\w+/g);
  return matches ? matches.slice(0, 5) : [];
};

export default function DraftCard({
  draft,
  onEdit,
  onDelete,
  onSchedule,
  onPublish,
  isDeleting = false,
}: DraftCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const platform = platformConfig[draft.platform];
  const hashtags = extractHashtags(draft.content);
  const contentWithoutHashtags = draft.content.replace(/#\w+/g, '').trim();

  return (
    <div
      className={`
        relative group
        bg-[#1A1F3A]/40 backdrop-blur-md
        border-3 ${platform.borderColor}
        rounded-xl overflow-hidden
        transition-all duration-300 ease-out
        ${isHovered ? '-translate-y-2' : ''}
        ${isHovered ? platform.glowColor : 'shadow-[8px_8px_0_0_rgba(157,78,221,0.2)]'}
        ${isDeleting ? 'opacity-50 scale-95 animate-pulse' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
      style={draft.platform === 'instagram' ? {
        borderImage: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F56040) 1',
      } : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Platform Icon */}
          <div
            className={`
              w-10 h-10 rounded-lg
              bg-gradient-to-br ${platform.bgGradient}
              flex items-center justify-center
              shadow-lg
            `}
          >
            <i className={`fa-brands ${platform.icon} text-white text-lg`}></i>
          </div>
          
          {/* Platform Name */}
          <span className="text-white font-bold uppercase tracking-wider text-sm">
            {platform.name}
          </span>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className=""
            aria-label="More options"
            aria-expanded={isMenuOpen}
          >
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="">
              <button
                onClick={() => { onEdit(); setIsMenuOpen(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#9D4EDD]/20 hover:text-white flex items-center gap-2"
              >
                <i className="fa-solid fa-pen w-4"></i>
                Edit
              </button>
              <button
                onClick={() => { onDelete(); setIsMenuOpen(false); }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center gap-2"
              >
                <i className="fa-solid fa-trash w-4"></i>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex gap-4">
          {/* Image Thumbnail */}
          {draft.imageUrl && (
            <div className="">
              <Image
                src={draft.imageUrl}
                alt="Post image"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-gray-200 text-sm leading-relaxed line-clamp-3 mb-2">
              {contentWithoutHashtags || draft.content}
            </p>
            
            {/* Hashtags */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[#FFCC00] text-xs font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 space-y-3">
        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs">
          {/* Topic Badge */}
          {draft.topic && (
            <span className="">
              {draft.topic}
            </span>
          )}
          
          {/* Timestamp */}
          <span className="text-gray-500 font-mono">
            Created: {formatRelativeTime(draft.createdAt)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {/* Edit Button */}
          <button
            onClick={onEdit}
            disabled={isDeleting}
            className=""
            aria-label="Edit draft"
          >
            <i className="fa-solid fa-pen text-[10px]"></i>
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* Schedule Button */}
          <button
            onClick={onSchedule}
            disabled={isDeleting}
            className=""
            aria-label="Schedule draft"
          >
            <i className="fa-regular fa-calendar text-[10px]"></i>
            <span className="hidden sm:inline">Schedule</span>
          </button>

          {/* Publish Button */}
          <button
            onClick={onPublish}
            disabled={isDeleting}
            className=""
            aria-label="Publish draft now"
          >
            <i className="fa-solid fa-rocket text-[10px]"></i>
            <span className="hidden sm:inline">Publish</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className=""
            aria-label="Delete draft"
          >
            <i className="fa-solid fa-trash text-[10px]"></i>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Deleting overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-[#0D0F1C]/80 flex items-center justify-center">
          <div className="flex items-center gap-2 text-red-400">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>Deleting...</span>
          </div>
        </div>
      )}
    </div>
  );
}
