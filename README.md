# Purple Glow Social 2.0 🇿🇦

**AI-Powered Social Media Management for South Africa**

Purple Glow Social 2.0 is a comprehensive social media automation platform designed specifically for South African businesses. Generate, schedule, and automate social media content across multiple platforms in all 11 official South African languages.

---

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

## ✨ Features

### ✅ Implemented
- 🌍 **11 South African Languages** - Full support for all official languages
- 📅 **Smart Scheduling** - Calendar, List, and Timeline views with AI-powered best time suggestions
- 🤖 **Automation Rules** - Set-and-forget content automation with 4-step wizard
- 💡 **AI Suggestions** - Smart recommendations for hashtags, timing, and content
- 💳 **Payment Simulation** - Polar integration for subscriptions and credits
- 👤 **User Management** - Admin dashboard with user and transaction management
- 🎨 **South African Design** - Purple Glow branding with SA cultural context
- ♿ **Accessible** - WCAG AA compliant with keyboard navigation
- 📱 **Responsive** - Mobile-first design for all screen sizes

### 🔧 Tech Stack
- React 18+ with TypeScript
- Vite build tool
- Tailwind CSS
- Font Awesome icons
- React Context API for state
- Mock data system (ready for backend)

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

**Phase 6 Complete** ✅
- All core features implemented
- Full documentation
- Production-ready polish
- Ready for Phase 7 (Final Testing)

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

## 🚧 Roadmap

### Phase 7 (Next)
- Final testing and cleanup
- Browser compatibility testing
- Performance profiling

### Future Phases
- Real backend integration
- Authentication system
- WebSocket for real-time updates
- Progressive Web App (PWA)
- Analytics integration

---

## 📄 License

Proprietary - Purple Glow Social Team

---

## 🤝 Contributing

Please read [AGENTS.md](./AGENTS.md) before contributing to understand the architecture and patterns.

---

**Built with ❤️ for South African Businesses** 🇿🇦✨

*Lekker coding!* 🚀
