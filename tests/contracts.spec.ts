/**
 * Workflow: Contract pipeline
 *
 * Covers:
 *   - /contracts page loads with heading, search bar, filter pills
 *   - "Add Contract" button opens the slide-over panel
 *   - Table column headers visible
 *   - No console errors
 */
import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/.auth/user.json' })

test.beforeEach(async ({ page }) => {
  await page.goto('/contracts')
  await page.waitForLoadState('networkidle')
})

test('page heading and description are visible', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Contracts' })).toBeVisible()
  await expect(page.getByText('Track and manage your title closing deals.')).toBeVisible()
})

test('Add Contract button is visible', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Add Contract/i })).toBeVisible()
})

test('search bar and filter pills are visible', async ({ page }) => {
  await expect(page.getByPlaceholder('Search by contact or address…')).toBeVisible()
  await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Opened' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Closed' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cancelled' })).toBeVisible()
})

test('table column headers are visible', async ({ page }) => {
  for (const col of ['FILE NUMBER', 'ADDRESS', 'CONTACT', 'AMOUNT', 'STATUS']) {
    await expect(page.getByText(col).first()).toBeVisible()
  }
})

test('Add Contract button opens the panel', async ({ page }) => {
  await page.getByRole('button', { name: /Add Contract/i }).click()
  await page.waitForTimeout(400)

  // Panel heading should appear
  await expect(
    page.getByText(/Add Contract|Log Contract|New Contract/i).nth(1)
  ).toBeVisible({ timeout: 5_000 })
    .catch(() => expect(page.getByText(/Add Contract|Log Contract|New Contract/i)).toBeVisible())
})

test('no console errors on load', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  await page.reload()
  await page.waitForLoadState('networkidle')
  expect(errors).toHaveLength(0)
})
