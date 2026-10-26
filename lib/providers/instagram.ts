/**
 * Instagram provider — a thin adapter over the existing InstagramPoster. No API call lives here.
 */

import { InstagramPoster } from '@/lib/posting/instagram-poster';
import {
  classifyTransientError,
  type PublishInput,
  type PublishOutcome,
  type SocialProvider,
} from './types';

const poster = new InstagramPoster();

export const instagramProvider: SocialProvider = {
  identifier: 'instagram',
  displayName: 'Instagram',
  scopes: ['instagram_basic', 'instagram_content_publish'],
  maxLength: 2200,
  requiresMedia: true,
  classifyError: classifyTransientError,

  async publish(input: PublishInput): Promise<PublishOutcome> {
    if (!input.content.mediaUrl) {
      throw new Error('Instagram requires an image');
    }

    const result = await poster.postImage(input.accessToken, input.accountId, {
      caption: input.content.text,
      imageUrl: input.content.mediaUrl,
    });

    return { status: 'published', platformPostId: result.id, url: result.postUrl };
  },
};
