/**
 * Auth flow E2E tests
 *
 * Covers:
 *   - Unauthenticated access to protected pages redirects to /login
 *   - Invalid credentials show an error message on /login
 *   - Logout clears session (when logout is implemented)
 */
import { test, expect } from '@playwright/test'

test('unauthenticated user is redirected to /login when accessing /dashboard', async ({ page }) => {
  // Clear storage to simulate no auth
  await page.context().clearCookies()
  await page.evaluate(() => localStorage.clear())

  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')

  // Should redirect to /login
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
})

test('login page shows email and password fields', async ({ page }) => {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  await expect(page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i))).toBeVisible()
  await expect(page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i))).toBeVisible()
})

test('submitting wrong credentials shows an error message', async ({ page }) => {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i))
  const passwordField = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i))

  await emailField.fill('wrong@example.com')
  await passwordField.fill('wrongpassword')
  await page.getByRole('button', { name: /sign in|log in|login/i }).click()

  // Should show an error message
  await expect(
    page.getByText(/invalid|incorrect|error|wrong|failed/i)
  ).toBeVisible({ timeout: 8_000 })
})
