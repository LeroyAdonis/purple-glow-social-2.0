import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Purple Glow Social',
  description: 'Terms and conditions for using Purple Glow Social - AI-powered social media management platform',
};

const sections = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'service-description', title: '2. Service Description' },
  { id: 'user-accounts', title: '3. User Accounts' },
  { id: 'subscriptions', title: '4. Subscriptions and Payments' },
  { id: 'user-content', title: '5. User Content and Conduct' },
  { id: 'intellectual-property', title: '6. Intellectual Property' },
  { id: 'ai-content', title: '7. AI-Generated Content' },
  { id: 'third-party', title: '8. Third-Party Services' },
  { id: 'limitation', title: '9. Limitation of Liability' },
  { id: 'termination', title: '10. Termination' },
  { id: 'governing-law', title: '11. Governing Law' },
  { id: 'changes', title: '12. Changes to Terms' },
  { id: 'contact', title: '13. Contact Information' },
];

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Please read these terms carefully before using Purple Glow Social. By accessing or using our platform, you agree to be bound by these terms and our Privacy Policy.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <span className="px-3 py-1 rounded-full bg-joburg-teal/20 text-joburg-teal border border-joburg-teal/30">
              <i className="fa-solid fa-gavel mr-2"></i>
              South African Law
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
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-joburg-teal
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-li:text-gray-300
              prose-strong:text-white
              prose-a:text-neon-grape prose-a:no-underline hover:prose-a:underline
              prose-table:border-collapse prose-th:bg-white/5 prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-white/10
            ">
              <TermsContent />
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
            <Link href="/privacy" className="text-gray-400 hover:text-neon-grape transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-joburg-teal font-medium">
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

function TermsContent() {
  return (
    <>
      <section id="acceptance">
        <h2>1. Acceptance of Terms</h2>
        <p>
          Welcome to Purple Glow Social, an AI-powered social media management platform operated by Purple Glow Technologies (Pty) Ltd (&quot;Purple Glow,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), a company registered in South Africa.
        </p>
        <p>
          By accessing or using our website, mobile application, or any services provided by Purple Glow Social (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all of these Terms, you may not access or use the Service.
        </p>
        <p>
          These Terms constitute a legally binding agreement between you and Purple Glow Technologies (Pty) Ltd. You represent that you are at least 18 years of age and have the legal capacity to enter into this agreement. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
        </p>
      </section>

      <section id="service-description">
        <h2>2. Service Description</h2>
        <p>
          Purple Glow Social is an AI-powered social media management platform designed for South African small businesses, entrepreneurs, and content creators. Our Service includes:
        </p>
        <ul>
          <li><strong>AI Content Generation:</strong> Create social media posts in all 11 official South African languages using advanced AI technology powered by Google Gemini Pro.</li>
          <li><strong>Multi-Platform Publishing:</strong> Connect and post to Instagram, Twitter/X, LinkedIn, and Facebook from a single dashboard.</li>
          <li><strong>Scheduling:</strong> Schedule posts for optimal times across different platforms and time zones (SAST by default).</li>
          <li><strong>Automation:</strong> Set up automated posting rules based on your preferences and content strategy.</li>
          <li><strong>Analytics:</strong> Track performance and engagement across your connected social media accounts.</li>
        </ul>
        <p>
          We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice. We will make reasonable efforts to notify users of significant changes.
        </p>
      </section>

      <section id="user-accounts">
        <h2>3. User Accounts and Registration</h2>
        
        <h3>3.1 Account Creation</h3>
        <p>To access most features of the Service, you must create an account. When registering, you agree to:</p>
        <ul>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and update your information to keep it accurate</li>
          <li>Keep your password secure and confidential</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
          <li>Accept responsibility for all activities that occur under your account</li>
        </ul>

        <h3>3.2 Account Security</h3>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials. We implement industry-standard security measures, including AES-256-GCM encryption for sensitive data and secure session management. However, you acknowledge that no security system is impenetrable, and we cannot guarantee absolute security.
        </p>

        <h3>3.3 Account Restrictions</h3>
        <p>You may not:</p>
        <ul>
          <li>Create multiple accounts for deceptive purposes</li>
          <li>Share your account credentials with others</li>
          <li>Use another person&apos;s account without authorization</li>
          <li>Sell, transfer, or assign your account to third parties</li>
        </ul>
      </section>

      <section id="subscriptions">
        <h2>4. Subscriptions and Payments</h2>
        
        <h3>4.1 Subscription Plans</h3>
        <p>Purple Glow Social offers the following subscription tiers (prices in South African Rand, inclusive of 15% VAT):</p>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Plan</th>
                <th className="text-left">Monthly Price</th>
                <th className="text-left">Credits</th>
                <th className="text-left">Features</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Free</strong></td>
                <td>R 0</td>
                <td>10 credits</td>
                <td>Basic features, 5 queue slots, 5 daily AI generations</td>
              </tr>
              <tr>
                <td><strong>Pro</strong></td>
                <td>R 299</td>
                <td>500 credits</td>
                <td>All features, 50 queue slots, 50 daily generations, 5 automation rules</td>
              </tr>
              <tr>
                <td><strong>Business</strong></td>
                <td>R 999</td>
                <td>2,000 credits</td>
                <td>All features, 200 queue slots, 200 daily generations, 20 automation rules, priority support</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>4.2 Credit System</h3>
        <ul>
          <li>Credits are consumed when posts are successfully published (1 credit per platform per post)</li>
          <li>Credits are reserved when posts are scheduled and released if posting fails</li>
          <li>AI content generation does not consume credits; only successful publishing does</li>
          <li>Unused credits expire at the end of each billing cycle unless otherwise specified</li>
          <li>Additional credits can be purchased separately</li>
        </ul>

        <h3>4.3 Payment Processing</h3>
        <p>
          All payments are processed securely through <strong>Polar.sh</strong>, our third-party payment provider. By making a purchase, you agree to Polar.sh&apos;s terms of service. We accept major credit cards and other payment methods as available through Polar.sh.
        </p>

        <h3>4.4 Billing</h3>
        <ul>
          <li>Subscriptions are billed monthly or annually in advance</li>
          <li>Annual subscriptions receive a discount as displayed at checkout</li>
          <li>All prices are displayed in South African Rand (ZAR) and include 15% VAT</li>
          <li>You will receive an invoice for each payment via email</li>
        </ul>

        <h3>4.5 Cancellation and Refunds</h3>
        <ul>
          <li>You may cancel your subscription at any time through your account settings</li>
          <li>Cancellation takes effect at the end of your current billing period</li>
          <li>You retain access to paid features until your subscription expires</li>
          <li>Refunds are provided at our discretion and in accordance with the Consumer Protection Act 68 of 2008</li>
          <li>Credit purchases are non-refundable except where required by law</li>
        </ul>
      </section>

      <section id="user-content">
        <h2>5. User Content and Conduct</h2>

        <h3>5.1 Your Content</h3>
        <p>
          You retain ownership of all content you create, upload, or generate using our Service (&quot;User Content&quot;). By using the Service, you grant us a limited, non-exclusive license to store, process, and transmit your User Content solely for the purpose of providing the Service.
        </p>

        <h3>5.2 Acceptable Use</h3>
        <p>When using our Service, you agree NOT to:</p>
        <ul>
          <li>Violate any applicable laws, regulations, or third-party rights</li>
          <li>Post content that is illegal, harmful, threatening, abusive, defamatory, or discriminatory</li>
          <li>Infringe on intellectual property rights of others</li>
          <li>Distribute spam, malware, or engage in phishing activities</li>
          <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
          <li>Use the Service to generate content that violates social media platform policies</li>
          <li>Engage in any activity that disrupts or interferes with the Service</li>
          <li>Use automated tools to access the Service except as expressly permitted</li>
          <li>Circumvent any usage limits or restrictions</li>
        </ul>

        <h3>5.3 Content Moderation</h3>
        <p>
          We reserve the right, but not the obligation, to review, remove, or disable access to any User Content that violates these Terms or is otherwise objectionable. We may also suspend or terminate accounts that repeatedly violate our policies.
        </p>
      </section>

      <section id="intellectual-property">
        <h2>6. Intellectual Property</h2>

        <h3>6.1 Our Intellectual Property</h3>
        <p>
          The Service, including its original content, features, functionality, design, and source code, is owned by Purple Glow Technologies (Pty) Ltd and is protected by South African and international copyright, trademark, and other intellectual property laws.
        </p>
        <p>
          &quot;Purple Glow,&quot; &quot;Purple Glow Social,&quot; and our logo are trademarks of Purple Glow Technologies (Pty) Ltd. You may not use these trademarks without our prior written consent.
        </p>

        <h3>6.2 License to Use Service</h3>
        <p>
          Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal or internal business purposes. This license does not include the right to:
        </p>
        <ul>
          <li>Modify, reproduce, or create derivative works of the Service</li>
          <li>Reverse engineer, decompile, or disassemble the Service</li>
          <li>Sell, sublicense, or commercially exploit the Service</li>
          <li>Remove any proprietary notices or labels</li>
        </ul>
      </section>

      <section id="ai-content">
        <h2>7. AI-Generated Content</h2>

        <h3>7.1 Ownership</h3>
        <p>
          Content generated by our AI tools based on your prompts and inputs belongs to you. You may use, modify, and distribute AI-generated content for any lawful purpose, subject to these Terms and applicable laws.
        </p>

        <h3>7.2 AI Limitations</h3>
        <p>You acknowledge and agree that:</p>
        <ul>
          <li>AI-generated content may not always be accurate, complete, or appropriate</li>
          <li>You are responsible for reviewing and editing AI-generated content before use</li>
          <li>AI-generated content should not be relied upon for legal, medical, financial, or other professional advice</li>
          <li>We do not guarantee that AI-generated content will be unique or free from third-party intellectual property claims</li>
        </ul>

        <h3>7.3 Responsible Use</h3>
        <p>You agree to use AI content generation features responsibly and not to:</p>
        <ul>
          <li>Generate content that is misleading, fraudulent, or deceptive</li>
          <li>Create content that impersonates real individuals without consent</li>
          <li>Generate content intended to spread misinformation</li>
          <li>Produce content that violates platform community guidelines</li>
          <li>Create content for illegal purposes</li>
        </ul>
      </section>

      <section id="third-party">
        <h2>8. Third-Party Services</h2>

        <h3>8.1 Connected Platforms</h3>
        <p>
          Our Service integrates with third-party social media platforms (Instagram, Twitter/X, LinkedIn, Facebook). When you connect these accounts:
        </p>
        <ul>
          <li>You authorize us to access and post to your accounts on your behalf</li>
          <li>You must comply with each platform&apos;s terms of service and community guidelines</li>
          <li>We are not responsible for changes to third-party platform APIs or policies</li>
          <li>You may disconnect any platform at any time through your account settings</li>
        </ul>

        <h3>8.2 Third-Party Links</h3>
        <p>
          The Service may contain links to third-party websites or services. We do not control and are not responsible for the content, privacy policies, or practices of any third-party sites.
        </p>
      </section>

      <section id="limitation">
        <h2>9. Limitation of Liability</h2>

        <h3>9.1 Disclaimer of Warranties</h3>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>We do not warrant that:</p>
        <ul>
          <li>The Service will be uninterrupted, secure, or error-free</li>
          <li>Results obtained from using the Service will be accurate or reliable</li>
          <li>Any errors in the Service will be corrected</li>
          <li>The Service will meet your specific requirements</li>
        </ul>

        <h3>9.2 Limitation of Liability</h3>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY SOUTH AFRICAN LAW, PURPLE GLOW TECHNOLOGIES (PTY) LTD AND ITS DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
        </p>
        <ul>
          <li>Loss of profits, revenue, or business opportunities</li>
          <li>Loss of data or content</li>
          <li>Business interruption</li>
          <li>Damage to reputation</li>
          <li>Cost of substitute services</li>
        </ul>
        <p>
          Our total liability for any claims arising from or related to these Terms or the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim, or R 1,000 (One Thousand Rand), whichever is greater.
        </p>

        <h3>9.3 Exceptions</h3>
        <p>
          Nothing in these Terms shall exclude or limit our liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded by South African law.
        </p>
      </section>

      <section id="termination">
        <h2>10. Termination</h2>

        <h3>10.1 Termination by You</h3>
        <p>
          You may terminate your account at any time by contacting us or using the account deletion feature in your settings. Upon termination:
        </p>
        <ul>
          <li>Your right to access the Service ceases immediately</li>
          <li>Your data will be deleted in accordance with our Privacy Policy</li>
          <li>Any unused credits or subscription time will not be refunded</li>
        </ul>

        <h3>10.2 Termination by Us</h3>
        <p>We may suspend or terminate your account immediately, without notice, if:</p>
        <ul>
          <li>You breach any provision of these Terms</li>
          <li>You engage in fraudulent or illegal activity</li>
          <li>Your use of the Service poses a security risk</li>
          <li>We are required to do so by law</li>
          <li>We discontinue the Service</li>
        </ul>

        <h3>10.3 Effect of Termination</h3>
        <p>
          Upon termination, Sections 6 (Intellectual Property), 9 (Limitation of Liability), 11 (Governing Law), and any other provisions that by their nature should survive, will remain in effect.
        </p>
      </section>

      <section id="governing-law">
        <h2>11. Governing Law and Dispute Resolution</h2>

        <h3>11.1 Governing Law</h3>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the Republic of South Africa, without regard to its conflict of law provisions.
        </p>

        <h3>11.2 Jurisdiction</h3>
        <p>
          Any disputes arising from or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of the Republic of South Africa, specifically the High Court of South Africa, Gauteng Division, Johannesburg.
        </p>

        <h3>11.3 Dispute Resolution</h3>
        <p>
          Before initiating any legal proceedings, you agree to first attempt to resolve any dispute informally by contacting us at <a href="mailto:legal@purpleglow.co.za">legal@purpleglow.co.za</a>. We will attempt to resolve the dispute within 30 days of receiving your complaint.
        </p>

        <h3>11.4 Consumer Rights</h3>
        <p>
          Nothing in these Terms affects your statutory rights under the Consumer Protection Act 68 of 2008 or the Electronic Communications and Transactions Act 25 of 2002.
        </p>
      </section>

      <section id="changes">
        <h2>12. Changes to These Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. When we make changes:
        </p>
        <ul>
          <li>We will update the &quot;Last updated&quot; date at the top of these Terms</li>
          <li>For material changes, we will notify you via email or a prominent notice on the Service</li>
          <li>Changes become effective 30 days after posting, unless stated otherwise</li>
          <li>Your continued use of the Service after changes take effect constitutes acceptance of the revised Terms</li>
        </ul>
        <p>
          If you do not agree to the modified Terms, you must stop using the Service and terminate your account before the changes take effect.
        </p>
      </section>

      <section id="contact">
        <h2>13. Contact Information</h2>
        <p>If you have any questions about these Terms or the Service, please contact us:</p>
        
        <address className="not-italic bg-white/5 p-6 rounded-xl mt-4">
          <strong className="text-joburg-teal">Purple Glow Technologies (Pty) Ltd</strong><br /><br />
          <strong>Legal Inquiries:</strong><br />
          Email: <a href="mailto:legal@purpleglow.co.za">legal@purpleglow.co.za</a><br /><br />
          <strong>General Support:</strong><br />
          Email: <a href="mailto:support@purpleglow.co.za">support@purpleglow.co.za</a><br /><br />
          <strong>Physical Address:</strong><br />
          Johannesburg, Gauteng<br />
          South Africa
        </address>

        <p className="mt-6">
          We aim to respond to all inquiries within 5 business days.
        </p>
      </section>

      <section className="mt-12 p-6 bg-white/5 rounded-xl border border-white/10">
        <p className="text-center text-gray-400">
          By using Purple Glow Social, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our <Link href="/privacy" className="text-neon-grape hover:underline">Privacy Policy</Link>.
        </p>
      </section>
    </>
  );
}
