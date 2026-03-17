import { test, expect } from '@playwright/test'

test.describe('Form Interactions', () => {
  test('login form has required fields and submit button', async ({ page }) => {
    await page.goto('/login')
    const form = page.locator('form')
    await expect(form).toBeVisible()
    await expect(form.locator('input[type="password"]')).toBeVisible()
    await expect(form.locator('button[type="submit"]')).toBeVisible()
  })

  test('register form has multiple input fields', async ({ page }) => {
    await page.goto('/register')
    const form = page.locator('form')
    await expect(form).toBeVisible()
    const inputs = form.locator('input')
    expect(await inputs.count()).toBeGreaterThanOrEqual(3)
    await expect(form.locator('button[type="submit"]')).toBeVisible()
  })

  test('forgot password form has email input', async ({ page }) => {
    await page.goto('/forgot-password')
    const form = page.locator('form')
    await expect(form).toBeVisible()
    const inputs = form.locator('input')
    expect(await inputs.count()).toBeGreaterThanOrEqual(1)
    await expect(form.locator('button[type="submit"]')).toBeVisible()
  })

  test('login form prevents empty submission', async ({ page }) => {
    await page.goto('/login')
    const form = page.locator('form')
    await form.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('register form validates short password', async ({ page }) => {
    await page.goto('/register')
    const form = page.locator('form')
    const passwordInput = form.locator('input[type="password"]').first()
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('ab')
    }
    await form.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/register/)
  })

  test('login form accepts typing in fields', async ({ page }) => {
    await page.goto('/login')
    const form = page.locator('form')
    const firstInput = form.locator('input').first()
    await firstInput.fill('test@example.com')
    await expect(firstInput).toHaveValue('test@example.com')

    const passwordInput = form.locator('input[type="password"]')
    await passwordInput.fill('secretpassword')
    await expect(passwordInput).toHaveValue('secretpassword')
  })

  test('auth pages have cross-navigation links', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('a[href*="register"]')).toBeVisible()

    await page.goto('/register')
    await expect(page.locator('a[href*="login"]')).toBeVisible()
  })
})
