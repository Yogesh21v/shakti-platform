// Wraps the base Playwright test to block the external Google Fonts requests the
// client's <head> makes. They're cosmetic only and unreachable from a locked-down
// CI/sandbox network, and waiting on them was making page loads hang.
const base = require('@playwright/test');

const test = base.test.extend({
  page: async ({ page }, use) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    await use(page);
  },
});

module.exports = { test, expect: base.expect };
