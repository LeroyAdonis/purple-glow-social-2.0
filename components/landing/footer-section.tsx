'use client';

/**
 * Footer Section Component
 * Client Component - Displays footer with navigation links, legal information,
 * and smooth scrolling functionality
 * SA-themed: flag stripe divider, pattern-dots, prominent SA tagline
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/context/LanguageContext';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

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
    <motion.footer
      id="legal"
      className="relative border-t border-white/10 bg-black/40 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      {/* SA flag stripe above footer */}
      <div className="flag-stripe absolute top-0 left-0 right-0"></div>

      {/* Pattern dots background */}
      <div className="pattern-dots absolute inset-0 pointer-events-none opacity-10"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 pt-12 pb-6">
        {/* SA Tagline — prominent */}
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-posta-orange/10 via-sa-green/10 to-surge-teal/10 border border-white/5 mb-4">
            <div className="flex gap-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sa-green"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-sa-gold"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-sa-red"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-sa-blue"></span>
            </div>
            <span className="text-sm font-bold font-display bg-gradient-to-r from-sa-green via-sa-gold to-sa-red bg-clip-text text-transparent">
              Built in South Africa, for South Africa
            </span>
            <i className="fa-solid fa-heart text-sa-red text-[10px]"></i>
          </div>
        </motion.div>

        {/* Main Footer Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {/* Brand Column */}
          <motion.div className="col-span-1 md:col-span-2" variants={staggerItem}>
            <div className="flex items-center gap-3 mb-4">
              {/* Logo with SA flag colors */}
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-posta-orange to-surge-teal flex items-center justify-center shadow-[0_0_15px_rgba(232,93,4,0.3)]">
                  <span className="font-display font-bold text-sm text-white">P</span>
                </div>
                {/* Mini SA flag dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-cosmic-void bg-gradient-to-br from-sa-green via-sa-gold to-sa-red"></div>
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white">POSTA</span>
                <p className="text-[10px] text-text-quaternary font-mono tracking-wider">TECHNOLOGIES (PTY) LTD</p>
              </div>
            </div>
            <p className="text-text-tertiary text-sm max-w-sm leading-relaxed">
              {translate('footer.tagline')}
            </p>
            {/* Contact mini info */}
            <div className="flex items-center gap-4 mt-4">
              <span className="flex items-center gap-1.5 text-xs text-text-quaternary font-mono">
                <i className="fa-solid fa-envelope text-posta-orange text-[10px]"></i>
                hello@posta.co.za
              </span>
              <span className="flex items-center gap-1.5 text-xs text-text-quaternary font-mono">
                <i className="fa-solid fa-location-dot text-surge-teal text-[10px]"></i>
                Johannesburg, SA
              </span>
            </div>
          </motion.div>

          {/* Product Links */}
          <motion.div variants={staggerItem}>
            <h4 className="font-bold text-white mb-4 text-sm font-display tracking-wide">{translate('footer.product')}</h4>
            <ul className="space-y-2 text-sm text-text-tertiary">
              <li>
                <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-posta-orange transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-posta-orange transition-colors"></span>
                  {translate('nav.features')}
                </a>
              </li>
              <li>
                <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-posta-orange transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-posta-orange transition-colors"></span>
                  {translate('nav.pricing')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-posta-orange transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-posta-orange transition-colors"></span>
                  {translate('footer.integration')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-posta-orange transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-posta-orange transition-colors"></span>
                  {translate('footer.changelog')}
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div variants={staggerItem}>
            <h4 className="font-bold text-white mb-4 text-sm font-display tracking-wide">
              {translate('footer.legal')} <span className="text-[10px] text-text-tertiary font-mono">(ZA)</span>
            </h4>
            <ul className="space-y-2 text-sm text-text-tertiary">
              <li>
                <Link href="/privacy" className="hover:text-posta-orange transition-colors flex items-center gap-2 group">
                  <i className="fa-solid fa-shield-halved text-[10px] text-posta-orange group-hover:text-posta-orange transition-colors"></i>
                  {translate('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-posta-orange transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-posta-orange transition-colors"></span>
                  {translate('footer.terms')}
                </Link>
              </li>
              <li>
                <a href="#legal" onClick={(e) => scrollToSection(e, 'legal')} className="hover:text-posta-orange transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-posta-orange transition-colors"></span>
                  {translate('footer.paia')}
                </a>
              </li>
              <li>
                <Link href="/privacy#cookies" className="hover:text-posta-orange transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-posta-orange transition-colors"></span>
                  {translate('footer.cookies')}
                </Link>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Divider with SA flag colors */}
        <motion.div
          className="relative py-5"
          initial={{ opacity: 0, scaleX: 0.5 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="relative flex justify-center">
            <div className="flex gap-1 px-4 bg-black/40">
              <span className="w-6 h-0.5 rounded-full bg-sa-green"></span>
              <span className="w-6 h-0.5 rounded-full bg-sa-gold"></span>
              <span className="w-6 h-0.5 rounded-full bg-sa-red"></span>
              <span className="w-6 h-0.5 rounded-full bg-sa-blue"></span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-quaternary font-mono"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
        >
          <p>&copy; 2025 Posta Technologies (Pty) Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {/* Social links with SA tooltip */}
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <i className="fa-brands fa-twitter"></i>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <i className="fa-brands fa-linkedin"></i>
              </a>
            </div>
            <span className="text-[8px] text-text-quaternary tracking-widest uppercase hidden md:inline">
              <i className="fa-solid fa-flag text-sa-green mr-1"></i>
              RSA
            </span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
