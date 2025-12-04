import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getCurrentLanguage, setCurrentLanguage } from '../i18n';
import { logger } from '../logger';

interface User {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'pro' | 'business';
  credits: number;
  image: string;
  joined: Date;
  lastActive: Date;
  postsCreated: number;
  status: 'active' | 'inactive';
}

interface AppContextType {
  // User state
  user: User | null;
  updateUser: (updates: Partial<User>) => void;
  
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

// Default user for initial state (will be fetched from API)
const defaultUser: User = {
  id: '',
  name: 'User',
  email: '',
  tier: 'free',
  credits: 10,
  image: '',
  joined: new Date(),
  lastActive: new Date(),
  postsCreated: 0,
  status: 'active',
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(10);
  const [tier, setTier] = useState<'free' | 'pro' | 'business'>('free');
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

  // Fetch user data from API on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUser({
            ...defaultUser,
            id: data.id,
            name: data.name || data.email?.split('@')[0] || 'User',
            email: data.email,
            tier: data.tier || 'free',
            credits: data.credits || 10,
            image: data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=9D4EDD&color=fff`,
          });
          setTier(data.tier || 'free');
          setCredits(data.credits || 10);
        }
      } catch (error) {
        logger.api.exception(error as Error, { context: 'fetchUserData' });
      }
    };

    fetchUserData();
  }, []);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
    
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
