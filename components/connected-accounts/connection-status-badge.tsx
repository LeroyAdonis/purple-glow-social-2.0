'use client';

import React from 'react';

interface ConnectionStatusBadgeProps {
  isActive: boolean;
  tokenExpiresAt?: Date | null;
}

export default function ConnectionStatusBadge({ isActive, tokenExpiresAt }: ConnectionStatusBadgeProps) {
  // Check if token is expired or expiring soon (within 7 days)
  const isExpired = tokenExpiresAt && new Date(tokenExpiresAt) < new Date();
  const isExpiringSoon = tokenExpiresAt && !isExpired && 
    new Date(tokenExpiresAt).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

  if (!isActive || isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <span className="text-xs font-mono font-bold text-red-400">
          {isExpired ? 'EXPIRED' : 'DISCONNECTED'}
        </span>
      </div>
    );
  }

  if (isExpiringSoon) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
        <span className="text-xs font-mono font-bold text-yellow-400">EXPIRING SOON</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      <span className="text-xs font-mono font-bold text-emerald-400">CONNECTED</span>
    </div>
  );
}
