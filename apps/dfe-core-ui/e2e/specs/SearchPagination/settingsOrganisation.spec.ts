import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * The grid lists organisations by display name, six at a time, and "Show more"
 * adds six. Your organisation (`organisation`) shows in its own banner, never in
 * the grid. By display name `Searchable Organisation 0` is in the first six and
 * `Searchable Organisation 49` is not.
 * Search matches the name or the display name.
 */
const STEP = 6;
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

const showMore = (section: Locator) =>
  section.getByRole('button', { name: 'Show more' });

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

  test('Show more adds the next six', async ({ page }) => {
    await openOrganisations(page);
    const section = organisationsSection(page);

    await expect(cards(section)).toHaveCount(STEP);
    await expect(orgName(section, OTHER)).toBeVisible();
    await expect(orgName(section, MATCH)).toHaveCount(0);

    await showMore(section).click();
    await expect(cards(section)).toHaveCount(2 * STEP);

    await expect(async () => {
      await showMore(section).click();
      await expect(orgName(section, MATCH)).toBeAttached();
    }).toPass({ timeout: 20_000 });
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
