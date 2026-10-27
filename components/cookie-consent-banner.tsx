'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

type CookieConsent = {
  essential: boolean;
  analytics: boolean;
  personalization: boolean;
  timestamp: string;
};

const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [preferences, setPreferences] = useState<CookieConsent>({
    essential: true, // Always enabled
    analytics: false,
    personalization: false,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('pgs-cookie-consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Reserve exactly the bar's height on whichever edge it occupies, so page content can always be
  // scrolled clear of it. The bar is position:fixed and, on a 390x844 phone, it is tall enough to sit
  // over the signup form's own submit button - measured, with a real click landing on the banner instead
  // of the button. It now anchors to the TOP on phones (the submit button lives near the bottom of the
  // screen) and to the BOTTOM from md up, so the reservation has to follow it rather than assume bottom.
  const syncBodyPadding = useCallback(() => {
    const el = bannerRef.current;
    if (!el) return;
    const isPhone = window.innerWidth < 768;
    document.body.style.paddingTop = isPhone ? `${el.offsetHeight}px` : '';
    document.body.style.paddingBottom = isPhone ? '' : `${el.offsetHeight}px`;
  }, []);

  useEffect(() => {
    if (!showBanner) return;

    const el = bannerRef.current;
    if (!el) return;

    const previousPadding = document.body.style.paddingBottom;
    const previousTopPadding = document.body.style.paddingTop;
    syncBodyPadding();

    // Keep the reserved space in sync when the banner resizes (orientation
    // change, font load, switching between main and customize views).
    const observer = new ResizeObserver(() => syncBodyPadding());
    observer.observe(el);
    window.addEventListener('resize', syncBodyPadding);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncBodyPadding);
      document.body.style.paddingBottom = previousPadding;
      document.body.style.paddingTop = previousTopPadding;
    };
  }, [showBanner, syncBodyPadding]);

  const saveConsent = (consent: CookieConsent) => {
    localStorage.setItem('pgs-cookie-consent', JSON.stringify(consent));
    setShowBanner(false);
    setShowCustomize(false);

    // Dispatch custom event for analytics tools to listen to
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: consent }));
  };

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      essential: true,
      analytics: true,
      personalization: true,
      timestamp: new Date().toISOString(),
    };
    saveConsent(consent);
  };

  const handleRejectOptional = () => {
    const consent: CookieConsent = {
      essential: true,
      analytics: false,
      personalization: false,
      timestamp: new Date().toISOString(),
    };
    saveConsent(consent);
  };

  const handleSaveCustom = () => {
    const consent: CookieConsent = {
      ...preferences,
      essential: true, // Always true
      timestamp: new Date().toISOString(),
    };
    saveConsent(consent);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Consent bar — compact and flat (the 2026-10-27 rebrand). Anchors to the TOP on phones and
          to the BOTTOM from md up, exactly as syncBodyPadding reserves space; for months the class
          said bottom-0 while the padding logic assumed a top anchor, so phones got a bar at the
          bottom AND a band of empty page pushed down from above. Non-modal: no backdrop, page
          content stays readable; the POPIA detail sits one line in, and every per-category choice
          is still exposed in the Customise view on every screen size. */}
      <div
        ref={bannerRef}
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
        className="cookie-dock fixed inset-x-0 top-0 z-[9999] md:top-auto md:bottom-0"
      >
        <div className="animate-slide-up" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
          {!showCustomize ? (
          <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '12px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 24px' }}>
            <div style={{ minWidth: 0, flex: '1 1 260px' }}>
              <h2 id="cookie-banner-title" style={{ fontSize: 'var(--step-body)', fontWeight: 500, margin: 0 }}>
                Your Privacy Matters
              </h2>
              <p id="cookie-banner-description" style={{ fontSize: 'var(--step-small)', margin: '2px 0 0', maxWidth: '60ch', opacity: 0.78 }}>
                Cookies keep you logged in. You choose the rest. We follow South Africa&rsquo;s POPIA (Protection of Personal Information Act).
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', alignItems: 'center' }}>
              <a href="/privacy" style={{ color: 'var(--bg)', fontSize: 'var(--step-small)', minHeight: 44, display: 'inline-flex', alignItems: 'center', textDecoration: 'underline' }}>Privacy Policy</a>
              <a href="/cookies" style={{ color: 'var(--bg)', fontSize: 'var(--step-small)', minHeight: 44, display: 'inline-flex', alignItems: 'center', textDecoration: 'underline' }}>Cookie Policy</a>
              <a href="/terms" style={{ color: 'var(--bg)', fontSize: 'var(--step-small)', minHeight: 44, display: 'inline-flex', alignItems: 'center', textDecoration: 'underline' }}>Terms of Service</a>
            </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={handleAcceptAll}
                style={{ background: 'var(--accent)', color: 'var(--accent-ink)', height: 44, padding: '0 20px', fontSize: 'var(--step-body)', fontWeight: 500, border: 'none', cursor: 'pointer' }}
              >
                Accept All
              </button>
              <button
                onClick={handleRejectOptional}
                style={{ background: 'transparent', color: 'var(--bg)', height: 44, padding: '0 12px', fontSize: 'var(--step-small)', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Only Essential
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                style={{ background: 'transparent', color: 'var(--bg)', height: 44, padding: '0 12px', fontSize: 'var(--step-small)', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Customise
              </button>
            </div>
          </div>
          ) : (
          /* Customise view — every per-category choice on every screen size, on the same flat ink
              ground; toggles are square because the direction allows one radius anywhere on the page. */
          <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '16px 16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
              <h2 style={{ fontSize: 'var(--step-body)', fontWeight: 500, margin: 0 }}>Choose your cookie settings</h2>
              <button
                onClick={() => setShowCustomize(false)}
                style={{ background: 'transparent', color: 'var(--bg)', minHeight: 44, padding: '0 8px', fontSize: 'var(--step-small)', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                aria-label="Go back to the main choices"
              >
                Back
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              {[
                { key: 'essential', name: 'Essential', body: 'Needed for logging in and keeping the app working. These cannot be turned off.', locked: true, on: true },
                { key: 'analytics', name: 'Analytics', body: 'Helps us see which features people use so we can make things better. Data is anonymised.', locked: false, on: preferences.analytics },
                { key: 'personalization', name: 'Personalisation', body: 'Remembers your language choice and settings so everything looks right when you come back.', locked: false, on: preferences.personalization },
              ].map((c) => (
                <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, background: 'rgba(255,255,255,0.08)', padding: '12px 16px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--step-small)', fontWeight: 500, margin: 0 }}>{c.name}{c.locked ? ' — always on' : ''}</p>
                    <p style={{ fontSize: 'var(--step-small)', margin: '4px 0 0', opacity: 0.78 }}>{c.body}</p>
                  </div>
                  <button
                    onClick={c.locked ? undefined : () => setPreferences({ ...preferences, [c.key]: !preferences[c.key as 'analytics' | 'personalization'] })}
                    aria-pressed={c.on}
                    aria-label={`Turn ${c.on ? 'off' : 'on'} ${c.name} cookies`}
                    disabled={c.locked}
                    style={{ background: c.locked ? 'rgba(255,255,255,0.25)' : c.on ? 'var(--accent)' : 'rgba(255,255,255,0.25)', color: 'var(--bg)', height: 44, minWidth: 64, padding: '0 12px', fontSize: 'var(--step-small)', fontWeight: 500, border: 'none', cursor: c.locked ? 'not-allowed' : 'pointer', opacity: c.locked ? 0.6 : 1 }}
                  >
                    {c.on ? 'On' : 'Off'}
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
              <button
                onClick={handleSaveCustom}
                style={{ background: 'var(--accent)', color: 'var(--accent-ink)', height: 44, padding: '0 24px', fontSize: 'var(--step-body)', fontWeight: 500, border: 'none', cursor: 'pointer' }}
              >
                Save my choice
              </button>
              <p style={{ fontSize: 'var(--step-small)', margin: 0, opacity: 0.78 }}>You can change this anytime.</p>
            </div>
          </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up { animation: none; }
        }
      `}</style>
    </>
  );
};

export default CookieConsentBanner;
