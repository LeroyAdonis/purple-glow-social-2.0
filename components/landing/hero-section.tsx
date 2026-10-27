'use client';
import React from 'react';
import Link from 'next/link';
import '@/components/landing/board.css';
import PostaLogo from './logo';

/* Nike-based hero: ONE photograph, edge to edge, the statement sitting on it.
 *
 * The previous hero was a six-column sheet of fifteen cropped frames with coloured caption strips. It
 * measured clean and still read as a mood board: too many small pictures, no single image to look at.
 * Nike's homepage puts four full-bleed photographs on the whole page and lets each one carry a
 * sentence. This is that: one picture (a Johannesburg street vendor — the customer), one statement,
 * one action.
 *
 * One markup for every width. The old desktop/mobile split was what produced two hero panels and two
 * h1 elements in the same document.
 */

const HERO_PHOTO = '/photos/05-local-bakery-awesome-bread-5229115656-jp.jpg';
const HERO_ALT = 'A baker sliding a tray of fresh loaves into the oven at a small South African bakery';

export default function HeroSection() {
  return (
    <section className="hero" data-sf="hero">
      <div className="hero-media">
        <img src={HERO_PHOTO} alt={HERO_ALT} width={1600} height={2000} fetchPriority="high" />
        <div className="hero-scrim" aria-hidden="true" />
      </div>

      <div className="hero-copy">
        <PostaLogo size={30} color="var(--bg)" bubbleColor="var(--bg)" dotColor="var(--accent)" />
        <h1>Social posts, written for you.</h1>
        <p className="hero-sub">
          Posta writes in all 11 South African languages, for Instagram, Facebook, X and LinkedIn. You read
          each post, then approve it. Nothing publishes without you.
        </p>
        <div className="hero-actions">
          <Link href="/signup" className="action">Start free</Link>
          <a href="#how-it-works" className="hero-link">See a real draft</a>
        </div>
      </div>
    </section>
  );
}
