import { test, expect } from '@playwright/test'

test('allows a seeded user to log in and view the feed', async ({ page }) => {
  // Go to the login page (uses baseURL from playwright.config.js)
  await page.goto('/login')

  // Fill credentials for seeded demo user
  await page.getByLabel('Email').fill('shai@example.com')
  await page.getByLabel('Password').fill('Password123!')

  // Submit the login form
  await page.getByRole('button', { name: /login/i }).click()

  // Wait for navigation to feed
  await page.waitForURL('/')

  // Expect feed heading visible
  await expect(page.getByRole('heading', { name: /Feed/i })).toBeVisible()

  // Expect authenticated UI (logout button) to be visible
  await expect(page.getByRole('button', { name: /logout/i })).toBeVisible()

  // Expect at least one tweet (article) is visible on the feed
  await expect(page.getByRole('article').first()).toBeVisible()
})
