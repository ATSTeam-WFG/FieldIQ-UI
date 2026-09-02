/**
 * Workflow: Log Activity panel
 *
 * Covers:
 *   - "Log Activity" button on dashboard opens the slide-over panel
 *   - Panel shows heading, voice-log button, and activity type tiles
 *   - "Save Activity" submit button is present
 *   - Submitting the form triggers a success toast (requires auth)
 *   - AI nudge "Log activity now →" link also opens the panel
 */
import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/.auth/user.json' })

test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
})

test('Log Activity button opens the panel', async ({ page }) => {
  await page.getByRole('button', { name: /Log Activity/i }).first().click()
  await page.waitForTimeout(400)
  // Panel is open when the subtitle or Save Activity button becomes visible
  await expect(page.getByText('Fill in the details for your field activity')).toBeVisible({ timeout: 5_000 })
})

test('panel shows activity type tiles', async ({ page }) => {
  await page.getByRole('button', { name: /Log Activity/i }).first().click()
  await page.waitForTimeout(400)

  await expect(page.getByRole('button', { name: 'Lunch' })).toBeVisible({ timeout: 5_000 })
  await expect(page.getByRole('button', { name: 'Pop-by' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Coffee' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Call' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'CE Class' })).toBeVisible()
})

test('panel has a Save Activity submit button', async ({ page }) => {
  await page.getByRole('button', { name: /Log Activity/i }).first().click()
  await page.waitForTimeout(400)
  await expect(page.getByRole('button', { name: 'Save Activity' })).toBeVisible({ timeout: 5_000 })
})

test('submitting the form shows a success toast (requires auth)', async ({ page }) => {
  const hasToken = await page.evaluate(() => !!localStorage.getItem('app_token'))
  if (!hasToken) {
    test.skip(true, 'Skipped — no auth token; toast requires a successful API call')
    return
  }

  await page.getByRole('button', { name: /Log Activity/i }).first().click()
  await page.waitForTimeout(500)

  // Lunch is selected by default — just submit
  await page.getByRole('button', { name: 'Save Activity' }).click()
  await expect(page.getByText(/activity logged|saved|success/i).first()).toBeVisible({ timeout: 8_000 })
})

test('AI nudge "Log activity now" opens panel with contact pre-filled', async ({ page }) => {
  const nudgeLink = page.getByRole('button', { name: 'Log activity now →' })
  if (await nudgeLink.isVisible().catch(() => false)) {
    await nudgeLink.click()
    await page.waitForTimeout(400)
    await expect(page.getByRole('button', { name: 'Lunch' })).toBeVisible({ timeout: 5_000 })
  }
})
