'use client';

/**
 * Credit Expiry Warning Component
 * 
 * Shows when credits are about to expire (within 3 days of billing cycle)
 * South African styling and messaging
 */

import React from 'react';

interface CreditExpiryWarningProps {
  credits: number;
  daysRemaining: number;
  renewalDate: Date | string;
  onDismiss?: () => void;
}

export default function CreditExpiryWarning({
  credits,
  daysRemaining,
  renewalDate,
  onDismiss,
}: CreditExpiryWarningProps) {
  // Only show if credits will expire within 3 days and user has credits
  if (daysRemaining > 3 || credits <= 0) {
    return null;
  }

  const formattedDate = new Date(renewalDate).toLocaleDateString('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Johannesburg',
  });

  const isUrgent = daysRemaining <= 1;
  const bgClass = isUrgent
    ? 'from-red-500/15 to-orange-500/10 border-red-500/20'
    : 'from-amber-500/15 to-orange-500/10 border-amber-500/20';

  return (
    <div 
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-r ${bgClass} p-4 mb-6`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        {/* Clock Icon */}
        <div className={`flex-shrink-0 ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>
          <i className="fa-solid fa-clock text-xl"></i>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white mb-1">
            Credits Expiring {daysRemaining === 0 ? 'Today!' : daysRemaining === 1 ? 'Tomorrow!' : `in ${daysRemaining} Days`}
          </h3>
          <p className="text-sm text-gray-300">
            {isUrgent
              ? `Ayeye! You have ${credits} credits that will reset on ${formattedDate}. Use them now or lose them!`
              : `Heads up! Your ${credits} credits will reset to your monthly allocation on ${formattedDate}. Unused credits don't roll over.`
            }
          </p>
          
          {/* Tips */}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <i className="fa-solid fa-lightbulb text-mzansi-gold"></i>
            <span>Tip: Schedule some posts to use your remaining credits!</span>
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
      
      {/* Countdown Badge */}
      <div className="absolute top-4 right-4">
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isUrgent ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
          {daysRemaining === 0 ? 'TODAY' : daysRemaining === 1 ? '1 DAY' : `${daysRemaining} DAYS`}
        </div>
      </div>
    </div>
  );
}
