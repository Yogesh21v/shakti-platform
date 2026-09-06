// @ts-check
const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

// The client's api.js defaults to http://localhost:5000/api with no build step to
// override it, so the API is kept on 5000 here too (client port is arbitrary).
const SERVER_PORT = process.env.SHAKTI_TEST_SERVER_PORT || 5000;
const CLIENT_PORT = process.env.SHAKTI_TEST_CLIENT_PORT || 8085;

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${CLIENT_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Only set when a machine's Playwright browser cache lives at a nonstandard
        // path (e.g. a locked-down CI sandbox). Normal local runs should just use
        // `npx playwright install` and leave this unset.
        launchOptions: process.env.PW_TEST_CHROMIUM_PATH
          ? { executablePath: process.env.PW_TEST_CHROMIUM_PATH }
          : {},
      },
    },
  ],
  // Boots the real Express API (zero-setup in-memory MongoDB, no manual DB install)
  // and serves the real static client — the same two processes a developer runs
  // locally per the README — so tests exercise the actual app, not a mock.
  webServer: [
    {
      command: 'node server.js',
      cwd: path.join(__dirname, '..', 'server'),
      port: Number(SERVER_PORT),
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: String(SERVER_PORT),
        JWT_SECRET: 'playwright-test-secret-do-not-use-in-prod',
        JWT_EXPIRES_IN: '1h',
      },
    },
    {
      command: `python3 -m http.server ${CLIENT_PORT} --directory ${path.join(__dirname, '..', 'client')}`,
      port: Number(CLIENT_PORT),
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
