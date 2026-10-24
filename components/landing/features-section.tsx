import '@/design-system/posta/tokens.css';
import React from 'react';

const features = [
  { title: 'Writes in 11 languages', body: 'isiZulu, isiXhosa, Afrikaans and eight more. You read every word before it goes out.' },
  { title: 'Four platforms', body: 'Instagram, Facebook, X and LinkedIn from one screen.' },
  { title: 'You approve every post', body: 'Nothing is published without your yes.' },
  { title: 'Schedule ahead', body: 'Pick a day and time in SAST. Posta handles the rest.' },
];

export default function FeaturesSection() {
  return (
    <section id="features" style={{ background: 'var(--posta-paper)', color: 'var(--posta-ink)', padding: '64px 16px' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-h2)', marginBottom: 32 }}>
          What Posta does
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: 'var(--posta-white)',
                borderRadius: 'var(--radius-md)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-h3)', marginBottom: 8 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 'var(--text-body)', lineHeight: 'var(--leading-body)', color: 'var(--posta-ink-soft)' }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}