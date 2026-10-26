'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { useUserProfile } from '../lib/api/hooks';
import { queryKeys } from '../lib/api/query-client';
import { DashboardSkeleton } from './LoadingSkeletons';
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
import NotificationsDropdown from './notifications-dropdown';
import CreditWarningBanner from './credit-warning-banner';
import UsageSummary from './usage-summary';
import MobileNavigation from './mobile-navigation';
import PostaLogo from './landing/logo';
import { useLanguage } from '../lib/context/LanguageContext';

/**
 * A circular avatar containing the user's own initial, used when the signed-in
 * user has no profile photo. Replaces the old ui-avatars.com stock image.
 */
function initialAvatarDataUrl(name: string): string {
    const initial = (name.trim().charAt(0) || '?').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="#8E3B2E"/><text x="40" y="41" font-family="Arial,sans-serif" font-size="34" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initial}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

interface ClientDashboardViewProps {
    userName: string;
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
    onNavigateBack,
    onCreditPurchase,
    onSubscribe,
    successData,
    showSuccessModal,
    setShowSuccessModal
}: ClientDashboardViewProps) {
    const { t: translate } = useLanguage();
    const queryClient = useQueryClient();
    // The signed-in user, straight from /api/user/profile. There is deliberately
    // no fallback user: while it loads we show a skeleton, and if it cannot be
    // loaded we show an error - never a made-up name or credit balance.
    const { data: profile, isLoading } = useUserProfile();
    const [showSettings, setShowSettings] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'automation'>('dashboard');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-void text-[var(--posta-ink)] p-6 lg:p-12">
                <DashboardSkeleton />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-void text-[var(--posta-ink)] flex items-center justify-center p-6">
                <div className="aerogel-card p-8 rounded-2xl max-w-md text-center border border-[var(--posta-line)]">
                    <i className="fa-solid fa-triangle-exclamation text-red-400 text-2xl mb-4"></i>
                    <h2 className="font-display font-bold text-xl mb-2">We couldn&apos;t load your account</h2>
                    <p className="text-[var(--posta-ink-soft)] text-sm">Please refresh the page or sign in again.</p>
                </div>
            </div>
        );
    }

    const tier: 'free' | 'pro' | 'business' =
        profile.tier === 'pro' || profile.tier === 'business' ? profile.tier : 'free';
    const displayName = profile.name || profile.email.split('@')[0] || 'Account';
    // Real profile photo if the user has one, otherwise their own initial in a
    // circle - never a stock avatar service.
    const avatarSrc = profile.image || initialAvatarDataUrl(displayName);

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        // Credits/tier were optimistically updated in the parent; refetch so the
        // dashboard shows the values actually stored for this user.
        queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    };

    if (showSettings) {
        return <SettingsView
            user={{
                id: profile.id,
                name: displayName,
                email: profile.email,
                tier,
                credits: profile.credits,
                image: avatarSrc,
            }}
            onBack={() => setShowSettings(false)}
            onUpgrade={() => { setShowSettings(false); setShowPricingModal(true); }}
        />;
    }

    return (
        <div className="flex min-h-screen bg-void text-[var(--posta-ink)]">
            {/* Mobile Navigation */}
            <MobileNavigation
                userName={displayName}
                userEmail={profile.email}
                userTier={tier}
                userCredits={profile.credits}
                userImage={avatarSrc}
                activeTab={activeTab}
                onNavigate={setActiveTab}
                onSettingsClick={() => setShowSettings(true)}
            />

            {/* Sidebar - Desktop Only */}
 <aside className="w-64 border-r border-[var(--posta-line)] bg-[var(--posta-paper)] hidden lg:flex flex-col p-6 gap-8 fixed h-full z-20">
                <h1 className="mb-4">
                    <PostaLogo size={22} color="var(--posta-ink)" bubbleColor="var(--posta-clay)" />
                </h1>

                <nav className="flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer border transition-colors min-h-[var(--touch-min)] ${activeTab === 'dashboard'
                                ? 'bg-[var(--posta-clay-tint)] border-[var(--posta-line)] text-[var(--posta-ink)]'
                                : 'border-transparent text-[var(--posta-ink-soft)] hover:text-[var(--posta-ink)] hover:bg-[var(--posta-cream)]'
                            }`}
                    >
                        <i className="fa-solid fa-layer-group text-[var(--posta-clay)]"></i> {translate('dashboard.sidebar.dashboard')}
                    </button>
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer border transition-colors min-h-[var(--touch-min)] ${activeTab === 'schedule'
                                ? 'bg-[var(--posta-clay-tint)] border-[var(--posta-line)] text-[var(--posta-ink)]'
                                : 'border-transparent text-[var(--posta-ink-soft)] hover:text-[var(--posta-ink)] hover:bg-[var(--posta-cream)]'
                            }`}
                    >
                        <i className="fa-regular fa-calendar"></i> {translate('dashboard.sidebar.schedule')}
                    </button>
                    <button
                        onClick={() => setActiveTab('automation')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer border transition-colors min-h-[var(--touch-min)] ${activeTab === 'automation'
                                ? 'bg-[var(--posta-clay-tint)] border-[var(--posta-line)] text-[var(--posta-ink)]'
                                : 'border-transparent text-[var(--posta-ink-soft)] hover:text-[var(--posta-ink)] hover:bg-[var(--posta-cream)]'
                            }`}
                    >
                        <i className="fa-solid fa-bolt"></i> {translate('dashboard.sidebar.automation')}
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center gap-3 px-4 py-3 border border-transparent hover:bg-[var(--posta-cream)] rounded-xl text-[var(--posta-ink-soft)] hover:text-[var(--posta-ink)] transition-colors text-sm font-medium text-left cursor-pointer min-h-[var(--touch-min)]"
                    >
                        <i className="fa-solid fa-cog"></i> {translate('dashboard.sidebar.settings')}
                    </button>
                </nav>

                <div className="mt-auto">
 <div className="bg-[var(--posta-clay)] p-4 rounded-xl border border-[var(--posta-line)] ">
                        <p className="text-xs font-mono text-[var(--posta-cream)] mb-2">{translate('dashboard.credits')}</p>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-display font-bold text-[var(--posta-cream)]">{profile.credits}</span>
                            <span className="text-xs text-[var(--posta-cream)] mb-1">{translate(`dashboard.tiers.${tier}`)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6">
                        {profile.image ? (
                            <Image src={profile.image} alt={displayName} width={40} height={40} className="w-10 h-10 rounded-full border border-[var(--posta-line)]" unoptimized />
                        ) : (
                            <span className="w-10 h-10 shrink-0 rounded-full border border-[var(--posta-line)] bg-[var(--posta-clay)] text-[var(--posta-cream)] flex items-center justify-center font-bold text-sm" aria-hidden="true">
                                {displayName.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <div>
                            <p className="text-sm font-bold truncate w-32">{displayName}</p>
                            <button onClick={() => setShowSettings(true)} className="text-xs text-[var(--posta-ink-soft)] hover:text-[var(--posta-ink)] cursor-pointer">{translate('dashboard.sidebar.settings')}</button>
                        </div>
                    </div>

                    <div className="mt-4">
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-6 lg:p-12 overflow-y-auto relative pt-20 lg:pt-12">
                <div className="max-w-6xl mx-auto space-y-8 relative">
                    <header className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h2 className="font-display font-bold text-4xl mb-2">{translate('dashboard.welcome')}, {displayName.split(' ')[0]}</h2>
                            <p className="text-[var(--posta-ink-soft)]">{translate('dashboard.status')}: <span className="text-joburg-teal">{translate('dashboard.optimal')}</span></p>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationsDropdown />
                            <LanguageSelector
                                variant="compact"
                            />
                            <button
                                onClick={onNavigateBack}
                                className="px-6 py-3 border border-[var(--posta-line)] rounded-full text-sm hover:bg-[var(--posta-paper)] transition-colors cursor-pointer flex items-center gap-2"
                            >
                                <i className="fa-solid fa-arrow-left"></i> 
                                <span>{translate('common.backToLanding')}</span>
                            </button>
                        </div>
                    </header>

                    {/* Credit Warning Banner */}
                    <CreditWarningBanner
                        credits={profile.credits}
                        tier={tier}
                        onUpgrade={() => setShowSubscriptionModal(true)}
                    />

                    {/* Render different views based on active tab */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8">
                            <ContentGenerator />
                            {/* Usage Summary - shows below content generator */}
                            <UsageSummary onUpgrade={() => setShowSubscriptionModal(true)} />
                        </div>
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
 <div className="absolute inset-0 bg-black/60 cursor-pointer" onClick={() => setShowPricingModal(false)}></div>
                    <div className="aerogel-card p-8 rounded-3xl w-full max-w-4xl relative z-10 animate-enter max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowPricingModal(false)}
                            className="absolute top-4 right-4 text-[var(--posta-ink-soft)] hover:text-[var(--posta-ink)] transition-colors cursor-pointer"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>

                        <h2 className="font-display font-bold text-3xl mb-8 text-center">Choose Your Plan</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Free */}
                            <div className="border border-[var(--posta-line)] rounded-2xl p-6 hover:border-[var(--posta-clay)] transition-all">
                                <h3 className="font-mono text-sm text-[var(--posta-ink-soft)] uppercase mb-2">The Hustle</h3>
                                <p className="text-4xl font-display font-bold mb-4">R0</p>
                                <ul className="space-y-2 text-sm text-[var(--posta-ink-soft)] mb-6">
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-[var(--posta-ink-soft)]"></i> 5 AI Posts/month</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-[var(--posta-ink-soft)]"></i> 1 Profile</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-[var(--posta-ink-soft)]"></i> Basic Analytics</li>
                                </ul>
                                <button
                                    onClick={() => setShowPricingModal(false)}
                                    className="w-full py-3 border border-[var(--posta-line)] rounded-xl hover:bg-[var(--posta-paper)] cursor-pointer"
                                >
                                    Current Plan
                                </button>
                            </div>

                            {/* Pro */}
                            <div className="border-2 border-neon-grape rounded-2xl p-6 relative bg-neon-grape/5">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-grape px-4 py-1 rounded-full text-xs font-bold text-[var(--posta-cream)]">
                                    MOST POPULAR
                                </div>
                                <h3 className="font-mono text-sm text-neon-grape uppercase mb-2">The Creator</h3>
                                <p className="text-4xl font-display font-bold mb-4">R299</p>
                                <ul className="space-y-2 text-sm text-[var(--posta-ink-soft)] mb-6">
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
                            <div className="border border-[var(--posta-line)] rounded-2xl p-6 hover:border-joburg-teal/50 transition-all">
                                <h3 className="font-mono text-sm text-joburg-teal uppercase mb-2">The Mogul</h3>
                                <p className="text-4xl font-display font-bold mb-4">R999</p>
                                <ul className="space-y-2 text-sm text-[var(--posta-ink-soft)] mb-6">
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-joburg-teal"></i> Everything in Pro</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-joburg-teal"></i> 200 Credits</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-joburg-teal"></i> Unlimited Profiles</li>
                                    <li className="flex gap-2"><i className="fa-solid fa-check text-joburg-teal"></i> Team Access</li>
                                </ul>
                                <button
                                    onClick={() => { setShowPricingModal(false); setShowSubscriptionModal(true); }}
                                    className="w-full py-3 border border-[var(--posta-line)] rounded-xl hover:bg-[var(--posta-paper)] cursor-pointer"
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
                currentCredits={profile.credits}
            />

            {/* Subscription Modal */}
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                onSubscribe={onSubscribe}
                currentTier={tier}
            />

            {/* Success Modal */}
            {successData && (
                <PaymentSuccessModal
                    isOpen={showSuccessModal}
                    onClose={handleSuccessModalClose}
                    type={successData.type}
                    amount={successData.amount}
                    credits={successData.credits}
                    plan={successData.plan}
                />
            )}
        </div>
    );
}
