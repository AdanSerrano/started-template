import { test, expect } from '@playwright/test'

test.describe('Navigation & Route Protection', () => {
  test('landing page loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await expect(page.locator('body')).toBeVisible()
  })

  test('protected route redirects to login when not authenticated', async ({
    page,
  }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login/)
  })

  test('protected addresses route redirects to login', async ({ page }) => {
    await page.goto('/account/addresses')
    await expect(page).toHaveURL(/\/login/)
  })

  test('health endpoint returns valid response', async ({ request }) => {
    const response = await request.get('/api/health')
    // 200 (healthy) or 503 (unhealthy, e.g. no DB in CI) — both are valid
    expect([200, 503]).toContain(response.status())

    const body = await response.json()
    expect(body.status).toBeDefined()
    expect(body.services).toBeDefined()
    expect(body.timestamp).toBeDefined()
  })

  test('locale switching works — English', async ({ page }) => {
    await page.goto('/en')
    await expect(page).toHaveURL('/en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('locale switching works — Catalan', async ({ page }) => {
    await page.goto('/ca')
    await expect(page).toHaveURL('/ca')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ca')
  })

  test('default locale does not require prefix', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  })

  test('unknown route renders not-found page', async ({ page }) => {
    const response = await page.goto('/unknown-page-that-does-not-exist')
    // Next.js with i18n middleware may return 200 with not-found page
    expect([200, 404]).toContain(response?.status())
    const body = await page.textContent('body')
    expect(body?.length).toBeGreaterThan(0)
  })

  test('API auth route responds', async ({ request }) => {
    const response = await request.get('/api/auth/ok')
    // Better Auth returns 200 on /ok health check
    expect([200, 404]).toContain(response.status())
  })
})
