import '@/design-system/posta/tokens.css';
import React from 'react';
import Link from 'next/link';
import PostaLogo from './logo';

interface HeroSectionProps {
  translate?: (key: string) => string;
}

export default function HeroSection({}: HeroSectionProps) {
  return (
    <section
      id="hero"
      style={{
        background: 'var(--posta-clay)',
        color: 'var(--posta-cream)',
        padding: '96px 16px 64px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, maxWidth: 720 }}>
        <PostaLogo size={18} color="var(--posta-cream)" bubbleColor="var(--posta-cream)" />
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'var(--text-display)',
            lineHeight: 'var(--leading-display)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--posta-cream)',
            margin: 0,
          }}
        >
          Just Posta.
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-lg)',
            lineHeight: 'var(--leading-body)',
            color: 'var(--posta-cream)',
            margin: 0,
            maxWidth: '40ch',
          }}
        >
          Posta writes your social posts in all 11 South African languages. You read them, then approve.
        </p>
        <Link
          href="/signup"
          style={{
            background: 'var(--posta-gold)',
            color: 'var(--posta-ink)',
            padding: '14px 32px',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 700,
            fontSize: 'var(--text-body-lg)',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Get started
        </Link>
      </div>

      {/* Phone showing the product */}
      <div
        style={{
          width: 260,
          height: 520,
          background: 'var(--posta-paper)',
          borderRadius: 32,
          boxShadow: 'var(--shadow-sheet)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          color: 'var(--posta-ink)',
        }}
      >
        <div style={{ fontSize: 'var(--text-small)', color: 'var(--posta-ink-soft)', textAlign: 'center' }}>9:41</div>
        <div
          style={{
            background: 'var(--posta-white)',
            borderRadius: 16,
            padding: 12,
            boxShadow: 'var(--shadow-card)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 'var(--text-small)', fontWeight: 500, color: 'var(--posta-ink-soft)' }}>Posta draft</div>
          <p style={{ fontSize: 'var(--text-small)', lineHeight: 1.5, margin: 0 }}>
            Sharp sharp Joburg — new stock in store today. Come through.
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            <button
              style={{
                flex: 1,
                background: 'var(--posta-clay)',
                color: 'var(--posta-cream)',
                border: 'none',
                borderRadius: 999,
                padding: '8px 0',
                minHeight: 44,
                fontWeight: 700,
                fontSize: 'var(--text-small)',
                cursor: 'pointer',
              }}
            >
              Approve
            </button>
            <button
              style={{
                flex: 1,
                background: 'transparent',
                color: 'var(--posta-ink)',
                border: '1px solid var(--posta-line)',
                borderRadius: 999,
                padding: '8px 0',
                minHeight: 44,
                fontSize: 'var(--text-small)',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}