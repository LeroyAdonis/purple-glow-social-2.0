'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const platform = searchParams.get('platform');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const platformIcons: Record<string, string> = {
    instagram: '📷',
    facebook: '👥',
    twitter: '🐦',
    linkedin: '💼',
  };

  const platformNames: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pretoria-blue via-void to-neon-grape p-4">
      <div className="w-full max-w-md">
        {/* Success Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-glass-border rounded-xl p-8 shadow-2xl text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Platform Icon */}
          {platform && (
            <div className="text-6xl mb-4">
              {platformIcons[platform] || '🔗'}
            </div>
          )}

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-white mb-2">
            Successfully Connected!
          </h1>
          
          <p className="text-gray-300 mb-6">
            Your {platform ? platformNames[platform] : 'account'} is now connected to Purple Glow Social.
            You can now post content directly to your account.
          </p>

          {/* Features List */}
          <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-400 mb-2">What you can do now:</p>
            <ul className="space-y-2 text-sm text-white">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Auto-post to {platform ? platformNames[platform] : 'your account'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Schedule posts in advance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Use automation rules</span>
              </li>
            </ul>
          </div>

          {/* Countdown */}
          <p className="text-joburg-teal text-sm mb-4">
            Redirecting to dashboard in {countdown} seconds...
          </p>

          {/* Manual Navigation */}
          <div className="space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-neon-grape to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-neon-grape/50 transition-all"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={() => router.push('/dashboard?tab=settings')}
              className="w-full bg-white/5 text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              Manage Connections
            </button>
          </div>

          {/* Tip */}
          <div className="mt-6 p-3 bg-joburg-teal/10 border border-joburg-teal/30 rounded-lg">
            <p className="text-sm text-joburg-teal">
              💡 <strong>Tip:</strong> Connect more platforms in Settings to reach a wider audience!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
