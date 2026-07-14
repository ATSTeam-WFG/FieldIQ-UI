/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle (.next/standalone) so the app runs as a
  // Node server in a container on Azure Container Apps. Required for middleware.ts
  // and the Sentry server/edge runtimes, which a static export cannot host.
  output: 'standalone',
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

const { withSentryConfig } = require('@sentry/nextjs')

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, { silent: true, hideSourceMaps: true })
  : nextConfig
