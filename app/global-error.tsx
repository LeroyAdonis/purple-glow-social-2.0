'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import ErrorFallback from '@/components/errors/ErrorFallback';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error, {
      tags: {
        errorType: 'global',
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <html>
      <body className="bg-void text-white min-h-screen flex items-center justify-center">
        <ErrorFallback
          error={error}
          resetError={reset}
          title="Yoh! Something went very wrong"
          description="The application encountered a critical error. We've been notified and are working on it."
          icon="fa-solid fa-bomb"
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </body>
    </html>
  );
}
