'use client';
import React from 'react';
import Link from 'next/link';
import '@/components/landing/board.css';
import Reveal from './reveal';

const plans = [
  { name: 'Free', price: 'R0', note: '10 credits. 5 scheduled posts.', cta: 'Start free', bg: '#f4f4f4', ink: '#111111', strip: '#d0d0d0', stripInk: '#111111', h: 360 },
  { name: 'Pro', price: 'R299', note: '500 credits. 50 scheduled posts. 5 automation rules.', cta: 'Choose Pro', bg: '#1a4be0', ink: '#ffffff', strip: '#153bb8', stripInk: '#ffffff', h: 480 },
  { name: 'Business', price: 'R999', note: '2000 credits. 200 scheduled posts. 20 automation rules.', cta: 'Choose Business', bg: '#111111', ink: '#ffffff', strip: '#000000', stripInk: '#ffffff', h: 600 },
];

export default function PricingSection() {
  return (
    <section id="pricing" data-sf="pricing" style={{ background: 'var(--bg)', color: 'var(--ink)', padding: '120px 16px 0' }}>
      <Reveal delay={0}>
        <h2 style={{ fontSize: 'var(--step-head)', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 0.9, margin: '0 0 24px', maxWidth: '20ch' }}>Pay in rands, cancel any time</h2>
      </Reveal>
      <div className="pricing-row" data-sf="pricing-grid">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 80} className="price-tile" style={{ background: p.bg, color: p.ink, height: p.h }}>
            <div className="name">{p.name}</div>
            <div className="price">{p.price}<span style={{ fontSize: 'var(--step-body)', fontWeight: 400, marginLeft: 8 }}>/month</span></div>
            <div className="inc">{p.note}</div>
            <Link href="/signup" className="btnstrip" style={{ background: p.strip, color: p.stripInk }}>{p.cta}</Link>
          </Reveal>
        ))}
      </div>
      <p style={{ marginTop: 16, fontSize: 'var(--step-small)', color: 'var(--muted)', maxWidth: '60ch' }}>No VAT. Credits are spent only when a post actually publishes.</p>
    </section>
  );
}
