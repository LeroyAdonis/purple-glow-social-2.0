'use client';

import '@/design-system/posta/tokens.css';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PostaLogo from './logo';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkStyle: React.CSSProperties = {
    color: 'var(--posta-cream)',
    fontSize: 14,
    fontWeight: 400,
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled ? 'var(--posta-clay-deep)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--posta-clay-deep)' : '1px solid transparent',
        transition: 'background 140ms, border-color 140ms',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--page-max)',
          margin: '0 auto',
          padding: '0 16px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
          <PostaLogo size={22} color="var(--posta-cream)" bubbleColor="var(--posta-cream)" />
        </Link>

        {/* Desktop nav: at most 4 items */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" style={linkStyle}>Features</a>
          <a href="#how-it-works" style={linkStyle}>How it works</a>
          <a href="#pricing" style={linkStyle}>Pricing</a>
          <a href="#contact" style={linkStyle}>Contact</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              style={{
                color: 'var(--posta-cream)',
                padding: '10px 20px',
                border: '1px solid var(--posta-cream)',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ ...linkStyle, fontWeight: 500 }}>Log in</Link>
              <Link
                href="/signup"
                style={{
                  color: 'var(--posta-cream)',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--posta-cream)',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--posta-cream)',
            fontSize: 20,
            cursor: 'pointer',
            width: 44,
            height: 44,
          }}
          aria-label="Menu"
        >
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`} />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          style={{
            background: 'var(--posta-clay-deep)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)} style={linkStyle}>Features</a>
          <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} style={linkStyle}>How it works</a>
          <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} style={linkStyle}>Pricing</a>
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} style={linkStyle}>Contact</a>
          <Link href="/signup" style={{ ...linkStyle, fontWeight: 700, color: 'var(--posta-cream)' }}>Get started</Link>
        </div>
      )}
    </nav>
  );
}