// Loads the Sentry server and edge configs. Without this file Next never
// imports sentry.server.config.ts or sentry.edge.config.ts, so only the
// browser is instrumented — server components, route handlers and middleware
// report nothing.
//
// Requires `experimental.instrumentationHook` in next.config.js on Next 14;
// the hook is stable (and the flag deprecated) from Next 15.
//
// `onRequestError` is deliberately not exported: it needs Next 15, and this
// app is on 14.2.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}
