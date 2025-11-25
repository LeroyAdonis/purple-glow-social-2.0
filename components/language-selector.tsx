'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LANGUAGES, Language, getCurrentLanguage, setCurrentLanguage } from '../lib/i18n';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  variant?: 'default' | 'compact';
}

export default function LanguageSelector({ currentLanguage, onLanguageChange, variant = 'default' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    onLanguageChange(lang);
    setCurrentLanguage(lang);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          aria-label="Select Language"
        >
          <span className="text-lg">{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
          <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 aerogel-card rounded-xl shadow-2xl z-[9999] max-h-80 overflow-y-auto">
            <div className="p-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentLanguage === lang.code
                      ? 'bg-neon-grape/20 text-white'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-bold">{lang.name}</div>
                    <div className="text-xs text-gray-500">{lang.nativeName}</div>
                  </div>
                  {currentLanguage === lang.code && (
                    <i className="fa-solid fa-check text-neon-grape"></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-glass-border rounded-xl hover:bg-white/10 transition-all"
      >
        <span className="text-2xl">{currentLang.flag}</span>
        <div className="flex-1 text-left">
          <div className="text-sm font-bold">{currentLang.name}</div>
          <div className="text-xs text-gray-500">{currentLang.nativeName}</div>
        </div>
        <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 aerogel-card rounded-xl shadow-2xl z-[9999] max-h-80 overflow-y-auto animate-enter">
          <div className="p-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentLanguage === lang.code
                    ? 'bg-neon-grape/20 text-white border border-neon-grape/30'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-bold">{lang.name}</div>
                  <div className="text-xs text-gray-500">{lang.nativeName}</div>
                </div>
                {currentLanguage === lang.code && (
                  <i className="fa-solid fa-check text-neon-grape"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
