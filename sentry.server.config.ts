import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Set environment
  environment: process.env.NODE_ENV,

  // Filter out noisy errors
  beforeSend(event) {
    // Don't send health check errors
    if (event.request?.url?.includes('/api/health')) {
      return null;
    }
    return event;
  },
});
