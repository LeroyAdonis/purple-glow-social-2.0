'use client';

import React, { useState } from 'react';

interface AIContentStudioProps {
  userId: string;
  currentLanguage?: string;
}

export default function AIContentStudio({ userId, currentLanguage = 'en' }: AIContentStudioProps) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'twitter' | 'linkedin'>('twitter');
  const [tone, setTone] = useState<'professional' | 'casual' | 'friendly' | 'energetic'>('friendly');
  const [language, setLanguage] = useState(currentLanguage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          platform,
          language,
          tone,
          includeHashtags: true,
          includeEmojis: true,
          variations: 3, // Generate 3 variations
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setResults(data.results);
      setSelectedVariation(0);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetTopicSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/ai/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: 'small business',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTopicSuggestions(data.topics || []);
      }
    } catch (err) {
      console.error('Topic suggestion error:', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const currentResult = results[selectedVariation];

  return (
    <div className="space-y-6">
      {/* Topic Suggestions Button */}
      <div className="flex justify-end">
        <button
          onClick={handleGetTopicSuggestions}
          disabled={isLoadingSuggestions}
          className="text-sm text-joburg-teal hover:text-white transition-colors flex items-center gap-2"
        >
          {isLoadingSuggestions ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Loading suggestions...
            </>
          ) : (
            <>
              <i className="fa-solid fa-lightbulb"></i>
              Get Topic Ideas
            </>
          )}
        </button>
      </div>

      {/* Topic Suggestions */}
      {topicSuggestions.length > 0 && (
        <div className="aerogel-card p-4 rounded-xl border border-glass-border">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
            <i className="fa-solid fa-lightbulb text-mzansi-gold"></i>
            Topic Suggestions
          </h4>
          <div className="flex flex-wrap gap-2">
            {topicSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setTopic(suggestion)}
                className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-glass-border
                         hover:border-neon-grape hover:bg-neon-grape/10 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generation Form */}
      <div className="aerogel-card p-6 rounded-2xl border border-glass-border">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <i className="fa-solid fa-wand-magic-sparkles text-neon-grape"></i>
          AI Content Studio
        </h3>

        <div className="space-y-4">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-bold mb-2">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Summer sale on sneakers"
              disabled={isGenerating}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border
                       focus:border-neon-grape focus:ring-2 focus:ring-neon-grape/20
                       transition-all outline-none disabled:opacity-50"
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-bold mb-2">Platform</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['facebook', 'instagram', 'twitter', 'linkedin'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  disabled={isGenerating}
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

          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-bold mb-2">Tone</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['professional', 'casual', 'friendly', 'energetic'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  disabled={isGenerating}
                  className={`px-4 py-2 rounded-xl border transition-all ${
                    tone === t
                      ? 'border-neon-grape bg-neon-grape/20 text-white'
                      : 'border-glass-border text-gray-400 hover:border-white/30'
                  } disabled:opacity-50`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-exclamation-circle text-red-400"></i>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full py-4 rounded-xl font-bold text-lg
                     bg-gradient-to-r from-neon-grape to-joburg-teal
                     hover:scale-105 transition-transform duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Generating 3 variations...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Generate Content
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Generated Content */}
      {results.length > 0 && (
        <div className="aerogel-card p-6 rounded-2xl border border-glass-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-lg">Generated Variations</h4>
            <div className="flex gap-2">
              {results.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedVariation(idx)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    selectedVariation === idx
                      ? 'bg-neon-grape text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Variation {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {currentResult && (
            <div className="space-y-4">
              {/* Content */}
              <div className="p-4 rounded-xl bg-white/5 border border-glass-border">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {currentResult.content}
                </p>
              </div>

              {/* Hashtags */}
              {currentResult.hashtags && currentResult.hashtags.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">
                    HASHTAGS
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentResult.hashtags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-sm rounded-lg bg-joburg-teal/10 border border-joburg-teal/30 text-joburg-teal"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Prompt */}
              {currentResult.suggestedImagePrompt && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">
                    SUGGESTED IMAGE
                  </label>
                  <p className="text-xs text-gray-500 italic">
                    {currentResult.suggestedImagePrompt}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(currentResult.content)}
                  className="flex-1 py-3 border border-glass-border text-gray-400
                           hover:border-white hover:text-white rounded-xl transition-colors"
                >
                  <i className="fa-regular fa-copy mr-2"></i>
                  Copy Content
                </button>
                <button
                  className="flex-1 py-3 bg-neon-grape text-white rounded-xl
                           hover:bg-neon-grape/80 transition-colors"
                >
                  <i className="fa-regular fa-calendar-check mr-2"></i>
                  Schedule Post
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
