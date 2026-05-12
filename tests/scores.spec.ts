/**
 * Workflow: Relationship scores
 *
 * Covers:
 *   - /scores page loads with "Relationship Scores" heading
 *   - Summary KPI chips visible (AVG SCORE, TOP SCORE, CONTACTS TRACKED)
 *   - Legend labels visible (High, Medium, Low)
 *   - Table column headers visible
 *   - Score ring SVGs visible when data is present
 *   - No console errors
 */
import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/.auth/user.json' })

test.beforeEach(async ({ page }) => {
  await page.goto('/scores')
  await page.waitForLoadState('networkidle')
})

test('page heading is "Relationship Scores"', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Relationship Scores' })).toBeVisible()
  await expect(page.getByText('Agent contacts ranked by relationship score')).toBeVisible()
})

test('summary KPI chips are visible', async ({ page }) => {
  await expect(page.getByText('AVG SCORE', { exact: true })).toBeVisible()
  await expect(page.getByText('TOP SCORE', { exact: true })).toBeVisible()
  await expect(page.getByText('CONTACTS TRACKED', { exact: true })).toBeVisible()
})

test('score level legend is visible', async ({ page }) => {
  await expect(page.getByText(/High \(80\+\)/)).toBeVisible()
  await expect(page.getByText(/Medium \(60/)).toBeVisible()
  await expect(page.getByText(/Low \(<60\)/)).toBeVisible()
})

test('table column headers are visible', async ({ page }) => {
  for (const col of ['RANK', 'CONTACT', 'SCORE', 'BREAKDOWN', 'LAST CONTACT', 'TREND']) {
    await expect(page.getByText(col, { exact: true }).first()).toBeVisible()
  }
})

test('score ring SVGs present when data is loaded', async ({ page }) => {
  const hasData = !(await page.getByText('No contacts tracked yet.').isVisible())
  if (!hasData) {
    // No data without auth — just verify empty state message
    await expect(page.getByText('No contacts tracked yet.')).toBeVisible()
    return
  }
  // With data: SVG circles (score rings) should exist
  await expect(page.locator('svg circle').first()).toBeVisible()
})

test('no console errors on load', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  await page.reload()
  await page.waitForLoadState('networkidle')
  expect(errors).toHaveLength(0)
})
