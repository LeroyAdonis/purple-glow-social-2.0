/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    domains: [
      'ui-avatars.com',
      'picsum.photos',
      'graph.facebook.com',
      'pbs.twimg.com',
      'media.licdn.com',
      'vercel.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
    ],
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-only packages on client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Enable experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
