import React from 'react';

/**
 * How it works — mirrors `[data-sf=how]` in design-system/posta/styleframe/landing.html.
 * A clay band between two paper sections: the page breathes, and the eye knows a new idea started.
 */
const steps = [
  { n: '1', title: 'Tell Posta the topic', body: 'One line is enough. “New stock in store this weekend.”' },
  { n: '2', title: 'Read the drafts', body: 'Posta writes a post in each language you pick. You read them.' },
  { n: '3', title: 'Approve and schedule', body: 'Approve the ones you want. Posta publishes at the time you set.' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="ps-section ps-clay" data-sf="how">
      <div className="ps-wrap">
        <div className="ps-head" data-sf="how-head">
          <p className="ps-eyebrow">Three steps</p>
          <h2 className="ps-h2">How it works</h2>
        </div>
        <div className="ps-stack ps-gap-32" data-sf="steps">
          {steps.map((s) => (
            <div className="ps-row ps-gap-16" data-sf="step" key={s.n}>
              <div className="ps-step">{s.n}</div>
              <div>
                <h3 className="ps-h3">{s.title}</h3>
                <p className="ps-body ps-muted" style={{ marginTop: 4 }}>
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
