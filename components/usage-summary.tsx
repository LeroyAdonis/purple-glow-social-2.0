'use client';

/**
 * Usage Summary Component
 * 
 * Displays a comprehensive overview of all tier limits and current usage
 * with progress bars, upgrade prompts, and loading states.
 * South African context with local styling.
 */

import React, { useState, useEffect } from 'react';
import type { TierName } from '@/lib/tiers/types';

interface LimitStatus {
  current: number;
  limit: number;
  remaining: number;
  percentage: number;
  isAtLimit: boolean;
}

interface UsageLimits {
  tier: TierName;
  credits: {
    total: number;
    reserved: number;
    available: number;
    percentage: number;
    isLow: boolean;
  };
  connectedAccounts: {
    total: LimitStatus;
    byPlatform: Record<string, LimitStatus>;
  };
  scheduling: {
    queueSize: LimitStatus;
    advanceSchedulingDays: number;
  };
  dailyGenerations: LimitStatus;
  dailyPosts: {
    total: LimitStatus;
    byPlatform: Record<string, LimitStatus>;
  };
  automation: {
    enabled: boolean;
    rules: LimitStatus;
  };
}

interface UsageSummaryProps {
  compact?: boolean;
  onUpgrade?: () => void;
}

export default function UsageSummary({ compact = false, onUpgrade }: UsageSummaryProps) {
  const [limits, setLimits] = useState<UsageLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLimits() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/limits/check');
        if (!response.ok) {
          throw new Error('Failed to fetch usage limits');
        }
        const data = await response.json();
        setLimits(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load usage data');
      } finally {
        setLoading(false);
      }
    }
    fetchLimits();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="aerogel-card rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
          <div className="h-6 w-32 bg-white/10 rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-white/10 rounded"></div>
              <div className="h-2 w-full bg-white/10 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="aerogel-card rounded-xl p-6 border border-red-500/30 bg-red-500/5">
        <div className="flex items-center gap-3 text-red-400">
          <i className="fa-solid fa-circle-exclamation text-xl"></i>
          <div>
            <h4 className="font-bold">Error Loading Usage</h4>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30 transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-rotate-right mr-2"></i>
          Retry
        </button>
      </div>
    );
  }

  if (!limits) return null;

  // Helper function to get progress bar color
  const getProgressColor = (percentage: number, isAtLimit: boolean) => {
    if (isAtLimit) return 'bg-red-500';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-mzansi-gold';
    return 'bg-gradient-to-r from-neon-grape to-joburg-teal';
  };

  // Helper to render a usage bar
  const UsageBar = ({ 
    label, 
    current, 
    limit, 
    icon, 
    showUpgrade = false 
  }: { 
    label: string; 
    current: number; 
    limit: number; 
    icon: string;
    showUpgrade?: boolean;
  }) => {
    const percentage = limit > 0 ? Math.round((current / limit) * 100) : 0;
    const isAtLimit = current >= limit;
    const remaining = Math.max(0, limit - current);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <i className={`${icon} ${isAtLimit ? 'text-red-400' : 'text-gray-400'}`}></i>
            <span className="font-medium">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-mono ${isAtLimit ? 'text-red-400' : 'text-gray-400'}`}>
              {current}/{limit}
            </span>
            {isAtLimit && showUpgrade && onUpgrade && (
              <button
                onClick={onUpgrade}
                className="text-xs text-mzansi-gold hover:underline cursor-pointer"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor(percentage, isAtLimit)}`}
            style={{ width: `${Math.min(100, Math.max(2, percentage))}%` }}
          ></div>
        </div>
        {!compact && (
          <div className="text-xs text-gray-500">
            {isAtLimit 
              ? <span className="text-red-400">Limit reached</span>
              : `${remaining} remaining`
            }
          </div>
        )}
      </div>
    );
  };

  // Compact view for sidebar
  if (compact) {
    return (
      <div className="aerogel-card rounded-xl p-4 border border-glass-border space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-joburg-teal"></i>
            Usage
          </h4>
          <span className="text-xs text-gray-400 capitalize">{limits.tier} tier</span>
        </div>

        {/* Credits */}
        <UsageBar
          label="Credits"
          current={limits.credits.available}
          limit={limits.credits.total}
          icon="fa-solid fa-coins"
          showUpgrade
        />

        {/* Daily Generations */}
        <UsageBar
          label="AI Generations"
          current={limits.dailyGenerations.current}
          limit={limits.dailyGenerations.limit}
          icon="fa-solid fa-wand-magic-sparkles"
        />

        {/* Queue */}
        <UsageBar
          label="Queue"
          current={limits.scheduling.queueSize.current}
          limit={limits.scheduling.queueSize.limit}
          icon="fa-regular fa-calendar"
          showUpgrade
        />
      </div>
    );
  }

  // Full view
  return (
    <div className="aerogel-card rounded-2xl p-6 border border-glass-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center">
            <i className="fa-solid fa-chart-pie text-2xl text-white"></i>
          </div>
          <div>
            <h3 className="font-display font-bold text-xl">Usage Summary</h3>
            <p className="text-sm text-gray-400 capitalize">{limits.tier} Tier</p>
          </div>
        </div>
        {limits.tier !== 'business' && onUpgrade && (
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-gradient-to-r from-mzansi-gold to-neon-grape rounded-lg text-sm font-bold hover:shadow-lg transition-all cursor-pointer"
          >
            <i className="fa-solid fa-crown mr-2"></i>
            Upgrade
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credits Section */}
        <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-glass-border">
          <h4 className="font-bold flex items-center gap-2">
            <i className="fa-solid fa-coins text-mzansi-gold"></i>
            Credits
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-display font-bold text-white">
                {limits.credits.available}
              </div>
              <div className="text-xs text-gray-400">Available</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-gray-500">
                {limits.credits.reserved}
              </div>
              <div className="text-xs text-gray-400">Reserved</div>
            </div>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full flex">
              <div
                className="bg-gradient-to-r from-neon-grape to-joburg-teal"
                style={{ width: `${(limits.credits.available / limits.credits.total) * 100}%` }}
              ></div>
              <div
                className="bg-mzansi-gold/50"
                style={{ width: `${(limits.credits.reserved / limits.credits.total) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total: {limits.credits.total}</span>
            {limits.credits.isLow && (
              <span className="text-mzansi-gold">
                <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                Low credits
              </span>
            )}
          </div>
        </div>

        {/* Daily Usage Section */}
        <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-glass-border">
          <h4 className="font-bold flex items-center gap-2">
            <i className="fa-solid fa-clock text-joburg-teal"></i>
            Daily Limits
            <span className="text-xs text-gray-500 font-normal">(resets at midnight SAST)</span>
          </h4>
          <UsageBar
            label="AI Generations"
            current={limits.dailyGenerations.current}
            limit={limits.dailyGenerations.limit}
            icon="fa-solid fa-wand-magic-sparkles"
          />
          <UsageBar
            label="Posts Today"
            current={limits.dailyPosts.total.current}
            limit={limits.dailyPosts.total.limit}
            icon="fa-solid fa-paper-plane"
          />
        </div>

        {/* Scheduling Section */}
        <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-glass-border">
          <h4 className="font-bold flex items-center gap-2">
            <i className="fa-regular fa-calendar text-neon-grape"></i>
            Scheduling
          </h4>
          <UsageBar
            label="Queue Size"
            current={limits.scheduling.queueSize.current}
            limit={limits.scheduling.queueSize.limit}
            icon="fa-solid fa-list-check"
            showUpgrade
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Advance Scheduling</span>
            <span className="font-mono text-white">
              Up to {limits.scheduling.advanceSchedulingDays} days
            </span>
          </div>
        </div>

        {/* Connected Accounts Section */}
        <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-glass-border">
          <h4 className="font-bold flex items-center gap-2">
            <i className="fa-solid fa-link text-joburg-teal"></i>
            Connected Accounts
          </h4>
          <UsageBar
            label="Total Accounts"
            current={limits.connectedAccounts.total.current}
            limit={limits.connectedAccounts.total.limit}
            icon="fa-solid fa-users"
            showUpgrade
          />
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(limits.connectedAccounts.byPlatform).map(([platform, status]) => (
              <div key={platform} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                <span className="capitalize">{platform}</span>
                <span className={`font-mono ${status.isAtLimit ? 'text-red-400' : 'text-gray-400'}`}>
                  {status.current}/{status.limit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Automation Section */}
        <div className="md:col-span-2 space-y-4 p-4 bg-white/5 rounded-xl border border-glass-border">
          <h4 className="font-bold flex items-center gap-2">
            <i className="fa-solid fa-robot text-neon-grape"></i>
            Automation
            {!limits.automation.enabled && (
              <span className="px-2 py-0.5 text-xs bg-mzansi-gold/20 border border-mzansi-gold/30 rounded-full text-mzansi-gold">
                PRO+
              </span>
            )}
          </h4>
          {limits.automation.enabled ? (
            <UsageBar
              label="Automation Rules"
              current={limits.automation.rules.current}
              limit={limits.automation.rules.limit}
              icon="fa-solid fa-bolt"
              showUpgrade
            />
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                <i className="fa-solid fa-lock mr-2"></i>
                Upgrade to Pro to unlock automation
              </span>
              {onUpgrade && (
                <button
                  onClick={onUpgrade}
                  className="px-3 py-1 text-xs bg-mzansi-gold/20 border border-mzansi-gold/30 rounded-lg hover:bg-mzansi-gold/30 transition-colors cursor-pointer"
                >
                  Unlock Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
