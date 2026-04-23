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
  id: 'test-agent-id',
  name: 'Sarah Chen',
  initials: 'SC',
  role: 'agent',
  agency_id: null,
  territory: 'Buckhead',
  title: 'Senior Title Agent',
  monthly_budget: 1500,
  rep_tier: 'senior_sales_rep',
  team_id: null,
  email_digest: true,
  push_notifications: true,
  follow_up_reminders: true,
  team_alerts: true,
  default_period: 'MTD',
  theme: 'dark',
}

test.beforeEach(async ({ page }) => {
  // Intercept settings GET so the test doesn't need a live backend
  await page.route('**/agents/me/profile', async (route) => {
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
  await expect(page.getByText('Sarah Chen')).toBeVisible()
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
    (req) => req.url().includes('/agents/me/profile') && req.method() === 'PUT'
  )

  // Click the Email digest toggle (first toggle button on the page after profile)
  const emailDigestRow = page.locator('div').filter({ hasText: /^Email digestDaily summary/ }).first()
  const toggle = emailDigestRow.locator('button[aria-label="Toggle"]')
  await toggle.click()

  const req = await putRequest
  const body = req.postDataJSON()
  expect(body).toHaveProperty('email_digest')
})

test('selecting QTD period fires PUT request with default_period', async ({ page }) => {
  const putRequest = page.waitForRequest(
    (req) => req.url().includes('/agents/me/profile') && req.method() === 'PUT'
  )

  await page.getByRole('button', { name: 'QTD' }).click()

  const req = await putRequest
  const body = req.postDataJSON()
  expect(body).toMatchObject({ default_period: 'QTD' })
})

test('theme toggle fires PUT request with theme value', async ({ page }) => {
  const putRequest = page.waitForRequest(
    (req) => req.url().includes('/agents/me/profile') && req.method() === 'PUT'
  )

  const themeRow = page.locator('div').filter({ hasText: /^ThemeCurrently/ }).first()
  const toggle = themeRow.locator('button[aria-label="Toggle"]')
  await toggle.click()

  const req = await putRequest
  const body = req.postDataJSON()
  expect(body).toHaveProperty('theme')
})
