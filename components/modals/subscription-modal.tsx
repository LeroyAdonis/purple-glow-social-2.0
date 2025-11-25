'use client';

import React, { useState } from 'react';

interface Plan {
  id: 'free' | 'pro' | 'business';
  name: string;
  price: number;
  features: string[];
  badge?: string;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planId: string, billingCycle: string) => void;
  currentTier: 'free' | 'pro' | 'business';
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'The Hustle',
    price: 0,
    features: [
      '5 AI Posts per month',
      '1 Social Profile',
      'Standard Support',
      'Basic Analytics'
    ]
  },
  {
    id: 'pro',
    name: 'The Creator',
    price: 299,
    badge: 'MOST POPULAR',
    features: [
      'Unlimited Text Generation',
      '50 Image Credits / month',
      '5 Social Profiles',
      'Smart Scheduling',
      '11 Language Translation',
      'Priority Support'
    ]
  },
  {
    id: 'business',
    name: 'The Mogul',
    price: 999,
    features: [
      'Everything in Creator',
      '200 Image & Video Credits',
      'Unlimited Profiles',
      'Team Collaboration (3 Seats)',
      'Priority Support',
      'Dedicated Account Manager'
    ]
  }
];

export default function SubscriptionModal({ isOpen, onClose, onSubscribe, currentTier }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isOpen) return null;

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleBack = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  const handleCompleteSubscription = () => {
    if (selectedPlan) {
      onSubscribe(selectedPlan.id, billingCycle);
      onClose();
      setShowCheckout(false);
      setSelectedPlan(null);
    }
  };

  const calculateTotal = () => {
    if (!selectedPlan) return { subtotal: 0, vat: 0, total: 0, monthlyPrice: 0 };
    let subtotal = selectedPlan.price;
    if (billingCycle === 'annual') {
      subtotal = subtotal * 12 * 0.8; // 20% discount
    }
    const vat = subtotal * 0.15;
    const total = subtotal + vat;
    return { subtotal, vat, total, monthlyPrice: selectedPlan.price };
  };

  const totals = calculateTotal();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="aerogel-card p-8 rounded-3xl w-full max-w-6xl relative z-10 animate-enter max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        {!showCheckout ? (
          <>
            <div className="text-center mb-8">
              <h2 className="font-display font-bold text-4xl mb-2">Choose Your Plan</h2>
              <p className="text-gray-400 mb-6">Transparent pricing in ZAR. No hidden fees.</p>
              
              <div className="inline-flex p-1 bg-white/5 border border-glass-border rounded-xl">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    billingCycle === 'monthly' ? 'bg-white text-black' : 'text-gray-400'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    billingCycle === 'annual' ? 'bg-white text-black' : 'text-gray-400'
                  }`}
                >
                  Annual <span className="text-neon-grape ml-1">-20%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`aerogel-card p-8 rounded-2xl relative ${
                    plan.badge ? 'border-2 border-neon-grape bg-neon-grape/5' : ''
                  } ${currentTier === plan.id ? 'opacity-60' : ''}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-grape px-4 py-1 rounded-full text-xs font-bold">
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-mono text-sm text-gray-400 uppercase mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-display font-bold">
                        R{billingCycle === 'annual' && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price}
                      </span>
                      <span className="text-gray-500">/mo</span>
                    </div>
                    {billingCycle === 'annual' && plan.price > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Billed R{(plan.price * 12 * 0.8).toFixed(0)} annually
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-300">
                        <i className={`fa-solid fa-check ${plan.id === 'pro' ? 'text-neon-grape' : plan.id === 'business' ? 'text-joburg-teal' : 'text-gray-500'}`}></i>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={currentTier === plan.id}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      currentTier === plan.id
                        ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                        : plan.id === 'pro'
                        ? 'bg-white text-black hover:scale-105'
                        : 'border border-glass-border hover:bg-white/5'
                    }`}
                  >
                    {currentTier === plan.id ? 'Current Plan' : plan.id === 'free' ? 'Downgrade' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <button 
                onClick={handleBack}
                className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-2"
              >
                <i className="fa-solid fa-arrow-left"></i> Back to plans
              </button>

              <h3 className="font-display font-bold text-2xl mb-6">Subscription Summary</h3>

              {selectedPlan && (
                <>
                  <div className="aerogel-card p-6 rounded-2xl mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold text-xl">{selectedPlan.name}</div>
                        <div className="text-sm text-gray-400 capitalize">{billingCycle} billing</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-2xl">R{totals.monthlyPrice}</div>
                        <div className="text-xs text-gray-500">/month</div>
                      </div>
                    </div>

                    {billingCycle === 'annual' && (
                      <div className="bg-mzansi-gold/10 border border-mzansi-gold/30 rounded-lg p-3 flex items-center gap-2">
                        <i className="fa-solid fa-tag text-mzansi-gold"></i>
                        <span className="text-sm text-mzansi-gold font-bold">
                          Save R{(totals.monthlyPrice * 12 * 0.2).toFixed(0)} with annual billing
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="aerogel-card p-6 rounded-2xl mb-6">
                    <h4 className="font-bold mb-4">What's Included</h4>
                    <ul className="space-y-2 text-sm">
                      {selectedPlan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-300">
                          <i className="fa-solid fa-check text-green-400"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="aerogel-card p-6 rounded-2xl">
                    <div className="space-y-3 mb-4 pb-4 border-b border-glass-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Subtotal
                        </span>
                        <span className="font-mono">R{totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">VAT (15%)</span>
                        <span className="font-mono">R{totals.vat.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total Due Today</span>
                      <span className="font-display font-bold text-2xl text-green-400">R{totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="aerogel-card p-8 rounded-2xl">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-glass-border">
                  <h3 className="font-bold text-xl">Payment Details</h3>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-lock text-green-400 text-sm"></i>
                    <span className="text-xs text-gray-400">Secure</span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCompleteSubscription(); }}>
                  <div>
                    <label className="text-xs font-mono text-gray-400 mb-2 block">CARD NUMBER</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-gray-400 mb-2 block">EXPIRY</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-gray-400 mb-2 block">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
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

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1" required />
                    <span className="text-xs text-gray-400">
                      I agree to the <a href="#" className="text-joburg-teal hover:underline">Terms</a> and authorize recurring charges
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-neon-grape to-joburg-teal text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(157,78,221,0.5)] transition-all"
                  >
                    <i className="fa-solid fa-lock mr-2"></i>
                    Subscribe Now
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-glass-border text-center">
                  <p className="text-xs text-gray-500">Powered by <span className="text-blue-400 font-bold">Polar.sh</span></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
