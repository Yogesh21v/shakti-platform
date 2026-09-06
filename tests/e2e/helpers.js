// Shared helpers for the ShaktiConnect end-to-end suite.

function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

/** Builds a fresh, never-before-used test account. */
function newTestUser(prefix = 'e2e') {
  const suffix = uniqueSuffix();
  return {
    name: `${prefix} Tester ${suffix}`,
    email: `${prefix}.${suffix}@example.com`,
    password: 'TestPass123',
    district: 'Chennai (TN)',
  };
}

/** Registers a new account through the real UI (modal) and waits for the logged-in nav state. */
async function registerViaUI(page, user) {
  await page.locator('#nav-register').click();
  await page.locator('#auth-name').fill(user.name);
  await page.locator('#auth-email').fill(user.email);
  await page.locator('#auth-password').fill(user.password);
  if (user.district) {
    await page.locator('#auth-district').selectOption(user.district);
  }
  if (user.skill) {
    await page.locator('#auth-skill').selectOption(user.skill);
  }
  await page.locator('#auth-submit-btn').click();
  await page.locator('#nav-account').waitFor({ state: 'visible' });
}

/** Logs in an existing account through the real UI (modal). */
async function loginViaUI(page, user) {
  await page.locator('#nav-login').click();
  await page.locator('#auth-email').fill(user.email);
  await page.locator('#auth-password').fill(user.password);
  await page.locator('#auth-submit-btn').click();
  await page.locator('#nav-account').waitFor({ state: 'visible' });
}

module.exports = { newTestUser, registerViaUI, loginViaUI };
