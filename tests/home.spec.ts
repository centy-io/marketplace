import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('matches screenshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Disable animations so screenshots are stable and deterministic
    await page.addStyleTag({
      content: `.animate-in {
        animation: none !important;
        opacity: 1 !important;
        transition: none !important;
      }`,
    })

    await expect(page).toHaveScreenshot('home.png', { fullPage: true })
  })
})
