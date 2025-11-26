'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getCurrentLanguage, setCurrentLanguage, t } from '../i18n';
import { initializeTranslations } from '../load-translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize translations on mount
    initializeTranslations();
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
    <LanguageContext.Provider value={{ language, setLanguage, t: translate }}>
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
