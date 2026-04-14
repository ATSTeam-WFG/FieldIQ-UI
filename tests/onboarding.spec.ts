/**
 * Workflow: Onboarding flow
 *
 * Covers:
 *   - Root (/) redirects to /onboarding
 *   - Step 1: Select user type → Continue
 *   - Step 2: Select agency role → Continue
 *   - Step 3: Select team preference → Continue
 *   - Step 4: "You're one step away" confirmation screen
 *   - No console errors throughout
 */
import { test, expect } from '@playwright/test'

// Onboarding is a public page — no auth needed
test.use({ storageState: { cookies: [], origins: [] } })

test('root redirects to /onboarding', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/onboarding/)
})

test('step 1: displays user-type selection', async ({ page }) => {
  await page.goto('/onboarding')
  await expect(page.getByText('How will you use FieldIQ?')).toBeVisible()
  await expect(page.getByText('Individual Title Sales Rep')).toBeVisible()
  await expect(page.getByText('Small or Mid-Size Agency Team')).toBeVisible()
})

test('step 1 → 2 → 3 → 4: full agency-rep-team flow', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })

  await page.goto('/onboarding')

  // Step 1: choose Agency Team
  await page.getByText('Small or Mid-Size Agency Team').click()
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 2: choose Sales Rep role
  await expect(page.getByText("What's your role at your agency?")).toBeVisible()
  await page.getByText('Sales Rep').click()
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 3: choose Request Access
  await expect(page.getByText('How would you like to get started?')).toBeVisible()
  await page.getByText('Request Access to My Agency\'s Account').click()
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 4: confirmation
  await expect(page.getByText("You're one step away")).toBeVisible()
  await expect(page.getByText('Already invited? Sign in')).toBeVisible()

  expect(errors).toHaveLength(0)
})

test('Continue button is disabled until a selection is made', async ({ page }) => {
  await page.goto('/onboarding')
  const continueBtn = page.getByRole('button', { name: 'Continue' })
  await expect(continueBtn).toBeDisabled()

  await page.getByText('Individual Title Sales Rep').click()
  await expect(continueBtn).toBeEnabled()
})

test('Back button appears from step 2 onward', async ({ page }) => {
  await page.goto('/onboarding')
  await page.getByText('Small or Mid-Size Agency Team').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible()
})
