# Contributing to Purple Glow Social 2.0

Thank you for your interest in contributing to Purple Glow Social 2.0! This document provides guidelines for contributing to the project.

## 🇿🇦 South African Context

This project is designed specifically for South African businesses. All contributions should maintain cultural authenticity and support all 11 official South African languages.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (we use Neon)
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/purple-glow-social-2.0.git
cd purple-glow-social-2.0
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Set up your local database and update `DATABASE_URL`

5. Push the schema:
```bash
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

## Development Workflow

### Branch Naming

- `feature/short-description` - New features
- `fix/short-description` - Bug fixes
- `docs/short-description` - Documentation updates
- `refactor/short-description` - Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: add LinkedIn posting support
fix: resolve OAuth callback error
docs: update API documentation
refactor: simplify credit validation logic
test: add unit tests for content validator
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the code standards
3. Run tests: `npm run test:run`
4. Run build: `npm run build`
5. Run linting: `npm run lint`
6. Create a pull request with a clear description
7. Request review from a maintainer

## Code Standards

### TypeScript

- Use strict TypeScript - no `any` types
- Define interfaces for all data structures
- Add JSDoc comments for public functions

```typescript
// ✅ Good
interface PostContent {
  text: string;
  imageUrl?: string;
}

async function createPost(content: PostContent): Promise<Post> {
  // implementation
}

// ❌ Bad
async function createPost(content: any) {
  // no types
}
```

### Authentication

Always validate sessions in API routes:

```typescript
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... rest of logic
}
```

### Database

Use Drizzle ORM for all database queries:

```typescript
import { db } from '@/drizzle/db';
import { posts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

const userPosts = await db
  .select()
  .from(posts)
  .where(eq(posts.userId, userId));
```

### South African Languages

When adding content, support all 11 languages:

```typescript
const SA_LANGUAGES = {
  en: 'English',
  af: 'Afrikaans',
  zu: 'isiZulu',
  xh: 'isiXhosa',
  nso: 'Sepedi',
  tn: 'Setswana',
  st: 'Sesotho',
  ts: 'Xitsonga',
  ss: 'siSwati',
  ve: 'Tshivenda',
  nr: 'isiNdebele',
};
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test:run -- tests/unit/validation.test.ts
```

### Writing Tests

Place tests in the `tests/` directory:

- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests

Example test:

```typescript
import { describe, it, expect } from 'vitest';
import { validateContent } from '@/lib/ai/content-validator';

describe('validateContent', () => {
  it('should validate content within character limits', () => {
    const result = validateContent('Hello, Mzansi!', 'twitter', 'en');
    expect(result.isValid).toBe(true);
    expect(result.withinLimit).toBe(true);
  });
});
```

## Documentation

### When to Update Docs

- Adding new features
- Changing API endpoints
- Modifying environment variables
- Updating database schema

### Key Documentation Files

- `AGENTS.md` - Main project documentation
- `README.md` - Project overview
- `docs/API_DOCUMENTATION.md` - API reference
- `docs/TROUBLESHOOTING.md` - Common issues

## Security

### Do's

- Use environment variables for secrets
- Encrypt sensitive data (OAuth tokens)
- Validate all user input
- Check session on every protected route

### Don'ts

- Never commit secrets or API keys
- Never log sensitive data
- Never trust user input without validation
- Never skip rate limiting on public endpoints

## Getting Help

- Check existing issues for similar problems
- Read the troubleshooting guide: `docs/TROUBLESHOOTING.md`
- Ask in discussions or create an issue

## Code of Conduct

- Be respectful and inclusive
- Welcome developers from all backgrounds
- Appreciate South Africa's diverse cultures
- Help newcomers learn and grow

---

**Sharp sharp, welcome to the team! Let's build something lekker together! 🇿🇦✨**
