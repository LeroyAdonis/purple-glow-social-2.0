'use client';

import '@/design-system/posta/tokens.css';

import React from 'react';
import Link from 'next/link';

const plans = [
  { name: 'Free', price: 'R0', note: '10 credits, 5 scheduled posts', cta: 'Start free' },
  { name: 'Pro', price: 'R299', note: '500 credits, 50 scheduled posts, 5 automation rules', cta: 'Choose Pro' },
  { name: 'Business', price: 'R999', note: '2000 credits, 200 scheduled posts, 20 automation rules', cta: 'Choose Business' },
];

export default function PricingSection() {
  return (
    <section id="pricing" style={{ background: 'var(--posta-paper)', color: 'var(--posta-ink)', padding: '64px 16px' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-h2)', marginBottom: 32 }}>
          Pricing
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {plans.map((p) => (
            <div
              key={p.name}
              style={{
                background: 'var(--posta-white)',
                borderRadius: 'var(--radius-md)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-h3)', margin: 0 }}>{p.name}</h3>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-h1)' }}>{p.price}<span style={{ fontSize: 'var(--text-small)', fontWeight: 400, color: 'var(--posta-ink-soft)' }}>/month</span></div>
              <p style={{ fontSize: 'var(--text-body)', color: 'var(--posta-ink-soft)', margin: 0 }}>{p.note}</p>
              <Link
                href="/signup"
                style={{
                  marginTop: 8,
                  background: 'var(--posta-clay)',
                  color: 'var(--posta-cream)',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  fontSize: 'var(--text-body)',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}