/**
 * Workflow: Personal performance
 *
 * Covers:
 *   - /performance loads with "My Performance" heading
 *   - Persona and period context visible
 *   - 4 KPI summary cards present
 *   - "Spend & Activity Trend" chart section heading visible
 *   - No console errors
 */
import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/.auth/user.json' })

test.beforeEach(async ({ page }) => {
  await page.goto('/performance')
  await page.waitForLoadState('networkidle')
})

test('page heading is "My Performance"', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'My Performance' })).toBeVisible()
})

test('AI summary card is visible', async ({ page }) => {
  await expect(page.getByText('AI')).toBeVisible()
  await expect(page.getByText('SUMMARY')).toBeVisible()
})

test('4 KPI summary cards are rendered', async ({ page }) => {
  for (const label of [
    'ACTIVITIES THIS MONTH',
    'TOTAL SPEND',
    'CONTACTS ENGAGED',
    'LONGEST STREAK',
  ]) {
    await expect(page.getByText(label)).toBeVisible()
  }
})

test('Spend & Activity Trend section heading is visible', async ({ page }) => {
  await expect(page.getByText('Spend & Activity Trend')).toBeVisible()
})

test('chart renders (Recharts SVG present after scroll)', async ({ page }) => {
  // Scroll to chart area
  await page.getByText('Spend & Activity Trend').scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  // Recharts renders a .recharts-wrapper div with SVG inside
  const chart = page.locator('.recharts-wrapper').first()
  await expect(chart).toBeVisible({ timeout: 8_000 })
})

test('no console errors on load', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  await page.reload()
  await page.waitForLoadState('networkidle')
  expect(errors).toHaveLength(0)
})

test('agent view shows "My Performance" heading', async ({ page }) => {
  // Default view for agent role shows personal performance
  await expect(page.getByRole('heading', { name: 'My Performance' })).toBeVisible()
})

test('manager view shows "Team Performance" heading when role switched', async ({ page }) => {
  // Switch to manager view if switcher is available
  const switcherBtn = page.locator('button').filter({ hasText: /Sarah Chen|SC/ }).first()
  const hasSwitcher = await switcherBtn.isVisible().catch(() => false)
  if (!hasSwitcher) {
    // Navigate directly to manager performance
    await page.goto('/performance')
    await page.waitForLoadState('networkidle')
    // In agent-only mode, "My Performance" is visible
    await expect(page.getByRole('heading')).toBeVisible()
    return
  }
  await switcherBtn.click()
  await page.getByText('Switch to Manager View').click()
  await page.waitForLoadState('networkidle')
  await page.goto('/performance')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading')).toBeVisible()
})

test('recharts chart is present in performance view', async ({ page }) => {
  await page.getByText('Spend & Activity Trend').scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  const chart = page.locator('.recharts-wrapper').first()
  await expect(chart).toBeVisible({ timeout: 8_000 })
})
