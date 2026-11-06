import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Org files sort by name and the grid asks for 12 at a time.
 * The reserved default org sorts first, so `Searchable Organisation 0` is on
 * the first page and `Searchable Organisation 49` is not.
 * Search matches the name or the display name.
 */
const FIRST_PAGE = 12;
const MATCH = 'Searchable Organisation 49';
const OTHER = 'Searchable Organisation 0';

test.setTimeout(180_000);

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await e2eClient({
    playwright,
    seedScript: 'seed_searchable_organisations',
  });
  await loginAs(page, 'dfe_admin');
});

const openOrganisations = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/admin`);
  await expect(page).toHaveURL(`${BASE_URL}/settings/admin`);
};

/** The card. The header holds the search box; its parent holds the grid. */
const organisationsSection = (page: Page) =>
  page
    .locator('div')
    .filter({
      has: page.getByText('Manage existing organisations', { exact: true }),
    })
    .filter({
      has: page.getByPlaceholder('Search organisations', { exact: true }),
    })
    .last()
    .locator('..');

const cards = (section: Locator) => section.locator('ul.grid > li');

const orgName = (section: Locator, name: string) =>
  section.getByRole('heading', { name, exact: true });

const searchOrganisations = async (section: Locator, keyword: string) => {
  const field = section.getByPlaceholder('Search organisations', {
    exact: true,
  });
  await field.scrollIntoViewIfNeeded();
  await field.fill(keyword);
  await expect(field).toHaveValue(keyword);
};

/** The next page loads when the sentinel under the grid scrolls into view. */
const scrollOrganisations = async (section: Locator) => {
  const grid = section.locator('ul.grid');
  await grid.evaluate((node) => {
    const scroller = node.parentElement;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  });
};

test.describe('', { tag: [TAGS.core, TAGS.search, TAGS.pagination] }, () => {
  test('A search keeps the organisation whose name matches', async ({
    page,
  }) => {
    await openOrganisations(page);
    const section = organisationsSection(page);

    await expect(orgName(section, OTHER)).toBeVisible();
    await expect(orgName(section, MATCH)).toHaveCount(0);

    await searchOrganisations(section, MATCH);

    await expect(orgName(section, MATCH)).toBeVisible();
    await expect(orgName(section, OTHER)).toBeHidden();

    await searchOrganisations(section, '');

    await expect(orgName(section, OTHER)).toBeVisible();
    await expect(orgName(section, MATCH)).toHaveCount(0);
  });

  test('Scrolling the list loads the next page', async ({ page }) => {
    await openOrganisations(page);
    const section = organisationsSection(page);

    await expect(cards(section)).toHaveCount(FIRST_PAGE);
    await expect(orgName(section, OTHER)).toBeVisible();
    await expect(orgName(section, MATCH)).toHaveCount(0);

    await expect(async () => {
      await scrollOrganisations(section);
      await expect(orgName(section, MATCH)).toBeAttached();
    }).toPass({ timeout: 20_000 });

    expect(await cards(section).count()).toBeGreaterThan(FIRST_PAGE);
  });

  test('A search that matches nothing says so', async ({ page }) => {
    await openOrganisations(page);
    const section = organisationsSection(page);
    await expect(orgName(section, OTHER)).toBeVisible();

    await searchOrganisations(section, 'no-such-organisation');

    await expect(section.getByText('No organisations found')).toBeVisible();
    await expect(orgName(section, OTHER)).toBeHidden();
  });
});
