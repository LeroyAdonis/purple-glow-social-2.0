'use client';

/**
 * Navigation Component
 * Client Component - Handles interactive navigation with scroll effects,
 * mobile menu, user dropdown, and smooth scrolling.
 * Enhanced with SA flag accents, decorative elements, and premium styling.
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
      className={`fixed w-full top-0 z-50 border-b transition-all duration-500 ${
        scrolled || isMobileMenuOpen
          ? 'bg-deep-charcoal/85 backdrop-blur-xl border-border-default shadow-lg py-3'
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      {/* Noise texture overlay on scrolled nav */}
      {scrolled && <div className="noise-overlay" style={{ zIndex: -1, opacity: 0.025 }} />}

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* ─── Logo with SA Flag Accent ───────────────────────────── */}
        <div className="flex items-center gap-2 cursor-pointer z-50 group">
          {/* Decorative geometric accent — SA colors */}
          <div className="relative flex items-center">
            <div className="w-9 h-9 rounded-lg bg-posta-orange flex items-center justify-center shadow-[0_0_18px_rgba(232,93,4,0.4)] transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(232,93,4,0.5)]">
              <i className="fa-solid fa-bolt text-white text-sm"></i>
            </div>
            {/* Small SA color dot accents around logo */}
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sa-green/60" />
            <span className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-sa-gold/60" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight leading-tight text-white">
              POSTA
            </span>
            {/* Flag-accent bar under brand name */}
            <span className="w-full h-[2px] rounded-full mt-0.5" style={{
              background: 'linear-gradient(90deg, #007749, #FFB81C, #E03C31, #002C6F)',
            }} />
          </div>
        </div>

        {/* ─── Desktop Navigation ───────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1 text-sm text-text-secondary font-medium">
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, 'features')}
            className="relative px-4 py-2 rounded-lg hover:text-white hover:bg-white/[0.03] transition-all duration-300 group"
          >
            {translate('nav.features')}
            <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-sa-green via-sa-gold to-sa-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            className="relative px-4 py-2 rounded-lg hover:text-white hover:bg-white/[0.03] transition-all duration-300 group"
          >
            {translate('howItWorks.title')}
            <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-sa-green via-sa-gold to-sa-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </a>
          <a
            href="#testimonials"
            onClick={(e) => scrollToSection(e, 'testimonials')}
            className="relative px-4 py-2 rounded-lg hover:text-white hover:bg-white/[0.03] transition-all duration-300 group"
          >
            {translate('testimonials.title').split(' ')[0]}
            <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-sa-green via-sa-gold to-sa-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </a>
          <a
            href="#pricing"
            onClick={(e) => scrollToSection(e, 'pricing')}
            className="relative px-4 py-2 rounded-lg hover:text-white hover:bg-white/[0.03] transition-all duration-300 group"
          >
            {translate('nav.pricing')}
            <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-sa-green via-sa-gold to-sa-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </a>
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, 'contact')}
            className="relative px-4 py-2 rounded-lg hover:text-white hover:bg-white/[0.03] transition-all duration-300 group"
          >
            {translate('nav.contact')}
            <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-sa-green via-sa-gold to-sa-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </a>
          <a
            href="#legal"
            onClick={(e) => scrollToSection(e, 'legal')}
            className="relative px-4 py-2 rounded-lg hover:text-white hover:bg-white/[0.03] transition-all duration-300 group"
          >
            {translate('footer.legal')}
            <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-sa-green via-sa-gold to-sa-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </a>
        </div>

        {/* ─── Desktop Actions ──────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSelector variant="compact" />
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-5 py-2 bg-posta-orange text-white font-bold rounded-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(232,93,4,0.3)] cursor-pointer"
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
                      )}&background=E85D04&color=fff`
                    }
                    alt="User"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border border-border-default"
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
                  <div className="absolute right-0 mt-2 w-56 bg-deep-charcoal border border-border-default rounded-xl shadow-2xl overflow-hidden z-50 animate-scale-in">
                    <div className="p-4 border-b border-border-default">
                      <p className="font-bold text-white truncate">
                        {session.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-text-tertiary truncate">{session.user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <i className="fa-solid fa-grid-2 text-posta-orange"></i>
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          // Settings logic here
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors cursor-pointer text-left"
                      >
                        <i className="fa-solid fa-cog text-text-tertiary"></i>
                        <span>Settings</span>
                      </button>
                      <div className="h-px bg-border-default my-2"></div>
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
                className="text-sm font-bold text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-posta-orange text-white font-bold rounded-lg hover:scale-105 hover:shadow-[0_0_25px_rgba(232,93,4,0.4)] transition-all duration-300 cursor-pointer"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ─── Mobile Hamburger Toggle ──────────────────────────── */}
        <button
          className="md:hidden text-white z-50 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <i
            className={`fa-solid ${
              isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'
            } text-xl transition-all duration-300`}
          ></i>
        </button>
      </div>

      {/* ─── Mobile Menu Overlay ────────────────────────────────── */}
      <div
        className={`md:hidden absolute top-0 left-0 w-full bg-deep-charcoal/95 backdrop-blur-xl border-b border-border-default transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen
            ? 'max-h-[700px] opacity-100 pt-24 pb-8'
            : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <div className="px-6 flex flex-col gap-5">
          {/* SA flag decorative stripe at top of mobile menu */}
          <div className="flag-stripe rounded-full opacity-60" style={{ height: '3px' }} />

          <a
            href="#features"
            className="text-xl font-display font-bold text-text-secondary hover:text-white transition-colors"
            onClick={(e) => scrollToSection(e, 'features')}
          >
            {translate('nav.features')}
          </a>
          <a
            href="#how-it-works"
            className="text-xl font-display font-bold text-text-secondary hover:text-white transition-colors"
            onClick={(e) => scrollToSection(e, 'how-it-works')}
          >
            {translate('howItWorks.title')}
          </a>
          <a
            href="#testimonials"
            className="text-xl font-display font-bold text-text-secondary hover:text-white transition-colors"
            onClick={(e) => scrollToSection(e, 'testimonials')}
          >
            {translate('testimonials.title').split(' ')[0]}
          </a>
          <a
            href="#pricing"
            className="text-xl font-display font-bold text-text-secondary hover:text-white transition-colors"
            onClick={(e) => scrollToSection(e, 'pricing')}
          >
            {translate('nav.pricing')}
          </a>
          <a
            href="#contact"
            className="text-xl font-display font-bold text-text-secondary hover:text-white transition-colors"
            onClick={(e) => scrollToSection(e, 'contact')}
          >
            {translate('nav.contact')}
          </a>
          <a
            href="#legal"
            className="text-xl font-display font-bold text-text-secondary hover:text-white transition-colors"
            onClick={(e) => scrollToSection(e, 'legal')}
          >
            {translate('footer.legal')}
          </a>

          <div className="h-px bg-border-default w-full my-1"></div>

          {/* Language Selector in Mobile Menu */}
          <div className="w-full">
            <LanguageSelector variant="default" />
          </div>

          <div className="flex flex-col gap-3">
            {session ? (
              <Link
                href="/dashboard"
                className="w-full py-4 bg-posta-orange text-white font-bold rounded-xl shadow-[0_0_20px_rgba(232,93,4,0.3)] text-center cursor-pointer"
              >
                <i className="fa-solid fa-grid-2 mr-2"></i>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full py-4 text-center font-bold text-text-secondary hover:text-white border border-border-default rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="w-full py-4 bg-posta-orange text-white font-bold rounded-xl shadow-[0_0_20px_rgba(232,93,4,0.3)] text-center cursor-pointer"
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
