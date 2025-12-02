'use client';

/**
 * Limit Status Badge Component
 * 
 * A compact badge showing limit status with progress indicator
 * Used throughout the UI to show tier limits at relevant points.
 */

import React from 'react';

interface LimitStatusBadgeProps {
  current: number;
  limit: number;
  label: string;
  icon?: string;
  showProgress?: boolean;
  onUpgrade?: () => void;
  className?: string;
}

export default function LimitStatusBadge({
  current,
  limit,
  label,
  icon,
  showProgress = true,
  onUpgrade,
  className = '',
}: LimitStatusBadgeProps) {
  const percentage = limit > 0 ? Math.round((current / limit) * 100) : 0;
  const isAtLimit = current >= limit;
  const isNearLimit = percentage >= 80;
  const remaining = Math.max(0, limit - current);

  // Color based on usage
  const getStatusColor = () => {
    if (isAtLimit) return 'border-red-500/50 bg-red-500/10 text-red-400';
    if (isNearLimit) return 'border-mzansi-gold/50 bg-mzansi-gold/10 text-mzansi-gold';
    return 'border-glass-border bg-white/5 text-gray-400';
  };

  const getProgressColor = () => {
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-mzansi-gold';
    return 'bg-gradient-to-r from-neon-grape to-joburg-teal';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor()} ${className}`}>
      {icon && <i className={`${icon} text-sm`}></i>}
      
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium whitespace-nowrap">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold">
            {current}/{limit}
          </span>
          {showProgress && (
            <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {isAtLimit && onUpgrade && (
        <button
          onClick={onUpgrade}
          className="ml-2 px-2 py-1 text-xs bg-mzansi-gold/20 border border-mzansi-gold/30 rounded hover:bg-mzansi-gold/30 transition-colors cursor-pointer whitespace-nowrap"
        >
          Upgrade
        </button>
      )}
    </div>
  );
}
