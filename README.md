# Purple Glow Social 2.0 🇿🇦

**AI-Powered Social Media Management for South Africa**

Purple Glow Social 2.0 is a comprehensive social media automation platform designed specifically for South African businesses. Generate, schedule, and automate social media content across multiple platforms in all 11 official South African languages.

---

## 💳 Payment Integration

Purple Glow Social uses **Polar.sh** for secure payment processing:
- Real-time credit purchases
- Subscription management (Pro & Business plans)
- ZAR currency support
- PCI DSS compliant checkout

**Setup Guide**: See [docs/POLAR_SETUP_GUIDE.md](docs/POLAR_SETUP_GUIDE.md)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Navigate to `http://localhost:3001`

---

## 📚 Documentation

### Essential Docs (Start Here!)
- **[AGENTS.md](./AGENTS.md)** - Complete project overview and architecture guide
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick developer reference
- **[docs/COMPONENT_GUIDE.md](./docs/COMPONENT_GUIDE.md)** - Component API reference
- **[docs/MOCK_DATA_STRUCTURE.md](./docs/MOCK_DATA_STRUCTURE.md)** - Data models and helpers

### Specifications
- **[specs/ui-completion-and-features/requirements.md](./specs/ui-completion-and-features/requirements.md)** - Feature requirements
- **[specs/ui-completion-and-features/implementation-plan.md](./specs/ui-completion-and-features/implementation-plan.md)** - Implementation roadmap

### Archive
- **[archive/phase-completions/](./archive/phase-completions/)** - Phase completion summaries

---

## ✨ Key Features

### 🤖 AI Content Generation
- **Google Gemini Pro** powered intelligent content
- Generate in all **11 South African languages**
- **4 tone variations** (professional, casual, friendly, energetic)
- **Platform-specific optimization** (Twitter, Instagram, Facebook, LinkedIn)
- Automatic **hashtag generation** with SA context
- Multiple content variations to choose from

### 📤 Multi-Platform Auto-Posting
- **Instagram** - Business accounts, images, carousels
- **Facebook** - Pages, text, images, links
- **Twitter/X** - Tweets, threads, images
- **LinkedIn** - Professional posts, articles, images
- Post immediately or schedule for later
- **Automated posting** via Vercel Cron (every minute)

### 🔐 Secure Authentication & OAuth
- **Better-auth** with email/password + Google OAuth
- **One-click social account connection** (4 platforms)
- **AES-256-GCM token encryption**
- **PKCE for Twitter** OAuth 2.0
- **CSRF protection** on all OAuth flows
- Session management with 7-day expiry

### 📅 Smart Scheduling & Automation
- Visual **calendar view** with drag-and-drop
- **Best time to post** AI recommendations
- **Automation rules** with recurring posts
- Queue management with priorities
- Timeline and list views
- **SAST (UTC+2) timezone** support

### 🌍 South African Context
- Local slang integration ("lekker", "sharp sharp", "howzit")
- SA location references (Joburg, Cape Town, Durban)
- Cultural awareness in AI content
- Local hashtags (#Mzansi, #LocalIsLekker)
- All **11 official languages** supported

### 💳 Credit Management System
- **Free tier:** 10 credits
- **Pro tier:** 500 credits (R299/month)
- **Business tier:** 2000 credits (R999/month)
- Credit deduction tracking
- Top-up and subscription management

### 🔧 Tech Stack
**Frontend:**
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- React Context API

**Backend:**
- Better-auth (authentication)
- Drizzle ORM + Neon PostgreSQL
- Vercel Serverless Functions
- Vercel Cron Jobs

**AI & APIs:**
- Google Gemini Pro (content generation)
- Google Imagen 3 (image generation)
- Meta Graph API (Facebook/Instagram)
- Twitter API v2
- LinkedIn API

**Security:**
- AES-256-GCM encryption
- PKCE for OAuth 2.0
- CSRF protection
- HttpOnly Secure cookies

---

## 📂 Project Structure

```
purple-glow-social-2.0/
├── components/          # React components
├── lib/                 # Utilities and helpers
├── app/                 # Next.js App Router structure
├── docs/                # Documentation
├── specs/               # Feature specifications
├── archive/             # Archived phase completion docs
├── AGENTS.md           # Main developer guide
└── QUICK_REFERENCE.md  # Quick reference
```

---

## 🎯 Current Status

**ALL PHASES COMPLETE - PRODUCTION READY** ✅

### Completed Features
- ✅ **Phase 1-2:** Foundation & UI Components
- ✅ **Phase 3:** Payment System & Admin Dashboard
- ✅ **Phase 4:** Internationalization (11 SA Languages)
- ✅ **Phase 5:** Automation & Scheduling System
- ✅ **Phase 6:** Integration & Polish
- ✅ **Phase 7:** OAuth UI Components
- ✅ **Phase 8:** Authentication & OAuth Backend
- ✅ **Phase 9:** Auto-Posting to Social Platforms
- ✅ **Phase 10:** AI Content Generation (Google Gemini)

### Production Features
- 🔐 **Full Authentication** - Email/password + Google OAuth
- 🔗 **OAuth Integration** - Facebook, Instagram, Twitter, LinkedIn
- 🤖 **AI Content Generation** - Google Gemini Pro with SA context
- 📤 **Auto-Posting** - Post immediately or schedule with cron automation
- 📅 **Smart Scheduling** - Calendar with best time suggestions
- 🌍 **11 Languages** - All South African official languages
- 💳 **Credit System** - Tier-based usage management
- 🔒 **Enterprise Security** - AES-256-GCM encryption, CSRF protection

**Ready for deployment!** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🇿🇦 South African Context

This platform is built with South Africa in mind:
- **SAST (UTC+2)** timezone default
- **ZAR currency** with 15% VAT
- **11 official languages** fully supported
- **Local hashtags** (#LocalIsLekker, #MzansiMagic)
- **SA cultural context** in all content
- **Diverse representation** in mock data

---

## 🧪 Testing

```bash
# Run development server
npm run dev

# Test features
- Navigate to Schedule tab for calendar
- Navigate to Automation tab for rules
- Test language selector (11 languages)
- Try scheduling a post with AI suggestions
```

---

## 📖 For Developers

**New to this project?**
1. Read [AGENTS.md](./AGENTS.md) for complete overview
2. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for common tasks
3. Review [docs/COMPONENT_GUIDE.md](./docs/COMPONENT_GUIDE.md) for component APIs

**Adding features?**
- Follow patterns in existing components
- Use centralized mock data from `lib/mock-data.ts`
- Wrap with ErrorBoundary for complex components
- Add loading skeletons for async operations
- Maintain South African context

---

## 🔐 Authentication

Currently using **mock data** for demonstration.

Better-auth is integrated and ready for activation when connecting to a real backend.

---

## 📚 Documentation

### Production Deployment
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[SECURITY.md](./SECURITY.md)** - Security policies and best practices
- **[LAUNCH_ANNOUNCEMENT.md](./LAUNCH_ANNOUNCEMENT.md)** - Launch announcement template
- **[.env.production.example](./.env.production.example)** - Production environment variables

### Phase Completion Documentation
- **[PHASE_8_AUTHENTICATION_COMPLETE.md](./PHASE_8_AUTHENTICATION_COMPLETE.md)** - Authentication system
- **[PHASE_9_AUTO_POSTING_COMPLETE.md](./PHASE_9_AUTO_POSTING_COMPLETE.md)** - Auto-posting feature
- **[PHASE_10_AI_CONTENT_GENERATION_COMPLETE.md](./PHASE_10_AI_CONTENT_GENERATION_COMPLETE.md)** - AI integration

### Developer Guides
- **[AGENTS.md](./AGENTS.md)** - Complete project overview
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Developer quick reference
- **[docs/COMPONENT_GUIDE.md](./docs/COMPONENT_GUIDE.md)** - Component API reference
- **[docs/CONNECTED_ACCOUNTS_GUIDE.md](./docs/CONNECTED_ACCOUNTS_GUIDE.md)** - OAuth integration guide

### Specifications
- **[specs/social-auth-feature/](./specs/social-auth-feature/)** - OAuth feature specs
- **[specs/ui-completion-and-features/](./specs/ui-completion-and-features/)** - UI feature specs

---

## 🚀 Deployment

### Quick Deploy to Vercel

1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/your-org/purple-glow-social.git
   cd purple-glow-social
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Copy `.env.example` to `.env` and configure:
   
   ```bash
   cp .env.example .env
   ```
   
   **Required Variables:**
   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | PostgreSQL connection string (Neon) |
   | `BETTER_AUTH_SECRET` | Secret key for auth (min 32 chars) |
   | `BETTER_AUTH_URL` | Base URL for auth (e.g., http://localhost:3000) |
   | `NEXT_PUBLIC_BETTER_AUTH_URL` | Same as above, for client-side |
   
   **For Payment Integration:**
   - `POLAR_ACCESS_TOKEN` - Get from Polar.sh dashboard
   - `POLAR_WEBHOOK_SECRET` - Generate in webhook settings
   - `POLAR_ORGANIZATION_ID` - Your Polar organization ID
   - Product IDs for credit packages and subscriptions
   
   **For OAuth/Social Posting:**
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth login
   - `META_APP_ID` / `META_APP_SECRET` - Facebook/Instagram
   - `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` - Twitter/X
   - `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` - LinkedIn
   
   **For AI Content:**
   - `GEMINI_API_KEY` - Google Gemini Pro API key
   
   **For Security:**
   - `TOKEN_ENCRYPTION_KEY` - 64-char hex string for AES-256-GCM
   - `CRON_SECRET` - Secret for cron job authentication
   
   See [docs/POLAR_SETUP_GUIDE.md](docs/POLAR_SETUP_GUIDE.md) for detailed payment setup.

4. **Run Database Migrations**
   - Copy `.env.production.example` to your Vercel project
   - Fill in all required values (see DEPLOYMENT_GUIDE.md)

5. **Deploy**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

6. **Configure OAuth Apps**
   - Update redirect URIs for all OAuth providers
   - See DEPLOYMENT_GUIDE.md for detailed instructions

**Full deployment guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🚧 Future Enhancements

### Phase 11 (Planned)
- 📊 **Analytics Dashboard** - Post performance tracking
- 🎥 **Video Content Support** - Upload and schedule videos
- 📱 **Instagram Stories** - Story creation and posting
- 🤝 **Team Collaboration** - Multi-user accounts
- 🔔 **Real-time Notifications** - Push notifications for events
- 📈 **A/B Testing** - Test content variations
- 🎨 **Brand Voice** - Customize AI tone per brand
- 🌍 **Additional Platforms** - TikTok, Pinterest, YouTube

### Phase 12 (Future)
- 📱 **Mobile Apps** - iOS and Android native apps
- 🔄 **Advanced Automation** - Conditional rules, workflows
- 🎯 **Audience Insights** - Demographics and engagement analysis
- 🤖 **Chatbot Integration** - Social media inbox management
- 🌐 **Multi-account Management** - Manage multiple brands
- 📊 **Custom Reports** - Export analytics and insights

---

## 📄 License

Proprietary - Purple Glow Social Team

---

## 🤝 Contributing

Please read [AGENTS.md](./AGENTS.md) before contributing to understand the architecture and patterns.

---

**Built with ❤️ for South African Businesses** 🇿🇦✨

*Lekker coding!* 🚀
