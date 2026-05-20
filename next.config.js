/** @type {import('next').NextConfig} */
const nextConfig = {}

const { withSentryConfig } = require('@sentry/nextjs')

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, { silent: true, hideSourceMaps: true })
  : nextConfig
