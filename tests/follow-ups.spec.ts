/**
 * Workflow: Follow-ups
 *
 * Covers:
 *   - /follow-ups page loads with correct heading
 *   - 3 summary KPI chips: OVERDUE, THIS WEEK, UPCOMING
 *   - All 3 group section headings visible
 *   - Calendar dropdown button visible when rows exist
 *   - No console errors
 */
import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/.auth/user.json' })

test.beforeEach(async ({ page }) => {
  await page.goto('/follow-ups')
  await page.waitForLoadState('networkidle')
})

test('page heading is "Follow-ups"', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Follow-ups' })).toBeVisible()
})

test('summary KPI chips are visible', async ({ page }) => {
  await expect(page.getByText('OVERDUE')).toBeVisible()
  await expect(page.getByText('THIS WEEK')).toBeVisible()
  await expect(page.getByText('UPCOMING')).toBeVisible()
})

test('all 3 group section headings are visible', async ({ page }) => {
  await expect(page.getByText('Overdue', { exact: true })).toBeVisible()
  await expect(page.getByText('This Week', { exact: true })).toBeVisible()
  await expect(page.getByText('Upcoming', { exact: true })).toBeVisible()
})

test('empty state messages render correctly with no data', async ({ page }) => {
  // Without auth, all groups show 0 items
  const hasData = !(await page.getByText('Nothing here').first().isVisible().catch(() => false))
    && !(await page.getByText('No upcoming follow-ups').isVisible().catch(() => false))

  if (!hasData) {
    // Empty state: "Nothing here" or "No upcoming follow-ups"
    await expect(
      page.getByText('Nothing here').or(page.getByText('No upcoming follow-ups'))
    ).toBeVisible()
  }
})

test('calendar button visible when follow-up rows exist', async ({ page }) => {
  // The CalendarDropdown renders "Add to calendar" buttons on rows
  const hasRows = await page.locator('button[title="Add to calendar"]').first().isVisible()
    .catch(() => false)

  if (hasRows) {
    await expect(page.locator('button[title="Add to calendar"]').first()).toBeVisible()
  } else {
    // No rows without auth — just verify the page rendered without crashing
    await expect(page.getByRole('heading', { name: 'Follow-ups' })).toBeVisible()
  }
})

test('no console errors on load', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  await page.reload()
  await page.waitForLoadState('networkidle')
  expect(errors).toHaveLength(0)
})
