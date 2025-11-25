// Load all translations into memory
import { loadTranslation, Language } from './i18n';

// Import all translation files
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

// Initialize all translations
export function initializeTranslations() {
  loadTranslation('en', en);
  loadTranslation('af', af);
  loadTranslation('zu', zu);
  loadTranslation('xh', xh);
  loadTranslation('nso', nso);
  loadTranslation('tn', tn);
  loadTranslation('st', st);
  loadTranslation('ts', ts);
  loadTranslation('ss', ss);
  loadTranslation('ve', ve);
  loadTranslation('nr', nr);
}

// Get translation helper with fallback
export function getTranslation(key: string, lang: Language, translations: any): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      // Fallback to English if translation not found
      value = translations['en'];
      for (const fk of keys) {
        if (value && typeof value === 'object') {
          value = value[fk];
        } else {
          return key; // Return key if even English is not found
        }
      }
      return typeof value === 'string' ? value : key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}
