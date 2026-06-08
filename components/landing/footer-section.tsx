'use client';

/**
 * Footer Section Component
 * Client Component - Displays footer with navigation links, legal information,
 * and smooth scrolling functionality
 */

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function FooterSection() {
  const { t: translate } = useLanguage();
  // Custom Scroll Handler for smooth scrolling
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
  };

  return (
    <footer id="legal" className="border-t border-white/10 bg-black/40 backdrop-blur-lg pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center">
                <span className="font-display font-bold text-xs text-white">P</span>
              </div>
              <span className="font-display font-bold text-lg">PURPLE GLOW SOCIAL</span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm">
              {translate('footer.tagline')}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">{translate('footer.product')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-neon-grape transition-colors">{translate('nav.features')}</a></li>
              <li><a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-neon-grape transition-colors">{translate('nav.pricing')}</a></li>
              <li><a href="#" className="hover:text-neon-grape transition-colors">{translate('footer.integration')}</a></li>
              <li><a href="#" className="hover:text-neon-grape transition-colors">{translate('footer.changelog')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">{translate('footer.legal')} (ZA)</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-joburg-teal transition-colors flex items-center gap-2"><i className="fa-solid fa-shield-halved text-xs"></i> {translate('footer.privacy')}</Link></li>
              <li><Link href="/terms" className="hover:text-joburg-teal transition-colors">{translate('footer.terms')}</Link></li>
              <li><a href="#legal" onClick={(e) => scrollToSection(e, 'legal')} className="hover:text-joburg-teal transition-colors">{translate('footer.paia')}</a></li>
              <li><Link href="/privacy#cookies" className="hover:text-joburg-teal transition-colors">{translate('footer.cookies')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-mono">
          <p>&copy; 2025 Purple Glow Technologies (Pty) Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white"><i className="fa-brands fa-twitter"></i></a>
            <a href="#" className="hover:text-white"><i className="fa-brands fa-instagram"></i></a>
            <a href="#" className="hover:text-white"><i className="fa-brands fa-linkedin"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
