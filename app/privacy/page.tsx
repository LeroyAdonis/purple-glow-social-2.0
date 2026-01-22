import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Purple Glow Social',
  description: 'Our commitment to protecting your personal information under POPIA (Protection of Personal Information Act)',
};

const sections = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'information-collected', title: '2. Information We Collect' },
  { id: 'how-we-use', title: '3. How We Use Your Information' },
  { id: 'data-storage', title: '4. Data Storage and Security' },
  { id: 'third-party', title: '5. Third-Party Services' },
  { id: 'popia-rights', title: '6. Your Rights Under POPIA' },
  { id: 'cookies', title: '7. Cookies and Tracking' },
  { id: 'data-retention', title: '8. Data Retention' },
  { id: 'international', title: '9. International Transfers' },
  { id: 'changes', title: '10. Changes to Policy' },
  { id: 'contact', title: '11. Contact Information' },
];

export default function PrivacyPolicy() {
  return (
    <div className="legal-page min-h-screen bg-void text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-pretoria-blue/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center">
                <span className="font-display font-bold text-sm text-white">P</span>
              </div>
              <span className="font-display font-bold text-lg">PURPLE GLOW</span>
            </Link>
            <Link 
              href="/" 
              className="text-sm text-gray-400 hover:text-joburg-teal transition flex items-center gap-2"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-white/10 bg-gradient-to-b from-pretoria-blue/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-4xl sm:text-5xl font-display font-bold bg-gradient-to-r from-neon-grape to-joburg-teal bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Your privacy matters to us. This policy explains how Purple Glow Social collects, uses, and protects your personal information in compliance with the Protection of Personal Information Act (POPIA), Act 4 of 2013.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <span className="px-3 py-1 rounded-full bg-neon-grape/20 text-neon-grape border border-neon-grape/30">
              <i className="fa-solid fa-shield-halved mr-2"></i>
              POPIA Compliant
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
              <i className="fa-solid fa-calendar mr-2"></i>
              Last updated: January 19, 2025
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sticky Table of Contents - Desktop */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="sticky top-28">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Table of Contents</h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block py-2 px-3 text-sm text-gray-400 hover:text-neon-grape hover:bg-white/5 rounded-lg transition"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Mobile Table of Contents */}
          <details className="lg:hidden mb-8 aerogel-card rounded-xl p-4">
            <summary className="text-sm font-bold text-white cursor-pointer flex items-center gap-2">
              <i className="fa-solid fa-list"></i>
              Table of Contents
            </summary>
            <nav className="mt-4 space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block py-2 px-3 text-sm text-gray-400 hover:text-neon-grape rounded-lg transition"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </details>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            <div className="prose prose-invert prose-lg max-w-none 
              prose-headings:font-display prose-headings:text-white
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-white/10
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-neon-grape
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-li:text-gray-300
              prose-strong:text-white
              prose-a:text-joburg-teal prose-a:no-underline hover:prose-a:underline
            ">
              <PrivacyContent />
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-pretoria-blue/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 Purple Glow Technologies (Pty) Ltd. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-neon-grape font-medium">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-neon-grape transition">
              Terms of Service
            </Link>
            <a href="mailto:support@purpleglow.co.za" className="text-gray-400 hover:text-joburg-teal transition">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PrivacyContent() {
  return (
    <>
      <section id="introduction">
        <h2>1. Introduction</h2>
        <p>
          Welcome to Purple Glow Social (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered social media management platform.
        </p>
        <p>
          Purple Glow Technologies (Pty) Ltd is a South African company, and we comply with the <strong>Protection of Personal Information Act (POPIA), Act 4 of 2013</strong>. As the responsible party under POPIA, we ensure that all personal information is processed lawfully and in a reasonable manner that does not infringe on your privacy.
        </p>
        <p>
          By using Purple Glow Social, you consent to the collection and use of your information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
        </p>
      </section>

      <section id="information-collected">
        <h2>2. Information We Collect</h2>
        <p>We collect information that you provide directly to us, information collected automatically, and information from third-party sources.</p>
        
        <h3>2.1 Information You Provide</h3>
        <ul>
          <li><strong>Account Registration:</strong> Name, email address, password (encrypted), and optional profile picture when you create an account.</li>
          <li><strong>Profile Information:</strong> Business name, industry, preferred language (from our 11 South African language options), and timezone preferences.</li>
          <li><strong>Payment Information:</strong> When you subscribe to Pro or Business plans, payment details are processed securely through our payment provider, Polar.sh. We do not store your full credit card details.</li>
          <li><strong>Content:</strong> Social media posts, images, captions, and any content you create or upload using our AI content generation tools.</li>
          <li><strong>Communications:</strong> Messages you send to our support team and feedback you provide.</li>
        </ul>

        <h3>2.2 Information Collected Automatically</h3>
        <ul>
          <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
          <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform, and interaction patterns.</li>
          <li><strong>Log Data:</strong> Server logs recording your activity on our platform for security and troubleshooting purposes.</li>
        </ul>

        <h3>2.3 Information from Third Parties</h3>
        <ul>
          <li><strong>OAuth Connections:</strong> When you connect your social media accounts (Instagram, Twitter/X, LinkedIn, Facebook), we receive access tokens and basic profile information from these platforms.</li>
          <li><strong>Google OAuth:</strong> If you sign in with Google, we receive your name, email, and profile picture.</li>
          <li><strong>AI Services:</strong> We use Google Gemini Pro for content generation. Prompts and generated content may be processed by Google&apos;s AI systems.</li>
        </ul>
      </section>

      <section id="how-we-use">
        <h2>3. How We Use Your Information</h2>
        <p>We use your personal information for the following purposes:</p>
        <ul>
          <li><strong>Service Delivery:</strong> To provide, maintain, and improve our social media management platform, including AI content generation, scheduling, and automated posting.</li>
          <li><strong>Account Management:</strong> To create and manage your account, process subscriptions, and handle credit purchases.</li>
          <li><strong>Communication:</strong> To send service updates, security alerts, and respond to your inquiries.</li>
          <li><strong>Personalization:</strong> To customize your experience based on your preferences, language settings, and usage patterns.</li>
          <li><strong>Analytics:</strong> To understand how users interact with our platform and improve our services.</li>
          <li><strong>Security:</strong> To detect, prevent, and address fraud, abuse, and security issues.</li>
          <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.</li>
        </ul>
      </section>

      <section id="data-storage">
        <h2>4. Data Storage and Security</h2>
        <p>We implement robust security measures to protect your personal information:</p>
        
        <h3>4.1 Encryption</h3>
        <ul>
          <li><strong>Data at Rest:</strong> Sensitive data, including OAuth tokens for your connected social media accounts, is encrypted using <strong>AES-256-GCM encryption</strong>.</li>
          <li><strong>Data in Transit:</strong> All data transmitted between your device and our servers is encrypted using TLS 1.3.</li>
          <li><strong>Passwords:</strong> User passwords are hashed using industry-standard bcrypt algorithms and are never stored in plain text.</li>
        </ul>

        <h3>4.2 Infrastructure Security</h3>
        <ul>
          <li><strong>Database:</strong> Our PostgreSQL database is hosted on Neon, a secure cloud database provider with SOC 2 compliance.</li>
          <li><strong>Application Hosting:</strong> Our application is hosted on Vercel, which maintains enterprise-grade security controls.</li>
          <li><strong>Access Control:</strong> Strict access controls ensure only authorized personnel can access production systems.</li>
        </ul>

        <h3>4.3 Security Practices</h3>
        <ul>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Secure session management with HttpOnly cookies and CSRF protection</li>
          <li>Input validation and sanitization to prevent injection attacks</li>
          <li>Automated monitoring for suspicious activity</li>
        </ul>
      </section>

      <section id="third-party">
        <h2>5. Third-Party Services</h2>
        <p>We work with trusted third-party service providers to deliver our platform. These providers have access to your information only to perform specific tasks on our behalf:</p>

        <h3>5.1 Payment Processing</h3>
        <p><strong>Polar.sh:</strong> Handles all payment processing for subscriptions and credit purchases. Polar.sh is PCI DSS compliant and does not share your payment details with us. View their privacy policy at <a href="https://polar.sh/privacy" target="_blank" rel="noopener noreferrer">polar.sh/privacy</a>.</p>

        <h3>5.2 AI Content Generation</h3>
        <p><strong>Google Gemini Pro:</strong> Powers our AI content generation features. When you generate content, your prompts are sent to Google&apos;s AI services. Google&apos;s privacy practices apply to this data. View Google&apos;s privacy policy at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>.</p>

        <h3>5.3 Social Media Platforms</h3>
        <p>When you connect your accounts, the following platforms receive data:</p>
        <ul>
          <li><strong>Meta (Facebook/Instagram):</strong> Post content, images, and scheduling data for accounts you connect.</li>
          <li><strong>Twitter/X:</strong> Tweet content and media for posting.</li>
          <li><strong>LinkedIn:</strong> Post content for your professional profile or company pages.</li>
        </ul>
        <p>Each platform&apos;s privacy policy governs how they handle your data once it leaves our platform.</p>

        <h3>5.4 Infrastructure Providers</h3>
        <ul>
          <li><strong>Vercel:</strong> Application hosting and serverless functions</li>
          <li><strong>Neon:</strong> PostgreSQL database hosting</li>
          <li><strong>Vercel Blob:</strong> Image and media file storage</li>
        </ul>
      </section>

      <section id="popia-rights">
        <h2>6. Your Rights Under POPIA</h2>
        <p>Under the Protection of Personal Information Act (POPIA), you have the following rights regarding your personal information:</p>

        <h3>6.1 Right to Access</h3>
        <p>You have the right to request access to the personal information we hold about you. You can request a copy of your data by contacting us at <a href="mailto:privacy@purpleglow.co.za">privacy@purpleglow.co.za</a>.</p>

        <h3>6.2 Right to Correction</h3>
        <p>You have the right to request that we correct any inaccurate or incomplete personal information. You can update most information directly in your account settings or contact us for assistance.</p>

        <h3>6.3 Right to Deletion</h3>
        <p>You have the right to request deletion of your personal information. Upon receiving a valid request, we will delete your data within 30 days, except where we are legally required to retain it. To request deletion, email <a href="mailto:privacy@purpleglow.co.za">privacy@purpleglow.co.za</a>.</p>

        <h3>6.4 Right to Object</h3>
        <p>You have the right to object to the processing of your personal information for direct marketing purposes or where processing is based on our legitimate interests. You can opt out of marketing communications at any time.</p>

        <h3>6.5 Right to Data Portability</h3>
        <p>You have the right to receive your personal information in a structured, commonly used, machine-readable format. Contact us to request an export of your data.</p>

        <h3>6.6 Right to Lodge a Complaint</h3>
        <p>If you believe your privacy rights have been violated, you have the right to lodge a complaint with the Information Regulator of South Africa:</p>
        <address className="not-italic bg-white/5 p-4 rounded-lg mt-4">
          <strong>Information Regulator (South Africa)</strong><br />
          SALU Building, 316 Thabo Sehume Street<br />
          Pretoria, 0002<br />
          Email: <a href="mailto:inforeg@justice.gov.za">inforeg@justice.gov.za</a><br />
          Website: <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener noreferrer">www.justice.gov.za/inforeg</a>
        </address>
      </section>

      <section id="cookies">
        <h2>7. Cookies and Tracking</h2>
        <p>We use cookies and similar tracking technologies to enhance your experience on our platform.</p>

        <h3>7.1 Types of Cookies We Use</h3>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for the platform to function, including authentication and session management. These cannot be disabled.</li>
          <li><strong>Functional Cookies:</strong> Remember your preferences, such as language selection and display settings.</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform to improve our services.</li>
        </ul>

        <h3>7.2 Managing Cookies</h3>
        <p>You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of our platform. Most browsers allow you to:</p>
        <ul>
          <li>View what cookies are stored on your device</li>
          <li>Delete all or specific cookies</li>
          <li>Block third-party cookies</li>
          <li>Block all cookies from specific sites</li>
        </ul>
      </section>

      <section id="data-retention">
        <h2>8. Data Retention</h2>
        <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy:</p>
        <ul>
          <li><strong>Account Data:</strong> Retained while your account is active and for 90 days after account deletion to allow for recovery.</li>
          <li><strong>Generated Content:</strong> Stored until you delete it or close your account.</li>
          <li><strong>Transaction Records:</strong> Retained for 7 years as required by South African tax law.</li>
          <li><strong>OAuth Tokens:</strong> Retained while the connection is active and deleted immediately upon disconnection.</li>
          <li><strong>Usage Logs:</strong> Retained for 12 months for security and analytics purposes.</li>
        </ul>
      </section>

      <section id="international">
        <h2>9. International Transfers</h2>
        <p>Your information may be transferred to and processed in countries outside South Africa:</p>
        <ul>
          <li><strong>Vercel:</strong> Our application hosting provider operates globally with data centers in multiple regions.</li>
          <li><strong>Google (Gemini AI):</strong> AI processing may occur in Google&apos;s global data centers.</li>
          <li><strong>Social Media Platforms:</strong> Data posted to your connected accounts is subject to each platform&apos;s data practices.</li>
        </ul>
        <p>
          Where data is transferred internationally, we ensure appropriate safeguards are in place, including standard contractual clauses approved by relevant authorities. These third parties maintain security practices compliant with international standards.
        </p>
      </section>

      <section id="changes">
        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. When we make changes:
        </p>
        <ul>
          <li>We will update the &quot;Last updated&quot; date at the top of this policy.</li>
          <li>For significant changes, we will notify you via email or a prominent notice on our platform.</li>
          <li>Your continued use of our services after changes become effective constitutes acceptance of the revised policy.</li>
        </ul>
        <p>We encourage you to review this policy periodically to stay informed about how we protect your information.</p>
      </section>

      <section id="contact">
        <h2>11. Contact Information</h2>
        <p>If you have any questions about this Privacy Policy, your personal information, or wish to exercise your rights under POPIA, please contact us:</p>
        
        <address className="not-italic bg-white/5 p-6 rounded-xl mt-4">
          <strong className="text-neon-grape">Purple Glow Technologies (Pty) Ltd</strong><br /><br />
          <strong>Information Officer:</strong><br />
          Email: <a href="mailto:privacy@purpleglow.co.za">privacy@purpleglow.co.za</a><br /><br />
          <strong>General Support:</strong><br />
          Email: <a href="mailto:support@purpleglow.co.za">support@purpleglow.co.za</a><br /><br />
          <strong>Physical Address:</strong><br />
          Johannesburg, Gauteng<br />
          South Africa
        </address>

        <p className="mt-6">
          We aim to respond to all privacy-related inquiries within 7 business days.
        </p>
      </section>
    </>
  );
}
