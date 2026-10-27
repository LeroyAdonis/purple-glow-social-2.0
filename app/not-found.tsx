import Link from 'next/link';
import type { Metadata } from 'next';

import '@/design-system/posta/tokens.css';

export const metadata: Metadata = {
  title: 'Page not found | Posta',
  description: 'This page does not exist.',
};

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--posta-paper)', color: 'var(--posta-ink)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-display)', color: 'var(--posta-clay)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-h2)', margin: '16px 0 8px' }}>Page not found</h1>
        <p style={{ color: 'var(--posta-ink-soft)', marginBottom: 24 }}>That link does not go anywhere. It may have moved.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ background: 'var(--posta-gold)', color: 'var(--posta-cream)', padding: '12px 24px', borderRadius: 'var(--radius-pill)', fontWeight: 700, textDecoration: 'none' }}>Go home</Link>
          <Link href="/login" style={{ color: 'var(--posta-clay)', padding: '12px 24px', textDecoration: 'underline' }}>Sign in</Link>
        </div>
        <p style={{ marginTop: 24, fontSize: 'var(--text-small)', color: 'var(--posta-ink-soft)' }}>
          Need help? <a href="mailto:leroy@digitalwavetech.dev" style={{ color: 'var(--posta-clay)', textDecoration: 'underline' }}>leroy@digitalwavetech.dev</a>
        </p>
      </div>
    </div>
  );
}