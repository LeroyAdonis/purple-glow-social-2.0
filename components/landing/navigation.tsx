'use client';

/**
 * Navigation Component
 * Client Component - Handles interactive navigation with scroll effects,
 * mobile menu, user dropdown, and smooth scrolling
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSelector from '../language-selector';
import LogoutButton from '../LogoutButton';
import { useLanguage } from '@/lib/context/LanguageContext';

interface NavigationProps {
  session: {
    user?: {
      name?: string;
      email?: string;
      image?: string | null;
    };
  } | null;
}

export default function Navigation({ session }: NavigationProps) {
  const { t: translate } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Handle Scroll Effect for Navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Custom Scroll Handler to avoid hash navigation issues in iframes
  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed w-full top-0 z-50 border-b transition-all duration-300 ${
        scrolled || isMobileMenuOpen
          ? 'bg-void/90 backdrop-blur-xl border-white/10 shadow-lg py-4'
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer z-50">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center shadow-[0_0_15px_rgba(157,78,221,0.5)]">
            <i className="fa-solid fa-bolt text-white text-sm"></i>
          </div>
          <span className="font-display font-bold text-xl tracking-tight">PURPLE GLOW SOCIAL</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400 font-medium">
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, 'features')}
            className="hover:text-white transition-colors"
          >
            {translate('nav.features')}
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            className="hover:text-white transition-colors"
          >
            {translate('howItWorks.title')}
          </a>
          <a
            href="#testimonials"
            onClick={(e) => scrollToSection(e, 'testimonials')}
            className="hover:text-white transition-colors"
          >
            {translate('testimonials.title').split(' ')[0]}
          </a>
          <a
            href="#pricing"
            onClick={(e) => scrollToSection(e, 'pricing')}
            className="hover:text-white transition-colors"
          >
            {translate('nav.pricing')}
          </a>
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, 'contact')}
            className="hover:text-white transition-colors"
          >
            {translate('nav.contact')}
          </a>
          <a
            href="#legal"
            onClick={(e) => scrollToSection(e, 'legal')}
            className="hover:text-white transition-colors"
          >
            {translate('footer.legal')}
          </a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSelector variant="compact" />
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-5 py-2 bg-gradient-to-r from-neon-grape to-joburg-teal text-white font-bold rounded-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(157,78,221,0.4)] cursor-pointer"
              >
                <i className="fa-solid fa-grid-2 mr-2"></i>
                Dashboard
              </Link>

              {/* User Profile Dropdown */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Image
                    src={
                      session.user?.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        session.user?.name || 'User'
                      )}&background=9D4EDD&color=fff`
                    }
                    alt="User"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border border-glass-border"
                    unoptimized={!session.user?.image}
                  />
                  <i
                    className={`fa-solid fa-chevron-down text-xs transition-transform ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
                  ></i>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-void border border-glass-border rounded-xl shadow-2xl overflow-hidden z-50 animate-enter">
                    <div className="p-4 border-b border-glass-border">
                      <p className="font-bold text-white truncate">
                        {session.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <i className="fa-solid fa-grid-2 text-neon-grape"></i>
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          // Settings logic here
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors cursor-pointer text-left"
                      >
                        <i className="fa-solid fa-cog text-gray-400"></i>
                        <span>Settings</span>
                      </button>
                      <div className="h-px bg-glass-border my-2"></div>
                      <div className="px-4 py-2">
                        <LogoutButton onClick={() => setShowUserMenu(false)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold hover:text-joburg-teal transition-colors cursor-pointer"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 bg-white text-black font-bold rounded-lg hover:scale-105 transition-transform border border-transparent hover:border-neon-grape shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="md:hidden text-white z-50 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <i
            className={`fa-solid ${
              isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'
            } text-xl transition-all duration-300`}
          ></i>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden absolute top-0 left-0 w-full bg-void/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen
            ? 'max-h-[700px] opacity-100 pt-24 pb-8'
            : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <div className="px-6 flex flex-col gap-6">
          <a
            href="#features"
            className="text-xl font-display font-bold text-gray-300 hover:text-white"
            onClick={(e) => scrollToSection(e, 'features')}
          >
            {translate('nav.features')}
          </a>
          <a
            href="#how-it-works"
            className="text-xl font-display font-bold text-gray-300 hover:text-white"
            onClick={(e) => scrollToSection(e, 'how-it-works')}
          >
            {translate('howItWorks.title')}
          </a>
          <a
            href="#testimonials"
            className="text-xl font-display font-bold text-gray-300 hover:text-white"
            onClick={(e) => scrollToSection(e, 'testimonials')}
          >
            {translate('testimonials.title').split(' ')[0]}
          </a>
          <a
            href="#pricing"
            className="text-xl font-display font-bold text-gray-300 hover:text-white"
            onClick={(e) => scrollToSection(e, 'pricing')}
          >
            {translate('nav.pricing')}
          </a>
          <a
            href="#contact"
            className="text-xl font-display font-bold text-gray-300 hover:text-white"
            onClick={(e) => scrollToSection(e, 'contact')}
          >
            {translate('nav.contact')}
          </a>
          <a
            href="#legal"
            className="text-xl font-display font-bold text-gray-300 hover:text-white"
            onClick={(e) => scrollToSection(e, 'legal')}
          >
            {translate('footer.legal')}
          </a>

          <div className="h-px bg-white/10 w-full my-2"></div>

          {/* Language Selector in Mobile Menu */}
          <div className="w-full">
            <LanguageSelector variant="default" />
          </div>

          <div className="flex flex-col gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="w-full py-4 bg-gradient-to-r from-neon-grape to-joburg-teal text-white font-bold rounded-xl shadow-[0_0_20px_rgba(157,78,221,0.4)] text-center cursor-pointer"
              >
                <i className="fa-solid fa-grid-2 mr-2"></i>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full py-4 text-center font-bold text-white hover:text-joburg-teal border border-white/10 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] text-center cursor-pointer"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
