import { api } from './client'

/**
 * Fire-and-forget usage telemetry. Presence signals only.
 * Only call when authenticated — a 401 with no refresh token redirects to /login.
 * The trailing catch ensures telemetry never surfaces an error into the UI.
 */
export function trackEvent(
  event_type: string,
  surface?: string,
  metadata?: Record<string, unknown>,
): void {
  api.post('/events', { event_type, surface, metadata }).catch(() => {})
}
