import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Names sort alphabetically and the grid asks for 12 at a time.
 * Bootstrap groups sort first, so `searchable-group-0` is on the first page
 * and `searchable-group-49` is not. Search matches the name or the description.
 */
const FIRST_PAGE = 12;
const MATCH = 'searchable-group-49';
const OTHER = 'searchable-group-0';

test.setTimeout(180_000);

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await e2eClient({ playwright, seedScript: 'seed_searchable_groups' });
  await loginAs(page, 'dfe_admin');
});

const openGroups = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/admin/group-management`);
  await expect(page).toHaveURL(`${BASE_URL}/settings/admin/group-management`);
};

/** The card. The header holds the search box; its parent holds the grid. */
const groupsSection = (page: Page) =>
  page
    .locator('div')
    .filter({ has: page.getByText('Manage groups', { exact: true }) })
    .filter({ has: page.getByPlaceholder('Search groups', { exact: true }) })
    .last()
    .locator('..');

const cards = (section: Locator) => section.locator('ul.grid > li');

const searchGroups = async (section: Locator, keyword: string) => {
  const field = section.getByPlaceholder('Search groups', { exact: true });
  await field.scrollIntoViewIfNeeded();
  await field.fill(keyword);
  await expect(field).toHaveValue(keyword);
};

/** The next page loads when the sentinel under the grid scrolls into view. */
const scrollGroups = async (section: Locator) => {
  const grid = section.locator('ul.grid');
  await grid.evaluate((node) => {
    const scroller = node.parentElement;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  });
};

test.describe('', { tag: [TAGS.core, TAGS.search, TAGS.pagination] }, () => {
  test('A search keeps the group whose name matches', async ({ page }) => {
    await openGroups(page);
    const section = groupsSection(page);

    await expect(section.getByText(OTHER, { exact: true })).toBeVisible();
    await expect(section.getByText(MATCH, { exact: true })).toHaveCount(0);

    await searchGroups(section, MATCH);

    await expect(section.getByText(MATCH, { exact: true })).toBeVisible();
    await expect(section.getByText(OTHER, { exact: true })).toBeHidden();

    await searchGroups(section, '');

    await expect(section.getByText(OTHER, { exact: true })).toBeVisible();
    await expect(section.getByText(MATCH, { exact: true })).toHaveCount(0);
  });

  test('Scrolling the list loads the next page', async ({ page }) => {
    await openGroups(page);
    const section = groupsSection(page);

    await expect(cards(section)).toHaveCount(FIRST_PAGE);
    await expect(section.getByText(OTHER, { exact: true })).toBeVisible();
    await expect(section.getByText(MATCH, { exact: true })).toHaveCount(0);

    await expect(async () => {
      await scrollGroups(section);
      await expect(section.getByText(MATCH, { exact: true })).toBeAttached();
    }).toPass({ timeout: 20_000 });

    expect(await cards(section).count()).toBeGreaterThan(FIRST_PAGE);
  });

  test('A search that matches nothing says so', async ({ page }) => {
    await openGroups(page);
    const section = groupsSection(page);
    await expect(section.getByText(OTHER, { exact: true })).toBeVisible();

    await searchGroups(section, 'no-such-group');

    await expect(section.getByText('No groups found')).toBeVisible();
    await expect(section.getByText(OTHER, { exact: true })).toBeHidden();
  });
});
