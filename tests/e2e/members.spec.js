// Covers "search/filtering" on the member directory: search by name, and
// filter by district and by skill, each against real registered accounts.
const { test, expect } = require('./fixtures');
const { newTestUser, registerViaUI } = require('./helpers');

test.describe('Member directory: search & filtering', () => {
  test('searching by (a unique) name returns only that member', async ({ page }) => {
    const user = newTestUser('members-search');
    await page.goto('/');
    await registerViaUI(page, user);

    await page.locator('#nav-members').click();
    await page.locator('#members-search-input').fill(user.name);

    const grid = page.locator('#members-grid');
    await expect(grid.locator('.member-card', { hasText: user.name })).toBeVisible();
    await expect(grid.locator('.member-card')).toHaveCount(1);
  });

  test('a search with no matches shows the empty state, not stale results', async ({ page }) => {
    const user = newTestUser('members-noresult');
    await page.goto('/');
    await registerViaUI(page, user);

    await page.locator('#nav-members').click();
    await page.locator('#members-search-input').fill('zzz-no-such-member-zzz');

    await expect(page.locator('#members-grid .empty-state')).toBeVisible();
  });

  test('filtering by district only shows members from that district', async ({ page }) => {
    const chennaiUser = newTestUser('members-district-a');
    chennaiUser.district = 'Chennai (TN)';
    const guntUser = newTestUser('members-district-b');
    guntUser.district = 'Guntur (AP)';

    await page.goto('/');
    await registerViaUI(page, chennaiUser);
    await page.locator('#nav-account').locator('.nav-link', { hasText: 'Log Out' }).click();
    await registerViaUI(page, guntUser);

    await page.locator('#nav-members').click();
    // Narrow with a search term first so we're only looking at these two test accounts.
    await page.locator('#members-search-input').fill('members-district-');
    await page.locator('#members-district-filter').selectOption('Chennai (TN)');

    const grid = page.locator('#members-grid');
    await expect(grid.locator('.member-card', { hasText: chennaiUser.name })).toBeVisible();
    await expect(grid.locator('.member-card', { hasText: guntUser.name })).toHaveCount(0);
  });

  test('filtering by skill only shows members with that skill', async ({ page }) => {
    const digitalUser = newTestUser('members-skill-a');
    digitalUser.skill = 'Digital & Online';
    const craftUser = newTestUser('members-skill-b');
    craftUser.skill = 'Textiles & Crafts';

    await page.goto('/');
    await registerViaUI(page, digitalUser);
    await page.locator('#nav-account').locator('.nav-link', { hasText: 'Log Out' }).click();
    await registerViaUI(page, craftUser);

    await page.locator('#nav-members').click();
    await page.locator('#members-search-input').fill('members-skill-');
    await page.locator('#members-skill-filter').selectOption('Digital & Online');

    const grid = page.locator('#members-grid');
    await expect(grid.locator('.member-card', { hasText: digitalUser.name })).toBeVisible();
    await expect(grid.locator('.member-card', { hasText: craftUser.name })).toHaveCount(0);
  });
});
