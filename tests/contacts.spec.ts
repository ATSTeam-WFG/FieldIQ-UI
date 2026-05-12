/**
 * Workflow: Contacts list
 *
 * Covers:
 *   - /contacts page loads with heading and filter toolbar
 *   - "Add Contact" button visible
 *   - Tab pills: All / Agents / Vendors (with counts)
 *   - Search box is present and functional
 *   - Clicking a contact row navigates to /contacts/[id] (requires data)
 *   - No console errors
 */
import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/.auth/user.json' })

test.beforeEach(async ({ page }) => {
  await page.goto('/contacts')
  await page.waitForLoadState('networkidle')
})

test('page heading and Add Contact button visible', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Add Contact/i })).toBeVisible()
})

test('filter tab pills are visible', async ({ page }) => {
  // Tabs show "All N", "Agents N", "Vendors N" counts
  await expect(page.getByRole('button', { name: /All/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Agents/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Vendors/ })).toBeVisible()
})

test('search box is present', async ({ page }) => {
  await expect(page.getByPlaceholder('Search name or company…')).toBeVisible()
})

test('searching for no-match shows empty state', async ({ page }) => {
  await page.getByPlaceholder('Search name or company…').fill('zzz_no_match_xyz')
  await page.waitForTimeout(300)
  await expect(page.locator('p:visible').filter({ hasText: 'No contacts match your search' })).toBeVisible()
})

test('clearing search removes empty state', async ({ page }) => {
  // Only meaningful when contacts exist — skip for users with no contacts
  const initiallyEmpty = await page.locator('p:visible').filter({ hasText: 'No contacts match your search' }).isVisible().catch(() => false)
  if (initiallyEmpty) {
    // 0 contacts: empty state persists regardless of search
    test.skip(true, 'Skipped — no contacts to restore after clearing search')
    return
  }
  const search = page.getByPlaceholder('Search name or company…')
  await search.fill('zzz_no_match_xyz')
  await page.waitForTimeout(300)
  await search.clear()
  await page.waitForTimeout(300)
  await expect(page.locator('p:visible').filter({ hasText: 'No contacts match your search' })).not.toBeVisible()
})

test('contact row click navigates to detail page (when data exists)', async ({ page }) => {
  // If EmptyState is shown, there are no contacts to click
  const isEmpty = await page.getByText('No contacts match your search').isVisible().catch(() => false)
  if (isEmpty) {
    test.skip(true, 'No contact rows — skipping navigation test (requires auth + data)')
    return
  }
  // Click first contact row (height 56px grid row, not the table header sort buttons)
  await page.locator('div[style*="height: 56px"][style*="cursor: pointer"]').first().click()
  await expect(page).toHaveURL(/\/contacts\/.+/)
})

test('Agents filter only shows agent type rows', async ({ page }) => {
  await page.getByRole('button', { name: /Agents/ }).click()
  await page.waitForTimeout(300)
  // "Vendor" type badges should not appear
  await expect(page.getByText('Vendor', { exact: true })).toHaveCount(0)
})

test('no console errors on load', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  await page.reload()
  await page.waitForLoadState('networkidle')
  expect(errors).toHaveLength(0)
})
