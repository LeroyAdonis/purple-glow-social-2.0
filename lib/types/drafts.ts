/**
 * Draft Types for Purple Glow Social
 * 
 * Type definitions for draft post management feature (F001)
 */

export interface DraftPost {
  id: string;
  content: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  topic?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDraftInput {
  content: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  topic?: string;
  imageUrl?: string;
  hashtags?: string[];
}

export interface UpdateDraftInput {
  content?: string;
  platform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  topic?: string;
  imageUrl?: string | null; // null to remove image
}

export interface DraftListResponse {
  drafts: DraftPost[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface DraftFilters {
  platform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  sort?: 'newest' | 'oldest';
  limit?: number;
  offset?: number;
}

export interface ImageUploadResponse {
  success: boolean;
  url: string;
  size: number;
  contentType: string;
}
