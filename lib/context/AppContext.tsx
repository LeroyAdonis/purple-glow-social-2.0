import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MockUser, getCurrentUser } from '../mock-data';
import { Language, getCurrentLanguage, setCurrentLanguage } from '../i18n';

interface AppContextType {
  // User state
  user: MockUser;
  updateUser: (updates: Partial<MockUser>) => void;
  
  // Credits
  credits: number;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => void;
  
  // Subscription
  tier: 'free' | 'pro' | 'business';
  upgradeTier: (newTier: 'free' | 'pro' | 'business') => void;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Modal states
  modals: {
    creditTopup: boolean;
    subscription: boolean;
    paymentSuccess: boolean;
    schedulePost: boolean;
    automationWizard: boolean;
  };
  openModal: (modal: keyof AppContextType['modals']) => void;
  closeModal: (modal: keyof AppContextType['modals']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<MockUser>(getCurrentUser());
  const [credits, setCredits] = useState(user.credits);
  const [tier, setTier] = useState<'free' | 'pro' | 'business'>(user.tier);
  const [language, setLanguageState] = useState<Language>(getCurrentLanguage());
  const [modals, setModals] = useState({
    creditTopup: false,
    subscription: false,
    paymentSuccess: false,
    schedulePost: false,
    automationWizard: false,
  });

  // Initialize language from localStorage on mount
  useEffect(() => {
    const savedLang = getCurrentLanguage();
    setLanguageState(savedLang);
  }, []);

  const updateUser = (updates: Partial<MockUser>) => {
    setUser(prev => ({ ...prev, ...updates }));
    
    // Sync related states
    if (updates.credits !== undefined) {
      setCredits(updates.credits);
    }
    if (updates.tier !== undefined) {
      setTier(updates.tier);
    }
  };

  const addCredits = (amount: number) => {
    const newCredits = credits + amount;
    setCredits(newCredits);
    updateUser({ credits: newCredits });
  };

  const deductCredits = (amount: number) => {
    const newCredits = Math.max(0, credits - amount);
    setCredits(newCredits);
    updateUser({ credits: newCredits });
  };

  const upgradeTier = (newTier: 'free' | 'pro' | 'business') => {
    setTier(newTier);
    updateUser({ tier: newTier });
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Persist to localStorage using i18n helper
    setCurrentLanguage(lang);
  };

  const openModal = (modal: keyof AppContextType['modals']) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  };

  const closeModal = (modal: keyof AppContextType['modals']) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  };

  const value: AppContextType = {
    user,
    updateUser,
    credits,
    addCredits,
    deductCredits,
    tier,
    upgradeTier,
    language,
    setLanguage,
    modals,
    openModal,
    closeModal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
