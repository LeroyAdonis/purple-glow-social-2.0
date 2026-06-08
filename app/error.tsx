'use client';

/**
 * Error Boundary Component
 * 
 * Client Component - Catches and handles runtime errors in the app.
 */

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to structured logger
    logger.security.exception(error, {
      digest: error.digest,
      component: 'ErrorBoundary',
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-void text-white font-body flex items-center justify-center relative overflow-hidden selection:bg-neon-grape selection:text-white">
      
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-hyper-crimson opacity-[0.08] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-neon-grape opacity-[0.08] blur-[150px] rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        
        {/* Error Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-hyper-crimson/10 border-2 border-hyper-crimson/30">
            <svg 
              className="w-12 h-12 text-hyper-crimson" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Something Went Wrong
        </h2>
        
        <p className="text-lg text-gray-400 mb-2">
          We encountered an unexpected error while processing your request.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-obsidian-800/50 border border-hyper-crimson/20 rounded-lg text-left">
            <p className="text-sm font-mono text-hyper-crimson break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Production Error ID */}
        {process.env.NODE_ENV === 'production' && error.digest && (
          <p className="text-sm text-gray-500 mt-4">
            Error ID: <code className="text-gray-400">{error.digest}</code>
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          
          {/* Try Again Button */}
          <button
            onClick={reset}
            className="px-8 py-3 bg-gradient-to-r from-neon-grape to-hyper-crimson rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>

          {/* Go Home Button */}
          <a
            href="/"
            className="px-8 py-3 bg-obsidian-800 border border-neon-grape/30 rounded-lg font-semibold hover:border-neon-grape hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300"
          >
            Go Home
          </a>
          
        </div>

        {/* Support Message */}
        <p className="mt-12 text-sm text-gray-500">
          If this problem persists, please contact our support team with the error ID above.
        </p>
        
      </div>
    </div>
  );
}
