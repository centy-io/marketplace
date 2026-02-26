import { test, expect } from '@playwright/test'

const disableAnimations = `
  .animate-in {
    animation: none !important;
    opacity: 1 !important;
    transition: none !important;
  }
`

test.describe('Home page', () => {
  test('matches screenshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Disable animations so screenshots are stable and deterministic
    await page.addStyleTag({ content: disableAnimations })

    await expect(page).toHaveScreenshot('home.png', { fullPage: true })
  })

  test('matches screenshot on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.addStyleTag({ content: disableAnimations })

    await expect(page).toHaveScreenshot('home-mobile.png', { fullPage: true })
  })

  test('matches screenshot on narrow mobile (320px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.addStyleTag({ content: disableAnimations })

    await expect(page).toHaveScreenshot('home-mobile-320.png', {
      fullPage: true,
    })
  })
})
