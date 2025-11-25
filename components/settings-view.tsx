'use client';

import React, { useState } from 'react';
import { generateMockInvoices } from '../lib/mock-data';
import CustomSelect from './custom-select';
import ConnectedAccountsView from './connected-accounts/connected-accounts-view';

interface SettingsViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    tier: 'free' | 'pro' | 'business';
    credits: number;
    image: string;
  };
  onBack: () => void;
  onUpgrade: () => void;
}

export default function SettingsView({ user, onBack, onUpgrade }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'subscription' | 'payment' | 'billing' | 'preferences' | 'connections'>('account');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [timezone, setTimezone] = useState('SAST');
  const [language, setLanguage] = useState('en');

  const mockInvoices = generateMockInvoices(user.id);
  const mockCards = [
    { id: '1', brand: 'Visa', last4: '4532', expiry: '12/25', isDefault: true },
    { id: '2', brand: 'Mastercard', last4: '8821', expiry: '08/26', isDefault: false }
  ];

  const getTierDetails = () => {
    switch (user.tier) {
      case 'pro':
        return { name: 'Pro Plan', price: 299, features: ['Unlimited Text', '50 Image Credits', '5 Profiles', 'Smart Scheduling'] };
      case 'business':
        return { name: 'Business Plan', price: 999, features: ['Everything in Pro', '200 Image & Video Credits', 'Unlimited Profiles', 'Team Collaboration'] };
      default:
        return { name: 'Free Plan', price: 0, features: ['5 AI Posts/month', '1 Profile', 'Basic Analytics'] };
    }
  };

  const tierDetails = getTierDetails();
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  return (
    <div className="flex min-h-screen bg-void text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-glass-border bg-black/20 hidden lg:flex flex-col p-6 gap-8 fixed h-full backdrop-blur-md z-20">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight">Settings</h1>
            <p className="text-xs text-gray-500 font-mono">PURPLE GLOW</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'account'
              ? 'bg-white/5 border border-glass-border text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-user"></i> Account
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'subscription'
              ? 'bg-white/5 border border-glass-border text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-crown"></i> Subscription
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'payment'
              ? 'bg-white/5 border border-glass-border text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-credit-card"></i> Payment Methods
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'billing'
              ? 'bg-white/5 border border-glass-border text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-file-invoice"></i> Billing History
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'preferences'
              ? 'bg-white/5 border border-glass-border text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-sliders"></i> Preferences
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'connections'
              ? 'bg-white/5 border border-glass-border text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-link"></i> Connected Accounts
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-enter">
              <header>
                <h2 className="font-display font-bold text-4xl mb-2">Account Settings</h2>
                <p className="text-gray-400">Manage your profile information</p>
              </header>

              <div className="aerogel-card p-8 rounded-2xl space-y-6">
                <div className="flex items-center gap-6">
                  <img src={user.image} alt={user.name} className="w-24 h-24 rounded-full border-2 border-glass-border" />
                  <div>
                    <button className="px-4 py-2 bg-white/5 border border-glass-border rounded-xl hover:bg-white/10 transition-colors text-sm">
                      Change Photo
                    </button>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-mono text-gray-400 mb-2 block">FULL NAME</label>
                    <input
                      type="text"
                      defaultValue={user.name}
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-gray-400 mb-2 block">EMAIL</label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-400 mb-2 block">CURRENT PASSWORD</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-mono text-gray-400 mb-2 block">NEW PASSWORD</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-gray-400 mb-2 block">CONFIRM PASSWORD</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                    />
                  </div>
                </div>

                <button className="px-6 py-3 bg-neon-grape rounded-xl hover:bg-opacity-90 transition-colors font-bold">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-enter">
              <header>
                <h2 className="font-display font-bold text-4xl mb-2">Subscription</h2>
                <p className="text-gray-400">Manage your plan and billing</p>
              </header>

              {/* Current Plan */}
              <div className="aerogel-card p-8 rounded-2xl">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-display font-bold text-2xl mb-2">{tierDetails.name}</h3>
                    <p className="text-gray-400">
                      {user.tier === 'free' ? 'Free forever' : `R${tierDetails.price}/month`}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-xs font-bold border ${user.tier === 'free' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' :
                    user.tier === 'pro' ? 'bg-neon-grape/20 text-neon-grape border-neon-grape/30' :
                      'bg-joburg-teal/20 text-joburg-teal border-joburg-teal/30'
                    }`}>
                    {user.tier.toUpperCase()}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {tierDetails.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <i className="fa-solid fa-check text-green-400"></i> {feature}
                    </li>
                  ))}
                </ul>

                {user.tier !== 'free' && (
                  <div className="border-t border-glass-border pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Next billing date</span>
                      <span className="font-mono font-bold">{nextBillingDate.toLocaleDateString('en-ZA')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Amount</span>
                      <span className="font-mono font-bold text-green-400">R{(tierDetails.price * 1.15).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Includes 15% VAT</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={onUpgrade}
                  className="aerogel-card p-6 rounded-2xl hover:border-neon-grape/50 transition-all group"
                >
                  <i className="fa-solid fa-rocket text-3xl text-neon-grape mb-3"></i>
                  <h4 className="font-bold text-lg mb-1">
                    {user.tier === 'business' ? 'View All Plans' : user.tier === 'pro' ? 'Upgrade to Business' : 'Upgrade Plan'}
                  </h4>
                  <p className="text-sm text-gray-400">Get more features and credits</p>
                </button>

                {user.tier !== 'free' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="aerogel-card p-6 rounded-2xl hover:border-red-500/50 transition-all group"
                  >
                    <i className="fa-solid fa-times-circle text-3xl text-red-400 mb-3"></i>
                    <h4 className="font-bold text-lg mb-1">Cancel Subscription</h4>
                    <p className="text-sm text-gray-400">Downgrade to Free tier</p>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6 animate-enter">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="font-display font-bold text-4xl mb-2">Payment Methods</h2>
                  <p className="text-gray-400">Manage your payment cards</p>
                </div>
                <button
                  onClick={() => setShowAddCardModal(true)}
                  className="px-4 py-2 bg-neon-grape rounded-xl hover:bg-opacity-90 transition-colors font-bold flex items-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i> Add Card
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockCards.map((card) => (
                  <div key={card.id} className="aerogel-card p-6 rounded-2xl relative">
                    {card.isDefault && (
                      <span className="absolute top-4 right-4 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                        DEFAULT
                      </span>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <i className={`fa-brands fa-cc-${card.brand.toLowerCase()} text-2xl`}></i>
                      </div>
                      <div>
                        <p className="font-bold">{card.brand}</p>
                        <p className="text-sm text-gray-400">•••• •••• •••• {card.last4}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Expires {card.expiry}</p>
                    <div className="flex gap-2">
                      {!card.isDefault && (
                        <button className="flex-1 py-2 border border-glass-border rounded-lg hover:bg-white/5 transition-colors text-sm">
                          Set Default
                        </button>
                      )}
                      <button className="flex-1 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-sm">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="aerogel-card p-6 rounded-2xl flex items-center gap-4">
                <i className="fa-solid fa-lock text-2xl text-green-400"></i>
                <div>
                  <p className="font-bold mb-1">Secure Payment Processing</p>
                  <p className="text-sm text-gray-400">All transactions are encrypted and PCI DSS compliant via Polar.sh</p>
                </div>
              </div>
            </div>
          )}

          {/* Billing History Tab - Continued in next message due to length */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-enter">
              <header>
                <h2 className="font-display font-bold text-4xl mb-2">Billing History</h2>
                <p className="text-gray-400">View and download past invoices</p>
              </header>

              {mockInvoices.length === 0 ? (
                <div className="aerogel-card p-12 rounded-2xl text-center">
                  <i className="fa-solid fa-file-invoice text-6xl text-gray-600 mb-4"></i>
                  <p className="text-gray-400">No billing history available</p>
                  <p className="text-sm text-gray-500 mt-2">Upgrade to a paid plan to see invoices</p>
                </div>
              ) : (
                <div className="aerogel-card rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-glass-border">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase">Date</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase">Plan</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase">Amount</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {mockInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm">{invoice.date.toLocaleDateString('en-ZA')}</td>
                          <td className="px-6 py-4 text-sm">{invoice.plan}</td>
                          <td className="px-6 py-4">
                            <div className="font-mono font-bold text-green-400">R{invoice.total.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">incl. VAT</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                              {invoice.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-joburg-teal hover:text-white transition-colors text-sm flex items-center gap-2">
                              <i className="fa-solid fa-download"></i> Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 animate-enter">
              <header>
                <h2 className="font-display font-bold text-4xl mb-2">Preferences</h2>
                <p className="text-gray-400">Customize your experience</p>
              </header>

              <div className="aerogel-card p-8 rounded-2xl space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                      <span>Email notifications for scheduled posts</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                      <span>Weekly performance reports</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                      <span>Marketing and product updates</span>
                      <input type="checkbox" className="w-5 h-5" />
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-4">Regional Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-gray-400 mb-2 block">TIMEZONE</label>
                      <CustomSelect
                        value={timezone}
                        onChange={setTimezone}
                        options={[
                          { value: "SAST", label: "🇿🇦 SAST (UTC+2)" },
                          { value: "UTC", label: "🌍 UTC" }
                        ]}
                        placeholder="Select timezone"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-gray-400 mb-2 block">LANGUAGE</label>
                      <CustomSelect
                        value={language}
                        onChange={setLanguage}
                        options={[
                          { value: "en", label: "English" },
                          { value: "af", label: "Afrikaans" },
                          { value: "zu", label: "isiZulu" },
                          { value: "xh", label: "isiXhosa" },
                          { value: "nso", label: "Sesotho sa Leboa" },
                          { value: "tn", label: "Setswana" }
                        ]}
                        placeholder="Select language"
                      />
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Connected Accounts Tab */}
          {activeTab === 'connections' && (
            <ConnectedAccountsView userId={user.id} />
          )}

        </div>
      </main >

      {/* Cancel Subscription Modal */}
      {
        showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowCancelModal(false)}></div>
            <div className="aerogel-card p-8 rounded-3xl w-full max-w-md relative z-10 animate-enter">
              <h3 className="font-display font-bold text-2xl mb-4">Cancel Subscription?</h3>
              <p className="text-gray-400 mb-6">
                We're sorry to see you go! You'll lose access to:
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2 text-red-400">
                  <i className="fa-solid fa-times"></i> Unlimited AI content generation
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <i className="fa-solid fa-times"></i> Image & video credits
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <i className="fa-solid fa-times"></i> Smart scheduling features
                </li>
              </ul>
              <p className="text-sm text-gray-500 mb-6">
                Your subscription will remain active until {nextBillingDate.toLocaleDateString('en-ZA')}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 bg-neon-grape rounded-xl hover:bg-opacity-90 transition-colors font-bold"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={() => { setShowCancelModal(false); alert('Subscription cancelled (simulated)'); }}
                  className="flex-1 py-3 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors font-bold"
                >
                  Cancel Plan
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Add Card Modal */}
      {
        showAddCardModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAddCardModal(false)}></div>
            <div className="aerogel-card p-8 rounded-3xl w-full max-w-md relative z-10 animate-enter">
              <h3 className="font-display font-bold text-2xl mb-4">Add Payment Method</h3>
              <div className="space-y-4 mb-6">
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
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowAddCardModal(false)}
                  className="flex-1 py-3 border border-glass-border rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowAddCardModal(false); alert('Card added successfully (simulated)'); }}
                  className="flex-1 py-3 bg-neon-grape rounded-xl hover:bg-opacity-90 transition-colors font-bold"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
