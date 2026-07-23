import { defineConfig } from '@playwright/test'

const desktop = { width: 1440, height: 1000 }
const mobile = { width: 390, height: 844 }

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    timeout: 8_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01
    }
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    locale: 'es-CO',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'desktop-light', use: { viewport: desktop, colorScheme: 'light' } },
    { name: 'desktop-dark', use: { viewport: desktop, colorScheme: 'dark' } },
    { name: 'mobile-light', use: { viewport: mobile, colorScheme: 'light', isMobile: true, hasTouch: true } },
    { name: 'mobile-dark', use: { viewport: mobile, colorScheme: 'dark', isMobile: true, hasTouch: true } }
  ],
  webServer: {
    command: 'npm run build:app && npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/ui',
    reuseExistingServer: false,
    timeout: 120_000
  }
})
