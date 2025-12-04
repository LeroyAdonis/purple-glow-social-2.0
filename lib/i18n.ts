// Simple i18n system for 11 South African official languages
// No external dependencies - lightweight and performant

import type { TranslationRecord, TranslationValue, LanguageCode } from './types';

export type Language = LanguageCode;

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'zu', name: 'isiZulu', nativeName: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh', name: 'isiXhosa', nativeName: 'isiXhosa', flag: '🇿🇦' },
  { code: 'nso', name: 'Sepedi', nativeName: 'Sepedi', flag: '🇿🇦' },
  { code: 'tn', name: 'Setswana', nativeName: 'Setswana', flag: '🇿🇦' },
  { code: 'st', name: 'Sesotho', nativeName: 'Sesotho', flag: '🇿🇦' },
  { code: 'ts', name: 'Xitsonga', nativeName: 'Xitsonga', flag: '🇿🇦' },
  { code: 'ss', name: 'siSwati', nativeName: 'siSwati', flag: '🇿🇦' },
  { code: 've', name: 'Tshivenda', nativeName: 'Tshivenda', flag: '🇿🇦' },
  { code: 'nr', name: 'isiNdebele', nativeName: 'isiNdebele', flag: '🇿🇦' }
];

// Translation storage
const translations: Record<Language, TranslationRecord> = {} as Record<Language, TranslationRecord>;

// Load translation
export function loadTranslation(lang: Language, data: TranslationRecord) {
  translations[lang] = data;
}

// Get translation
export function t(key: string, lang: Language): string {
  const keys = key.split('.');
  let value: TranslationValue = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Get current language from localStorage
export function getCurrentLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('purple-glow-language');
    if (stored && LANGUAGES.some(l => l.code === stored)) {
      return stored as Language;
    }
  }
  return 'en';
}

// Set current language
export function setCurrentLanguage(lang: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('purple-glow-language', lang);
  }
}

// Format currency
export function formatCurrency(amount: number, lang: Language): string {
  return `R${amount.toFixed(2)}`;
}

// Format date
export function formatDate(date: Date, lang: Language): string {
  return date.toLocaleDateString('en-ZA', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
