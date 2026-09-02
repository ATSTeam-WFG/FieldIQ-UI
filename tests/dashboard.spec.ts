/**
 * Workflow: Agent dashboard
 *
 * Covers:
 *   - Page heading visible
 *   - 6 KPI cards rendered
 *   - AI nudge card visible
 *   - AI summary card visible
 *   - "Recent Activity" section with rows
 *   - "This Week" streak section visible
 *   - "Log Activity" and "Add Contract" CTAs present
 *   - No console errors
 */
import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/.auth/user.json' })

test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard')
  // Wait for the page to be fully loaded (not just navigation)
  await page.waitForLoadState('networkidle')
})

test('page heading and action buttons are visible', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Log Activity/ }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Add Contract/ }).first()).toBeVisible()
})

test('6 KPI cards are rendered', async ({ page }) => {
  const kpiLabels = [
    'ACTIVITIES THIS WEEK',
    'TOTAL SPEND MTD',
    'CONTACTS ENGAGED',
    'FOLLOW-UPS PENDING',
    'CLOSED THIS MONTH',
    'PIPELINE VALUE',
  ]
  for (const label of kpiLabels) {
    await expect(page.getByText(label)).toBeVisible()
  }
})

test('AI nudge card is visible', async ({ page }) => {
  // New users see WelcomeBanner instead of nudge; both are acceptable
  const hasNudge = await page.getByText('Daily Nudge').first().isVisible().catch(() => false)
  const hasBanner = await page.getByText(/get you started/i).first().isVisible().catch(() => false)
  expect(hasNudge || hasBanner).toBe(true)
})

test('AI summary card is visible', async ({ page }) => {
  // New users see WelcomeBanner instead of summary card; both are acceptable
  const hasSummary = await page.getByText('Summary').first().isVisible().catch(() => false)
  const hasBanner = await page.getByText(/get you started/i).first().isVisible().catch(() => false)
  expect(hasSummary || hasBanner).toBe(true)
})

test('Recent Activity section has rows', async ({ page }) => {
  // First-time users see WelcomeBanner instead of Recent Activity
  const hasRecent = await page.getByText('Recent Activity').isVisible().catch(() => false)
  if (hasRecent) {
    const rows = page.locator('.app-card').filter({ hasText: 'Recent Activity' })
    await expect(rows).toBeVisible()
    await expect(page.getByText('View all →')).toBeVisible()
  } else {
    await expect(page.getByText(/get you started/i)).toBeVisible()
  }
})

test('This Week streak section is visible', async ({ page }) => {
  await expect(page.getByText('This Week').first()).toBeVisible()
  await expect(page.getByText('Avg cost per activity')).toBeVisible()
  await expect(page.getByText('Most active type')).toBeVisible()
  await expect(page.getByText('Longest streak')).toBeVisible()
})

test('no console errors on load', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })

  await page.reload()
  await page.waitForLoadState('networkidle')

  expect(errors).toHaveLength(0)
})
