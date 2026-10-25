'use client';

import Link from 'next/link';
import PostaLogo from './logo';

/**
 * Phone-First hero — a direct port of the approved styleframe at
 * `sketches/003-phone-first/index.html`, not a redesign of it.
 *
 * Rules for anyone editing this file:
 * - Every number here exists in that styleframe. If you change one, change the styleframe too or you have
 *   broken the contract the direction was approved against.
 * - Copy is identical to the styleframe, including the isiZulu draft. Do not "improve" the words: the words
 *   are the design.
 * - The only deliberate deviations are accessibility fixes, each marked DEVIATION below. The styleframe's own
 *   muted grey (#9A8578) fails AA on paper at 12px, so the muted text uses --posta-ink-soft instead.
 * - Parity is measured, not eyeballed: `python3 scripts/parity-phone-first.py` prints the diff table and writes
 *   sketches/parity-phone-first/compare.png. It must report 0 differences on layout, type and material.
 */
export default function HeroSection() {
  return (
    <section data-pf="hero" data-sf="hero" style={{ background: 'var(--posta-clay)', color: 'var(--posta-cream)' }}>
      <div className="pf-page" data-pf="page" data-sf="page">
        <div className="pf-copy" data-pf="copy" data-sf="copy">
          {/* The styleframe's `.mark`: a 26px lockup with a 64px drop to the eyebrow. That pair of numbers is
              the 98px that made every line of copy sit 49px high when it was missing. Only the position and the
              size are the styleframe's — the mark itself is our locked drawn bubble, not the styleframe's gold
              full stop, because a stock or re-invented mark is not our brand. */}
          <div className="pf-mark" data-pf="mark" data-sf="mark">
            <PostaLogo size={26} color="var(--posta-cream)" bubbleColor="var(--posta-gold)" />
          </div>

          <div className="pf-eyebrow" data-pf="eyebrow" data-sf="eyebrow">
            Made for one phone and a busy day
          </div>

          <h1 className="pf-h1" data-pf="h1" data-sf="h1">
            Sharp sharp.
            <br />
            Your posts
            <br />
            are <u>ready</u>.
          </h1>

          <p className="pf-sub" data-pf="sub" data-sf="sub">
            Posta drafts in isiZulu, Afrikaans, Sesotho and eight more. You read it, you say yes, it posts. No
            laptop needed.
          </p>

          <div className="pf-cta" data-sf="cta">
            <Link href="/signup" className="pf-primary" data-pf="primary" data-sf="primary">
              Start free
            </Link>
            <a href="#how-it-works" className="pf-link" data-pf="link" data-sf="link">
              See a real draft
            </a>
          </div>
        </div>

        <div className="pf-phone" data-pf="phone" data-sf="phone">
          <div className="pf-screen" data-pf="screen" data-sf="screen">
            <div className="pf-sbar">
              <span>09:12</span>
              <span>SAST</span>
            </div>

            <div className="pf-stitle">Tuesday&rsquo;s three posts</div>
            <div className="pf-stime">Ready to approve</div>

            <div className="pf-draft" data-pf="draft" data-sf="draft">
              <div className="pf-lab">Draft &middot; isiZulu</div>
              <p>
                &ldquo;Isinkwa esisha siphuma ngo-7. Woza masinyane &mdash; amavetkoek aphela
                ngokushesha.&rdquo;
              </p>
              <div className="pf-chips">
                <span className="on">isiZulu</span>
                <span>English</span>
                <span>Afrikaans</span>
              </div>
            </div>

            <div className="pf-slots">
              <div className="pf-slot" data-pf="slot" data-sf="slot">
                <span>07:00 &middot; Instagram</span>
                <em>Ready</em>
              </div>
              <div className="pf-slot" data-pf="slot" data-sf="slot">
                <span>12:30 &middot; Facebook</span>
                <em>Ready</em>
              </div>
              {/* A link, not a fake button: the styleframe's gold row is a call to action, and rendering it as
                  a button that says "approved" would claim a capability the marketing page does not have. */}
              <Link href="/signup" className="pf-slot pf-slot-go" data-pf="slot" data-sf="slot-go">
                Approve all three
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
