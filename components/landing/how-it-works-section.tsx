import '@/design-system/posta/tokens.css';
import React from 'react';

const steps = [
  { n: '1', title: 'Tell Posta the topic', body: 'One line is enough. "New stock in store this weekend."' },
  { n: '2', title: 'Read the drafts', body: 'Posta writes a post in each language you pick. You read them.' },
  { n: '3', title: 'Approve and schedule', body: 'Approve the ones you want. Posta publishes at the time you set.' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ background: 'var(--posta-clay)', color: 'var(--posta-cream)', padding: '64px 16px' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-h2)', marginBottom: 32 }}>
          How it works
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--posta-cream)',
                  color: 'var(--posta-clay)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {s.n}
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-h3)', marginBottom: 4 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 'var(--text-body)', lineHeight: 'var(--leading-body)', color: 'var(--posta-cream)', opacity: 0.9 }}>
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}