/**
 * Robots.txt Configuration
 * 
 * Controls search engine crawler access following Next.js 16 Metadata API.
 * Allows indexing of public routes while protecting private areas.
 */

import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://purple-glow-social.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/signup', '/privacy', '/terms'],
        disallow: ['/api/', '/dashboard/', '/admin/', '/oauth/', '/diagnostics/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
