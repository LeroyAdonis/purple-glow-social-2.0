'use client';

import React, { useState } from 'react';
import { signIn } from '../../lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logger } from '../../lib/logger';

import '@/design-system/posta/tokens.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read at call time, not render time: keeps the route server-renderable.
  const resolveRedirectTo = () => {
    const appBase = process.env.NEXT_PUBLIC_APP_BASE_PATH ?? '';
    if (typeof window === 'undefined') return `${appBase}/dashboard`;
    const target = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
    return `${appBase}${target}`;
  };

  React.useEffect(() => {
    logger.auth.debug('Login page loaded', {
      hasAuthURL: !!process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
      isProduction: typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'),
      redirectTo: resolveRedirectTo()
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const redirectTo = resolveRedirectTo();
      logger.auth.info('Login attempt started', { email, redirectTo });

      const result = await signIn.email({
        email,
        password,
        callbackURL: redirectTo,
      });

      if (result?.error) {
        logger.auth.warn('Login failed', { email, error: result.error.message });
        setError(result.error.message || 'That email or password is not right. Try again, or reset your password.');
        setIsLoading(false);
        return;
      }

      logger.auth.info('Login successful', { email, redirectTo });
      window.location.href = redirectTo;
    } catch (err: any) {
      logger.auth.exception(err, { action: 'email-login', email });
      setError(err.message || 'Something went wrong signing you in. Try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const redirectTo = resolveRedirectTo();
    setIsLoading(true);
    setError(null);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: redirectTo,
      });
    } catch (err: any) {
      if (err?.message?.includes('AbortError') || err?.name === 'AbortError') {
        logger.auth.debug('Google sign-in cancelled by user');
      } else {
        logger.auth.exception(err, { action: 'google-oauth-login' });
        setError('Could not sign in with Google. Try again.');
      }
      setIsLoading(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    padding: '0 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--posta-line)',
    background: 'var(--posta-white)',
    color: 'var(--posta-ink)',
    fontSize: 'var(--text-body)',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--text-small)',
    fontWeight: 500,
    color: 'var(--posta-ink)',
    marginBottom: 8,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--posta-paper)', color: 'var(--posta-ink)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, letterSpacing: '-0.045em', color: 'var(--posta-ink)' }}>posta</div>
          <h1 style={{ color: 'var(--posta-ink-soft)', marginTop: 8 }}>Welcome back.</h1>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: 'var(--posta-white)',
              border: '1px solid var(--posta-danger)',
              borderRadius: 'var(--radius-sm)',
              padding: 12,
              marginBottom: 16,
              color: 'var(--posta-danger)',
              fontSize: 'var(--text-small)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.co.za"
              autoComplete="email"
              required
              disabled={isLoading}
              style={fieldStyle}
            />
          </div>
          <div>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={isLoading}
              style={fieldStyle}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: 48,
              width: '100%',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--posta-gold)',
              color: 'var(--posta-ink)',
              fontWeight: 700,
              fontSize: 'var(--text-body)',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ margin: '24px 0', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              color: 'var(--posta-ink)',
              border: '1px solid var(--posta-line)',
              fontWeight: 500,
              fontSize: 'var(--text-body)',
              cursor: 'pointer',
            }}
          >
            Continue with Google
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 'var(--text-small)', color: 'var(--posta-ink-soft)' }}>
          New here?{' '}
          <Link href="/signup" style={{ color: 'var(--posta-clay)', fontWeight: 700, textDecoration: 'underline', padding: '14px 6px' }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}