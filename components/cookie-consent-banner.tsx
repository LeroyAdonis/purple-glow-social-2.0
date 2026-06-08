'use client';

import React, { useState, useEffect } from 'react';

type CookieConsent = {
  essential: boolean;
  analytics: boolean;
  personalization: boolean;
  timestamp: string;
};

const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        aria-hidden="true"
      />

      {/* Banner */}
      <div
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
        className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 animate-slide-up"
      >
        <div className="max-w-6xl mx-auto bg-pretoria-blue border border-glass-border rounded-2xl shadow-2xl overflow-hidden">
          {!showCustomize ? (
            // Main Banner View
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-neon-grape/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-cookie-bite text-neon-grape text-xl"></i>
                </div>
                <div className="flex-1">
                  <h2 
                    id="cookie-banner-title"
                    className="text-xl md:text-2xl font-display font-bold text-white mb-3"
                  >
                    🍪 Your Privacy Matters
                  </h2>
                  <p 
                    id="cookie-banner-description"
                    className="text-gray-300 text-sm md:text-base leading-relaxed"
                  >
                    Purple Glow Social uses cookies to keep you logged in and make the app work properly. 
                    That's it. We also offer optional cookies that help us improve — but you choose. 
                    We follow South Africa's <strong className="text-white">POPIA (Protection of Personal Information Act)</strong>.
                  </p>
                </div>
              </div>

              {/* Cookie Categories Info */}
              <div className="mb-6 p-4 bg-void/50 rounded-lg border border-glass-border">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <i className="fas fa-shield-check text-joburg-teal text-sm"></i>
                      <span className="font-semibold text-white">Essential</span>
                    </div>
                    <p className="text-gray-400 text-xs">Keeps you logged in and the app running. Always on.</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <i className="fas fa-chart-line text-neon-grape text-sm"></i>
                      <span className="font-semibold text-white">Analytics</span>
                    </div>
                    <p className="text-gray-400 text-xs">Help us see what people use most so we can improve.</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <i className="fas fa-sparkles text-mzansi-gold text-sm"></i>
                      <span className="font-semibold text-white">Personalisation</span>
                    </div>
                    <p className="text-gray-400 text-xs">Remembers your language and preferences.</p>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="mb-6 flex flex-wrap gap-4 text-sm">
                <a 
                  href="/legal/privacy-policy" 
                  className="text-joburg-teal hover:text-joburg-teal/80 transition-colors underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-file-contract mr-1"></i>
                  Privacy Policy
                </a>
                <a 
                  href="/legal/cookie-policy" 
                  className="text-joburg-teal hover:text-joburg-teal/80 transition-colors underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-cookie mr-1"></i>
                  Cookie Policy
                </a>
                <a 
                  href="/legal/terms" 
                  className="text-joburg-teal hover:text-joburg-teal/80 transition-colors underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-gavel mr-1"></i>
                  Terms of Service
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-grape to-joburg-teal text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-neon-grape/50 transition-all duration-300"
                >
                  <i className="fas fa-check mr-2"></i>
                  Accept All
                </button>
                <button
                  onClick={handleRejectOptional}
                  className="flex-1 px-6 py-3 bg-void/80 text-white font-semibold rounded-lg border border-glass-border hover:bg-void hover:border-white/30 transition-all duration-300"
                >
                  <i className="fas fa-times mr-2"></i>
                  Only Essential
                </button>
                <button
                  onClick={() => setShowCustomize(true)}
                  className="flex-1 px-6 py-3 bg-void/80 text-white font-semibold rounded-lg border border-glass-border hover:bg-void hover:border-white/30 transition-all duration-300"
                >
                  <i className="fas fa-sliders-h mr-2"></i>
                  Customise
                </button>
              </div>

              {/* POPIA Compliance Statement */}
              <p className="mt-4 text-xs text-gray-500 text-center">
                <i className="fas fa-flag mr-1"></i>
                We follow South Africa's privacy law (POPIA Act 4 of 2013)
              </p>
            </div>
          ) : (
            // Customize View
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                  <i className="fas fa-sliders-h mr-2 text-neon-grape"></i>
                  Choose Your Cookie Settings
                </h2>
                <button
                  onClick={() => setShowCustomize(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Go back"
                >
                  <i className="fas fa-arrow-left text-xl"></i>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Essential Cookies */}
                <div className="p-4 bg-void/50 rounded-lg border border-glass-border">
                  <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-shield-check text-joburg-teal"></i>
                      <h3 className="font-semibold text-white">Essential</h3>
                      <span className="px-2 py-0.5 bg-joburg-teal/20 text-joburg-teal text-xs rounded-full">
                        Always On
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Needed for logging in and keeping the app working. These can't be turned off.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Examples: login session, security tokens
                    </p>
                  </div>
                    <div className="ml-4">
                      <div className="w-12 h-6 bg-joburg-teal rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-50">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="p-4 bg-void/50 rounded-lg border border-glass-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-chart-line text-neon-grape"></i>
                        <h3 className="font-semibold text-white">Analytics</h3>
                      </div>
                      <p className="text-sm text-gray-400">
                        Help us see which features people use so we can make things better. Data is anonymised.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Examples: page views, feature usage (no personal info)
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                        className={`w-12 h-6 rounded-full flex items-center transition-colors duration-300 ${
                          preferences.analytics ? 'bg-neon-grape justify-end' : 'bg-gray-600 justify-start'
                        }`}
                        role="switch"
                        aria-checked={preferences.analytics}
                        aria-label="Toggle analytics cookies"
                      >
                        <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Personalization Cookies */}
                <div className="p-4 bg-void/50 rounded-lg border border-glass-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-sparkles text-mzansi-gold"></i>
                        <h3 className="font-semibold text-white">Personalisation</h3>
                      </div>
                      <p className="text-sm text-gray-400">
                        Remembers your language choice and settings so everything looks right when you come back.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Examples: language preference, theme
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => setPreferences({ ...preferences, personalization: !preferences.personalization })}
                        className={`w-12 h-6 rounded-full flex items-center transition-colors duration-300 ${
                          preferences.personalization ? 'bg-neon-grape justify-end' : 'bg-gray-600 justify-start'
                        }`}
                        role="switch"
                        aria-checked={preferences.personalization}
                        aria-label="Toggle personalization cookies"
                      >
                        <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveCustom}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-grape to-joburg-teal text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-neon-grape/50 transition-all duration-300"
                >
                  <i className="fas fa-save mr-2"></i>
                  Save My Choice
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-500 text-center">
                You can change this anytime in your account settings.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default CookieConsentBanner;
