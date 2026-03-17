import { test, expect } from '@playwright/test'

test.describe('Account Pages — Protection', () => {
  test('account page redirects to login when unauthenticated', async ({
    page,
  }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login/)
  })

  test('addresses page redirects to login when unauthenticated', async ({
    page,
  }) => {
    await page.goto('/account/addresses')
    await expect(page).toHaveURL(/\/login/)
  })

  test('new address page redirects to login when unauthenticated', async ({
    page,
  }) => {
    await page.goto('/account/addresses/new')
    await expect(page).toHaveURL(/\/login/)
  })

  test('account with EN locale redirects to login', async ({ page }) => {
    await page.goto('/en/account')
    await expect(page).toHaveURL(/\/login/)
  })

  test('account with CA locale redirects to login', async ({ page }) => {
    await page.goto('/ca/account')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login form is visible after redirect from account', async ({
    page,
  }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('form')).toBeVisible()
  })
})
