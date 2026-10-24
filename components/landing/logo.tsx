import React from 'react';

/**
 * The Posta lockup: wordmark + speech-bubble full stop.
 *
 * The bubble path is copied from the design system, NOT redrawn — the mark is locked (see
 * design-system/posta/07-logo.md). The tail points LEFT so the bubble speaks into the word, tip facing the
 * final "a". It is mirrored with an SVG transform rather than re-plotting the bezier by hand, because a
 * hand-mirrored path is where mistakes hide.
 *
 * Geometry: the bubble is 0.4 of the type size, hung on the baseline exactly where a full stop belongs,
 * tight to the last letter. The translateY nudge compensates for the fact that a flex box's bottom edge is
 * NOT the bubble's visual bottom — measured, not guessed.
 */
interface LogoProps {
  size?: number;
  color?: string;
  bubbleColor?: string;
  dotColor?: string;
  showWordmark?: boolean;
}

const BUBBLE_PATH =
  'M48 9C25 9 9 24 9 44c0 21 17 35 39 35 4 0 8-.5 11.5-1.4l17 10-4.5-18C80 63 88 54 88 44 88 24 71 9 48 9z';

export default function PostaLogo({
  size = 24,
  color = 'var(--posta-cream)',
  bubbleColor = 'var(--posta-cream)',
  dotColor = 'var(--posta-gold)',
  showWordmark = true,
}: LogoProps) {
  const bubbleSize = Math.round(size * 0.4);
  return (
    <span className="inline-flex items-baseline" style={{ gap: 0, lineHeight: 1 }}>
      {showWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: size,
            letterSpacing: '-0.045em',
            color,
            lineHeight: 1,
          }}
        >
          posta
        </span>
      )}
      <svg
        width={bubbleSize}
        height={bubbleSize}
        viewBox="0 0 100 100"
        aria-hidden="true"
        style={{ marginLeft: 2, transform: `translateY(${Math.round(size * 0.06)}px)`, flex: 'none' }}
      >
        <g transform="translate(100,0) scale(-1,1)">
          <path
            d={BUBBLE_PATH}
            fill="none"
            stroke={bubbleColor}
            strokeWidth={11}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="48" cy="43" r="9" fill={dotColor} />
        </g>
      </svg>
    </span>
  );
}
