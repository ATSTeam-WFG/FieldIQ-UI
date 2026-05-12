/**
 * Workflow: Onboarding flow
 *
 * Covers:
 *   - Root (/) redirects to /onboarding
 *   - Step 1: Select user type (Sales Rep vs Manager)
 *   - Continue button disabled until selection
 *   - Step 1 → Step 2: rep path shows "How are you joining?"
 *   - Back button visible from step 2 onward
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
  await expect(page.getByText("I'm a Sales Rep")).toBeVisible()
  await expect(page.getByText("I'm a Manager")).toBeVisible()
})

test('step 1 → 2: rep flow shows joining options', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })

  await page.goto('/onboarding')

  // Step 1: choose Sales Rep
  await page.getByText("I'm a Sales Rep").click()
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 2: should show joining options
  await expect(page.getByText('How are you joining?')).toBeVisible()
  await expect(page.getByText("I'm working independently")).toBeVisible()
  await expect(page.getByText("I'm joining an agency")).toBeVisible()

  expect(errors).toHaveLength(0)
})

test('Continue button is disabled until a selection is made', async ({ page }) => {
  await page.goto('/onboarding')
  const continueBtn = page.getByRole('button', { name: 'Continue' })
  await expect(continueBtn).toBeDisabled()

  await page.getByText("I'm a Sales Rep").click()
  await expect(continueBtn).toBeEnabled()
})

test('Back button appears from step 2 onward', async ({ page }) => {
  await page.goto('/onboarding')
  await page.getByText("I'm a Sales Rep").click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible()
})

test('no console errors on load', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  await page.goto('/onboarding')
  await page.waitForLoadState('networkidle')
  expect(errors).toHaveLength(0)
})
