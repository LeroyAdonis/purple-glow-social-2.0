<![CDATA[<!-- 
  🇿🇦 Purple Glow Social 2.0
  AI-Powered Social Media Management for South Africa
  
  Banner Image Placeholder:
  A wide banner (1280x320px) featuring:
  - Purple gradient background with neon glow effect
  - "Purple Glow Social" logo on the left
  - South African flag colors subtly integrated
  - Social media platform icons (Instagram, Twitter, Facebook, LinkedIn)
  - Tagline: "AI-Powered Social Media for Mzansi"
-->

<div align="center">

# 🇿🇦 Purple Glow Social 2.0

**AI-Powered Social Media Management for South African Businesses**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/LeroyAdonis/purple-glow-social-2.0)
[![Tests](https://img.shields.io/badge/tests-134%20passing-brightgreen)](https://github.com/LeroyAdonis/purple-glow-social-2.0)
[![License](https://img.shields.io/badge/license-Proprietary-blue)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6)](https://www.typescriptlang.org/)

[🚀 Live Demo](https://purple-glow-social-2-0.vercel.app) • [📖 Documentation](./docs/) • [🐛 Report Bug](https://github.com/LeroyAdonis/purple-glow-social-2.0/issues) • [💡 Request Feature](https://github.com/LeroyAdonis/purple-glow-social-2.0/issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Status](#-project-status)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About

**Purple Glow Social 2.0** is a comprehensive B2B SaaS social media management platform built specifically for the South African market. It empowers small businesses, entrepreneurs, and marketing agencies to create, schedule, and automate culturally relevant social media content across multiple platforms.

### 🇿🇦 Built for South Africa

- **11 Official Languages** — Generate content in English, Afrikaans, Zulu, Xhosa, Northern Sotho, Tswana, Southern Sotho, Tsonga, Swati, Venda, and Ndebele
- **Local Cultural Context** — AI understands SA slang ("lekker", "sharp sharp", "howzit"), locations (Joburg, Cape Town, Durban), and cultural nuances
- **SAST Timezone** — Default UTC+2 timezone for accurate scheduling
- **ZAR Pricing** — Local currency with 15% VAT included

### 🎯 Target Audience

- Small and medium businesses in South Africa
- Marketing agencies managing multiple clients
- Entrepreneurs and solopreneurs
- Content creators and influencers
- Non-profits and community organizations

---

## ✨ Key Features

### 🤖 AI Content Generation
- **Google Gemini Pro** powered intelligent content creation
- Generate in all **11 South African official languages**
- **4 tone variations**: Professional, Casual, Friendly, Energetic
- **Platform-specific optimization** for each social network
- **Automatic hashtag generation** with SA-relevant tags (#LocalIsLekker, #MzansiMagic)
- **Multiple content variations** to choose from
- **Image prompt suggestions** for visual content

### 📤 Multi-Platform Auto-Posting
| Platform | Features |
|----------|----------|
| **Instagram** | Business accounts, images, carousels |
| **Facebook** | Pages, text, images, links |
| **Twitter/X** | Tweets, threads, images |
| **LinkedIn** | Professional posts, articles, images |

- Post immediately or schedule for later
- **Automated posting** via Vercel Cron (every 5 minutes)
- Post tracking with platform IDs and URLs
- Error handling and retry logic

### 🔐 Secure Authentication & OAuth
- **Better-auth** with email/password + Google OAuth
- **One-click social account connection** for all 4 platforms
- **AES-256-GCM token encryption** for secure credential storage
- **PKCE for Twitter** OAuth 2.0 (industry best practice)
- **CSRF protection** on all OAuth flows
- **Session management** with 7-day expiry and refresh

### 📅 Smart Scheduling & Automation
- **Visual calendar view** with monthly/weekly/daily modes
- **AI-powered best time to post** recommendations
- **Automation rules** with recurring posts (daily/weekly/monthly)
- **Queue management** with priorities
- **Timeline and list views** for content overview
- **SAST (UTC+2) timezone** support throughout

### 💳 Credit Management & Payments
| Plan | Credits | Price | Features |
|------|---------|-------|----------|
| **Free** | 10/month | R 0 | 5 queue slots, 5 daily generations |
| **Pro** | 500/month | R 299 | 50 queue slots, 50 daily generations, 5 automation rules |
| **Business** | 2000/month | R 999 | 200 queue slots, 200 daily generations, 20 automation rules |

- **Polar.sh** integration for secure payments
- Credit top-ups and subscription management
- Credit reservation system for scheduled posts
- Real-time transaction tracking

### 🔒 Enterprise Security & Compliance
- **POPIA Compliant** — South African data protection regulations
- **AES-256-GCM encryption** for all sensitive tokens
- **Rate limiting** via Upstash Redis
- **CSRF protection** on all forms and OAuth flows
- **HttpOnly Secure cookies** for session management
- **Input validation** and sanitization throughout
- **Sentry integration** for error monitoring

### 👨‍💼 Admin Dashboard
- User management and analytics
- Credit and generation statistics
- Job monitoring with retry capabilities
- Error tracking and resolution
- Automation rule overview
- Export functionality for reports

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16 | React framework with App Router |
| [React](https://react.dev/) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.8 | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utility-first CSS framework |
| [React Query](https://tanstack.com/query) | 5 | Server state management |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) | 16 | Serverless API endpoints |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.44 | Type-safe database queries |
| [PostgreSQL](https://www.postgresql.org/) (Neon) | 15+ | Serverless database |
| [Better-auth](https://www.better-auth.com/) | 1.4 | Authentication library |
| [Inngest](https://www.inngest.com/) | 3.27 | Background job processing |

### External Services
| Service | Purpose |
|---------|---------|
| [Google Gemini Pro](https://ai.google.dev/) | AI content generation |
| [Polar.sh](https://polar.sh/) | Payment processing |
| [Vercel](https://vercel.com/) | Hosting & deployment |
| [Neon](https://neon.tech/) | Serverless PostgreSQL |
| [Upstash Redis](https://upstash.com/) | Rate limiting |
| [Sentry](https://sentry.io/) | Error monitoring |
| [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) | Image storage |

### APIs
- Meta Graph API (Facebook/Instagram)
- Twitter API v2
- LinkedIn Marketing API
- Google OAuth 2.0

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| **Node.js** | 18.0+ | `node --version` |
| **npm** | 9.0+ | `npm --version` |
| **Git** | 2.0+ | `git --version` |

### Required Accounts

You'll need accounts with the following services:

1. **[Neon](https://neon.tech/)** — Serverless PostgreSQL database (free tier available)
2. **[Google Cloud Console](https://console.cloud.google.com/)** — For Gemini AI API and OAuth
3. **[Polar.sh](https://polar.sh/)** — Payment processing (use sandbox for development)

### Optional (for full functionality)

4. **[Meta Developer](https://developers.facebook.com/)** — Facebook/Instagram OAuth
5. **[Twitter Developer](https://developer.twitter.com/)** — Twitter/X OAuth
6. **[LinkedIn Developer](https://www.linkedin.com/developers/)** — LinkedIn OAuth
7. **[Upstash](https://upstash.com/)** — Redis for rate limiting
8. **[Sentry](https://sentry.io/)** — Error monitoring
9. **[Vercel](https://vercel.com/)** — Deployment (optional for local dev)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/LeroyAdonis/purple-glow-social-2.0.git
cd purple-glow-social-2.0
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Open and configure your environment variables
# See SETUP_GUIDE.md for detailed instructions
```

**Minimum required variables for local development:**

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require

# Authentication
BETTER_AUTH_SECRET=your_secret_key_here_min_32_chars_long
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# AI Content Generation
GEMINI_API_KEY=your_gemini_api_key

# Token Encryption (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
TOKEN_ENCRYPTION_KEY=64_character_hex_string_here
```

### 4. Set Up the Database

```bash
# Push schema to your Neon database
npm run db:push

# (Optional) Seed test accounts
npm run db:seed-test

# (Optional) Open Drizzle Studio to view data
npm run db:studio
```

### 5. Start the Development Server

```bash
npm run dev
```

🎉 **Open [http://localhost:3000](http://localhost:3000) in your browser!**

---

## 📁 Project Structure

```
purple-glow-social-2.0/
├── 📂 app/                      # Next.js App Router
│   ├── 📂 api/                  # API routes
│   │   ├── 📂 auth/             # Better-auth endpoints
│   │   ├── 📂 oauth/            # Social OAuth flows
│   │   ├── 📂 posts/            # Post management
│   │   ├── 📂 ai/               # AI generation endpoints
│   │   ├── 📂 cron/             # Scheduled job handlers
│   │   └── 📂 webhooks/         # Polar webhook handlers
│   ├── 📂 admin/                # Admin dashboard pages
│   ├── 📂 dashboard/            # User dashboard pages
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
│
├── 📂 components/               # React components
│   ├── 📂 modals/               # Modal dialogs
│   ├── 📂 providers/            # Context providers
│   ├── 📂 connected-accounts/   # OAuth connection UI
│   ├── calendar-view.tsx        # Calendar scheduling
│   ├── schedule-view.tsx        # Schedule management
│   ├── automation-view.tsx      # Automation rules
│   ├── ai-content-studio.tsx    # AI content generation
│   └── ...
│
├── 📂 lib/                      # Utilities and helpers
│   ├── 📂 ai/                   # Gemini AI service
│   ├── 📂 oauth/                # OAuth providers
│   ├── 📂 posting/              # Platform posting services
│   ├── 📂 polar/                # Payment integration
│   ├── 📂 db/                   # Database helpers
│   ├── 📂 crypto/               # Token encryption
│   ├── 📂 context/              # React contexts
│   ├── 📂 translations/         # 11 language files
│   ├── auth.ts                  # Better-auth config
│   ├── auth-client.ts           # Client-side auth
│   ├── i18n.ts                  # Internationalization
│   └── logger.ts                # Structured logging
│
├── 📂 drizzle/                  # Database
│   ├── schema.ts                # Drizzle schema (18 tables)
│   ├── db.ts                    # Database connection
│   └── 📂 migrations/           # SQL migrations
│
├── 📂 docs/                     # Documentation
│   ├── COMPONENT_GUIDE.md       # Component API reference
│   ├── PRODUCTION_DEPLOYMENT.md # Deployment guide
│   ├── TROUBLESHOOTING.md       # Troubleshooting runbook
│   ├── TEST_ACCOUNTS_GUIDE.md   # Test account details
│   └── ...
│
├── 📂 specs/                    # Feature specifications
├── 📂 scripts/                  # Utility scripts
├── .env.example                 # Environment template
├── AGENTS.md                    # AI agent instructions
├── SETUP_GUIDE.md               # Detailed setup guide
└── README.md                    # This file
```

---

## 📚 Documentation

### Getting Started
| Document | Description |
|----------|-------------|
| [**SETUP_GUIDE.md**](./SETUP_GUIDE.md) | Complete setup instructions |
| [**QUICK_REFERENCE.md**](./QUICK_REFERENCE.md) | Quick developer reference |
| [**AGENTS.md**](./AGENTS.md) | Complete project overview |

### Developer Guides
| Document | Description |
|----------|-------------|
| [docs/COMPONENT_GUIDE.md](./docs/COMPONENT_GUIDE.md) | Component API reference |
| [docs/MOCK_DATA_STRUCTURE.md](./docs/MOCK_DATA_STRUCTURE.md) | Data models and helpers |
| [docs/CONNECTED_ACCOUNTS_GUIDE.md](./docs/CONNECTED_ACCOUNTS_GUIDE.md) | OAuth integration guide |
| [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) | API endpoint documentation |

### Operations
| Document | Description |
|----------|-------------|
| [docs/PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md) | Deployment instructions |
| [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) | Testing procedures |
| [docs/TEST_ACCOUNTS_GUIDE.md](./docs/TEST_ACCOUNTS_GUIDE.md) | Test account details |

### Integrations
| Document | Description |
|----------|-------------|
| [docs/POLAR_SETUP_GUIDE.md](./docs/POLAR_SETUP_GUIDE.md) | Payment integration |
| [docs/POLAR_ACCOUNT_SETUP.md](./docs/POLAR_ACCOUNT_SETUP.md) | Polar account configuration |
| [docs/AI_FEEDBACK_LOOP.md](./docs/AI_FEEDBACK_LOOP.md) | AI learning system |

---

## 🧪 Testing

### Test Accounts

Pre-configured test accounts are available for development:

| Account | Email | Password | Tier | Credits |
|---------|-------|----------|------|---------|
| Free User | `free@test.purpleglow.co.za` | `TestFree123!` | Free | 10 |
| Pro User | `pro@test.purpleglow.co.za` | `TestPro123!` | Pro | 500 |
| Business User | `business@test.purpleglow.co.za` | `TestBiz123!` | Business | 2000 |
| Admin User | `admin@test.purpleglow.co.za` | `TestAdmin123!` | Business | 2000 |
| Low Credit | `lowcredit@test.purpleglow.co.za` | `TestLow123!` | Pro | 2 |
| Zero Credit | `zerocredit@test.purpleglow.co.za` | `TestZero123!` | Pro | 0 |

```bash
# Seed test accounts
npm run db:seed-test
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Results

```
✓ 134 tests passing
✓ Unit tests for all services
✓ Integration tests for API routes
✓ Component tests with React Testing Library
```

See [docs/TEST_ACCOUNTS_GUIDE.md](./docs/TEST_ACCOUNTS_GUIDE.md) for comprehensive testing procedures.

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LeroyAdonis/purple-glow-social-2.0)

### Manual Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variables (see [.env.example](./.env.example))
   - Deploy

3. **Configure Services**
   - Update OAuth callback URLs for all providers
   - Set up Polar webhook endpoint
   - Verify database connection
   - Enable Vercel Cron jobs

See [docs/PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md) for detailed instructions.

---

## 📊 Project Status

### Production Readiness Score: **92/100** ✅

| Category | Score | Status |
|----------|-------|--------|
| Core Features | 95/100 | ✅ Complete |
| Authentication | 95/100 | ✅ Production Ready |
| AI Integration | 90/100 | ✅ Production Ready |
| Payment System | 90/100 | ✅ Production Ready |
| Testing | 85/100 | ✅ 134 tests passing |
| Documentation | 90/100 | ✅ Comprehensive |
| Security | 90/100 | ✅ Audited |
| Performance | 85/100 | ✅ Optimized |

### Completed Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1-2 | Foundation & UI Components | ✅ Complete |
| 3 | Payment System & Admin Dashboard | ✅ Complete |
| 4 | Internationalization (11 Languages) | ✅ Complete |
| 5 | Automation & Scheduling System | ✅ Complete |
| 6 | Integration & Polish | ✅ Complete |
| 7 | OAuth UI Components | ✅ Complete |
| 8 | Authentication & OAuth Backend | ✅ Complete |
| 9 | Auto-Posting to Social Platforms | ✅ Complete |
| 10 | AI Content Generation | ✅ Complete |

---

## 🗺️ Roadmap

### Phase 11 (Planned)
- [ ] 📊 **Analytics Dashboard** — Post performance tracking
- [ ] 🎥 **Video Content Support** — Upload and schedule videos
- [ ] 📱 **Instagram Stories** — Story creation and posting
- [ ] 🤝 **Team Collaboration** — Multi-user accounts
- [ ] 🔔 **Real-time Notifications** — Push notifications
- [ ] 📈 **A/B Testing** — Test content variations

### Phase 12 (Future)
- [ ] 📱 **Mobile Apps** — iOS and Android native apps
- [ ] 🔄 **Advanced Automation** — Conditional rules, workflows
- [ ] 🎯 **Audience Insights** — Demographics analysis
- [ ] 🤖 **Chatbot Integration** — Social media inbox management
- [ ] 🌐 **Multi-account Management** — Manage multiple brands
- [ ] 📊 **Custom Reports** — Export analytics and insights

---

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting PRs.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** following the patterns in [AGENTS.md](./AGENTS.md)
4. **Run tests**
   ```bash
   npm run test:run
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Standards

- ✅ Use TypeScript with proper type definitions
- ✅ Follow existing component patterns
- ✅ Include accessibility features (keyboard nav, ARIA labels)
- ✅ Add error boundaries for complex components
- ✅ Write tests for new functionality
- ✅ Maintain South African context
- ✅ Update documentation

---

## 📄 License

**Proprietary** — Purple Glow Social Team

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software is strictly prohibited.

---

## 📞 Contact

**Purple Glow Social Team**

- 🌐 Website: [purpleglow.co.za](https://purpleglow.co.za)
- 📧 Support: support@purpleglow.co.za
- 🐛 Issues: [GitHub Issues](https://github.com/LeroyAdonis/purple-glow-social-2.0/issues)

---

<div align="center">

**Built with ❤️ for South African Businesses** 🇿🇦

*Sharp sharp! Lekker coding!* 🚀

</div>
]]>