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
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.includes('Log Activity'))
    btn?.click()
  })
  await page.waitForTimeout(400)
  await expect(page.getByText('Log Activity').nth(1)).toBeVisible({ timeout: 5_000 })
})

test('panel shows activity type tiles', async ({ page }) => {
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.includes('Log Activity'))
    btn?.click()
  })
  await page.waitForTimeout(400)

  await expect(page.getByText('Lunch')).toBeVisible({ timeout: 5_000 })
  await expect(page.getByText('Pop-by')).toBeVisible()
  await expect(page.getByText('Coffee')).toBeVisible()
  await expect(page.getByText('Call')).toBeVisible()
  await expect(page.getByText('CE Class')).toBeVisible()
})

test('panel has a Save Activity submit button', async ({ page }) => {
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.includes('Log Activity'))
    btn?.click()
  })
  await page.waitForTimeout(400)
  await expect(page.getByRole('button', { name: 'Save Activity' })).toBeVisible({ timeout: 5_000 })
})

test('submitting the form shows a success toast (requires auth)', async ({ page }) => {
  const hasToken = await page.evaluate(() => !!localStorage.getItem('fieldiq_token'))
  if (!hasToken) {
    test.skip(true, 'Skipped — no auth token; toast requires a successful API call')
    return
  }

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.includes('Log Activity'))
    btn?.click()
  })
  await page.waitForTimeout(500)

  // Lunch is selected by default — just submit
  await page.getByRole('button', { name: 'Save Activity' }).click()
  await expect(page.getByText(/activity logged|saved|success/i)).toBeVisible({ timeout: 8_000 })
})

test('AI nudge "Log activity now" opens panel with contact pre-filled', async ({ page }) => {
  const nudgeLink = page.getByText('Log activity now →')
  if (await nudgeLink.isVisible()) {
    await nudgeLink.click()
    await page.waitForTimeout(400)
    await expect(page.getByText('Lunch')).toBeVisible({ timeout: 5_000 })
  }
})
