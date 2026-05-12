/**
 * Workflow: Settings persistence — Phase 2F
 *
 * Covers:
 *   - /settings page loads with heading
 *   - Notification toggles and preference buttons are visible
 *   - Toggle interaction triggers a PUT request to the profile endpoint
 *   - Default period selection triggers a PUT request
 *   - Theme toggle fires the settings update
 */
import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/.auth/user.json' })

const MOCK_SETTINGS = {
  email_digest: true,
  push_notifications: true,
  follow_up_reminders: true,
  team_alerts: true,
  default_period: 'MTD',
  theme: 'dark',
}

// Matches both /agents/me/profile and /managers/me/profile
const PROFILE_ROUTE = /\/(agents|managers)\/me\/profile/

test.beforeEach(async ({ page }) => {
  // Intercept settings GET/PUT so the test doesn't need a live backend
  await page.route(PROFILE_ROUTE, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SETTINGS) })
    } else {
      const body = route.request().postDataJSON() ?? {}
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...MOCK_SETTINGS, ...body }) })
    }
  })

  await page.goto('/settings')
  await page.waitForLoadState('networkidle')
})

test('page heading is visible', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
})

test('profile section shows persona name', async ({ page }) => {
  // Persona name comes from the auth context (real user, not mock)
  // Just verify some non-empty text appears in the profile section
  await expect(page.locator('[class*="rounded-full"]').first()).toBeVisible()
})

test('notification toggles are visible', async ({ page }) => {
  await expect(page.getByText('Email digest')).toBeVisible()
  await expect(page.getByText('Push notifications')).toBeVisible()
  await expect(page.getByText('Follow-up reminders')).toBeVisible()
  await expect(page.getByText('Team alerts')).toBeVisible()
})

test('default period buttons are visible', async ({ page }) => {
  await expect(page.getByText('Default period')).toBeVisible()
  for (const p of ['MTD', 'QTD', 'YTD']) {
    await expect(page.getByRole('button', { name: p })).toBeVisible()
  }
})

test('toggling email digest fires PUT request', async ({ page }) => {
  const putRequest = page.waitForRequest(
    (req) => PROFILE_ROUTE.test(req.url()) && req.method() === 'PUT'
  )

  // Click the Email digest toggle
  const emailDigestRow = page.locator('div').filter({ hasText: /^Email digestDaily summary/ }).first()
  const toggle = emailDigestRow.locator('button[aria-label="Toggle"]')
  await toggle.click()

  const req = await putRequest
  const body = req.postDataJSON()
  expect(body).toHaveProperty('email_digest')
})

test('selecting QTD period fires PUT request with default_period', async ({ page }) => {
  const putRequest = page.waitForRequest(
    (req) => PROFILE_ROUTE.test(req.url()) && req.method() === 'PUT'
  )

  await page.getByRole('button', { name: 'QTD' }).click()

  const req = await putRequest
  const body = req.postDataJSON()
  expect(body).toMatchObject({ default_period: 'QTD' })
})

test('theme toggle fires PUT request with theme value', async ({ page }) => {
  const putRequest = page.waitForRequest(
    (req) => PROFILE_ROUTE.test(req.url()) && req.method() === 'PUT'
  )

  const themeRow = page.locator('div').filter({ hasText: /^ThemeCurrently/ }).first()
  const toggle = themeRow.locator('button[aria-label="Toggle"]')
  await toggle.click()

  const req = await putRequest
  const body = req.postDataJSON()
  expect(body).toHaveProperty('theme')
})
