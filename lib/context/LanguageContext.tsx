'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getCurrentLanguage, setCurrentLanguage, t, loadTranslation } from '../i18n';

// Import all translation files
import en from '../translations/en.json';
import af from '../translations/af.json';
import zu from '../translations/zu.json';
import xh from '../translations/xh.json';
import nso from '../translations/nso.json';
import tn from '../translations/tn.json';
import st from '../translations/st.json';
import ts from '../translations/ts.json';
import ss from '../translations/ss.json';
import ve from '../translations/ve.json';
import nr from '../translations/nr.json';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isInitialized: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize all translations
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
    
    // Get saved language
    const currentLang = getCurrentLanguage();
    setLanguageState(currentLang);
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setCurrentLanguage(lang);
  };

  const translate = (key: string) => {
    if (!isInitialized) return key;
    return t(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate, isInitialized }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
