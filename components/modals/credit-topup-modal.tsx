'use client';

import React, { useState } from 'react';

interface Package {
  id: string;
  name: string;
  credits: number;
  price: number;
  savings?: number;
  badge?: string;
}

interface CreditTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (credits: number, amount: number) => void;
  currentCredits: number;
}

interface CheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
  message?: string;
}

const PACKAGES: Package[] = [
  {
    id: 'starter',
    name: '100 Credits',
    credits: 100,
    price: 150,
  },
  {
    id: 'popular',
    name: '500 Credits',
    credits: 500,
    price: 600,
    savings: 150,
    badge: 'BEST VALUE'
  },
  {
    id: 'bulk',
    name: '1000 Credits',
    credits: 1000,
    price: 1000,
    savings: 500,
  },
  {
    id: 'video',
    name: 'Video Pack',
    credits: 50,
    price: 850,
    badge: '50 VIDEOS'
  }
];

export default function CreditTopupModal({ isOpen, onClose, onPurchase, currentCredits }: CreditTopupModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowCheckout(true);
    setError(null);
  };

  const handleBack = () => {
    setShowCheckout(false);
    setSelectedPackage(null);
    setError(null);
  };

  const handleCompletePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPackage) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call API to create Polar checkout
      const response = await fetch('/api/checkout/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
        }),
      });

      const data: CheckoutResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to create checkout');
      }

      // Redirect to Polar checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate checkout');
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedPackage) return { subtotal: 0, vat: 0, total: 0 };
    const subtotal = selectedPackage.price;
    const vat = subtotal * 0.15;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  };

  const totals = calculateTotal();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="aerogel-card p-8 rounded-3xl w-full max-w-5xl relative z-10 animate-enter max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        {!showCheckout ? (
          // Package Selection View
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-mzansi-gold to-joburg-teal mx-auto mb-4 flex items-center justify-center">
                <i className="fa-solid fa-bolt text-2xl text-white"></i>
              </div>
              <h2 className="font-display font-bold text-3xl mb-2">Top Up Credits</h2>
              <p className="text-gray-400">Choose a package to power your content creation</p>
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/5 rounded-full">
                <i className="fa-solid fa-wallet text-mzansi-gold"></i>
                <span className="text-sm font-mono">Current Balance: <span className="font-bold text-mzansi-gold">{currentCredits} credits</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handleSelectPackage(pkg)}
                  className={`aerogel-card p-6 rounded-2xl text-left hover:border-neon-grape/50 transition-all group relative ${
                    pkg.badge ? 'border-2 border-neon-grape/30' : ''
                  }`}
                >
                  {pkg.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-grape px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                      {pkg.badge}
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <div className="text-4xl font-display font-bold text-white mb-1">{pkg.credits}</div>
                    <div className="text-sm text-gray-400">{pkg.name}</div>
                  </div>

                  <div className="border-t border-glass-border pt-4 mb-4">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-green-400">R{pkg.price}</span>
                      <span className="text-sm text-gray-500">.00</span>
                    </div>
                    {pkg.savings && (
                      <div className="text-center mt-2">
                        <span className="text-xs text-mzansi-gold">Save R{pkg.savings}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-green-400"></i>
                      <span>Instant delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-green-400"></i>
                      <span>Never expires</span>
                    </div>
                    {pkg.id === 'video' && (
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-check text-green-400"></i>
                        <span>Video generation</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full py-3 bg-white/5 rounded-xl group-hover:bg-neon-grape group-hover:text-white transition-all text-center font-bold">
                    Select Package
                  </div>
                </button>
              ))}
            </div>

            <div className="aerogel-card p-6 rounded-2xl flex items-start gap-4">
              <i className="fa-solid fa-info-circle text-joburg-teal text-xl mt-1"></i>
              <div className="flex-1">
                <p className="font-bold mb-2">How Credits Work</p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Text generation is <span className="text-white font-bold">free and unlimited</span></li>
                  <li>• 1 credit = 1 AI image generation (Imagen 3)</li>
                  <li>• Video credits for Veo 2 video generation</li>
                  <li>• Credits never expire and roll over monthly</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          // Checkout View
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Order Summary */}
            <div>
              <button 
                onClick={handleBack}
                className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-2"
              >
                <i className="fa-solid fa-arrow-left"></i> Back to packages
              </button>

              <h3 className="font-display font-bold text-2xl mb-6">Order Summary</h3>

              {selectedPackage && (
                <div className="aerogel-card p-6 rounded-2xl mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-lg">{selectedPackage.name}</div>
                      <div className="text-sm text-gray-400">{selectedPackage.credits} credits</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">R{selectedPackage.price}.00</div>
                    </div>
                  </div>

                  {selectedPackage.savings && (
                    <div className="bg-mzansi-gold/10 border border-mzansi-gold/30 rounded-lg p-3 flex items-center gap-2">
                      <i className="fa-solid fa-tag text-mzansi-gold"></i>
                      <span className="text-sm text-mzansi-gold font-bold">You save R{selectedPackage.savings}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="aerogel-card p-6 rounded-2xl">
                <div className="space-y-3 mb-4 pb-4 border-b border-glass-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="font-mono">R{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">VAT (15%)</span>
                    <span className="font-mono">R{totals.vat.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-display font-bold text-2xl text-green-400">R{totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 text-sm text-gray-400">
                <i className="fa-solid fa-shield-halved text-green-400"></i>
                <span>Secure payment powered by Polar.sh</span>
              </div>
            </div>

            {/* Right: Polar Checkout */}
            <div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-red-400">
                    <i className="fa-solid fa-exclamation-circle"></i>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              <div className="aerogel-card p-8 rounded-2xl">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-glass-border">
                  <h3 className="font-bold text-xl">Payment Details</h3>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-lock text-green-400 text-sm"></i>
                    <span className="text-xs text-gray-400">Secure</span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleCompletePurchase}>
                  <div>
                    <label className="text-xs font-mono text-gray-400 mb-2 block">CARD NUMBER</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors pr-12"
                        maxLength={19}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                        <i className="fa-brands fa-cc-visa text-xl text-gray-500"></i>
                        <i className="fa-brands fa-cc-mastercard text-xl text-gray-500"></i>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-gray-400 mb-2 block">EXPIRY DATE</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-gray-400 mb-2 block">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-gray-400 mb-2 block">CARDHOLDER NAME</label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-gray-400 mb-2 block">EMAIL</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                    />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-1" required />
                    <span className="text-xs text-gray-400 group-hover:text-gray-300">
                      I agree to the <a href="#" className="text-joburg-teal hover:underline">Terms of Service</a> and <a href="#" className="text-joburg-teal hover:underline">Privacy Policy</a>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-neon-grape to-joburg-teal text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(157,78,221,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-lock"></i>
                        Pay R{totals.total.toFixed(2)}
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-glass-border">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-shield-halved text-green-400"></i> SSL Encrypted
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-check-circle text-green-400"></i> PCI DSS Compliant
                    </span>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-3">
                    Powered by <span className="text-blue-400 font-bold">Polar.sh</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
