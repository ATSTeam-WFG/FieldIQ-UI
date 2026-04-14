/**
 * Workflow: Signup page — all account types
 *
 * Covers:
 *   - Page renders required fields (individual path)
 *   - Individual rep signup → redirects to /dashboard, role=agent
 *   - Manager signup (single role) → registers agency → redirects to /manager, role=manager, also_rep=false
 *   - Manager signup (dual role) → registers agency → redirects to /manager, role=manager, also_rep=true
 */
import { test, expect, type APIRequestContext } from '@playwright/test'

// Run without any pre-existing auth state
test.use({ storageState: { cookies: [], origins: [] } })

const TEST_PASSWORD = 'Playwright1234!'
const TEST_NAME = 'Playwright Test'
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function assertMe(
  request: APIRequestContext,
  token: string | null,
  expected: { email: string; role: string; also_rep?: boolean },
) {
  expect(token).toBeTruthy()
  const meRes = await request.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(meRes.ok()).toBeTruthy()
  const me = await meRes.json()
  expect(me.email).toBe(expected.email)
  expect(me.role).toBe(expected.role)
  if (expected.also_rep !== undefined) expect(me.also_rep).toBe(expected.also_rep)
}

test('signup page renders required fields', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
      errors.push(msg.text())
    }
  })

  await page.goto('/signup')
  await expect(page.locator('#fullName')).toBeVisible()
  await expect(page.locator('#email')).toBeVisible()
  await expect(page.locator('#password')).toBeVisible()
  await expect(page.locator('#confirmPw')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()

  expect(errors).toHaveLength(0)
})

test('individual signup redirects to /dashboard and stores token', async ({ page, request }) => {
  const testEmail = `playwright.signup.${Date.now()}@test.fieldiq.io`

  await page.goto('/signup')
  await page.fill('#fullName', TEST_NAME)
  await page.fill('#email', testEmail)
  await page.fill('#password', TEST_PASSWORD)
  await page.fill('#confirmPw', TEST_PASSWORD)

  await page.click('button[type="submit"]')

  // Redirect uses window.location.href so wait for full navigation
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })

  // Token stored in localStorage + /auth/me confirms user
  const token = await page.evaluate(() => localStorage.getItem('fieldiq_token'))
  await assertMe(request, token, { email: testEmail, role: 'agent', also_rep: false })
})

test('manager signup (single role) → registers agency → redirects to /manager', async ({ page, request }) => {
  const testEmail = `playwright.manager.${Date.now()}@test.fieldiq.io`

  await page.goto('/signup?role=manager&type=agency')

  // ── Step 1: Account creation ──────────────────────────────────
  await expect(page.getByRole('heading', { name: 'Create Your Manager Account' })).toBeVisible()
  await page.fill('#fullName', TEST_NAME)
  await page.fill('#email', testEmail)
  await page.fill('#password', TEST_PASSWORD)
  await page.fill('#confirmPw', TEST_PASSWORD)
  // Do NOT click "also rep" — single role only
  await page.click('button[type="submit"]') // "Continue"

  // ── Step 2: Agency registration ───────────────────────────────
  await expect(page.getByRole('heading', { name: 'Register Your Agency' })).toBeVisible()
  await page.fill('input[placeholder="e.g. Premier Title Agency"]', 'Playwright Agency')
  await page.locator('select').selectOption('Georgia')
  await page.getByRole('button', { name: '6–15' }).click() // rep count (optional field)
  // Wait for submit to be enabled (requires agencyName + agencyState)
  await expect(page.locator('button[type="submit"]')).toBeEnabled()
  await page.click('button[type="submit"]') // "Register Agency"

  // ── Step 3: Skip invites ──────────────────────────────────────
  // API call may take a moment; allow up to navigation timeout
  await expect(page.getByRole('heading', { name: 'Invite Your Reps' })).toBeVisible({ timeout: 15_000 })
  await page.getByText('Skip & go to dashboard').click()

  await expect(page).toHaveURL(/\/manager/, { timeout: 20_000 })

  const token = await page.evaluate(() => localStorage.getItem('fieldiq_token'))
  await assertMe(request, token, { email: testEmail, role: 'manager', also_rep: false })
})

test('manager signup (dual role) → registers agency → redirects to /manager with also_rep', async ({ page, request }) => {
  const testEmail = `playwright.manager-rep.${Date.now()}@test.fieldiq.io`

  await page.goto('/signup?role=manager&type=agency')

  // ── Step 1: Account creation ──────────────────────────────────
  await expect(page.getByRole('heading', { name: 'Create Your Manager Account' })).toBeVisible()
  await page.fill('#fullName', TEST_NAME)
  await page.fill('#email', testEmail)
  await page.fill('#password', TEST_PASSWORD)
  await page.fill('#confirmPw', TEST_PASSWORD)
  // Enable dual-role
  await page.getByText('I also act as a sales rep on my own team').click()
  await page.click('button[type="submit"]') // "Continue"

  // ── Step 2: Agency registration ───────────────────────────────
  await expect(page.getByRole('heading', { name: 'Register Your Agency' })).toBeVisible()
  await page.fill('input[placeholder="e.g. Premier Title Agency"]', 'Playwright Agency')
  await page.locator('select').selectOption('Georgia')
  // Wait for submit to be enabled (requires agencyName + agencyState)
  await expect(page.locator('button[type="submit"]')).toBeEnabled()
  await page.click('button[type="submit"]') // "Register Agency"

  // ── Step 3: Skip invites ──────────────────────────────────────
  await expect(page.getByRole('heading', { name: 'Invite Your Reps' })).toBeVisible({ timeout: 15_000 })
  await page.getByText('Skip & go to dashboard').click()

  await expect(page).toHaveURL(/\/manager/, { timeout: 20_000 })

  const token = await page.evaluate(() => localStorage.getItem('fieldiq_token'))
  await assertMe(request, token, { email: testEmail, role: 'manager', also_rep: true })
})
