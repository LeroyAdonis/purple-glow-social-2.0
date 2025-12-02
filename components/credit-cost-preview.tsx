'use client';

/**
 * Credit Cost Preview Component
 * 
 * Shows the credit cost before publishing/scheduling actions
 * with clear available vs required credit display.
 */

import React from 'react';

interface CreditCostPreviewProps {
  platforms: string[];
  availableCredits: number;
  reservedCredits?: number;
  action: 'publish' | 'schedule';
  className?: string;
}

export default function CreditCostPreview({
  platforms,
  availableCredits,
  reservedCredits = 0,
  action,
  className = '',
}: CreditCostPreviewProps) {
  const creditCost = platforms.length;
  const hasEnoughCredits = availableCredits >= creditCost;
  const effectiveAvailable = availableCredits - reservedCredits;

  if (platforms.length === 0) return null;

  return (
    <div
      className={`rounded-xl p-4 ${
        hasEnoughCredits
          ? 'bg-neon-grape/10 border border-neon-grape/30'
          : 'bg-red-500/10 border border-red-500/30'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${hasEnoughCredits ? 'text-neon-grape' : 'text-red-400'}`}>
          <i className="fa-solid fa-coins text-xl"></i>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Credit Cost */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">
              Credit Cost
            </span>
            <span className={`text-lg font-bold font-mono ${
              hasEnoughCredits ? 'text-white' : 'text-red-400'
            }`}>
              {creditCost} credit{creditCost !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Platform Breakdown */}
          <div className="flex flex-wrap gap-1 mb-3">
            {platforms.map((platform) => (
              <span
                key={platform}
                className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-gray-300 capitalize"
              >
                <i className={`fa-brands fa-${platform} mr-1`}></i>
                {platform}
              </span>
            ))}
          </div>

          {/* Available Credits */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Available Credits</span>
            <span className={`font-mono ${hasEnoughCredits ? 'text-gray-400' : 'text-red-400'}`}>
              {availableCredits}
              {reservedCredits > 0 && (
                <span className="text-gray-500 ml-1">
                  ({reservedCredits} reserved)
                </span>
              )}
            </span>
          </div>

          {/* After action */}
          {hasEnoughCredits && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-500">After {action}</span>
              <span className="font-mono text-gray-500">
                {availableCredits - creditCost} remaining
              </span>
            </div>
          )}

          {/* Insufficient credits warning */}
          {!hasEnoughCredits && (
            <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 text-sm text-red-400">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>
                  Need {creditCost - availableCredits} more credit{creditCost - availableCredits !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
