'use client';

/**
 * Pricing Section Component
 * Client Component - Displays pricing tiers with monthly/annual billing toggle
 * and credit top-up options powered by Polar.sh
 */

import React, { useState } from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function PricingSection() {
  const { t: translate } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <>
      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-display font-bold text-4xl mb-2">{translate('pricing.title')}</h2>
              <p className="text-gray-400">{translate('pricing.subtitle')}</p>
            </div>

            <div className="bg-white/5 p-1 rounded-xl flex border border-glass-border">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                {translate('pricing.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'annual' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                {translate('pricing.annual')} <span className="text-[10px] text-neon-grape ml-1">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* TIER 1: FREE */}
            <div className="aerogel-card p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all">
              <div className="mb-6">
                <h3 className="font-mono text-sm tracking-widest text-gray-500 uppercase mb-2">FREE</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-white">R0</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex gap-3"><i className="fa-solid fa-check text-gray-500"></i> 5 AI posts per month</li>
                <li className="flex gap-3"><i className="fa-solid fa-check text-gray-500"></i> 1 social profile</li>
                <li className="flex gap-3"><i className="fa-solid fa-check text-gray-500"></i> Email support</li>
                <li className="flex gap-3"><i className="fa-solid fa-check text-gray-500"></i> Basic insights</li>
              </ul>
              <button className="w-full py-3 border border-glass-border text-white rounded-xl hover:bg-white/5 font-bold transition-colors">
                Get Started Free
              </button>
            </div>

            {/* TIER 2: PRO (Highlighted) */}
            <div className="aerogel-card p-8 rounded-3xl border border-neon-grape/50 relative bg-neon-grape/5 shadow-[0_0_40px_-10px_rgba(157,78,221,0.3)] transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-neon-grape to-electric-indigo px-4 py-1 rounded-full text-xs font-bold border border-white/20 shadow-lg whitespace-nowrap">
                MOST POPULAR
              </div>
              <div className="mb-6">
                <h3 className="font-mono text-sm tracking-widest text-neon-grape uppercase mb-2">PRO</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-display font-bold text-white">R299</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Billed R{billingCycle === 'monthly' ? '299' : '3588'} {billingCycle}</p>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-gray-200">
                <li className="flex gap-3"><i className="fa-solid fa-check text-neon-grape"></i> <strong>Unlimited</strong> AI posts</li>
                <li className="flex gap-3"><i className="fa-solid fa-check text-neon-grape"></i> 50 image credits / month</li>
                <li className="flex gap-3"><i className="fa-solid fa-check text-neon-grape"></i> 5 social profiles</li>
                <li className="flex gap-3"><i className="fa-solid fa-check text-neon-grape"></i> Smart scheduling</li>
                <li className="flex gap-3"><i className="fa-solid fa-check text-neon-grape"></i> All 11 languages</li>
              </ul>
              <button className="w-full py-4 bg-white text-black rounded-xl hover:scale-105 font-bold transition-transform shadow-lg">
                Go Pro
              </button>
            </div>

            {/* TIER 3: BUSINESS */}
            <div className="aerogel-card p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all">
              <div className="mb-6">
                <h3 className="font-mono text-sm tracking-widest text-joburg-teal uppercase mb-2">BUSINESS</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-white">R999</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex gap-3"><i className="fa-solid fa-check text-joburg-teal"></i> Everything in Pro</li>
                <li className="flex gap-3"><i className="fa-solid fa-check text-joburg-teal"></i> 200 image & video credits</li>
                <li className="flex gap-3"><i className="fa-solid fa-check text-joburg-teal"></i> Unlimited profiles</li>
                <li className="flex gap-3"><i className="fa-solid fa-check text-joburg-teal"></i> Team access (3 people)</li>
                <li className="flex gap-3"><i className="fa-solid fa-check text-joburg-teal"></i> Priority support</li>
              </ul>
              <button className="w-full py-3 border border-glass-border text-white rounded-xl hover:bg-white/5 font-bold transition-colors">
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Top-up (Polar UI Simulation) */}
      <section id="credits" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="aerogel-card p-10 rounded-3xl border-t border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-joburg-teal opacity-10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest mb-4">
                  PAY AS YOU GO
                </div>
                <h2 className="font-display font-bold text-3xl mb-3">Need more credits?</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Running low on image or video credits? Top up anytime without changing your plan. Secure payments via Polar.
                </p>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => console.log('Modal placeholder')}
                    className="px-4 py-3 bg-white/5 border border-glass-border rounded-xl hover:border-neon-grape hover:bg-white/10 transition-all text-sm text-left"
                  >
                    <div className="font-bold text-white">100 Credits</div>
                    <div className="text-xs text-gray-400">R150.00</div>
                  </button>
                  <button
                    onClick={() => console.log('Modal placeholder')}
                    className="px-4 py-3 bg-white/5 border border-glass-border rounded-xl hover:border-neon-grape hover:bg-white/10 transition-all text-sm text-left"
                  >
                    <div className="font-bold text-white">500 Credits</div>
                    <div className="text-xs text-gray-400">R600.00</div>
                  </button>
                  <button
                    onClick={() => console.log('Modal placeholder')}
                    className="px-4 py-3 bg-white/5 border border-glass-border rounded-xl hover:border-neon-grape hover:bg-white/10 transition-all text-sm text-left"
                  >
                    <div className="font-bold text-white">Video Pack</div>
                    <div className="text-xs text-gray-400">R850.00</div>
                  </button>
                </div>
              </div>

              <div className="w-full md:w-72 bg-void border border-glass-border rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-glass-border">
                  <span className="font-bold text-sm">Preview Checkout</span>
                  <i className="fa-solid fa-lock text-xs text-green-500"></i>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>100 Credits Pack</span>
                    <span>R150.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>VAT (15%)</span>
                    <span>R22.50</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-glass-border">
                    <span>Total</span>
                    <span>R172.50</span>
                  </div>
                </div>
                <button
                  onClick={() => console.log('Modal placeholder')}
                  className="w-full py-3 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  Pay with <span className="font-display italic">Polar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
