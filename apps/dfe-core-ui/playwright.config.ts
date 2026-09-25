import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * A k8s run has no docker daemon to shell out to, so it excludes the two
 * specs tagged @docker-only (filebeatDataPath.spec.ts, promoteJsonField.spec.ts):
 * `npx playwright test --grep-invert @docker-only`.
 */
export default defineConfig({
  testDir: './e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retries hide flakes: a spec either passes or gets fixed. */
  retries: 0,
  /*
   * All e2e specs share one dfe-engine and call reset_all in hooks. Parallel
   * workers race on seed-static and leave the DB/UI in inconsistent state
   * (passes in isolation, hangs/timeouts when the folder runs together).
   */
  fullyParallel: false,
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    // DFE serves edge TLS from a cluster CA regenerated on every rebuild.
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // ignoreHTTPSErrors misses the top-level navigation Chromium blocks itself.
        launchOptions: { args: ['--ignore-certificate-errors'] },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
