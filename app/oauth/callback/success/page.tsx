'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const platform = searchParams.get('platform');
  const [countdown, setCountdown] = useState(3);

  const navigateToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Separate effect for navigation to avoid setState during render
  useEffect(() => {
    if (countdown === 0) {
      navigateToDashboard();
    }
  }, [countdown, navigateToDashboard]);

  const platformIcons: Record<string, string> = {
    instagram: '📷',
    facebook: '👥',
    twitter: '🐦',
  };

  const platformNames: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    twitter: 'Twitter/X',
  };

  return (
 <div className="bg-[var(--posta-clay)] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success Card */}
 <div className="bg-[var(--posta-cream)] border border-glass-border rounded-xl p-8 shadow-2xl text-center">
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
          <h1 className="text-3xl font-bold text-[var(--posta-ink)] mb-2">
            Successfully Connected!
          </h1>
          
          <p className="text-[var(--posta-ink-soft)] mb-6">
            Your {platform ? platformNames[platform] : 'account'} is now connected to Posta.
            You can now post content directly to your account.
          </p>

          {/* Features List */}
          <div className="bg-[var(--posta-paper)] rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-[var(--posta-ink-soft)] mb-2">What you can do now:</p>
            <ul className="space-y-2 text-sm text-[var(--posta-ink)]">
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
 className="bg-[var(--posta-clay)] w-full text-[var(--posta-ink)] font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-neon-grape/50 transition-all"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={() => router.push('/dashboard?tab=settings')}
              className="w-full bg-[var(--posta-paper)] text-[var(--posta-ink)] font-semibold py-3 px-4 rounded-lg hover:bg-[var(--posta-cream)] transition-colors"
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

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={
 <div className="bg-[var(--posta-clay)] min-h-screen flex items-center justify-center ">
        <div className="text-[var(--posta-ink)]">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
