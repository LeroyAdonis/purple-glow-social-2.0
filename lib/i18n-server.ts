/**
 * Server-side i18n utilities
 * Provides translation functions for Server Components
 */

import { cookies } from 'next/headers';
import type { Language, TranslationRecord } from './types';
import { LANGUAGES } from './i18n';

// Import all translations
import en from './translations/en.json';
import af from './translations/af.json';
import zu from './translations/zu.json';
import xh from './translations/xh.json';
import nso from './translations/nso.json';
import tn from './translations/tn.json';
import st from './translations/st.json';
import ts from './translations/ts.json';
import ss from './translations/ss.json';
import ve from './translations/ve.json';
import nr from './translations/nr.json';

// Server-side translation storage
const serverTranslations: Record<Language, TranslationRecord> = {
  en,
  af,
  zu,
  xh,
  nso,
  tn,
  st,
  ts,
  ss,
  ve,
  nr,
} as Record<Language, TranslationRecord>;

/**
 * Get current language from cookies (server-side)
 */
export async function getServerLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const stored = cookieStore.get('purple-glow-language')?.value;
  
  if (stored && LANGUAGES.some(l => l.code === stored)) {
    return stored as Language;
  }
  
  return 'en';
}

/**
 * Get translation value by key (server-side)
 */
export function getTranslation(key: string, lang: Language): string {
  const keys = key.split('.');
  let value: unknown = serverTranslations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

/**
 * Get all translations for a specific language
 */
export function getTranslations(lang: Language): TranslationRecord {
  return serverTranslations[lang];
}

/**
 * Create translation function bound to specific language
 */
export function createTranslator(lang: Language) {
  return (key: string) => getTranslation(key, lang);
}
