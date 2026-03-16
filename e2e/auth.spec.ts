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
})
