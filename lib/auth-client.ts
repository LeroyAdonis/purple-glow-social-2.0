import { createAuthClient } from "better-auth/react";

// Determine base URL with smart fallback for production
const getBaseURL = () => {
  // Use explicitly set environment variable if available
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }
  
  // In browser, use the current origin (handles Vercel deployments automatically)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side fallback to localhost during development
  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  basePath: "/api/auth",
});

export const { signIn, signUp, signOut, useSession } = authClient;
