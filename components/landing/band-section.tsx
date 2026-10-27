import React from 'react';

/* A full-bleed statement band — Nike's second move: one photograph across the whole width, a short
 * uppercase line on it, nothing else. It exists to give the page a breath between the board sections
 * and a second place where the pictures carry the colour.
 */

const PHOTO = '/photos/09-street-vendor-joubert-street-johannesbur.jpg';
const ALT = 'A street vendor at his stand on Joubert Street in downtown Johannesburg, goods laid out in front of him';

export default function BandSection() {
  return (
    <section className="band" data-sf="band">
      <div className="band-media">
        <img src={PHOTO} alt={ALT} width={1600} height={900} loading="lazy" />
        <div className="band-scrim" aria-hidden="true" />
      </div>
      <div className="band-copy">
        <h2>About a day to write it. Two minutes to approve it.</h2>
        <p>
          Tell Posta what you want to say. It writes the post in the languages your customers speak, and holds
          it until you say yes. Credits are spent only when a post publishes, never on a draft.
        </p>
      </div>
    </section>
  );
}
