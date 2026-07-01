/**
 * Session expiry E2E tests
 *
 * Covers:
 *   - /login?expired=1 renders the amber "session expired" banner
 *   - Missing auth cookie (middleware) redirects to /login without ?expired=1
 *   - Stale token + failed refresh redirects to /login?expired=1 with banner
 */
import { test, expect } from '@playwright/test'

// All tests start with no auth state
test.use({ storageState: { cookies: [], origins: [] } })

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

test('session expired banner renders on /login?expired=1', async ({ page }) => {
  await page.goto('/login?expired=1')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText(/session has expired/i)).toBeVisible()
})

test('no auth cookie redirects to /login without expired param', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForURL(/\/login/, { timeout: 10_000 })
  expect(page.url()).not.toContain('expired=1')
})

test('stale token with failed refresh redirects to /login?expired=1', async ({ page }) => {
  // Mock both auth endpoints to return 401 — simulates a fully expired session
  await page.route(`${API}/auth/me`, route =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Unauthorized' }),
    })
  )
  await page.route(`${API}/auth/refresh`, route =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Refresh token invalid or expired' }),
    })
  )

  // Navigate to a public page first to establish the origin, then seed fake tokens
  await page.goto('/login')
  await page.evaluate(() => {
    localStorage.setItem('fieldiq_token', 'fake.stale.token')
    localStorage.setItem('fieldiq_refresh_token', 'fake-refresh-token')
  })
  await page.context().addCookies([{
    name: 'fieldiq_has_token',
    value: '1',
    domain: 'localhost',
    path: '/',
    sameSite: 'Lax',
  }])

  // Navigate to a protected page — middleware passes (cookie present),
  // first API call 401s, refresh attempt 401s, client does window.location.href = '/login?expired=1'.
  // Use expect(page).toHaveURL (polling) rather than waitForURL (navigation-event-based)
  // so that mid-navigation request aborts don't surface as test errors.
  await page.goto('/dashboard', { waitUntil: 'commit' }).catch(() => {})
  await expect(page).toHaveURL(/\/login\?expired=1/, { timeout: 10_000 })
  await expect(page.getByText(/session has expired/i)).toBeVisible()
})
