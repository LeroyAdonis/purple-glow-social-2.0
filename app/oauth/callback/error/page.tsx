'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, { title: string; description: string; action: string }> = {
    missing_parameters: {
      title: 'Missing Parameters',
      description: 'The OAuth callback was missing required parameters. Please try connecting again.',
      action: 'Try Again',
    },
    invalid_state: {
      title: 'Invalid State',
      description: 'The OAuth state parameter was invalid or expired. This may be due to a CSRF protection check.',
      action: 'Try Again',
    },
    access_denied: {
      title: 'Access Denied',
      description: 'You denied access to your account. To use auto-posting features, you need to grant permission.',
      action: 'Grant Access',
    },
    no_instagram_business_account: {
      title: 'Instagram Business Account Required',
      description: 'To connect Instagram, you need a Business or Creator account. Please convert your account first.',
      action: 'Learn How',
    },
    token_exchange_failed: {
      title: 'Token Exchange Failed',
      description: 'Failed to exchange the authorization code for an access token. Please try again.',
      action: 'Try Again',
    },
    connection_failed: {
      title: 'Connection Failed',
      description: 'Failed to establish the connection. Please check your account settings and try again.',
      action: 'Try Again',
    },
  };

  const errorInfo = errorMessages[error || ''] || {
    title: 'Connection Error',
    description: error || 'An unknown error occurred while connecting your account.',
    action: 'Try Again',
  };

  return (
 <div className="bg-[var(--posta-clay)] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Error Card */}
 <div className="bg-[var(--posta-cream)] border border-glass-border rounded-xl p-8 shadow-2xl text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-[var(--posta-ink)] mb-2">
            {errorInfo.title}
          </h1>
          
          <p className="text-[var(--posta-ink-soft)] mb-6">
            {errorInfo.description}
          </p>

          {/* Special Instructions for Instagram Business */}
          {error === 'no_instagram_business_account' && (
            <div className="bg-[var(--posta-paper)] rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-[var(--posta-ink)] mb-2">
                How to convert to Business Account:
              </p>
              <ol className="space-y-2 text-sm text-[var(--posta-ink-soft)] list-decimal list-inside">
                <li>Open Instagram app</li>
                <li>Go to Settings → Account</li>
                <li>Tap "Switch to Professional Account"</li>
                <li>Choose "Business" or "Creator"</li>
                <li>Complete the setup</li>
                <li>Return here and try connecting again</li>
              </ol>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {error === 'no_instagram_business_account' ? (
              <>
                <a
                  href="https://help.instagram.com/502981923235522"
                  target="_blank"
                  rel="noopener noreferrer"
 className="bg-[var(--posta-clay)] block w-full text-[var(--posta-ink)] font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-neon-grape/50 transition-all"
                >
                  Learn How to Convert
                </a>
                <button
                  onClick={() => router.push('/dashboard?tab=settings')}
                  className="w-full bg-[var(--posta-paper)] text-[var(--posta-ink)] font-semibold py-3 px-4 rounded-lg hover:bg-[var(--posta-cream)] transition-colors"
                >
                  Back to Settings
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/dashboard?tab=settings')}
 className="bg-[var(--posta-clay)] w-full text-[var(--posta-ink)] font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-neon-grape/50 transition-all"
                >
                  {errorInfo.action}
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-[var(--posta-paper)] text-[var(--posta-ink)] font-semibold py-3 px-4 rounded-lg hover:bg-[var(--posta-cream)] transition-colors"
                >
                  Back to Dashboard
                </button>
              </>
            )}
          </div>

          {/* Support Link */}
          <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-300">
              💬 Need help? Contact support at{' '}
              <a href="mailto:leroy@digitalwavetech.dev" className="underline">
                leroy@digitalwavetech.dev
              </a>
            </p>
          </div>

          {/* Error Code */}
          {error && (
            <p className="text-xs text-[var(--posta-ink-soft)] mt-4">
              Error code: {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OAuthErrorPage() {
  return (
    <Suspense fallback={
 <div className="bg-[var(--posta-clay)] min-h-screen flex items-center justify-center ">
        <div className="text-[var(--posta-ink)]">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
