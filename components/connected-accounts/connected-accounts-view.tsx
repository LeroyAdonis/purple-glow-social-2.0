'use client';

import React, { useState, useEffect } from 'react';
import ConnectedAccountCard from './connected-account-card';

interface Connection {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  platformUsername: string;
  platformDisplayName: string;
  profileImageUrl: string | null;
  isActive: boolean;
  lastSyncedAt: Date | null;
  tokenExpiresAt: Date | null;
  createdAt: Date;
}

interface LimitStatus {
  current: number;
  limit: number;
  remaining: number;
  isAtLimit: boolean;
}

interface TierLimits {
  tier: string;
  connectedAccounts: {
    total: LimitStatus;
    byPlatform: Record<string, LimitStatus>;
  };
}

interface ConnectedAccountsViewProps {
  userId: string;
}

export default function ConnectedAccountsView({ userId }: ConnectedAccountsViewProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [tierLimits, setTierLimits] = useState<TierLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  // Check URL for tier limit errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === 'tier_limit') {
        const message = params.get('message');
        const platform = params.get('platform');
        setLimitMessage(message || `Connection limit reached for ${platform}`);
        setShowUpgradeModal(true);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // Fetch connections and limits
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch connections and limits in parallel
      const [connectionsRes, limitsRes] = await Promise.all([
        fetch('/api/oauth/connections'),
        fetch('/api/limits/check'),
      ]);
      
      if (!connectionsRes.ok) {
        throw new Error('Failed to fetch connections');
      }
      
      const connectionsData = await connectionsRes.json();
      setConnections(connectionsData.connections || []);

      if (limitsRes.ok) {
        const limitsData = await limitsRes.json();
        setTierLimits(limitsData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load connected accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Handle connect - check limits first
  const handleConnect = (platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin') => {
    // Check if at limit before redirecting
    if (tierLimits) {
      const platformLimit = tierLimits.connectedAccounts.byPlatform[platform];
      if (platformLimit?.isAtLimit) {
        setLimitMessage(`You've reached the maximum of ${platformLimit.limit} ${platform} account(s) for your ${tierLimits.tier} tier`);
        setShowUpgradeModal(true);
        return;
      }
      const totalLimit = tierLimits.connectedAccounts.total;
      if (totalLimit?.isAtLimit) {
        setLimitMessage(`You've reached the maximum of ${totalLimit.limit} total connected accounts for your ${tierLimits.tier} tier`);
        setShowUpgradeModal(true);
        return;
      }
    }
    // Redirect to the OAuth connect endpoint
    window.location.href = `/api/oauth/${platform}/connect`;
  };

  // Handle disconnect
  const handleDisconnect = async (platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin') => {
    try {
      const response = await fetch(`/api/oauth/${platform}/disconnect`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      // Refresh data after disconnect
      await fetchData();
    } catch (err) {
      console.error('Error disconnecting:', err);
      alert('Failed to disconnect account. Please try again.');
    }
  };

  // Check if a platform is connected
  const isConnected = (platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin') => {
    return connections.some(conn => conn.platform === platform && conn.isActive);
  };

  // Get connection data for a platform
  const getConnection = (platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin') => {
    return connections.find(conn => conn.platform === platform);
  };

  // Check if can connect more for a platform
  const canConnectMore = (platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin') => {
    if (!tierLimits) return true;
    const platformLimit = tierLimits.connectedAccounts.byPlatform[platform];
    const totalLimit = tierLimits.connectedAccounts.total;
    return !platformLimit?.isAtLimit && !totalLimit?.isAtLimit;
  };

  const platforms: Array<'instagram' | 'facebook' | 'twitter' | 'linkedin'> = [
    'instagram',
    'facebook', 
    'twitter',
    'linkedin'
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-enter">
        <header>
          <h2 className="font-display font-bold text-4xl mb-2">Connected Accounts</h2>
          <p className="text-gray-400">Connect your social media accounts to publish content</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aerogel-card p-6 rounded-2xl animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/5 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-48"></div>
                </div>
              </div>
              <div className="h-20 bg-white/5 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-enter">
        <header>
          <h2 className="font-display font-bold text-4xl mb-2">Connected Accounts</h2>
          <p className="text-gray-400">Connect your social media accounts to publish content</p>
        </header>

        <div className="aerogel-card p-8 rounded-2xl border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 mb-4">
            <i className="fa-solid fa-exclamation-triangle text-red-400 text-2xl"></i>
            <h3 className="font-bold text-lg text-red-400">Error Loading Connections</h3>
          </div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-neon-grape rounded-xl hover:bg-opacity-90 transition-colors font-bold"
          >
            <i className="fa-solid fa-rotate mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const connectedCount = connections.filter(c => c.isActive).length;
  const totalLimit = tierLimits?.connectedAccounts.total.limit || 4;

  return (
    <div className="space-y-6 animate-enter">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="font-display font-bold text-4xl mb-2">Connected Accounts</h2>
          <p className="text-gray-400">Connect your social media accounts to publish content</p>
        </div>
        <div className="aerogel-card px-4 py-2 rounded-xl border border-glass-border">
          <p className="text-xs text-gray-400 font-mono mb-1">CONNECTED</p>
          <p className="font-display font-bold text-2xl text-neon-grape">
            {connectedCount}/{totalLimit}
          </p>
          {tierLimits && (
            <p className="text-xs text-gray-500 capitalize">{tierLimits.tier} tier</p>
          )}
        </div>
      </header>

      {/* Tier Limit Warning */}
      {tierLimits?.connectedAccounts.total.isAtLimit && (
        <div className="aerogel-card p-6 rounded-2xl border border-mzansi-gold/30 bg-mzansi-gold/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-mzansi-gold/20 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-crown text-mzansi-gold"></i>
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1 text-mzansi-gold">Account Limit Reached</h3>
              <p className="text-sm text-gray-400 mb-3">
                You've connected the maximum number of accounts for your {tierLimits.tier} tier. 
                Upgrade to connect more accounts and unlock additional features.
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-mzansi-gold to-neon-grape rounded-lg font-bold text-sm hover:shadow-lg transition-all"
              >
                <i className="fa-solid fa-arrow-up-right mr-2"></i>
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="aerogel-card p-6 rounded-2xl border border-joburg-teal/20 bg-joburg-teal/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-joburg-teal/20 flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-info text-joburg-teal"></i>
          </div>
          <div>
            <h3 className="font-bold mb-1">🇿🇦 Why Connect Accounts?</h3>
            <p className="text-sm text-gray-400">
              Connecting your social media accounts allows Purple Glow Social to automatically post your AI-generated content. 
              Your credentials are encrypted and stored securely. You can disconnect at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.map(platform => {
          const connection = getConnection(platform);
          const canConnect = canConnectMore(platform);
          const platformLimit = tierLimits?.connectedAccounts.byPlatform[platform];
          
          return (
            <div key={platform} className="relative">
              <ConnectedAccountCard
                platform={platform}
                isConnected={isConnected(platform)}
                platformUsername={connection?.platformUsername}
                platformDisplayName={connection?.platformDisplayName}
                profileImageUrl={connection?.profileImageUrl || undefined}
                tokenExpiresAt={connection?.tokenExpiresAt}
                lastSyncedAt={connection?.lastSyncedAt}
                onConnect={() => handleConnect(platform)}
                onDisconnect={() => handleDisconnect(platform)}
              />
              {/* Show limit indicator */}
              {platformLimit && (
                <div className="absolute top-3 right-3 text-xs text-gray-500">
                  {platformLimit.current}/{platformLimit.limit}
                </div>
              )}
              {/* Overlay if at limit and not connected */}
              {!isConnected(platform) && !canConnect && (
                <div className="absolute inset-0 bg-void/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center p-4">
                    <i className="fa-solid fa-lock text-2xl text-mzansi-gold mb-2"></i>
                    <p className="text-sm font-bold">Limit Reached</p>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="mt-2 px-3 py-1 text-xs bg-mzansi-gold/20 border border-mzansi-gold/30 rounded-lg hover:bg-mzansi-gold/30 transition-colors"
                    >
                      Upgrade
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="aerogel-card p-6 rounded-2xl border border-glass-border">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <i className="fa-solid fa-circle-question text-mzansi-gold"></i>
          Need Help?
        </h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <i className="fa-solid fa-check text-emerald-400 mt-1"></i>
            <span><strong>Instagram & Facebook:</strong> Uses Meta Business Suite. Long-lived tokens (60 days).</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fa-solid fa-check text-emerald-400 mt-1"></i>
            <span><strong>Twitter / X:</strong> Tokens last 2 hours but refresh automatically.</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fa-solid fa-check text-emerald-400 mt-1"></i>
            <span><strong>LinkedIn:</strong> Professional network posting with 60-day token validity.</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fa-solid fa-shield-halved text-joburg-teal mt-1"></i>
            <span><strong>Security:</strong> All tokens are encrypted with AES-256-GCM before storage.</span>
          </li>
        </ul>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="aerogel-card p-8 rounded-2xl max-w-md w-full border border-mzansi-gold/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-mzansi-gold to-neon-grape flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-crown text-2xl text-white"></i>
              </div>
              <h3 className="font-display font-bold text-2xl mb-2">Upgrade Your Plan</h3>
              <p className="text-gray-400 text-sm">
                {limitMessage || 'Unlock more features with a higher tier'}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <i className="fa-solid fa-check text-emerald-400"></i>
                <span>Connect more social accounts</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <i className="fa-solid fa-check text-emerald-400"></i>
                <span>Higher daily posting limits</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <i className="fa-solid fa-check text-emerald-400"></i>
                <span>More AI generations per day</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <i className="fa-solid fa-check text-emerald-400"></i>
                <span>Automation rules (Pro+)</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-3 border border-glass-border rounded-xl hover:bg-white/5 transition-colors"
              >
                Maybe Later
              </button>
              <a
                href="/dashboard?view=settings"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-mzansi-gold to-neon-grape rounded-xl font-bold text-center hover:shadow-lg transition-all"
              >
                View Plans
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
