/**
 * Facebook provider — a thin adapter over the existing FacebookPoster. No API call lives here.
 */

import { FacebookPoster } from '@/lib/posting/facebook-poster';
import {
  classifyTransientError,
  type PublishInput,
  type PublishOutcome,
  type SocialProvider,
} from './types';

const poster = new FacebookPoster();

export const facebookProvider: SocialProvider = {
  identifier: 'facebook',
  displayName: 'Facebook',
  scopes: ['pages_manage_posts', 'pages_read_engagement'],
  maxLength: 63206,
  requiresMedia: false,
  classifyError: classifyTransientError,

  async publish(input: PublishInput): Promise<PublishOutcome> {
    const { text, mediaUrl, link } = input.content;

    const result = mediaUrl
      ? await poster.postImage(input.accessToken, input.accountId, { message: text, imageUrl: mediaUrl })
      : link
        ? await poster.postLink(input.accessToken, input.accountId, { message: text, link })
        : await poster.postText(input.accessToken, input.accountId, text);

    return { status: 'published', platformPostId: result.id, url: result.postUrl };
  },
};
