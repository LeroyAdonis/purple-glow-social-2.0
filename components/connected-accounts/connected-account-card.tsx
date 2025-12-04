'use client';

import React, { useState } from 'react';
import ConnectionStatusBadge from './connection-status-badge';

interface ConnectedAccountCardProps {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  isConnected: boolean;
  platformUsername?: string;
  platformDisplayName?: string;
  profileImageUrl?: string;
  tokenExpiresAt?: Date | null;
  lastSyncedAt?: Date | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const platformConfig = {
  instagram: {
    name: 'Instagram',
    icon: 'fa-brands fa-instagram',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
    borderColor: 'border-purple-500/20',
    description: 'Share your content with Instagram followers',
  },
  facebook: {
    name: 'Facebook',
    icon: 'fa-brands fa-facebook',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Post to your Facebook page and profile',
  },
  twitter: {
    name: 'Twitter / X',
    icon: 'fa-brands fa-x-twitter',
    color: 'from-gray-300 to-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    description: 'Tweet to your X (Twitter) followers',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'fa-brands fa-linkedin',
    color: 'from-blue-600 to-blue-700',
    bgColor: 'bg-blue-600/10',
    borderColor: 'border-blue-600/20',
    description: 'Share professional content on LinkedIn',
  },
};

export default function ConnectedAccountCard({
  platform,
  isConnected,
  platformUsername,
  platformDisplayName,
  profileImageUrl,
  tokenExpiresAt,
  lastSyncedAt,
  onConnect,
  onDisconnect,
}: ConnectedAccountCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const config = platformConfig[platform];

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await onDisconnect();
      setShowDisconnectModal(false);
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-ZA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className={`aerogel-card p-6 rounded-2xl border ${config.borderColor} ${config.bgColor} transition-all hover:scale-[1.02]`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
              <i className={`${config.icon} text-white text-xl`}></i>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">{config.name}</h3>
              <p className="text-xs text-gray-400">{config.description}</p>
            </div>
          </div>
          <ConnectionStatusBadge isActive={isConnected} tokenExpiresAt={tokenExpiresAt} />
        </div>

        {isConnected ? (
          <div className="space-y-4">
            {/* Profile Info */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-glass-border">
              {profileImageUrl && (
                <img 
                  src={profileImageUrl} 
                  alt={platformDisplayName || platformUsername} 
                  className="w-10 h-10 rounded-full border border-glass-border"
                />
              )}
              <div className="flex-1">
                <p className="font-bold text-sm">{platformDisplayName || platformUsername}</p>
                <p className="text-xs text-gray-400">@{platformUsername}</p>
              </div>
            </div>

            {/* Connection Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-500 font-mono mb-1">LAST SYNCED</p>
                <p className="text-white">{formatDate(lastSyncedAt)}</p>
              </div>
              <div>
                <p className="text-gray-500 font-mono mb-1">TOKEN EXPIRES</p>
                <p className="text-white">{formatDate(tokenExpiresAt)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-white/5 border border-glass-border rounded-xl hover:bg-white/10 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isLoading ? (
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fa-solid fa-rotate mr-2"></i>
                )}
                Reconnect
              </button>
              <button
                onClick={() => setShowDisconnectModal(true)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium text-red-400 disabled:opacity-50"
              >
                <i className="fa-solid fa-unlink mr-2"></i>
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Connect your {config.name} account to schedule and publish content automatically.
            </p>
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className={`w-full px-6 py-3 bg-gradient-to-r ${config.color} rounded-xl hover:opacity-90 transition-all font-bold text-white disabled:opacity-50`}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Connecting...
                </>
              ) : (
                <>
                  <i className={`${config.icon} mr-2`}></i>
                  Connect {config.name}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
          <div className="aerogel-card p-8 rounded-2xl max-w-md w-full space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.color} mx-auto mb-4 flex items-center justify-center`}>
                <i className={`${config.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="font-display font-bold text-2xl mb-2">Disconnect {config.name}?</h3>
              <p className="text-gray-400">
                Are you sure you want to disconnect your {config.name} account? You won't be able to post to this platform until you reconnect.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDisconnectModal(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-white/5 border border-glass-border rounded-xl hover:bg-white/10 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-red-500 rounded-xl hover:bg-red-600 transition-colors font-bold text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
