import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // NODE_ENV is 'production' for every deployed build, which would make
    // alpha and prod indistinguishable in Sentry. Mirrors the backend's
    // ENVIRONMENT setting; falls back so local dev still tags correctly.
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? process.env.NODE_ENV,
    // Both Vercel apps share one DSN, so without this their events are
    // indistinguishable in the same Sentry project.
    initialScope: { tags: { app: 'web' } },
    integrations: [Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false })],
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  })
}
