'use client';

/**
 * Credit Warning Banner Component
 * 
 * Shows a warning when user's credits are below 20% of their tier allocation
 * South African context with local styling
 */

import React from 'react';
import { TIER_LIMITS } from '@/lib/tiers/config';
import type { TierName } from '@/lib/tiers/types';

interface CreditWarningBannerProps {
  credits: number;
  tier: TierName;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

export default function CreditWarningBanner({
  credits,
  tier,
  onUpgrade,
  onDismiss,
}: CreditWarningBannerProps) {
  const limits = TIER_LIMITS[tier];
  const monthlyCredits = limits.monthlyCredits;
  const percentage = (credits / monthlyCredits) * 100;
  
  // Only show if credits are below 20%
  if (percentage >= 20 || credits > monthlyCredits * 0.2) {
    return null;
  }

  const isZero = credits <= 0;
  const bgClass = isZero 
    ? 'from-red-500/20 to-red-600/10 border-red-500/30' 
    : 'from-mzansi-gold/20 to-amber-500/10 border-mzansi-gold/30';
  const iconColor = isZero ? 'text-red-400' : 'text-mzansi-gold';
  const progressColor = isZero ? 'bg-red-500' : 'bg-mzansi-gold';

  return (
    <div 
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-r ${bgClass} p-4 mb-6`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        {/* Warning Icon */}
        <div className={`flex-shrink-0 ${iconColor}`}>
          <i className={`fa-solid ${isZero ? 'fa-circle-exclamation' : 'fa-triangle-exclamation'} text-xl`}></i>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white mb-1">
            {isZero ? 'No Credits Remaining!' : 'Low Credits Warning'}
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            {isZero 
              ? 'Eish! You\'ve run out of credits. Your scheduled posts will be skipped until you top up or upgrade.'
              : `Haibo! You only have ${credits} credits left (${percentage.toFixed(0)}% of your monthly allocation). Consider topping up soon.`
            }
          </p>
          
          {/* Credit Progress Bar */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${progressColor} transition-all duration-500`}
                style={{ width: `${Math.max(percentage, 2)}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono text-gray-400">
              {credits}/{monthlyCredits}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {tier !== 'business' && (
              <button
                onClick={onUpgrade}
                className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:scale-105 transition-transform cursor-pointer"
              >
                Upgrade Plan
              </button>
            )}
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
            >
              Buy Credits
            </button>
          </div>
        </div>
        
        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
            aria-label="Dismiss warning"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>
      
      {/* Decorative Element */}
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <i className={`fa-solid fa-coins text-8xl ${iconColor}`}></i>
      </div>
    </div>
  );
}
