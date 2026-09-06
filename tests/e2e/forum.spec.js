// Covers "live voting, threaded replies, search/filtering" for the forum feature.
const { test, expect } = require('./fixtures');
const { newTestUser, registerViaUI } = require('./helpers');

async function createDiscussion(page, { title, body, category }) {
  await page.locator('#nav-forum').click();
  await page.locator('.sidebar-card .post-btn', { hasText: 'Start a New Discussion' }).click();
  if (category) await page.locator('#post-category').selectOption(category);
  await page.locator('#post-title').fill(title);
  if (body) await page.locator('#post-body').fill(body);
  await page.locator('.modal-btns .btn-primary', { hasText: 'Post Discussion' }).click();
  await page.locator('.forum-thread', { has: page.locator('.thread-title', { hasText: title }) }).waitFor();
}

test.describe('Forum: discussions, voting, replies', () => {
  test('a logged-in user can start a new discussion and see it appear', async ({ page }) => {
    const user = newTestUser('forum-post');
    const title = `E2E discussion ${Date.now()}`;
    await page.goto('/');
    await registerViaUI(page, user);

    await createDiscussion(page, { title, body: 'Posted by the Playwright suite.', category: 'Business' });

    const thread = page.locator('.forum-thread', { has: page.locator('.thread-title', { hasText: title }) });
    await expect(thread).toBeVisible();
    await expect(thread.locator('.thread-meta')).toContainText(user.name);
  });

  test('upvoting a discussion updates the live vote count, and un-voting reverses it', async ({ page }) => {
    const user = newTestUser('forum-vote');
    const title = `E2E vote target ${Date.now()}`;
    await page.goto('/');
    await registerViaUI(page, user);
    await createDiscussion(page, { title, category: 'Health' });

    const thread = page.locator('.forum-thread', { has: page.locator('.thread-title', { hasText: title }) });
    const voteCount = thread.locator('.vote-count');
    const voteBtn = thread.locator('.vote-btn');

    await expect(voteCount).toHaveText('0');

    await voteBtn.click();
    await expect(thread.locator('.vote-count')).toHaveText('1');
    await expect(thread.locator('.vote-btn')).toHaveClass(/voted/);

    // Voting again removes the vote — confirms it's a real toggle, not a one-way counter.
    await thread.locator('.vote-btn').click();
    await expect(thread.locator('.vote-count')).toHaveText('0');
    await expect(thread.locator('.vote-btn')).not.toHaveClass(/voted/);
  });

  test('a reply is threaded under its discussion and visible to other users', async ({ page, browser }) => {
    const author = newTestUser('forum-thread-author');
    const replier = newTestUser('forum-thread-replier');
    const title = `E2E threaded reply ${Date.now()}`;
    const replyText = `Great point — replying via Playwright at ${Date.now()}`;

    await page.goto('/');
    await registerViaUI(page, author);
    await createDiscussion(page, { title, category: 'Parenting' });

    // A second, independent browser context stands in for a different logged-in member
    // reading and replying to the thread.
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    await registerViaUI(page2, replier);
    await page2.locator('#nav-forum').click();

    const thread2 = page2.locator('.forum-thread', { has: page2.locator('.thread-title', { hasText: title }) });
    await thread2.locator('.thread-toggle-replies').click();
    await thread2.locator('input[id^="reply-input-"]').fill(replyText);
    await thread2.locator('.reply-form .btn-primary').click();

    // Submitting a reply re-fetches and re-renders the whole thread list (fresh DOM
    // nodes, panel collapsed again). Wait for that re-render to actually land — via
    // the updated reply count — before reopening the panel, or the click can land on
    // a node that's about to be replaced and get lost.
    await expect(thread2.locator('.thread-toggle-replies')).toContainText('1 reply');
    await thread2.locator('.thread-toggle-replies').click();
    await expect(thread2.locator('.reply-item', { hasText: replyText })).toBeVisible();
    await expect(thread2.locator('.reply-item', { hasText: replyText })).toContainText(replier.name);

    // The original author should see the same reply after refreshing the list — it's
    // stored server-side under the post, not just rendered locally for the replier.
    await page.reload();
    await page.locator('#nav-forum').click();
    const thread1 = page.locator('.forum-thread', { has: page.locator('.thread-title', { hasText: title }) });
    await thread1.locator('.thread-toggle-replies').click();
    await expect(thread1.locator('.reply-item', { hasText: replyText })).toBeVisible();

    await context2.close();
  });

  test('logged-out visitors can read discussions but voting prompts a login', async ({ page }) => {
    const user = newTestUser('forum-guest');
    const title = `E2E guest-read ${Date.now()}`;
    await page.goto('/');
    await registerViaUI(page, user);
    await createDiscussion(page, { title, category: 'Health' });
    await page.locator('#nav-account').locator('.nav-link', { hasText: 'Log Out' }).click();

    await page.locator('#nav-forum').click();
    const thread = page.locator('.forum-thread', { has: page.locator('.thread-title', { hasText: title }) });
    await expect(thread).toBeVisible();

    await thread.locator('.vote-btn').click();
    await expect(page.locator('#modal-auth')).toHaveClass(/open/);
  });

  test('filtering by category narrows the discussion list', async ({ page }) => {
    const user = newTestUser('forum-filter');
    const legalTitle = `E2E legal filter ${Date.now()}`;
    await page.goto('/');
    await registerViaUI(page, user);
    await createDiscussion(page, { title: legalTitle, category: 'Rights & Law' });

    await page.locator('#forum-categories .cat-pill', { hasText: 'Rights & Law' }).click();
    await expect(
      page.locator('.forum-thread', { has: page.locator('.thread-title', { hasText: legalTitle }) })
    ).toBeVisible();

    await page.locator('#forum-categories .cat-pill', { hasText: 'Health' }).click();
    await expect(
      page.locator('.forum-thread', { has: page.locator('.thread-title', { hasText: legalTitle }) })
    ).toHaveCount(0);
  });
});
