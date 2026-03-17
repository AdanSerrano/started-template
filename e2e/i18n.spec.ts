import { test, expect } from '@playwright/test'

test.describe('Internationalization (i18n)', () => {
  test('default locale (ES) sets lang="es"', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  })

  test('EN locale sets lang="en"', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('CA locale sets lang="ca"', async ({ page }) => {
    await page.goto('/ca')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ca')
  })

  test('login page works with EN locale', async ({ page }) => {
    await page.goto('/en/login')
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('login page works with CA locale', async ({ page }) => {
    await page.goto('/ca/login')
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'ca')
  })

  test('register page works with EN locale', async ({ page }) => {
    await page.goto('/en/register')
    await expect(page.locator('form')).toBeVisible()
  })

  test('forgot password page works with EN locale', async ({ page }) => {
    await page.goto('/en/forgot-password')
    await expect(page.locator('form')).toBeVisible()
  })

  test('meta description exists on localized landing pages', async ({
    page,
  }) => {
    await page.goto('/en')
    const desc = page.locator('meta[name="description"]')
    await expect(desc).toHaveAttribute('content', /.+/)
  })

  test('landing page has title in all locales', async ({ page }) => {
    await page.goto('/')
    expect((await page.title()).length).toBeGreaterThan(0)

    await page.goto('/en')
    expect((await page.title()).length).toBeGreaterThan(0)

    await page.goto('/ca')
    expect((await page.title()).length).toBeGreaterThan(0)
  })
})
