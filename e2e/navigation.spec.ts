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

  test('health endpoint returns 200', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.status).toBeDefined()
    expect(body.checks).toBeDefined()
    expect(body.timestamp).toBeDefined()
  })

  test('locale switching works', async ({ page }) => {
    await page.goto('/en')
    await expect(page).toHaveURL('/en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })
})
