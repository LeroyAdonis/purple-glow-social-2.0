# 🔐 Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Security Measures Implemented

### Authentication & Authorization
- ✅ **Better-auth** with bcrypt password hashing
- ✅ **Session management** with 7-day expiry
- ✅ **Protected routes** via middleware
- ✅ **Google OAuth 2.0** integration
- ✅ **CSRF protection** on all OAuth flows
- ✅ **HttpOnly, Secure cookies** for session tokens

### Data Protection
- ✅ **AES-256-GCM encryption** for OAuth tokens
- ✅ **Environment variables** for all secrets
- ✅ **SQL injection prevention** via Drizzle ORM
- ✅ **XSS protection** via React automatic escaping
- ✅ **HTTPS/SSL** enforced (Vercel)

### OAuth Security
- ✅ **State parameter** for CSRF protection
- ✅ **PKCE (Proof Key for Code Exchange)** for Twitter OAuth
- ✅ **Token refresh** logic implemented
- ✅ **Secure token storage** with encryption
- ✅ **Scope validation** on all OAuth flows

### API Security
- ✅ **Session validation** on all authenticated endpoints
- ✅ **Rate limiting** (recommended to implement)
- ✅ **Input validation** on all user inputs
- ✅ **Error messages** don't leak sensitive information
- ✅ **CORS configuration** (same-origin by default)

### Infrastructure Security
- ✅ **Database connection pooling** (Neon)
- ✅ **Secure headers** (X-Frame-Options, CSP, etc.)
- ✅ **Cron job authentication** with secret token
- ✅ **Environment separation** (dev/staging/production)

---

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** Create a Public GitHub Issue

Security vulnerabilities should be reported privately to prevent exploitation.

### 2. Report via Email

Send details to: **security@purpleglowsocial.co.za**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Expected Response Time

- **Initial Response:** Within 24-48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity
  - Critical: 1-3 days
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release cycle

### 4. Disclosure Policy

- We follow **responsible disclosure**
- Will credit researchers (unless anonymity requested)
- Public disclosure after fix is deployed (90 days maximum)

---

## Security Best Practices for Developers

### Environment Variables
```bash
# NEVER commit these files:
.env
.env.local
.env.production
.env.production.local

# Always use .env.example for documentation
```

### Secret Management
```typescript
// ✅ Good - Use environment variables
const apiKey = process.env.GEMINI_API_KEY;

// ❌ Bad - Hardcoded secrets
const apiKey = "AIzaSyDlOBk..."; // NEVER DO THIS
```

### Database Queries
```typescript
// ✅ Good - Use ORM with parameterized queries
await db.query.users.findFirst({
  where: eq(users.id, userId),
});

// ❌ Bad - String interpolation (SQL injection risk)
await db.execute(`SELECT * FROM users WHERE id = '${userId}'`);
```

### OAuth Tokens
```typescript
// ✅ Good - Encrypt tokens before storage
const encryptedToken = await encryptToken(accessToken);
await db.insert(connectedAccounts).values({
  accessToken: encryptedToken,
});

// ❌ Bad - Store tokens in plaintext
await db.insert(connectedAccounts).values({
  accessToken: accessToken, // NEVER DO THIS
});
```

### API Endpoints
```typescript
// ✅ Good - Validate session
const session = await auth.api.getSession({ headers });
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// ❌ Bad - No authentication check
// Proceed without session validation
```

---

## Security Checklist for Deployment

### Pre-Deployment
- [ ] All environment variables use production values
- [ ] No secrets committed to repository
- [ ] OAuth redirect URIs use HTTPS
- [ ] Database uses SSL/TLS connection
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error monitoring configured (Sentry)

### Post-Deployment
- [ ] HTTPS/SSL certificate valid
- [ ] Security headers configured
- [ ] OAuth apps approved for production
- [ ] Database backups enabled
- [ ] Monitoring alerts configured
- [ ] Incident response plan documented

---

## Known Security Considerations

### Token Refresh
**Status:** Implemented for core functionality
**Note:** Background job for automatic token refresh is planned for Phase 11

### Rate Limiting
**Status:** Not implemented
**Recommendation:** Implement rate limiting on:
- `/api/auth/*` endpoints
- `/api/ai/*` endpoints
- `/api/posts/*` endpoints

**Suggested Solution:**
```typescript
// Use Upstash Rate Limit or similar
import { Ratelimit } from "@upstash/ratelimit";
```

### Brute Force Protection
**Status:** Partial (Better-auth has built-in protections)
**Recommendation:** Add additional rate limiting on login endpoints

### API Key Rotation
**Status:** Manual rotation required
**Recommendation:** Implement automated key rotation for:
- OAuth tokens
- API keys
- Encryption keys

---

## Security Updates

### How We Handle Security Updates

1. **Dependency Updates**
   - Weekly automated checks via Dependabot
   - Critical security patches applied immediately
   - Non-critical updates reviewed and applied monthly

2. **Framework Updates**
   - Next.js updates reviewed for security improvements
   - React security patches applied promptly
   - Node.js LTS versions maintained

3. **Third-Party Services**
   - OAuth provider security updates monitored
   - API service announcements tracked
   - Database security patches applied

---

## Compliance

### Data Protection
- **GDPR Compliance:** User data handling follows GDPR principles
- **POPIA Compliance:** South African data protection standards
- **Data Retention:** Users can request data deletion
- **Right to Access:** Users can export their data

### OAuth Compliance
- **Meta Platform Policy:** Compliant with Facebook/Instagram policies
- **Twitter API Policy:** Follows Twitter developer agreement
- **LinkedIn API Policy:** Adheres to LinkedIn terms
- **Google OAuth Policy:** Compliant with Google OAuth requirements

---

## Security Contacts

**Security Team:** security@purpleglowsocial.co.za  
**Support Team:** support@purpleglowsocial.co.za  
**Emergency:** Use security email with [URGENT] prefix

---

## Version History

### v1.0.0 (Current)
- Initial production release
- AES-256-GCM token encryption
- PKCE for Twitter OAuth
- Better-auth integration
- CSRF protection on OAuth flows

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist#security)
- [Better-auth Security](https://www.better-auth.com/docs/concepts/security)

---

*Last Updated: Production Deployment*  
*Review Frequency: Quarterly or after security incidents*
