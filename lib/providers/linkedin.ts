/**
 * LinkedIn provider — a thin adapter over the existing LinkedInPoster. No API call lives here.
 *
 * The author URN lookup stays with the OAuth provider that already owns it; the poster has always
 * needed a URN rather than a token alone.
 */

import { LinkedInPoster } from '@/lib/posting/linkedin-poster';
import { LinkedInProvider } from '@/lib/oauth/linkedin-provider';
import {
  classifyTransientError,
  type PublishInput,
  type PublishOutcome,
  type SocialProvider,
} from './types';

const poster = new LinkedInPoster();
const oauth = new LinkedInProvider();

export const linkedinProvider: SocialProvider = {
  identifier: 'linkedin',
  displayName: 'LinkedIn',
  scopes: ['openid', 'profile', 'w_member_social'],
  maxLength: 3000,
  requiresMedia: false,
  classifyError: classifyTransientError,

  async publish(input: PublishInput): Promise<PublishOutcome> {
    const { text, mediaUrl, link } = input.content;

    // Always resolved, as before, even for a text-only post.
    const authorUrn = await oauth.getMemberUrn(input.accessToken);

    const result = mediaUrl
      ? await poster.postImage(input.accessToken, authorUrn, { text, imageUrl: mediaUrl })
      : link
        ? await poster.postArticle(input.accessToken, authorUrn, { text, articleUrl: link })
        : await poster.postText(input.accessToken, authorUrn, { text });

    return { status: 'published', platformPostId: result.id, url: result.postUrl };
  },
};
