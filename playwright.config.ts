import { defineConfig, devices } from '@playwright/test';

/** Dedicated port so E2E never fights `astro dev` / stray previews on 4321. */
const PORT = 4173;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Pixel 5 profile uses Chromium (no extra browser install); iPhone uses WebKit.
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    // `--ignore-lock` keeps `astro preview` in the foreground: Astro 7 otherwise
    // auto-backgrounds it under coding agents and Playwright sees an early exit.
    command: `pnpm run build && pnpm run preview --host 127.0.0.1 --port ${String(PORT)} --ignore-lock`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // astro.config.mjs requires SITE_URL for `astro build`; preview base is a safe default for E2E.
    env: {
      ...process.env,
      SITE_URL: process.env.SITE_URL?.trim() || baseURL,
    },
  },
});
