import React, { useState } from 'react';
import SettingsView from './settings-view';
import ScheduleView from './schedule-view';
import SchedulePostModal from './modals/schedule-post-modal';
import AutomationView from './automation-view';
import AutomationWizard from './modals/automation-wizard';
import CreditTopupModal from './modals/credit-topup-modal';
import SubscriptionModal from './modals/subscription-modal';
import PaymentSuccessModal from './modals/payment-success-modal';
import LanguageSelector from './language-selector';
import ContentGenerator from './content-generator';
import LogoutButton from './LogoutButton';

interface ClientDashboardViewProps {
    userEmail: string;
    userTier: 'free' | 'pro' | 'business';
    userCredits: number;
    onNavigateBack: () => void;
    onCreditPurchase: (credits: number, amount: number) => void;
    onSubscribe: (planId: string, billingCycle: string) => void;
    successData: any;
    showSuccessModal: boolean;
    setShowSuccessModal: (show: boolean) => void;
}

export default function ClientDashboardView({
    userEmail,
    userTier,
    userCredits,
    onNavigateBack,
    onCreditPurchase,
    onSubscribe,
    successData,
    showSuccessModal,
    setShowSuccessModal
}: ClientDashboardViewProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'automation'>('dashboard');

    // Use real user data from props, not mock data
    const mockUser = {
        id: 'user-authenticated', // This should come from session
        name: userEmail.split('@')[0] || 'User',
        email: userEmail,
        tier: userTier,
        credits: userCredits,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(userEmail)}&background=9D4EDD&color=fff`
    };

    if (showSettings) {
        return <SettingsView
            user={mockUser}
            onBack={() => setShowSettings(false)}
            onUpgrade={() => { setShowSettings(false); setShowPricingModal(true); }}
        />;
    }

    return (
        <div className="flex min-h-screen bg-void text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-glass-border bg-black/20 hidden lg:flex flex-col p-6 gap-8 fixed h-full backdrop-blur-md z-20">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center">
                        <span className="font-display font-bold">P</span>
                    </div>
                    <h1 className="font-display font-bold text-lg tracking-tight">Purple Glow</h1>
                </div>

                <nav className="flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer ${activeTab === 'dashboard'
                                ? 'bg-white/5 border border-glass-border text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5 transition-colors'
                            }`}
                    >
                        <i className="fa-solid fa-layer-group text-neon-grape"></i> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer ${activeTab === 'schedule'
                                ? 'bg-white/5 border border-glass-border text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5 transition-colors'
                            }`}
                    >
                        <i className="fa-regular fa-calendar"></i> Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('automation')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer ${activeTab === 'automation'
                                ? 'bg-white/5 border border-glass-border text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5 transition-colors'
                            }`}
                    >
                        <i className="fa-solid fa-bolt"></i> Automation
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors text-sm font-medium text-left cursor-pointer"
                    >
                        <i className="fa-solid fa-cog"></i> Settings
                    </button>
                </nav>

                <div className="mt-auto">
                    <div className="p-4 rounded-xl border border-glass-border bg-gradient-to-br from-white/5 to-transparent">
                        <p className="text-xs font-mono text-gray-400 mb-2">CREDITS REMAINING</p>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-display font-bold text-white">{mockUser.credits}</span>
                            <span className="text-xs text-mzansi-gold mb-1">PRO TIER</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                            <div className="h-full w-3/4 bg-joburg-teal"></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6">
                        <img src={mockUser.image} alt="User" className="w-10 h-10 rounded-full border border-glass-border" />
                        <div>
                            <p className="text-sm font-bold truncate w-32">{mockUser.name}</p>
                            <button onClick={() => setShowSettings(true)} className="text-xs text-gray-400 hover:text-white cursor-pointer">Settings</button>
                        </div>
                    </div>

                    <div className="mt-4">
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-6 lg:p-12 overflow-y-auto relative">
                <div className="max-w-6xl mx-auto space-y-8 relative">
                    <header className="flex justify-between items-center">
                        <div>
                            <h2 className="font-display font-bold text-4xl mb-2">Welcome back, {mockUser.name.split(' ')[0]}</h2>
                            <p className="text-gray-400">Your AI fleet is ready. System status: <span className="text-joburg-teal">OPTIMAL</span></p>
                        </div>
                        <div className="flex items-center gap-4">
                            <LanguageSelector
                                variant="compact"
                            />
                            <button
                                onClick={onNavigateBack}
                                className="px-6 py-3 border border-white/20 rounded-full text-sm hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2"
                            >
                                <i className="fa-solid fa-arrow-left"></i> 
                                <span>Back to Landing</span>
                            </button>
                        </div>
                    </header>

                    {/* Render different views based on active tab */}
                    {activeTab === 'dashboard' && (
                        <ContentGenerator />
                    )}

                    {activeTab === 'schedule' && (
                        <>
                            <ScheduleView onSchedulePost={() => setShowScheduleModal(true)} />
                            {showScheduleModal && (
                                <SchedulePostModal
                                    isOpen={showScheduleModal}
                                    onClose={() => setShowScheduleModal(false)}
                                />
                            )}
                        </>
                    )}

                    {activeTab === 'automation' && (
                        <>
                            <AutomationView onCreateRule={() => setShowWizard(true)} />
                            {showWizard && (
                                <AutomationWizard
                                    isOpen={showWizard}
                                    onClose={() => setShowWizard(false)}
                                />
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Pricing Modal */}
            {showPricingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer" onClick={() => setShowPricingModal(false)}></div>
                    <div className="aerogel-card p-8 rounded-3xl w-full max-w-4xl relative z-10 animate-enter max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowPricingModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>

                        <h2 className="font-display font-bold text-3xl mb-8 text-center">Choose Your Plan</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Free */}
                            <div className="border border-glass-border rounded-2xl p-6 hover:border-white/30 transition-all">
                                <h3 className="font-mono text-sm text-gray-500 uppercase mb-2">The Hustle</h3>
                                <p className="text-4xl font-display font-bold mb-4">R0</p>
                                <ul className="space-y-2 text-sm text-gray-300 mb-6">
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-gray-500"></i> 5 AI Posts/month</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-gray-500"></i> 1 Profile</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-gray-500"></i> Basic Analytics</li>
                                </ul>
                                <button
                                    onClick={() => setShowPricingModal(false)}
                                    className="w-full py-3 border border-glass-border rounded-xl hover:bg-white/5 cursor-pointer"
                                >
                                    Current Plan
                                </button>
                            </div>

                            {/* Pro */}
                            <div className="border-2 border-neon-grape rounded-2xl p-6 relative bg-neon-grape/5">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-grape px-4 py-1 rounded-full text-xs font-bold">
                                    MOST POPULAR
                                </div>
                                <h3 className="font-mono text-sm text-neon-grape uppercase mb-2">The Creator</h3>
                                <p className="text-4xl font-display font-bold mb-4">R299</p>
                                <ul className="space-y-2 text-sm text-gray-300 mb-6">
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-neon-grape"></i> Unlimited Text</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-neon-grape"></i> 50 Image Credits</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-neon-grape"></i> 5 Profiles</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-neon-grape"></i> Smart Scheduling</li>
                                </ul>
                                <button
                                    onClick={() => { setShowPricingModal(false); setShowSubscriptionModal(true); }}
                                    className="w-full py-3 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform cursor-pointer"
                                >
                                    Upgrade Now
                                </button>
                            </div>

                            {/* Business */}
                            <div className="border border-glass-border rounded-2xl p-6 hover:border-joburg-teal/50 transition-all">
                                <h3 className="font-mono text-sm text-joburg-teal uppercase mb-2">The Mogul</h3>
                                <p className="text-4xl font-display font-bold mb-4">R999</p>
                                <ul className="space-y-2 text-sm text-gray-300 mb-6">
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-joburg-teal"></i> Everything in Pro</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-joburg-teal"></i> 200 Credits</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-joburg-teal"></i> Unlimited Profiles</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-joburg-teal"></i> Team Access</li>
                                </ul>
                                <button
                                    onClick={() => { setShowPricingModal(false); setShowSubscriptionModal(true); }}
                                    className="w-full py-3 border border-glass-border rounded-xl hover:bg-white/5 cursor-pointer"
                                >
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Credit Top-up Modal */}
            <CreditTopupModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                onPurchase={onCreditPurchase}
                currentCredits={mockUser.credits}
            />

            {/* Subscription Modal */}
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                onSubscribe={onSubscribe}
                currentTier={mockUser.tier}
            />

            {/* Success Modal */}
            {successData && (
                <PaymentSuccessModal
                    isOpen={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    type={successData.type}
                    amount={successData.amount}
                    credits={successData.credits}
                    plan={successData.plan}
                />
            )}
        </div>
    );
}
