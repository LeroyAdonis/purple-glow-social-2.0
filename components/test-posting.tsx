'use client';

import React, { useState } from 'react';
import type { PublishResult } from '@/lib/types';

interface TestPostingProps {
  userId: string;
}

export default function TestPosting({ userId }: TestPostingProps) {
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'twitter' | 'linkedin'>('twitter');
  const [content, setContent] = useState('Hey Mzansi! 🇿🇦 Testing auto-posting from Purple Glow Social. This is lekker! #MadeInSA #PurpleGlowSocial');
  const [imageUrl, setImageUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePost = async () => {
    setIsPosting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/posts/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          content,
          imageUrl: imageUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Posting error:', err);
      setError(err.message || 'Failed to post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="aerogel-card p-6 rounded-2xl border border-glass-border">
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
        <i className="fa-solid fa-vial text-joburg-teal"></i>
        Test Auto-Posting
      </h3>

      <div className="space-y-4">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-bold mb-2">Platform</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['facebook', 'instagram', 'twitter', 'linkedin'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                disabled={isPosting}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  platform === p
                    ? 'border-neon-grape bg-neon-grape/20 text-white'
                    : 'border-glass-border text-gray-400 hover:border-white/30'
                } disabled:opacity-50`}
              >
                <i className={`fa-brands fa-${p} mr-2`}></i>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Content
            <span className="text-xs text-gray-400 ml-2">
              ({content.length}/280 {platform === 'twitter' && content.length > 280 && '⚠️ Too long for Twitter'})
            </span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPosting}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border
                     focus:border-neon-grape focus:ring-2 focus:ring-neon-grape/20
                     transition-all outline-none disabled:opacity-50 resize-none"
            placeholder="Write your post content..."
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Image URL (Optional)
            {platform === 'instagram' && (
              <span className="text-xs text-red-400 ml-2">⚠️ Required for Instagram</span>
            )}
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isPosting}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border
                     focus:border-neon-grape focus:ring-2 focus:ring-neon-grape/20
                     transition-all outline-none disabled:opacity-50"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Post Button */}
        <button
          onClick={handlePost}
          disabled={isPosting || (platform === 'instagram' && !imageUrl)}
          className="w-full py-4 rounded-xl font-bold text-lg
                   bg-gradient-to-r from-neon-grape to-joburg-teal
                   hover:scale-105 transition-transform duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isPosting ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-spinner fa-spin"></i>
              Posting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-paper-plane"></i>
              Post to {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </span>
          )}
        </button>

        {/* Result */}
        {result && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-check-circle text-emerald-400 text-xl mt-1"></i>
              <div className="flex-1">
                <p className="font-bold text-emerald-400 mb-2">Post Published Successfully! 🎉</p>
                <div className="text-sm text-gray-300 space-y-1">
                  <p><strong>Platform:</strong> {result.platform}</p>
                  {result.postId && <p><strong>Post ID:</strong> {result.postId}</p>}
                  {result.postUrl && (
                    <p>
                      <strong>View Post:</strong>{' '}
                      <a
                        href={result.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-joburg-teal hover:underline"
                      >
                        {result.postUrl}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-exclamation-circle text-red-400 text-xl mt-1"></i>
              <div className="flex-1">
                <p className="font-bold text-red-400 mb-1">Posting Failed</p>
                <p className="text-sm text-gray-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 rounded-xl bg-white/5 border border-glass-border">
          <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
            <i className="fa-solid fa-lightbulb text-mzansi-gold"></i>
            Testing Instructions
          </h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Make sure you have connected the platform account first</li>
            <li>• Twitter has a 280 character limit</li>
            <li>• Instagram requires an image URL</li>
            <li>• Use a publicly accessible image URL</li>
            <li>• Check the platform after posting to verify</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
