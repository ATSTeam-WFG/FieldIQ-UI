import { api } from './client'

export type FeedbackBucket = 'defect' | 'refinement' | 'capability'

/**
 * Submit tester feedback. Route, version and browser ride along automatically —
 * that context is the reason this is a widget and not an email alias, so it is
 * never left to the reporter to remember.
 *
 * User, role, agency and recent telemetry are resolved server-side.
 */
export function submitFeedback(bucket: FeedbackBucket, message: string, route: string) {
  return api.post('/feedback', {
    bucket,
    message,
    route,
    app_version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
  })
}
