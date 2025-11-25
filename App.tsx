import React, { useState, useEffect } from 'react';
import AdminDashboardView from './components/admin-dashboard-view';
import CreditTopupModal from './components/modals/credit-topup-modal';
import SubscriptionModal from './components/modals/subscription-modal';
import PaymentSuccessModal from './components/modals/payment-success-modal';
import LanguageSelector from './components/language-selector';
import { Language, getCurrentLanguage, t } from './lib/i18n';
import { initializeTranslations } from './lib/load-translations';

// Import all translations
import en from './lib/translations/en.json';
import af from './lib/translations/af.json';
import zu from './lib/translations/zu.json';
import xh from './lib/translations/xh.json';
import nso from './lib/translations/nso.json';
import tn from './lib/translations/tn.json';
import st from './lib/translations/st.json';
import ts from './lib/translations/ts.json';
import ss from './lib/translations/ss.json';
import ve from './lib/translations/ve.json';
import nr from './lib/translations/nr.json';

const translations: Record<Language, any> = {
  en, af, zu, xh, nso, tn, st, ts, ss, ve, nr
};

// This component serves as the Landing Page / Design System Preview
// In a real Next.js deployment, the logic shifts to app/page.tsx
export default function App() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'admin'>('landing');
  const [userEmail, setUserEmail] = useState('');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [userCredits, setUserCredits] = useState(450);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'business'>('pro');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Initialize translations and language on mount
  useEffect(() => {
    initializeTranslations();
    const savedLang = getCurrentLanguage();
    setCurrentLanguage(savedLang);
  }, []);

  // Helper function to get translation
  const translate = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // Handle Scroll Effect for Navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Custom Scroll Handler to avoid hash navigation issues in iframes
  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };

  // Simulate Login
  const handleLogin = (provider: string, email?: string) => {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
        setIsLoading(false);
        setIsLoginModalOpen(false);
        
        // Check if admin user
        const loginEmail = email || (provider === 'email' ? userEmail : `user@${provider}.com`);
        if (loginEmail.toLowerCase().includes('admin')) {
          setCurrentView('admin');
        } else {
          setCurrentView('dashboard');
        }
    }, 1500);
  };

  // Handle Credit Purchase
  const handleCreditPurchase = (credits: number, amount: number) => {
    setIsLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setUserCredits(prev => prev + credits);
      setSuccessData({
        type: 'credits',
        amount: amount * 1.15, // Include VAT
        credits
      });
      setShowSuccessModal(true);
    }, 2000);
  };

  // Handle Subscription
  const handleSubscription = (planId: string, billingCycle: string) => {
    setIsLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setUserTier(planId as any);
      const prices = { free: 0, pro: 299, business: 999 };
      const amount = prices[planId as keyof typeof prices];
      setSuccessData({
        type: 'subscription',
        amount: amount * 1.15,
        plan: planId === 'pro' ? 'The Creator' : 'The Mogul'
      });
      setShowSuccessModal(true);
    }, 2000);
  };

  // Render appropriate view based on state
  if (currentView === 'admin') {
    return <AdminDashboardView />;
  }

  if (currentView === 'dashboard') {
    // Import and render dashboard with settings integration
    const DashboardPlaceholder = () => {
      const [showSettings, setShowSettings] = useState(false);
      const [showPricingModal, setShowPricingModal] = useState(false);
      const [showScheduleModal, setShowScheduleModal] = useState(false);
      const [showWizard, setShowWizard] = useState(false);
      const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'automation'>('dashboard');
      
      const mockUser = {
        id: 'user-1',
        name: 'Thabo Nkosi',
        email: userEmail || 'thabo@purpleglow.co.za',
        tier: userTier,
        credits: userCredits,
        image: 'https://ui-avatars.com/api/?name=Thabo+Nkosi&background=9D4EDD&color=fff'
      };

      if (showSettings) {
        const SettingsView = require('./components/settings-view').default;
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  activeTab === 'dashboard' 
                    ? 'bg-white/5 border border-glass-border text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 transition-colors'
                }`}
              >
                <i className="fa-solid fa-layer-group text-neon-grape"></i> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  activeTab === 'schedule' 
                    ? 'bg-white/5 border border-glass-border text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 transition-colors'
                }`}
              >
                <i className="fa-regular fa-calendar"></i> Schedule
              </button>
              <button 
                onClick={() => setActiveTab('automation')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  activeTab === 'automation' 
                    ? 'bg-white/5 border border-glass-border text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 transition-colors'
                }`}
              >
                <i className="fa-solid fa-bolt"></i> Automation
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors text-sm font-medium text-left"
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
                  <button onClick={() => setShowSettings(true)} className="text-xs text-gray-400 hover:text-white">Settings</button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:ml-64 p-6 lg:p-12 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="font-display font-bold text-4xl mb-2">Welcome back, {mockUser.name.split(' ')[0]}</h2>
                  <p className="text-gray-400">Your AI fleet is ready. System status: <span className="text-joburg-teal">OPTIMAL</span></p>
                </div>
                <button 
                  onClick={() => setCurrentView('landing')}
                  className="px-6 py-3 border border-glass-border rounded-xl text-sm hover:bg-white/5 transition-colors"
                >
                  <i className="fa-solid fa-arrow-left mr-2"></i> Back to Landing
                </button>
              </header>

              {/* Render different views based on active tab */}
              {activeTab === 'dashboard' && (
                <div className="aerogel-card p-12 rounded-2xl text-center">
                  <i className="fa-solid fa-wand-magic-sparkles text-6xl text-neon-grape mb-4"></i>
                  <h3 className="font-display font-bold text-2xl mb-2">Content Generator</h3>
                  <p className="text-gray-400 mb-6">Full dashboard with content generator coming in Phase 6</p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <button 
                      onClick={() => setShowSettings(true)}
                      className="px-6 py-3 bg-neon-grape rounded-xl hover:bg-opacity-90 transition-colors font-bold"
                    >
                      <i className="fa-solid fa-cog mr-2"></i> Open Settings
                    </button>
                    <button 
                      onClick={() => setShowPricingModal(true)}
                      className="px-6 py-3 border border-glass-border rounded-xl hover:bg-white/5 transition-colors font-bold"
                    >
                      <i className="fa-solid fa-crown mr-2"></i> View Plans
                    </button>
                    <button 
                      onClick={() => setShowCreditModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-mzansi-gold to-joburg-teal text-black rounded-xl hover:opacity-90 transition-opacity font-bold"
                    >
                      <i className="fa-solid fa-bolt mr-2"></i> Buy Credits
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'schedule' && (() => {
                const ScheduleView = require('./components/schedule-view').default;
                const SchedulePostModal = require('./components/modals/schedule-post-modal').default;
                
                return (
                  <>
                    <ScheduleView onSchedulePost={() => setShowScheduleModal(true)} />
                    {showScheduleModal && (
                      <SchedulePostModal
                        isOpen={showScheduleModal}
                        onClose={() => setShowScheduleModal(false)}
                      />
                    )}
                  </>
                );
              })()}
              
              {activeTab === 'automation' && (() => {
                const AutomationView = require('./components/automation-view').default;
                const AutomationWizard = require('./components/modals/automation-wizard').default;
                
                return (
                  <>
                    <AutomationView onCreateRule={() => setShowWizard(true)} />
                    {showWizard && (
                      <AutomationWizard
                        isOpen={showWizard}
                        onClose={() => setShowWizard(false)}
                      />
                    )}
                  </>
                );
              })()}
            </div>
          </main>

          {/* Pricing Modal */}
          {showPricingModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowPricingModal(false)}></div>
              <div className="aerogel-card p-8 rounded-3xl w-full max-w-4xl relative z-10 animate-enter max-h-[90vh] overflow-y-auto">
                <button 
                  onClick={() => setShowPricingModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
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
                      className="w-full py-3 border border-glass-border rounded-xl hover:bg-white/5"
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
                      className="w-full py-3 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform"
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
                      className="w-full py-3 border border-glass-border rounded-xl hover:bg-white/5"
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
            onPurchase={handleCreditPurchase}
            currentCredits={mockUser.credits}
          />

          {/* Subscription Modal */}
          <SubscriptionModal
            isOpen={showSubscriptionModal}
            onClose={() => setShowSubscriptionModal(false)}
            onSubscribe={handleSubscription}
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
    };

    return <DashboardPlaceholder />;
  }

  return (
    <div className="min-h-screen bg-void text-white font-body overflow-x-hidden relative selection:bg-neon-grape selection:text-white">
      {/* Global Style Injection for Smooth Scroll & Offset */}
      <style dangerouslySetInnerHTML={{__html: `
        html { 
          scroll-behavior: smooth; 
        }
      `}} />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-neon-grape opacity-15 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-joburg-teal opacity-15 blur-[150px] rounded-full" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-hyper-crimson opacity-5 blur-[120px] rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav 
        className={`fixed w-full top-0 z-50 border-b transition-all duration-300 ${
          scrolled || isMobileMenuOpen 
            ? 'bg-void/90 backdrop-blur-xl border-white/10 shadow-lg py-4' 
            : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer z-50">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center shadow-[0_0_15px_rgba(157,78,221,0.5)]">
               <i className="fa-solid fa-bolt text-white text-sm"></i>
            </div>
            <span className="font-display font-bold text-xl tracking-tight">PURPLE GLOW</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400 font-medium">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-white transition-colors">Capabilities</a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="hover:text-white transition-colors">How It Works</a>
            <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')} className="hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-white transition-colors">Pricing</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="hover:text-white transition-colors">Contact</a>
            <a href="#legal" onClick={(e) => scrollToSection(e, 'legal')} className="hover:text-white transition-colors">Legal</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="text-sm font-bold hover:text-joburg-teal transition-colors"
            >
                Log In
            </button>
            <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2 bg-white text-black font-bold rounded-lg hover:scale-105 transition-transform border border-transparent hover:border-neon-grape shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="md:hidden text-white z-50 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl transition-all duration-300`}></i>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`md:hidden absolute top-0 left-0 w-full bg-void/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-[700px] opacity-100 pt-24 pb-8' : 'max-h-0 opacity-0 py-0'}`}>
           <div className="px-6 flex flex-col gap-6">
              <a href="#features" className="text-xl font-display font-bold text-gray-300 hover:text-white" onClick={(e) => scrollToSection(e, 'features')}>Capabilities</a>
              <a href="#how-it-works" className="text-xl font-display font-bold text-gray-300 hover:text-white" onClick={(e) => scrollToSection(e, 'how-it-works')}>How It Works</a>
              <a href="#testimonials" className="text-xl font-display font-bold text-gray-300 hover:text-white" onClick={(e) => scrollToSection(e, 'testimonials')}>Testimonials</a>
              <a href="#pricing" className="text-xl font-display font-bold text-gray-300 hover:text-white" onClick={(e) => scrollToSection(e, 'pricing')}>Pricing</a>
              <a href="#contact" className="text-xl font-display font-bold text-gray-300 hover:text-white" onClick={(e) => scrollToSection(e, 'contact')}>Contact</a>
              <a href="#legal" className="text-xl font-display font-bold text-gray-300 hover:text-white" onClick={(e) => scrollToSection(e, 'legal')}>Legal</a>
              
              <div className="h-px bg-white/10 w-full my-2"></div>
              
              <div className="flex flex-col gap-4">
                <button 
                    onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }}
                    className="w-full py-4 text-center font-bold text-white hover:text-joburg-teal border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Log In
                </button>
                <button 
                    onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Get Started
                </button>
              </div>
           </div>
        </div>
      </nav>

      {/* Payment Modals */}
      <CreditTopupModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        onPurchase={handleCreditPurchase}
        currentCredits={userCredits}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscription}
        currentTier={userTier}
      />

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

      {/* LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsLoginModalOpen(false)}></div>
            <div className="aerogel-card p-8 rounded-3xl w-full max-w-md relative z-10 animate-enter bg-[#0a0a0f]">
                <button 
                    onClick={() => setIsLoginModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>
                
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(157,78,221,0.5)]">
                        <i className="fa-solid fa-bolt text-white"></i>
                    </div>
                    <h2 className="font-display font-bold text-2xl text-white">Welcome Back</h2>
                    <p className="text-gray-400 text-sm mt-1">Access your AI command center</p>
                </div>

                <div className="space-y-3 mb-6">
                    <button onClick={() => handleLogin('google')} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 relative overflow-hidden group">
                        {isLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-brands fa-google text-lg"></i> Continue with Google</>}
                    </button>
                    <button onClick={() => handleLogin('twitter')} className="w-full py-3 bg-[#1DA1F2] text-white font-bold rounded-xl hover:bg-[#1a91da] transition-colors flex items-center justify-center gap-3">
                         {isLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-brands fa-twitter text-lg"></i> Continue with Twitter</>}
                    </button>
                    <button onClick={() => handleLogin('facebook')} className="w-full py-3 bg-[#1877F2] text-white font-bold rounded-xl hover:bg-[#166fe5] transition-colors flex items-center justify-center gap-3">
                         {isLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-brands fa-facebook text-lg"></i> Continue with Facebook</>}
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="text-xs text-gray-500 font-mono">OR EMAIL</span>
                    <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin('email', userEmail); }}>
                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400">EMAIL</label>
                        <input 
                          type="email" 
                          placeholder="you@example.com (try: admin@purpleglow.co.za)" 
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors text-sm" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400">PASSWORD</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors text-sm" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-neon-grape to-electric-indigo text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(157,78,221,0.4)] transition-all flex items-center justify-center gap-2">
                         {isLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <span>Log In with Email</span>}
                    </button>
                </form>
                
                <p className="text-center text-xs text-joburg-teal mt-4 font-mono">
                    💡 TIP: Use email with "admin" to access Admin Dashboard
                </p>
                
                <p className="text-center text-xs text-gray-500 mt-6">
                    By continuing, you agree to our <a href="#" className="text-joburg-teal hover:underline">Terms</a> and <a href="#" className="text-joburg-teal hover:underline">Privacy Policy</a>.
                </p>
            </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-40 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-mzansi-gold animate-pulse"></span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-gray-300">Powered by Gemini 2.5</span>
            </div>
            
            <h1 className="font-display font-extrabold text-6xl md:text-7xl leading-[0.9]">
              LIQUID<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-grape via-white to-joburg-teal">INTELLIGENCE</span>
            </h1>
            
            <p className="font-body text-xl text-gray-400 max-w-lg leading-relaxed">
              Automate your social presence with South African flair. Generating posts, images, and videos with local "gees" in 11 official languages.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="px-8 py-4 bg-neon-grape text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-[0_0_30px_-10px_#9D4EDD] hover:scale-105"
              >
                Launch Dashboard
              </button>
              <button className="px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2 group">
                <i className="fa-solid fa-play text-xs group-hover:text-joburg-teal transition-colors"></i> Watch Demo
              </button>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-mono text-gray-500 pt-4">
                <span><i className="fa-solid fa-check text-joburg-teal mr-2"></i>POPIA Compliant</span>
                <span><i className="fa-solid fa-check text-joburg-teal mr-2"></i>Cancel Anytime</span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            {/* Glass Card Mockup */}
            <div className="aerogel-card p-6 rounded-3xl relative z-10 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 border-t border-white/20">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-800 to-black border border-white/10"></div>
                   <div>
                     <div className="h-2 w-24 bg-white/20 rounded mb-2"></div>
                     <div className="h-2 w-16 bg-white/10 rounded"></div>
                   </div>
                 </div>
                 <i className="fa-brands fa-instagram text-xl text-gray-400"></i>
              </div>
              
              <div className="aspect-square rounded-2xl bg-black/50 mb-6 overflow-hidden relative group">
                <img src="https://picsum.photos/600/600" alt="Generated Content" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                   <i className="fa-solid fa-wand-magic-sparkles text-neon-grape text-xs"></i>
                   <span className="text-[10px] font-mono tracking-wider">IMAGEN 3</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-3 w-3/4 bg-white/20 rounded"></div>
                <div className="h-3 w-full bg-white/10 rounded"></div>
                <div className="h-3 w-1/2 bg-white/10 rounded"></div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 aerogel-card p-4 rounded-2xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-8 h-8 bg-mzansi-gold/20 text-mzansi-gold rounded-lg flex items-center justify-center"><i className="fa-solid fa-language"></i></div>
                <div>
                    <div className="text-xs font-bold text-white">11 Languages</div>
                    <div className="text-[10px] text-gray-400 font-mono">ZULU / XHOSA / ENG +</div>
                </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section (Capabilities) */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="font-display font-bold text-4xl mb-4">Engineered for <span className="text-joburg-teal">Mzansi</span></h2>
                <p className="text-gray-400 max-w-2xl mx-auto">Most AI tools sound like robots. Ours sounds like your best friend from Soweto.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="aerogel-card p-8 rounded-3xl group hover:border-neon-grape/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-neon-grape/10 text-neon-grape flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-comments"></i>
                    </div>
                    <h3 className="font-display font-bold text-xl mb-3">The "Gees" Engine</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Tuned to understand and generate South African context. From "Lekker" to "Eish", we get the tone right across LinkedIn, Twitter, and Insta.
                    </p>
                </div>
                <div className="aerogel-card p-8 rounded-3xl group hover:border-joburg-teal/30 transition-colors">
                     <div className="w-14 h-14 rounded-2xl bg-joburg-teal/10 text-joburg-teal flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-image"></i>
                    </div>
                    <h3 className="font-display font-bold text-xl mb-3">Visual Alchemy</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Powered by Imagen 3. Generate photorealistic product shots in Table Mountain backdrops or cyberpunk Joburg street scenes.
                    </p>
                </div>
                <div className="aerogel-card p-8 rounded-3xl group hover:border-mzansi-gold/30 transition-colors">
                     <div className="w-14 h-14 rounded-2xl bg-mzansi-gold/10 text-mzansi-gold flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-video"></i>
                    </div>
                    <h3 className="font-display font-bold text-xl mb-3">Video Synthesis</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Need a Reel? Use Google Veo to create short, high-impact videos from simple text prompts. Automation like never before.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="font-display font-bold text-4xl mb-4">Get Sorted in 3 Easy Steps</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connector Line */}
                <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-neon-grape via-white/20 to-joburg-teal z-0"></div>

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-void border border-neon-grape shadow-[0_0_20px_rgba(157,78,221,0.5)] flex items-center justify-center text-xl font-bold font-mono mb-6">1</div>
                    <h3 className="font-display font-bold text-xl mb-3">Describe Your Goal</h3>
                    <p className="text-gray-400 text-sm">
                        Give the AI the low-down on your business and the topic. Use 'Manual' for specific instructions or 'AI Pilot' for smart suggestions.
                    </p>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-void border border-white/30 flex items-center justify-center text-xl font-bold font-mono mb-6">2</div>
                    <h3 className="font-display font-bold text-xl mb-3">Generate & Choose</h3>
                    <p className="text-gray-400 text-sm">
                        Instantly receive unique post options with authentic local lingo and stunning AI-generated images. Pick the one with the most gees.
                    </p>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-void border border-joburg-teal shadow-[0_0_20px_rgba(0,224,255,0.5)] flex items-center justify-center text-xl font-bold font-mono mb-6">3</div>
                    <h3 className="font-display font-bold text-xl mb-3">Schedule or Post</h3>
                    <p className="text-gray-400 text-sm">
                        Publish immediately or let our AI schedule it for the optimal time to catch everyone's attention. Sharp sharp!
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="font-display font-bold text-4xl mb-4">Trusted by Local Businesses Across Mzansi</h2>
                <p className="text-gray-400">See how Purple Glow is helping South African entrepreneurs save time and grow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Testimonial 1 */}
                <div className="aerogel-card p-8 rounded-3xl flex flex-col h-full hover:border-white/30 transition-all">
                    <div className="mb-4 text-neon-grape text-2xl"><i className="fa-solid fa-quote-left"></i></div>
                    <p className="text-gray-300 italic mb-6 flex-1">
                        "Ja, nee, this app is a game-changer. I used to spend hours trying to think of posts, now I get amazing, truly South African content in seconds. My engagement has shot up!"
                    </p>
                    <div className="flex items-center gap-4 border-t border-glass-border pt-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><i className="fa-regular fa-user"></i></div>
                        <div>
                            <h4 className="font-bold text-sm text-white">Thabo Khumalo</h4>
                            <p className="text-xs text-gray-500">Owner, TK's Plumbing, Durban</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 2 */}
                <div className="aerogel-card p-8 rounded-3xl flex flex-col h-full hover:border-white/30 transition-all">
                    <div className="mb-4 text-joburg-teal text-2xl"><i className="fa-solid fa-quote-left"></i></div>
                    <p className="text-gray-300 italic mb-6 flex-1">
                        "Finally, a tool that gets our humour! The AI writes in our local lingo, and my customers love it. It feels authentic, not like a robot. Purple Glow is just lekker."
                    </p>
                    <div className="flex items-center gap-4 border-t border-glass-border pt-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><i className="fa-regular fa-user"></i></div>
                        <div>
                            <h4 className="font-bold text-sm text-white">Anelisa Venter</h4>
                            <p className="text-xs text-gray-500">Manager, The Daily Grind, Cape Town</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 3 */}
                <div className="aerogel-card p-8 rounded-3xl flex flex-col h-full hover:border-white/30 transition-all">
                    <div className="mb-4 text-mzansi-gold text-2xl"><i className="fa-solid fa-quote-left"></i></div>
                    <p className="text-gray-300 italic mb-6 flex-1">
                        "Running a guesthouse leaves no time for social media. Purple Glow's AI Pilot is my secret weapon. It suggests what to post and when. It's like having a marketing boet on my team."
                    </p>
                    <div className="flex items-center gap-4 border-t border-glass-border pt-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><i className="fa-regular fa-user"></i></div>
                        <div>
                            <h4 className="font-bold text-sm text-white">Sipho van der Merwe</h4>
                            <p className="text-xs text-gray-500">Host, Karoo Oasis B&B, Beaufort West</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
             <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div>
                    <h2 className="font-display font-bold text-4xl mb-2">Choose Your Plan</h2>
                    <p className="text-gray-400">Transparent pricing in ZAR. No hidden international transaction fees.</p>
                </div>
                
                <div className="bg-white/5 p-1 rounded-xl flex border border-glass-border">
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setBillingCycle('annual')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'annual' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Annual <span className="text-[10px] text-neon-grape ml-1">-20%</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* TIER 1: FREE */}
                <div className="aerogel-card p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all">
                    <div className="mb-6">
                        <h3 className="font-mono text-sm tracking-widest text-gray-500 uppercase mb-2">THE HUSTLE</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-display font-bold text-white">R0</span>
                            <span className="text-gray-500">/pm</span>
                        </div>
                    </div>
                    <ul className="space-y-4 mb-8 text-sm text-gray-300">
                        <li className="flex gap-3"><i className="fa-solid fa-check text-gray-500"></i> 5 AI Posts per month</li>
                        <li className="flex gap-3"><i className="fa-solid fa-check text-gray-500"></i> 1 Social Profile</li>
                        <li className="flex gap-3"><i className="fa-solid fa-check text-gray-500"></i> Standard Support</li>
                        <li className="flex gap-3"><i className="fa-solid fa-check text-gray-500"></i> Basic Analytics</li>
                    </ul>
                    <button className="w-full py-3 border border-glass-border text-white rounded-xl hover:bg-white/5 font-bold transition-colors">
                        Start Free
                    </button>
                </div>

                {/* TIER 2: PRO (Highlighted) */}
                <div className="aerogel-card p-8 rounded-3xl border border-neon-grape/50 relative bg-neon-grape/5 shadow-[0_0_40px_-10px_rgba(157,78,221,0.3)] transform md:-translate-y-4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-neon-grape to-electric-indigo px-4 py-1 rounded-full text-xs font-bold border border-white/20 shadow-lg whitespace-nowrap">
                        MOST POPULAR
                    </div>
                    <div className="mb-6">
                        <h3 className="font-mono text-sm tracking-widest text-neon-grape uppercase mb-2">THE CREATOR</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-display font-bold text-white">R299</span>
                            <span className="text-gray-500">/pm</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Billed R{billingCycle === 'monthly' ? '299' : '3588'} {billingCycle}</p>
                    </div>
                    <ul className="space-y-4 mb-8 text-sm text-gray-200">
                        <li className="flex gap-3"><i className="fa-solid fa-check text-neon-grape"></i> <strong>Unlimited</strong> Text Generation</li>
                        <li className="flex gap-3"><i className="fa-solid fa-check text-neon-grape"></i> 50 Image Credits / mo</li>
                        <li className="flex gap-3"><i className="fa-solid fa-check text-neon-grape"></i> 5 Social Profiles</li>
                        <li className="flex gap-3"><i className="fa-solid fa-check text-neon-grape"></i> Smart Scheduling</li>
                        <li className="flex gap-3"><i className="fa-solid fa-check text-neon-grape"></i> 11 Language Translation</li>
                    </ul>
                    <button className="w-full py-4 bg-white text-black rounded-xl hover:scale-105 font-bold transition-transform shadow-lg">
                        Get Pro
                    </button>
                </div>

                 {/* TIER 3: BUSINESS */}
                 <div className="aerogel-card p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all">
                    <div className="mb-6">
                        <h3 className="font-mono text-sm tracking-widest text-joburg-teal uppercase mb-2">THE MOGUL</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-display font-bold text-white">R999</span>
                            <span className="text-gray-500">/pm</span>
                        </div>
                    </div>
                    <ul className="space-y-4 mb-8 text-sm text-gray-300">
                        <li className="flex gap-3"><i className="fa-solid fa-check text-joburg-teal"></i> Everything in Creator</li>
                        <li className="flex gap-3"><i className="fa-solid fa-check text-joburg-teal"></i> 200 Image & Video Credits</li>
                        <li className="flex gap-3"><i className="fa-solid fa-check text-joburg-teal"></i> Unlimited Profiles</li>
                        <li className="flex gap-3"><i className="fa-solid fa-check text-joburg-teal"></i> Team Collaboration (3 Seats)</li>
                        <li className="flex gap-3"><i className="fa-solid fa-check text-joburg-teal"></i> Priority Support</li>
                    </ul>
                    <button className="w-full py-3 border border-glass-border text-white rounded-xl hover:bg-white/5 font-bold transition-colors">
                        Contact Sales
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* Credit Top-up (Polar UI Simulation) */}
      <section id="credits" className="py-24 relative">
         <div className="max-w-4xl mx-auto px-6">
            <div className="aerogel-card p-10 rounded-3xl border-t border-white/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-joburg-teal opacity-10 blur-[80px] rounded-full pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest mb-4">
                            POWERED BY POLAR.SH
                        </div>
                        <h2 className="font-display font-bold text-3xl mb-3">Need extra firepower?</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Running low on image or video credits? Top up instantly without changing your subscription. Secure payments handled via Polar.
                        </p>
                        
                        <div className="flex gap-3 flex-wrap">
                            <button 
                              onClick={() => setShowCreditModal(true)}
                              className="px-4 py-3 bg-white/5 border border-glass-border rounded-xl hover:border-neon-grape hover:bg-white/10 transition-all text-sm text-left"
                            >
                                <div className="font-bold text-white">100 Credits</div>
                                <div className="text-xs text-gray-400">R150.00</div>
                            </button>
                            <button 
                              onClick={() => setShowCreditModal(true)}
                              className="px-4 py-3 bg-white/5 border border-glass-border rounded-xl hover:border-neon-grape hover:bg-white/10 transition-all text-sm text-left"
                            >
                                <div className="font-bold text-white">500 Credits</div>
                                <div className="text-xs text-gray-400">R600.00</div>
                            </button>
                             <button 
                              onClick={() => setShowCreditModal(true)}
                              className="px-4 py-3 bg-white/5 border border-glass-border rounded-xl hover:border-neon-grape hover:bg-white/10 transition-all text-sm text-left"
                            >
                                <div className="font-bold text-white">Video Pack</div>
                                <div className="text-xs text-gray-400">R850.00</div>
                            </button>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-72 bg-void border border-glass-border rounded-xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-glass-border">
                            <span className="font-bold text-sm">Preview Checkout</span>
                            <i className="fa-solid fa-lock text-xs text-green-500"></i>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>100 Credits Pack</span>
                                <span>R150.00</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>VAT (15%)</span>
                                <span>R22.50</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-glass-border">
                                <span>Total</span>
                                <span>R172.50</span>
                            </div>
                        </div>
                        <button 
                          onClick={() => setShowCreditModal(true)}
                          className="w-full py-3 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                        >
                            Pay with <span className="font-display italic">Polar</span>
                        </button>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 relative bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-display font-bold text-4xl mb-6">Get in Touch</h2>
            <p className="text-gray-400 mb-12">Have questions? We'd love to hear from you.</p>
            
            <div className="aerogel-card p-8 rounded-3xl text-left">
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-gray-400">YOUR NAME</label>
                            <input type="text" className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-gray-400">EMAIL ADDRESS</label>
                            <input type="email" className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400">MESSAGE</label>
                        <textarea rows={4} className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"></textarea>
                    </div>
                    <button type="button" className="w-full py-4 bg-gradient-to-r from-neon-grape to-electric-indigo text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(157,78,221,0.4)] transition-all">
                        Send Message
                    </button>
                </form>
            </div>
        </div>
      </section>

      {/* Footer & Compliance */}
      <footer id="legal" className="border-t border-white/10 bg-black/40 backdrop-blur-lg pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center">
                           <span className="font-display font-bold text-xs text-white">P</span>
                        </div>
                        <span className="font-display font-bold text-lg">PURPLE GLOW</span>
                    </div>
                    <p className="text-gray-500 text-sm max-w-sm">
                        Built for the hustlers, the dreamers, and the storytellers of South Africa. 
                        Proudly engineered in Cape Town.
                    </p>
                </div>
                
                <div>
                    <h4 className="font-bold text-white mb-4">Product</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-neon-grape transition-colors">Features</a></li>
                        <li><a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-neon-grape transition-colors">Pricing</a></li>
                        <li><a href="#" className="hover:text-neon-grape transition-colors">Integration</a></li>
                        <li><a href="#" className="hover:text-neon-grape transition-colors">Changelog</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4">Legal (ZA)</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><a href="#legal" onClick={(e) => scrollToSection(e, 'legal')} className="hover:text-joburg-teal transition-colors flex items-center gap-2"><i className="fa-solid fa-shield-halved text-xs"></i> Privacy Policy (POPIA)</a></li>
                        <li><a href="#legal" onClick={(e) => scrollToSection(e, 'legal')} className="hover:text-joburg-teal transition-colors">Terms of Service</a></li>
                        <li><a href="#legal" onClick={(e) => scrollToSection(e, 'legal')} className="hover:text-joburg-teal transition-colors">PAIA Manual</a></li>
                        <li><a href="#legal" onClick={(e) => scrollToSection(e, 'legal')} className="hover:text-joburg-teal transition-colors">Cookie Policy</a></li>
                    </ul>
                </div>
            </div>
            
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-mono">
                <p>&copy; 2024 Purple Glow Technologies (Pty) Ltd. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white"><i className="fa-brands fa-twitter"></i></a>
                    <a href="#" className="hover:text-white"><i className="fa-brands fa-instagram"></i></a>
                    <a href="#" className="hover:text-white"><i className="fa-brands fa-linkedin"></i></a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}