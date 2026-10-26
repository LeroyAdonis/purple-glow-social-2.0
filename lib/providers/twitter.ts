/**
 * Twitter/X provider — a thin adapter over the existing TwitterPoster. No API call lives here.
 */

import { TwitterPoster } from '@/lib/posting/twitter-poster';
import {
  classifyTransientError,
  type PublishInput,
  type PublishOutcome,
  type SocialProvider,
} from './types';

const poster = new TwitterPoster();

export const twitterProvider: SocialProvider = {
  identifier: 'twitter',
  displayName: 'Twitter',
  scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  maxLength: 280,
  requiresMedia: false,
  classifyError: classifyTransientError,

  async publish(input: PublishInput): Promise<PublishOutcome> {
    const { text, mediaUrl } = input.content;

    const result = mediaUrl
      ? await poster.postWithImage(input.accessToken, text, mediaUrl)
      : await poster.postText(input.accessToken, text);

    return { status: 'published', platformPostId: result.id, url: result.postUrl };
  },
};
