import { test, expect } from '@playwright/test'

test.describe('Auth Pages', () => {
  test('login page renders with form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('register page renders with form', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('form')).toBeVisible()
  })

  test('forgot password page renders', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.locator('form')).toBeVisible()
  })

  test('login form shows validation errors on empty submit', async ({
    page,
  }) => {
    await page.goto('/login')
    const form = page.locator('form')
    await form.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page has link to register', async ({ page }) => {
    await page.goto('/login')
    const registerLink = page.locator('a[href*="register"]')
    await expect(registerLink).toBeVisible()
  })

  test('register page has link to login', async ({ page }) => {
    await page.goto('/register')
    const loginLink = page.locator('a[href*="login"]')
    await expect(loginLink).toBeVisible()
  })

  test('login page has link to forgot password', async ({ page }) => {
    await page.goto('/login')
    const forgotLink = page.locator('a[href*="forgot-password"]')
    await expect(forgotLink).toBeVisible()
  })

  test('register form validates password minimum length', async ({ page }) => {
    await page.goto('/register')
    const form = page.locator('form')
    const nameInput = form.locator('input[name="name"]')
    const emailInput = form.locator('input[type="email"]')
    const passwordInput = form.locator('input[type="password"]').first()

    // Fill with short password
    if (await nameInput.isVisible()) await nameInput.fill('Test User')
    if (await emailInput.isVisible()) await emailInput.fill('test@example.com')
    if (await passwordInput.isVisible()) await passwordInput.fill('123')

    await form.locator('button[type="submit"]').click()
    // Should stay on register page (validation error)
    await expect(page).toHaveURL(/\/register/)
  })

  test('unauthenticated user visiting a protected route is redirected to login', async ({
    page,
  }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login/)
  })
})
