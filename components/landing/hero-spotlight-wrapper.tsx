'use client';

/**
 * HeroSpotlightWrapper
 * Client component wrapper that adds the interactive Spotlight effect
 * to the hero section's visual column.
 */

import Spotlight from '@/components/ui/spotlight';

export default function HeroSpotlightWrapper() {
  return (
    <Spotlight
      fill="#E85D04"
      size={500}
      opacity={0.06}
    />
  );
}
