'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PostaLogo from './logo';

interface NavigationProps {
  session: { user?: { name?: string; email?: string; image?: string | null } } | null;
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
    color: 'var(--ink)',
    fontSize: 'var(--step-body)',
    minHeight: 44,
    padding: '10px 4px',
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
  };

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: scrolled ? 'var(--bg)' : 'transparent', borderBottom: scrolled ? '1px solid var(--surface)' : '1px solid transparent', transition: 'background 140ms, border-color 140ms' }}>
      <div style={{ margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Link href="/" style={{ textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
          <PostaLogo size={22} color="var(--ink)" bubbleColor="var(--ink)" dotColor="var(--accent)" />
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" style={linkStyle}>Features</a>
          <a href="#how-it-works" style={linkStyle}>How it works</a>
          <a href="#pricing" style={linkStyle}>Pricing</a>
          <a href="#contact" style={linkStyle}>Contact</a>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <Link href="/dashboard" style={{ color: 'var(--ink)', padding: '8px 16px', minHeight: 44, display: 'inline-flex', alignItems: 'center', border: '1px solid var(--ink)', textDecoration: 'none', fontSize: 'var(--step-body)' }}>Dashboard</Link>
          ) : (
            <>
              <Link href="/login" style={linkStyle}>Log in</Link>
              <Link href="/signup" style={{ color: 'var(--accent-ink)', background: 'var(--accent)', padding: '8px 16px', minHeight: 44, display: 'inline-flex', alignItems: 'center', textDecoration: 'none', fontSize: 'var(--step-body)', fontWeight: 500 }}>Start free</Link>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(v => !v)} style={{ background: 'transparent', border: 'none', color: 'var(--ink)', fontSize: 20, cursor: 'pointer', width: 44, height: 44 }} aria-label="Menu">
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`} />
        </button>
      </div>
      {isMobileMenuOpen && (
        <div style={{ background: 'var(--bg)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, borderBottom: '1px solid var(--surface)' }}>
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)} style={linkStyle}>Features</a>
          <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} style={linkStyle}>How it works</a>
          <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} style={linkStyle}>Pricing</a>
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} style={linkStyle}>Contact</a>
          <Link href="/signup" style={{ ...linkStyle, fontWeight: 500, color: 'var(--accent)' }}>Start free</Link>
        </div>
      )}
    </nav>
  );
}
