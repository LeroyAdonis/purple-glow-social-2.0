'use client';

/**
 * Pricing Section Component
 * Client Component - Displays pricing tiers with monthly/annual billing toggle
 * and credit top-up options powered by Polar.sh
 * SA-themed: flag accents, tiered glow colors, pattern-dots background
 */

import React, { useState } from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function PricingSection() {
  const { t: translate } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <>
      {/* ═══ PRICING SECTION ═══ */}
      <section id="pricing" className="py-24 relative bg-black/20 overflow-hidden">
        {/* SA flag stripe across the section */}
        <div className="flag-stripe absolute top-0 left-0 right-0"></div>

        {/* Background pattern */}
        <div className="pattern-dots absolute inset-0 pointer-events-none opacity-20"></div>

        {/* Ambient orbs */}
        <div className="glow-orb-posta-orange w-[600px] h-[600px] -top-48 -right-48 pointer-events-none"></div>
        <div className="glow-orb-gold w-[400px] h-[400px] -bottom-32 -left-32 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-4">
          {/* Header with badge */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sa-gold/10 border border-sa-gold/20 text-sa-gold text-[10px] font-bold tracking-widest mb-4 uppercase">
                <i className="fa-solid fa-tag"></i>
                <span>{translate('pricing.badge') || 'Simple Pricing'}</span>
              </div>
              <h2 className="font-display font-bold text-4xl md:text-5xl mb-2">{translate('pricing.title')}</h2>
              <p className="text-text-secondary">{translate('pricing.subtitle')}</p>
            </div>

            {/* Billing Toggle */}
            <div className="bg-white/5 p-1 rounded-xl border border-glass-border flex-shrink-0">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                {translate('pricing.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  billingCycle === 'annual' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                {translate('pricing.annual')} <span className="text-[10px] text-posta-orange ml-1 font-bold">-20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* TIER 1: FREE — sa-green accent */}
            <div className="premium-card rounded-3xl border border-white/5 hover:border-sa-green/40 transition-all duration-300 group">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-sa-green animate-pulse"></div>
                  <h3 className="font-mono text-sm tracking-widest text-sa-green uppercase font-bold">FREE</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-white">R0</span>
                  <span className="text-text-tertiary text-sm">/month</span>
                </div>
                <p className="text-xs text-text-tertiary mt-2">Perfect for getting started</p>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-text-secondary">
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-sa-green mt-0.5"></i>
                  <span>5 AI posts per month</span>
                </li>
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-sa-green mt-0.5"></i>
                  <span>1 social profile</span>
                </li>
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-sa-green mt-0.5"></i>
                  <span>Email support</span>
                </li>
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-sa-green mt-0.5"></i>
                  <span>Basic insights</span>
                </li>
              </ul>
              <button className="w-full py-3 border border-glass-border text-white rounded-xl hover:bg-white/5 font-bold transition-colors text-sm">
                Get Started Free
              </button>
            </div>

            {/* TIER 2: PRO (Recommended) — orange glow + flag accent */}
            <div className="premium-card rounded-3xl relative bg-gradient-to-b from-posta-orange/[0.08] to-transparent border border-posta-orange/40 shadow-[0_0_40px_-10px_rgba(232,93,4,0.3)] transform md:-translate-y-4 overflow-hidden group glow-orange">
              {/* SA flag decorative element on top */}
              <div className="flag-accent absolute top-0 left-0 right-0 rounded-t-3xl overflow-hidden"></div>

              {/* "Most Popular" badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-posta-orange to-amber-600 px-4 py-1.5 rounded-full text-[10px] font-bold border border-white/10 shadow-lg font-mono tracking-wider">
                MOST POPULAR
              </div>

              <div className="mb-6 pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-posta-orange animate-pulse-glow"></div>
                  <h3 className="font-mono text-sm tracking-widest text-posta-orange uppercase font-bold">PRO</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-display font-bold text-white">R{billingCycle === 'monthly' ? '299' : '239'}</span>
                  <span className="text-text-tertiary text-sm">/month</span>
                </div>
                <p className="text-xs text-text-tertiary mt-2">
                  Billed R{billingCycle === 'monthly' ? '299' : '2868'} {billingCycle}
                  {billingCycle === 'annual' && (
                    <span className="text-sa-green ml-1">(Save R720)</span>
                  )}
                </p>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-text-secondary">
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-posta-orange mt-0.5"></i>
                  <span><strong className="text-white">Unlimited</strong> AI posts</span>
                </li>
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-posta-orange mt-0.5"></i>
                  <span>50 image credits / month</span>
                </li>
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-posta-orange mt-0.5"></i>
                  <span>5 social profiles</span>
                </li>
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-posta-orange mt-0.5"></i>
                  <span>Smart scheduling</span>
                </li>
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-posta-orange mt-0.5"></i>
                  <span>All 11 languages</span>
                </li>
              </ul>
              <button className="w-full py-4 bg-gradient-to-r from-posta-orange to-amber-600 text-white rounded-xl hover:scale-[1.02] font-bold transition-all shadow-lg text-sm flex items-center justify-center gap-2">
                Go Pro <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>

            {/* TIER 3: BUSINESS — surge-teal accent */}
            <div className="premium-card rounded-3xl border border-white/5 hover:border-surge-teal/40 transition-all duration-300 group">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-surge-teal"></div>
                  <h3 className="font-mono text-sm tracking-widest text-surge-teal uppercase font-bold">BUSINESS</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-white">R{billingCycle === 'monthly' ? '999' : '799'}</span>
                  <span className="text-text-tertiary text-sm">/month</span>
                </div>
                <p className="text-xs text-text-tertiary mt-2">
                  Billed R{billingCycle === 'monthly' ? '999' : '9588'} {billingCycle}
                  {billingCycle === 'annual' && (
                    <span className="text-surge-teal ml-1">(Save R2400)</span>
                  )}
                </p>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-text-secondary">
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-surge-teal mt-0.5"></i>
                  <span>Everything in Pro</span>
                </li>
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-surge-teal mt-0.5"></i>
                  <span>200 image &amp; video credits</span>
                </li>
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-surge-teal mt-0.5"></i>
                  <span>Unlimited profiles</span>
                </li>
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-surge-teal mt-0.5"></i>
                  <span>Team access (3 people)</span>
                </li>
                <li className="flex gap-3 items-start">
                  <i className="fa-solid fa-check text-surge-teal mt-0.5"></i>
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full py-3 border border-glass-border text-white rounded-xl hover:bg-white/5 font-bold transition-colors text-sm">
                Talk to Sales
              </button>
            </div>
          </div>

          {/* SA stamp below cards */}
          <div className="flex justify-center mt-10">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.02] border border-white/5">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-sa-green"></span>
                <span className="w-2 h-2 rounded-full bg-sa-gold"></span>
                <span className="w-2 h-2 rounded-full bg-sa-red"></span>
                <span className="w-2 h-2 rounded-full bg-sa-blue"></span>
              </div>
              <span className="text-xs text-text-quaternary font-mono">All prices in ZAR (Rands) — 15% VAT may apply</span>
            </div>
          </div>

          {/* Bottom flag accent */}
          <div className="flag-accent mt-12"></div>
        </div>
      </section>

      {/* ═══ CREDIT TOP-UP SECTION (Polar) ═══ */}
      <section id="credits" className="py-24 relative overflow-hidden">
        <div className="pattern-dots-teal absolute inset-0 pointer-events-none opacity-20"></div>
        <div className="glow-orb-teal w-[500px] h-[500px] top-1/2 -translate-y-1/2 right-0 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="premium-card p-10 rounded-3xl border border-white/5 relative overflow-hidden">
            {/* Top SA flag accent */}
            <div className="flag-accent absolute top-0 left-0 right-0"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 pt-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surge-teal/10 border border-surge-teal/20 text-surge-teal text-[10px] font-bold tracking-widest mb-4">
                  <i className="fa-solid fa-bolt"></i>
                  PAY AS YOU GO
                </div>
                <h2 className="font-display font-bold text-3xl mb-3">
                  {translate('credits.title') || 'Need more credits?'}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  {translate('credits.description') || 'Running low on image or video credits? Top up anytime without changing your plan. Secure payments via Polar.'}
                </p>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => console.log('Modal placeholder')}
                    className="px-5 py-3 bg-white/5 border border-glass-border rounded-xl hover:border-posta-orange hover:bg-white/10 transition-all text-sm text-left group"
                  >
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sa-green"></span>
                      100 Credits
                    </div>
                    <div className="text-xs text-text-tertiary">R150.00</div>
                  </button>
                  <button
                    onClick={() => console.log('Modal placeholder')}
                    className="px-5 py-3 bg-white/5 border border-glass-border rounded-xl hover:border-posta-orange hover:bg-white/10 transition-all text-sm text-left group"
                  >
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sa-gold"></span>
                      500 Credits
                    </div>
                    <div className="text-xs text-text-tertiary">R600.00</div>
                  </button>
                  <button
                    onClick={() => console.log('Modal placeholder')}
                    className="px-5 py-3 bg-white/5 border border-glass-border rounded-xl hover:border-posta-orange hover:bg-white/10 transition-all text-sm text-left group"
                  >
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-surge-teal"></span>
                      Video Pack
                    </div>
                    <div className="text-xs text-text-tertiary">R850.00</div>
                  </button>
                </div>
              </div>

              {/* Polar Checkout Preview */}
              <div className="w-full md:w-72 bg-void-elevated border border-border-default rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-border-default">
                  <span className="font-bold text-sm">Preview Checkout</span>
                  <i className="fa-solid fa-lock text-xs text-sa-green"></i>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs text-text-tertiary">
                    <span>100 Credits Pack</span>
                    <span>R150.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-text-tertiary">
                    <span>VAT (15%)</span>
                    <span>R22.50</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-border-default">
                    <span>Total</span>
                    <span>R172.50</span>
                  </div>
                </div>
                <button
                  onClick={() => console.log('Modal placeholder')}
                  className="w-full py-3 bg-gradient-to-r from-posta-orange to-amber-600 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Pay with <span className="font-display italic">Polar</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
