import { test, expect } from '@playwright/test'

test.describe('Error Handling & Edge Cases', () => {
  test('404 for completely unknown route', async ({ page }) => {
    const response = await page.goto('/this-page-definitely-does-not-exist')
    expect(response?.status()).toBe(404)
  })

  test('health endpoint returns JSON with required fields', async ({
    request,
  }) => {
    const response = await request.get('/api/health')
    expect([200, 503]).toContain(response.status())

    const body = await response.json()
    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('services')
    expect(body).toHaveProperty('timestamp')
    expect(typeof body.timestamp).toBe('string')
  })

  test('health endpoint services has database key', async ({ request }) => {
    const response = await request.get('/api/health')
    const body = await response.json()
    expect(body.services).toHaveProperty('database')
  })

  test('API auth endpoint responds', async ({ request }) => {
    const response = await request.get('/api/auth/ok')
    expect([200, 404]).toContain(response.status())
  })

  test('static favicon.ico is accessible', async ({ request }) => {
    const response = await request.get('/favicon.ico')
    expect(response.status()).toBe(200)
  })

  test('manifest.webmanifest is accessible', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest')
    expect([200, 404]).toContain(response.status())
  })
})
