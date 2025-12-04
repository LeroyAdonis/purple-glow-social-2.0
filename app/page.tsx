'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminDashboardView from '../components/admin-dashboard-view';
import CreditTopupModal from '../components/modals/credit-topup-modal';
import SubscriptionModal from '../components/modals/subscription-modal';
import PaymentSuccessModal from '../components/modals/payment-success-modal';
import LanguageSelector from '../components/language-selector';
import ScheduleView from '../components/schedule-view';
import SchedulePostModal from '../components/modals/schedule-post-modal';
import AutomationView from '../components/automation-view';
import AutomationWizard from '../components/modals/automation-wizard';
import SettingsView from '../components/settings-view';
import ClientDashboardView from '../components/client-dashboard-view';
import LogoutButton from '../components/LogoutButton';
import { useSession } from '../lib/auth-client';
import { useLanguage } from '../lib/context/LanguageContext';

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { t: translate, isInitialized } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'admin'>('landing');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<import('../lib/types').SuccessData | null>(null);
  const [userCredits, setUserCredits] = useState(450);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'business'>('pro');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Removed auto-redirect to allow authenticated users to view landing page
  // Users can navigate to dashboard via the navigation menu or "Back to Landing" button

  // Handle Scroll Effect for Navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

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
      setUserTier(planId as 'free' | 'pro' | 'business');
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
    return (
      <ClientDashboardView
        userName={session?.user?.name || ''}
        userEmail={userEmail || session?.user?.email || ''}
        userTier={userTier}
        userCredits={userCredits}
        onNavigateBack={() => setCurrentView('landing')}
        onCreditPurchase={handleCreditPurchase}
        onSubscribe={handleSubscription}
        successData={successData}
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
      />
    );
  }

  return (
    <div className="min-h-screen bg-void text-white font-body overflow-x-hidden relative selection:bg-neon-grape selection:text-white">

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-neon-grape opacity-15 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-joburg-teal opacity-15 blur-[150px] rounded-full" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-hyper-crimson opacity-5 blur-[120px] rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav
        className={`fixed w-full top-0 z-50 border-b transition-all duration-300 ${scrolled || isMobileMenuOpen
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
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-white transition-colors">{translate('nav.features')}</a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="hover:text-white transition-colors">{translate('howItWorks.title')}</a>
            <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')} className="hover:text-white transition-colors">{translate('testimonials.title').split(' ')[0]}</a>
            <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-white transition-colors">{translate('nav.pricing')}</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="hover:text-white transition-colors">{translate('nav.contact')}</a>
            <a href="#legal" onClick={(e) => scrollToSection(e, 'legal')} className="hover:text-white transition-colors">{translate('footer.legal')}</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector
              variant="compact"
            />
            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-5 py-2 bg-gradient-to-r from-neon-grape to-joburg-teal text-white font-bold rounded-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(157,78,221,0.4)] cursor-pointer"
                >
                  <i className="fa-solid fa-grid-2 mr-2"></i>
                  Dashboard
                </Link>
                
                {/* User Profile Dropdown */}
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <img 
                      src={session.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || 'User')}&background=9D4EDD&color=fff`} 
                      alt="User" 
                      className="w-8 h-8 rounded-full border border-glass-border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || 'User')}&background=9D4EDD&color=fff`;
                      }}
                    />
                    <i className={`fa-solid fa-chevron-down text-xs transition-transform ${showUserMenu ? 'rotate-180' : ''}`}></i>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-void border border-glass-border rounded-xl shadow-2xl overflow-hidden z-50 animate-enter">
                      <div className="p-4 border-b border-glass-border">
                        <p className="font-bold text-white truncate">{session.user?.name || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <i className="fa-solid fa-grid-2 text-neon-grape"></i>
                          <span>Dashboard</span>
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            // Settings logic here
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors cursor-pointer text-left"
                        >
                          <i className="fa-solid fa-cog text-gray-400"></i>
                          <span>Settings</span>
                        </button>
                        <div className="h-px bg-glass-border my-2"></div>
                        <div className="px-4 py-2">
                          <LogoutButton onClick={() => setShowUserMenu(false)} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold hover:text-joburg-teal transition-colors cursor-pointer"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 bg-white text-black font-bold rounded-lg hover:scale-105 transition-transform border border-transparent hover:border-neon-grape shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
                >
                  Get Started
                </Link>
              </>
            )}
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
            <a href="#features" className="text-xl font-display font-bold text-gray-300 hover:text-white" onClick={(e) => scrollToSection(e, 'features')}>{translate('nav.features')}</a>
            <a href="#how-it-works" className="text-xl font-display font-bold text-gray-300 hover:text-white" onClick={(e) => scrollToSection(e, 'how-it-works')}>{translate('howItWorks.title')}</a>
            <a href="#testimonials" className="text-xl font-display font-bold text-gray-300 hover:text-white" onClick={(e) => scrollToSection(e, 'testimonials')}>{translate('testimonials.title').split(' ')[0]}</a>
            <a href="#pricing" className="text-xl font-display font-bold text-gray-300 hover:text-white" onClick={(e) => scrollToSection(e, 'pricing')}>{translate('nav.pricing')}</a>
            <a href="#contact" className="text-xl font-display font-bold text-gray-300 hover:text-white" onClick={(e) => scrollToSection(e, 'contact')}>{translate('nav.contact')}</a>
            <a href="#legal" className="text-xl font-display font-bold text-gray-300 hover:text-white" onClick={(e) => scrollToSection(e, 'legal')}>{translate('footer.legal')}</a>

            <div className="h-px bg-white/10 w-full my-2"></div>

            {/* Language Selector in Mobile Menu */}
            <div className="w-full">
              <LanguageSelector
                variant="default"
              />
            </div>

            <div className="flex flex-col gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="w-full py-4 bg-gradient-to-r from-neon-grape to-joburg-teal text-white font-bold rounded-xl shadow-[0_0_20px_rgba(157,78,221,0.4)] text-center cursor-pointer"
                >
                  <i className="fa-solid fa-grid-2 mr-2"></i>
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="w-full py-4 text-center font-bold text-white hover:text-joburg-teal border border-white/10 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] text-center cursor-pointer"
                  >
                    Get Started
                  </Link>
                </>
              )}
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

      {
        successData && (
          <PaymentSuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            type={successData.type}
            amount={successData.amount}
            credits={successData.credits}
            plan={successData.plan}
          />
        )
      }


      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-40 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-mzansi-gold animate-pulse"></span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-gray-300">Powered by Gemini 2.5</span>
            </div>

            <h1 className="font-display font-extrabold text-6xl md:text-7xl leading-[0.9]">
              LIQUID<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-grape via-white to-joburg-teal">INTELLIGENCE</span>
            </h1>

            <p className="font-body text-xl text-gray-400 max-w-lg leading-relaxed">
              {translate('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/signup"
                className="px-8 py-4 bg-neon-grape text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-[0_0_30px_-10px_#9D4EDD] hover:scale-105 text-center"
              >
                {translate('hero.cta')}
              </Link>
              <button className="px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2 group">
                <i className="fa-solid fa-play text-xs group-hover:text-joburg-teal transition-colors"></i> {translate('hero.demo')}
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
            <h2 className="font-display font-bold text-4xl mb-4">{translate('features.title').split(' ')[0]} <span className="text-joburg-teal">{translate('features.title').split(' ').slice(1).join(' ')}</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{translate('features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="aerogel-card p-8 rounded-3xl group hover:border-neon-grape/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-neon-grape/10 text-neon-grape flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-comments"></i>
              </div>
              <h3 className="font-display font-bold text-xl mb-3">{translate('features.aiEngine.title')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {translate('features.aiEngine.description')}
              </p>
            </div>
            <div className="aerogel-card p-8 rounded-3xl group hover:border-joburg-teal/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-joburg-teal/10 text-joburg-teal flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-image"></i>
              </div>
              <h3 className="font-display font-bold text-xl mb-3">{translate('features.multilingual.title')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {translate('features.multilingual.description')}
              </p>
            </div>
            <div className="aerogel-card p-8 rounded-3xl group hover:border-mzansi-gold/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-mzansi-gold/10 text-mzansi-gold flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-video"></i>
              </div>
              <h3 className="font-display font-bold text-xl mb-3">{translate('features.scheduling.title')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {translate('features.scheduling.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl mb-4">{translate('howItWorks.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-neon-grape via-white/20 to-joburg-teal z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-void border border-neon-grape shadow-[0_0_20px_rgba(157,78,221,0.5)] flex items-center justify-center text-xl font-bold font-mono mb-6">1</div>
              <h3 className="font-display font-bold text-xl mb-3">{translate('howItWorks.step1.title')}</h3>
              <p className="text-gray-400 text-sm">
                {translate('howItWorks.step1.description')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-void border border-white/30 flex items-center justify-center text-xl font-bold font-mono mb-6">2</div>
              <h3 className="font-display font-bold text-xl mb-3">{translate('howItWorks.step2.title')}</h3>
              <p className="text-gray-400 text-sm">
                {translate('howItWorks.step2.description')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-void border border-joburg-teal shadow-[0_0_20px_rgba(0,224,255,0.5)] flex items-center justify-center text-xl font-bold font-mono mb-6">3</div>
              <h3 className="font-display font-bold text-xl mb-3">{translate('howItWorks.step3.title')}</h3>
              <p className="text-gray-400 text-sm">
                {translate('howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl mb-4">{translate('testimonials.title')}</h2>
            <p className="text-gray-400">{translate('testimonials.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="aerogel-card p-8 rounded-3xl flex flex-col h-full hover:border-white/30 transition-all">
              <div className="mb-4 text-neon-grape text-2xl"><i className="fa-solid fa-quote-left"></i></div>
              <p className="text-gray-300 italic mb-6 flex-1">
                "{translate('testimonials.thabo.quote')}"
              </p>
              <div className="flex items-center gap-4 border-t border-glass-border pt-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><i className="fa-regular fa-user"></i></div>
                <div>
                  <h4 className="font-bold text-sm text-white">{translate('testimonials.thabo.name')}</h4>
                  <p className="text-xs text-gray-500">{translate('testimonials.thabo.role')}</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="aerogel-card p-8 rounded-3xl flex flex-col h-full hover:border-white/30 transition-all">
              <div className="mb-4 text-joburg-teal text-2xl"><i className="fa-solid fa-quote-left"></i></div>
              <p className="text-gray-300 italic mb-6 flex-1">
                "{translate('testimonials.zanele.quote')}"
              </p>
              <div className="flex items-center gap-4 border-t border-glass-border pt-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><i className="fa-regular fa-user"></i></div>
                <div>
                  <h4 className="font-bold text-sm text-white">{translate('testimonials.zanele.name')}</h4>
                  <p className="text-xs text-gray-500">{translate('testimonials.zanele.role')}</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="aerogel-card p-8 rounded-3xl flex flex-col h-full hover:border-white/30 transition-all">
              <div className="mb-4 text-mzansi-gold text-2xl"><i className="fa-solid fa-quote-left"></i></div>
              <p className="text-gray-300 italic mb-6 flex-1">
                "{translate('testimonials.pieter.quote')}"
              </p>
              <div className="flex items-center gap-4 border-t border-glass-border pt-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><i className="fa-regular fa-user"></i></div>
                <div>
                  <h4 className="font-bold text-sm text-white">{translate('testimonials.pieter.name')}</h4>
                  <p className="text-xs text-gray-500">{translate('testimonials.pieter.role')}</p>
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
              <h2 className="font-display font-bold text-4xl mb-2">{translate('pricing.title')}</h2>
              <p className="text-gray-400">{translate('pricing.subtitle')}</p>
            </div>

            <div className="bg-white/5 p-1 rounded-xl flex border border-glass-border">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                {translate('pricing.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'annual' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                {translate('pricing.annual')} <span className="text-[10px] text-neon-grape ml-1">-20%</span>
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
          <h2 className="font-display font-bold text-4xl mb-6">{translate('contact.title')}</h2>
          <p className="text-gray-400 mb-12">{translate('contact.subtitle')}</p>

          <div className="aerogel-card p-8 rounded-3xl text-left">
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400">{translate('contact.name').toUpperCase()}</label>
                  <input type="text" className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400">{translate('contact.email').toUpperCase()}</label>
                  <input type="email" className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400">{translate('contact.message').toUpperCase()}</label>
                <textarea rows={4} className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"></textarea>
              </div>
              <button type="button" className="w-full py-4 bg-gradient-to-r from-neon-grape to-electric-indigo text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(157,78,221,0.4)] transition-all">
                {translate('contact.send')}
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
                {translate('footer.tagline')}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">{translate('footer.product')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-neon-grape transition-colors">{translate('nav.features')}</a></li>
                <li><a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-neon-grape transition-colors">{translate('nav.pricing')}</a></li>
                <li><a href="#" className="hover:text-neon-grape transition-colors">{translate('footer.integration')}</a></li>
                <li><a href="#" className="hover:text-neon-grape transition-colors">{translate('footer.changelog')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">{translate('footer.legal')} (ZA)</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#legal" onClick={(e) => scrollToSection(e, 'legal')} className="hover:text-joburg-teal transition-colors flex items-center gap-2"><i className="fa-solid fa-shield-halved text-xs"></i> {translate('footer.privacy')}</a></li>
                <li><a href="#legal" onClick={(e) => scrollToSection(e, 'legal')} className="hover:text-joburg-teal transition-colors">{translate('footer.terms')}</a></li>
                <li><a href="#legal" onClick={(e) => scrollToSection(e, 'legal')} className="hover:text-joburg-teal transition-colors">{translate('footer.paia')}</a></li>
                <li><a href="#legal" onClick={(e) => scrollToSection(e, 'legal')} className="hover:text-joburg-teal transition-colors">{translate('footer.cookies')}</a></li>
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