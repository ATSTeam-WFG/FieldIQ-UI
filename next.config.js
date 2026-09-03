/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle (.next/standalone) so the app runs as a
  // Node server in a container on Azure Container Apps. Required for middleware.ts
  // and the Sentry server/edge runtimes, which a static export cannot host.
  output: 'standalone',
  // Required on Next 14 for instrumentation.ts to run at all — it is what
  // loads the Sentry server/edge configs. Stable (and this flag deprecated)
  // from Next 15; drop it on that upgrade.
  experimental: {
    instrumentationHook: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

const { withSentryConfig } = require('@sentry/nextjs')

// Source maps only upload when the auth token is present, so local and
// preview builds stay fast and never fail on a missing credential.
const sentryBuildOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Uploads a wider set of files so framework frames resolve too, not just
  // application code — worth the extra upload time for readable traces.
  widenClientFileUpload: true,
  sourcemaps: {
    // Maps go to Sentry, then are deleted from .next/static so they are never
    // served publicly. Server maps in .next/server are kept: they are needed
    // at runtime and are not web-reachable.
    deleteSourcemapsAfterUpload: true,
  },
}

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryBuildOptions)
  : nextConfig
