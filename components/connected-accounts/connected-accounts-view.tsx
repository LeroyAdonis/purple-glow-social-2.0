'use client';

import React, { useState, useEffect } from 'react';
import ConnectedAccountCard from './connected-account-card';

interface Connection {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter';
  platformUsername: string;
  platformDisplayName: string;
  profileImageUrl: string | null;
  isActive: boolean;
  lastSyncedAt: Date | null;
  tokenExpiresAt: Date | null;
  createdAt: Date;
}

interface ConnectedAccountsViewProps {
  userId: string;
}

export default function ConnectedAccountsView({ userId }: ConnectedAccountsViewProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch connections
  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/oauth/connections');
      
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      
      const data = await response.json();
      setConnections(data.connections || []);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('Failed to load connected accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [userId]);

  // Handle connect - redirect to OAuth flow
  const handleConnect = (platform: 'instagram' | 'facebook' | 'twitter') => {
    // Redirect to the OAuth connect endpoint
    window.location.href = `/api/oauth/${platform}/connect`;
  };

  // Handle disconnect
  const handleDisconnect = async (platform: 'instagram' | 'facebook' | 'twitter') => {
    try {
      const response = await fetch(`/api/oauth/${platform}/disconnect`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      // Refresh connections after disconnect
      await fetchConnections();
    } catch (err) {
      console.error('Error disconnecting:', err);
      alert('Failed to disconnect account. Please try again.');
    }
  };

  // Check if a platform is connected
  const isConnected = (platform: 'instagram' | 'facebook' | 'twitter') => {
    return connections.some(conn => conn.platform === platform && conn.isActive);
  };

  // Get connection data for a platform
  const getConnection = (platform: 'instagram' | 'facebook' | 'twitter') => {
    return connections.find(conn => conn.platform === platform);
  };

  const platforms: Array<'instagram' | 'facebook' | 'twitter'> = [
    'instagram',
    'facebook', 
    'twitter'
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
            onClick={fetchConnections}
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

  return (
    <div className="space-y-6 animate-enter">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="font-display font-bold text-4xl mb-2">Connected Accounts</h2>
          <p className="text-gray-400">Connect your social media accounts to publish content</p>
        </div>
        <div className="aerogel-card px-4 py-2 rounded-xl border border-glass-border">
          <p className="text-xs text-gray-400 font-mono mb-1">CONNECTED</p>
          <p className="font-display font-bold text-2xl text-neon-grape">{connectedCount}/3</p>
        </div>
      </header>

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
          return (
            <ConnectedAccountCard
              key={platform}
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
            <i className="fa-solid fa-shield-halved text-joburg-teal mt-1"></i>
            <span><strong>Security:</strong> All tokens are encrypted with AES-256-GCM before storage.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
