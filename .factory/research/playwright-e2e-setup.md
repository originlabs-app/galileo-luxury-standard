# Playwright E2E Setup for Galileo Dashboard

## Config: apps/dashboard/playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      command: 'cd /Users/pierrebeunardeau/GalileoLuxury/apps/api && PORT=4000 pnpm dev',
      url: 'http://localhost:4000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'cd /Users/pierrebeunardeau/GalileoLuxury/apps/dashboard && PORT=3000 pnpm dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
```

## Auth Setup: apps/dashboard/e2e/auth.setup.ts

```typescript
import { test as setup, expect } from '@playwright/test'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'e2e@galileo.test')
  await page.fill('input[name="password"]', 'TestPass123!')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})
```

## Turbo.json Integration

Add separate task (don't mix with unit tests):
```json
"test:e2e": {
  "dependsOn": ["^build"],
  "inputs": ["e2e/**", "playwright.config.ts"],
  "outputs": ["playwright-report/**", "test-results/**"]
}
```

## Gotchas
- Next.js App Router hydration: use Playwright's auto-waiting, wait for specific elements
- Cookie auth: Playwright handles cookies automatically after login
- For CI: test against production build (`next build && next start`) instead of dev server
- storageState saves cookies — httpOnly cookies from the API will be persisted between tests
