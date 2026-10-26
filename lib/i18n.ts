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
  // `name` is the English name a non-speaker searches for; `nativeName` is what the language calls
  // itself and is what the switcher displays. Those were identical for nine of the eleven languages,
  // which meant a South African product advertised "Zulu" where the people it is for say isiZulu.
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦' },
  { code: 'nso', name: 'Sepedi', nativeName: 'Sesotho sa Leboa', flag: '🇿🇦' },
  { code: 'tn', name: 'Tswana', nativeName: 'Setswana', flag: '🇿🇦' },
  { code: 'st', name: 'Sotho', nativeName: 'Sesotho', flag: '🇿🇦' },
  { code: 'ts', name: 'Tsonga', nativeName: 'Xitsonga', flag: '🇿🇦' },
  { code: 'ss', name: 'Swati', nativeName: 'siSwati', flag: '🇿🇦' },
  { code: 've', name: 'Venda', nativeName: 'Tshivenda', flag: '🇿🇦' },
  { code: 'nr', name: 'Ndebele', nativeName: 'isiNdebele', flag: '🇿🇦' }
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
      value = value[k]!;
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
