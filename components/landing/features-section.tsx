import React from 'react';

/**
 * Features — mirrors `design-system/posta/styleframe/landing.html` section `[data-sf=features]` exactly.
 *
 * The class names are the system's (`ps-*`), not one-off inline styles: the same .ps-card is used here, in
 * pricing, and in the phone mockup. Values live in design-system/posta/library.css, never in this file.
 * Parity is measured by scripts/parity-landing.py — it must report 0 for this section.
 */
const features = [
  { title: 'Writes in 11 languages', body: 'isiZulu, isiXhosa, Afrikaans and eight more. You read every word before it goes out.' },
  { title: 'Four platforms', body: 'Instagram, Facebook, X and LinkedIn from one screen.' },
  { title: 'You approve every post', body: 'Nothing is published without your yes.' },
  { title: 'Schedule ahead', body: 'Pick a day and time in SAST. Posta handles the rest.' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="ps-section ps-paper" data-sf="features">
      <div className="ps-wrap">
        <div className="ps-head" data-sf="features-head">
          <p className="ps-eyebrow">What you get</p>
          <h2 className="ps-h2">What Posta does</h2>
        </div>
        <div className="ps-grid" data-sf="features-grid">
          {features.map((f) => (
            <article className="ps-card" data-sf="feature-card" key={f.title}>
              <h3 className="ps-h3">{f.title}</h3>
              <p className="ps-body ps-muted" style={{ marginTop: 8 }}>
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
