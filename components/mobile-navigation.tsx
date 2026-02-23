'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '../lib/context/LanguageContext';
import LogoutButton from './LogoutButton';
import LanguageSelector from './language-selector';

interface MobileNavigationProps {
  userName: string;
  userEmail: string;
  userTier: 'free' | 'pro' | 'business';
  userCredits: number;
  userImage: string;
  activeTab: 'dashboard' | 'schedule' | 'automation';
  onNavigate: (tab: 'dashboard' | 'schedule' | 'automation') => void;
  onSettingsClick: () => void;
}

export default function MobileNavigation({
  userName,
  userEmail,
  userTier,
  userCredits,
  userImage,
  activeTab,
  onNavigate,
  onSettingsClick
}: MobileNavigationProps) {
  const { t: translate } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Focus trap when menu is open
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';

      // Focus first interactive element
      const firstButton = drawerRef.current?.querySelector('button');
      firstButton?.focus();

      // Trap focus within drawer
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab' && drawerRef.current) {
          const focusableElements = drawerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => {
        document.removeEventListener('keydown', handleTabKey);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle navigation and close menu
  const handleNavigation = (tab: 'dashboard' | 'schedule' | 'automation') => {
    onNavigate(tab);
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    onSettingsClick();
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      setIsOpen(false);
    }
  };

  // Touch gesture support for swipe-to-close
  useEffect(() => {
    if (!isOpen) return;

    let startX = 0;
    let currentX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        startX = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        currentX = e.touches[0].clientX;
        const diff = startX - currentX;

        // Only allow swipe-left gesture (closing from left edge)
        if (diff > 0 && drawerRef.current) {
          const transform = Math.min(diff, 256);
          drawerRef.current.style.transform = `translateX(-${transform}px)`;
        }
      }
    };

    const handleTouchEnd = () => {
      const diff = startX - currentX;
      
      if (drawerRef.current) {
        drawerRef.current.style.transform = '';
      }

      // Close if swiped more than 100px
      if (diff > 100) {
        setIsOpen(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-12 h-12 rounded-xl bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <i className="fa-solid fa-bars text-white text-xl"></i>
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          ref={backdropRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Navigation Drawer */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-72 bg-void border-r border-glass-border shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full p-6 gap-6">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center">
                <span className="font-display font-bold text-white">P</span>
              </div>
              <h1 className="font-display font-bold text-lg tracking-tight text-white">Purple Glow</h1>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close navigation menu"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>

          {/* User Profile Section */}
          <div className="p-4 rounded-xl border border-glass-border bg-gradient-to-br from-white/5 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <Image 
                src={userImage} 
                alt={userName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full border-2 border-neon-grape/50"
                unoptimized
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate">{userEmail}</p>
              </div>
            </div>
            
            {/* Credits Display */}
            <div className="pt-3 border-t border-glass-border">
              <p className="text-xs font-mono text-gray-400 mb-1">{translate('dashboard.credits')}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-display font-bold text-white">{userCredits}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-mzansi-gold/20 text-mzansi-gold font-medium">
                  {translate(`dashboard.tiers.${userTier}`).toUpperCase()}
                </span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-grape to-joburg-teal transition-all duration-300"
                  style={{ 
                    width: `${Math.min((userCredits / (userTier === 'free' ? 10 : userTier === 'pro' ? 500 : 2000)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 flex-1" role="navigation">
            <button
              onClick={() => handleNavigation('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-neon-grape/20 to-joburg-teal/20 border border-neon-grape/40 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
            >
              <i className="fa-solid fa-layer-group text-neon-grape w-5"></i>
              <span>{translate('dashboard.sidebar.dashboard')}</span>
              {activeTab === 'dashboard' && (
                <i className="fa-solid fa-check text-joburg-teal ml-auto text-xs"></i>
              )}
            </button>

            <button
              onClick={() => handleNavigation('schedule')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'schedule'
                  ? 'bg-gradient-to-r from-neon-grape/20 to-joburg-teal/20 border border-neon-grape/40 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
              aria-current={activeTab === 'schedule' ? 'page' : undefined}
            >
              <i className="fa-regular fa-calendar text-joburg-teal w-5"></i>
              <span>{translate('dashboard.sidebar.schedule')}</span>
              {activeTab === 'schedule' && (
                <i className="fa-solid fa-check text-joburg-teal ml-auto text-xs"></i>
              )}
            </button>

            <button
              onClick={() => handleNavigation('automation')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'automation'
                  ? 'bg-gradient-to-r from-neon-grape/20 to-joburg-teal/20 border border-neon-grape/40 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
              aria-current={activeTab === 'automation' ? 'page' : undefined}
            >
              <i className="fa-solid fa-bolt text-mzansi-gold w-5"></i>
              <span>{translate('dashboard.sidebar.automation')}</span>
              {activeTab === 'automation' && (
                <i className="fa-solid fa-check text-joburg-teal ml-auto text-xs"></i>
              )}
            </button>

            <button
              onClick={handleSettingsClick}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-transparent"
            >
              <i className="fa-solid fa-cog w-5"></i>
              <span>{translate('dashboard.sidebar.settings')}</span>
            </button>
          </nav>

          {/* Language Selector */}
          <div className="border-t border-glass-border pt-4">
            <p className="text-xs font-mono text-gray-400 mb-3 px-2">{translate('common.language') || 'Language'}</p>
            <LanguageSelector variant="compact" />
          </div>

          {/* Logout Button */}
          <div className="border-t border-glass-border pt-4">
            <LogoutButton onClick={() => setIsOpen(false)} />
          </div>
        </div>
      </aside>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 200ms ease-out;
        }
      `}</style>
    </>
  );
}
