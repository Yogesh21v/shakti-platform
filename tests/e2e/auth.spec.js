// Covers the resume claim of "secure user sessions": registration issues a JWT,
// the session survives a page reload, and logging out actually clears access.
const { test, expect } = require('./fixtures');
const { newTestUser, registerViaUI, loginViaUI } = require('./helpers');

test.describe('Authentication & sessions', () => {
  test('a new user can register and lands in a logged-in state', async ({ page }) => {
    const user = newTestUser('auth-register');
    await page.goto('/');

    await registerViaUI(page, user);

    await expect(page.locator('#nav-account-name')).toHaveText(user.name);
    await expect(page.locator('#nav-login')).toBeHidden();
    await expect(page.locator('#nav-register')).toBeHidden();
  });

  test('registering twice with the same email is rejected', async ({ page }) => {
    const user = newTestUser('auth-dupe');
    await page.goto('/');
    await registerViaUI(page, user);
    await page.locator('#nav-account').locator('.nav-link', { hasText: 'Log Out' }).click();

    // Try to register again with the exact same email.
    await page.locator('#nav-register').click();
    await page.locator('#auth-name').fill(user.name);
    await page.locator('#auth-email').fill(user.email);
    await page.locator('#auth-password').fill(user.password);
    await page.locator('#auth-submit-btn').click();

    await expect(page.locator('#auth-error')).toBeVisible();
    await expect(page.locator('#auth-error')).toContainText('already exists');
  });

  test('the session (JWT) survives a full page reload', async ({ page }) => {
    const user = newTestUser('auth-reload');
    await page.goto('/');
    await registerViaUI(page, user);

    await page.reload();

    await expect(page.locator('#nav-account-name')).toHaveText(user.name);
    await expect(page.locator('#nav-account')).toBeVisible();
  });

  test('logging out clears the session and blocks authenticated actions', async ({ page }) => {
    const user = newTestUser('auth-logout');
    await page.goto('/');
    await registerViaUI(page, user);
    await page.locator('#nav-account').locator('.nav-link', { hasText: 'Log Out' }).click();

    await expect(page.locator('#nav-login')).toBeVisible();
    await expect(page.locator('#nav-account')).toBeHidden();

    // A logged-out visitor trying to start a discussion should be redirected to login,
    // not silently allowed through.
    await page.locator('#nav-forum').click();
    await page.locator('.sidebar-card .post-btn', { hasText: 'Start a New Discussion' }).click();
    await expect(page.locator('#modal-auth')).toHaveClass(/open/);
  });

  test('a registered user can log back in with the same credentials', async ({ page }) => {
    const user = newTestUser('auth-relogin');
    await page.goto('/');
    await registerViaUI(page, user);
    await page.locator('#nav-account').locator('.nav-link', { hasText: 'Log Out' }).click();

    await loginViaUI(page, user);

    await expect(page.locator('#nav-account-name')).toHaveText(user.name);
  });

  test('an invalid password is rejected with a clear error', async ({ page }) => {
    const user = newTestUser('auth-badpass');
    await page.goto('/');
    await registerViaUI(page, user);
    await page.locator('#nav-account').locator('.nav-link', { hasText: 'Log Out' }).click();

    await page.locator('#nav-login').click();
    await page.locator('#auth-email').fill(user.email);
    await page.locator('#auth-password').fill('WrongPassword999');
    await page.locator('#auth-submit-btn').click();

    await expect(page.locator('#auth-error')).toContainText('Invalid email or password');
    await expect(page.locator('#nav-account')).toBeHidden();
  });
});
