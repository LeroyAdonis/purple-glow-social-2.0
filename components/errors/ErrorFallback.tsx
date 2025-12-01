'use client';

import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
  icon?: string;
  variant?: 'default' | 'minimal' | 'card';
}

export default function ErrorFallback({
  error,
  resetError,
  title = 'Eish! Something went wrong',
  description = 'We encountered an unexpected error. Our team has been notified.',
  showDetails = false,
  icon = 'fa-solid fa-triangle-exclamation',
  variant = 'default',
}: ErrorFallbackProps) {
  const handleReportIssue = () => {
    // Open email with error details
    const subject = encodeURIComponent(`Bug Report: ${error.message}`);
    const body = encodeURIComponent(`
Error: ${error.message}
Stack: ${error.stack}
URL: ${typeof window !== 'undefined' ? window.location.href : 'Unknown'}
Time: ${new Date().toISOString()}
    `);
    window.open(`mailto:support@purpleglow.co.za?subject=${subject}&body=${body}`);
  };

  if (variant === 'minimal') {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400 mb-2">
          <i className={`${icon} mr-2`}></i>
          {title}
        </p>
        <button
          onClick={resetError}
          className="text-sm text-neon-grape hover:text-white transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="aerogel-card p-6 rounded-xl text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          <i className={`${icon} text-red-400 text-xl`}></i>
        </div>
        <h3 className="font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-neon-grape rounded-lg text-white text-sm hover:bg-opacity-90 transition-colors"
        >
          <i className="fa-solid fa-rotate-right mr-2"></i>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
          <i className={`${icon} text-red-400 text-4xl`}></i>
        </div>

        {/* Title */}
        <h2 className="font-display font-bold text-2xl text-white mb-3">
          {title}
        </h2>

        {/* Description */}
        <p className="text-gray-400 mb-6">
          {description}
        </p>

        {/* Error Details (optional) */}
        {showDetails && error.message && (
          <div className="mb-6 p-4 bg-white/5 border border-glass-border rounded-lg text-left">
            <p className="text-xs font-mono text-gray-400 mb-1">ERROR DETAILS</p>
            <p className="text-sm text-red-400 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetError}
            className="px-6 py-3 bg-gradient-to-r from-neon-grape to-joburg-teal text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <i className="fa-solid fa-rotate-right mr-2"></i>
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 border border-glass-border text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-colors"
          >
            <i className="fa-solid fa-home mr-2"></i>
            Go to Dashboard
          </button>
        </div>

        {/* Report Link */}
        <button
          onClick={handleReportIssue}
          className="mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <i className="fa-solid fa-bug mr-1"></i>
          Report this issue
        </button>
      </div>
    </div>
  );
}
