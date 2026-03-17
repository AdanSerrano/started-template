import { test, expect } from '@playwright/test'

test.describe('SEO & Metadata', () => {
  test('landing page has correct meta tags', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)

    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', /.+/)
  })

  test('robots.txt is accessible', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text.toLowerCase()).toContain('user-agent')
    expect(text).toContain('Sitemap')
  })

  test('sitemap.xml is accessible', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text).toContain('urlset')
  })

  test('canonical URL is set', async ({ page }) => {
    await page.goto('/')
    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toBeAttached()
  })

  test('login page has proper meta tags', async ({ page }) => {
    await page.goto('/login')
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)
  })

  test('viewport meta tag is configured', async ({ page }) => {
    await page.goto('/')
    const viewport = page.locator('meta[name="viewport"]')
    await expect(viewport).toBeAttached()
  })

  test('lang attribute matches locale', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    await page.goto('/ca')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ca')
  })
})
