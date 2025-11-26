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
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-glass-border"
          aria-label="Select Language"
        >
          <span className="text-lg">{currentLang.flag}</span>
          <span className="hidden sm:inline font-mono font-bold">{currentLang.code.toUpperCase()}</span>
          <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-void border border-glass-border rounded-xl shadow-2xl z-[9999] max-h-80 overflow-y-auto animate-enter custom-scrollbar">
            <div className="p-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all cursor-pointer ${
                    currentLanguage === lang.code
                      ? 'bg-gradient-to-r from-neon-grape/20 to-joburg-teal/20 text-white border border-neon-grape/40 shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:border-glass-border border border-transparent'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-bold font-body">{lang.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{lang.nativeName}</div>
                  </div>
                  {currentLanguage === lang.code && (
                    <i className="fa-solid fa-check text-joburg-teal text-sm"></i>
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
        className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-glass-border rounded-xl hover:bg-white/10 hover:border-neon-grape/50 transition-all cursor-pointer"
      >
        <span className="text-2xl">{currentLang.flag}</span>
        <div className="flex-1 text-left">
          <div className="text-sm font-bold font-body">{currentLang.name}</div>
          <div className="text-xs text-gray-400 font-mono">{currentLang.nativeName}</div>
        </div>
        <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-void border border-glass-border rounded-xl shadow-2xl z-[9999] max-h-80 overflow-y-auto animate-enter custom-scrollbar">
          <div className="p-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                  currentLanguage === lang.code
                    ? 'bg-gradient-to-r from-neon-grape/20 to-joburg-teal/20 text-white border border-neon-grape/40 shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:border-glass-border border border-transparent'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-bold font-body">{lang.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{lang.nativeName}</div>
                </div>
                {currentLanguage === lang.code && (
                  <i className="fa-solid fa-check text-joburg-teal"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
