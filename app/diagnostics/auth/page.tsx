'use client';

import { useEffect, useState } from 'react';

interface DiagnosticResult {
  success: boolean;
  timestamp: string;
  environment: {
    nodeEnv?: string;
    vercelEnv?: string;
    isProduction: boolean;
  };
  configuration: {
    databaseConfigured: boolean;
    secretConfigured: boolean;
    baseUrl: string;
    publicUrl: string;
  };
  issues: Array<{
    issue: string;
    solution: string;
  }>;
}

export default function AuthDiagnosticsPage() {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/diagnostics/auth')
      .then(res => res.json())
      .then(data => {
        setResult(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-neon-grape border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Running diagnostics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="aerogel-card p-8 rounded-2xl border border-red-500/20 bg-red-500/10">
            <i className="fa-solid fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
            <h1 className="text-2xl font-bold text-red-400 mb-4">Diagnostic Error</h1>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-void py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 glow-text">Authentication Diagnostics</h1>
          <p className="text-gray-400">Debugging authentication issues in production</p>
        </div>

        {/* Status Overview */}
        <div className="aerogel-card p-6 rounded-2xl border border-glass-border mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-4 h-4 rounded-full ${result.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <h2 className="text-xl font-bold">Status: {result.success ? '✅ Working' : '❌ Issues Found'}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2">Environment</h3>
              <div className="space-y-1 text-sm">
                <div>Node Env: {result.environment.nodeEnv || 'Not set'}</div>
                <div>Vercel Env: {result.environment.vercelEnv || 'Not set'}</div>
                <div>Production: {result.environment.isProduction ? '✅' : '❌'}</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2">Configuration</h3>
              <div className="space-y-1 text-sm">
                <div>Database: {result.configuration.databaseConfigured ? '✅' : '❌'}</div>
                <div>Secret: {result.configuration.secretConfigured ? '✅' : '❌'}</div>
                <div>Base URL: {result.configuration.baseUrl}</div>
                <div>Public URL: {result.configuration.publicUrl}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Issues */}
        {result.issues.length > 0 && (
          <div className="aerogel-card p-6 rounded-2xl border border-red-500/20 bg-red-500/10 mb-6">
            <h2 className="text-xl font-bold text-red-400 mb-4">Issues Found</h2>
            <div className="space-y-4">
              {result.issues.map((issue, index) => (
                <div key={index} className="border border-red-500/20 rounded-xl p-4">
                  <h3 className="font-bold text-red-300 mb-2">{issue.issue}</h3>
                  <p className="text-gray-300">{issue.solution}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Fixes */}
        <div className="aerogel-card p-6 rounded-2xl border border-glass-border mb-6">
          <h2 className="text-xl font-bold mb-4">Quick Fixes for Vercel</h2>
          <div className="space-y-4">
            <div className="border border-glass-border rounded-xl p-4">
              <h3 className="font-bold mb-2">1. Set Environment Variables</h3>
              <p className="text-gray-300 mb-2">Go to Vercel Dashboard → Your Project → Settings → Environment Variables</p>
              <div className="bg-black/50 rounded-lg p-3 font-mono text-sm">
                <div>DATABASE_URL=postgresql://your-neon-connection-string</div>
                <div>BETTER_AUTH_SECRET=your-32-char-secret</div>
                <div>BETTER_AUTH_URL=https://purple-glow-social-2-0.vercel.app</div>
                <div>NEXT_PUBLIC_BETTER_AUTH_URL=https://purple-glow-social-2-0.vercel.app</div>
              </div>
            </div>

            <div className="border border-glass-border rounded-xl p-4">
              <h3 className="font-bold mb-2">2. Redeploy</h3>
              <p className="text-gray-300">After setting environment variables, trigger a new deployment:</p>
              <div className="bg-black/50 rounded-lg p-3 font-mono text-sm">
                git push origin main
              </div>
            </div>

            <div className="border border-glass-border rounded-xl p-4">
              <h3 className="font-bold mb-2">3. Test Authentication</h3>
              <p className="text-gray-300">Try logging in again after redeployment</p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="aerogel-card p-6 rounded-2xl border border-glass-border">
          <h2 className="text-xl font-bold mb-4">Debug Information</h2>
          <details className="cursor-pointer">
            <summary className="font-bold mb-2">Full Diagnostic Result (JSON)</summary>
            <pre className="bg-black/50 rounded-lg p-4 text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400">
            Need help? Check the{' '}
            <a href="/docs/troubleshooting" className="text-neon-grape hover:underline">
              troubleshooting guide
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}