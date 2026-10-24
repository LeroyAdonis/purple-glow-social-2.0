'use client';

import React, { useState } from 'react';
import { signUp, signIn } from '../../lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logger } from '@/lib/logger';

import '@/design-system/posta/tokens.css';

export default function SignUpPage() {
  const router = useRouter();
  const appBase = process.env.NEXT_PUBLIC_APP_BASE_PATH ?? '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Those passwords do not match. Type them again.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Your password needs at least 8 characters.');
      setIsLoading(false);
      return;
    }

    try {
      await signUp.email({
        email,
        password,
        name,
        callbackURL: `${appBase}/dashboard`,
      });
      router.push('/dashboard');
    } catch (err: any) {
      logger.auth.exception(err, { action: 'email-signup', email, hasName: !!name });
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('already')) {
        setError('That email is already registered — sign in instead, or reset your password.');
      } else {
        setError(msg || 'Could not create your account. Try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: `${appBase}/dashboard`,
      });
    } catch (err: any) {
      logger.auth.exception(err, { action: 'google-oauth-signup', provider: 'google' });
      setError('Could not sign up with Google. Try again.');
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
          <p style={{ color: 'var(--posta-ink-soft)', marginTop: 8 }}>Create your account.</p>
        </div>

        {error && (
          <div role="alert" style={{ background: 'var(--posta-white)', border: '1px solid var(--posta-danger)', borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 16, color: 'var(--posta-danger)', fontSize: 'var(--text-small)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="name" style={labelStyle}>Your name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Thabo Nkosi" autoComplete="name" required disabled={isLoading} style={fieldStyle} />
          </div>
          <div>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourbusiness.co.za" autoComplete="email" required disabled={isLoading} style={fieldStyle} />
          </div>
          <div>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" required minLength={8} disabled={isLoading} style={fieldStyle} />
            <p style={{ fontSize: 'var(--text-meta)', color: 'var(--posta-ink-soft)', marginTop: 4 }}>At least 8 characters.</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" style={labelStyle}>Confirm password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" required disabled={isLoading} style={fieldStyle} />
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
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div style={{ margin: '24px 0', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--posta-clay)', fontWeight: 700, textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>

        <ul style={{ marginTop: 24, fontSize: 'var(--text-small)', color: 'var(--posta-ink-soft)', lineHeight: 1.6, paddingLeft: 18 }}>
          <li>10 free credits to start</li>
          <li>Posts in all 11 South African languages</li>
          <li>Connect Instagram, Facebook, X and LinkedIn</li>
          <li>Schedule posts ahead of time</li>
        </ul>
      </div>
    </div>
  );
}