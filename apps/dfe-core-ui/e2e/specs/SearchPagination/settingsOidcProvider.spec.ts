import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { rx } from '@e2e/config/regex.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Provider names sort alphabetically. The engine's own page is 50, which is
 * this whole seed, so the search and scroll tests ask for 25.
 * `Searchable Provider 0` stays on the first page. `Searchable Provider 49`
 * then lands on the next one. Users of `searchable-oidc-0` are the seeded
 * accounts, and those tests ask for the same page of 25.
 */
const PROVIDER_PAGE = 25;
const USER_PAGE = 25;
const PROVIDER_MATCH = 'Searchable Provider 49';
const PROVIDER_OTHER = 'Searchable Provider 0';
const USER_PROVIDER = 'searchable-oidc-0';
const USER_MATCH = 'Searchable Account 49';
const USER_OTHER = 'Searchable Account 0';

test.setTimeout(180_000);

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await loginAs(page, 'dfe_admin');
});

const openProviders = async (page: Page, pageSize?: number) => {
  const path = pageSize
    ? `/settings/admin/oidc-provider-management?page_size=${pageSize}`
    : '/settings/admin/oidc-provider-management';
  await page.goto(`${BASE_URL}${path}`);
  await expect(page).toHaveURL(`${BASE_URL}${path}`);
};

/** The card. The header holds the search box; its parent holds the grid. */
const providersSection = (page: Page) =>
  page
    .locator('div')
    .filter({ has: page.getByText('OIDC providers', { exact: true }) })
    .filter({ has: page.getByPlaceholder('Search providers', { exact: true }) })
    .last()
    .locator('..');

const providerName = (section: Locator, name: string) =>
  section.getByRole('heading', { name: rx`${name}\b` });

const providerCards = (section: Locator) => section.locator('ul.grid > li');

const searchProviders = async (section: Locator, keyword: string) => {
  const field = section.getByPlaceholder('Search providers', { exact: true });
  await field.scrollIntoViewIfNeeded();
  await field.fill(keyword);
  await expect(field).toHaveValue(keyword);
};

/** The next page loads when the sentinel under the grid scrolls into view. */
const scrollProviders = async (section: Locator) => {
  const grid = section.locator('ul.grid');
  await grid.evaluate((node) => {
    const scroller = node.parentElement;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  });
};

const userRows = (drawer: Locator) =>
  drawer.locator('.ant-table-tbody tr.ant-table-row');

const searchUsers = async (drawer: Locator, keyword: string) => {
  const field = drawer.getByPlaceholder('Search users', { exact: true });
  await field.fill(keyword);
  await expect(field).toHaveValue(keyword);
};

/** The next page loads when the table body scrolls near its last row. */
const scrollUsers = async (drawer: Locator) => {
  const body = drawer.locator('.ant-table-body');
  await body.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
};

const openProviderUsers = async (page: Page, section: Locator) => {
  const card = section.locator('li').filter({
    has: page.getByRole('heading', { name: /Searchable Provider 0\b/ }),
  });
  await card.getByRole('button', { name: 'OIDC Provider actions' }).click();
  await page
    .getByRole('button', { name: `View ${USER_PROVIDER} details` })
    .click();
  const drawer = page.getByRole('dialog', { name: 'OIDC Provider Details' });
  await expect(drawer).toBeVisible();
  await drawer.getByRole('tab', { name: 'Users' }).click();
  return drawer;
};

test.describe('', { tag: [TAGS.core, TAGS.search, TAGS.pagination] }, () => {
  test.describe('oidc providers', () => {
    test.beforeEach(async ({ playwright }) => {
      await e2eClient({
        playwright,
        seedScript: 'seed_searchable_oidc_providers',
      });
    });

    test('A search keeps the provider whose name matches', async ({ page }) => {
      await openProviders(page, PROVIDER_PAGE);
      const section = providersSection(page);

      await expect(providerName(section, PROVIDER_OTHER)).toBeVisible();
      await expect(providerName(section, PROVIDER_MATCH)).toHaveCount(0);

      await searchProviders(section, PROVIDER_MATCH);

      await expect(providerName(section, PROVIDER_MATCH)).toBeVisible();
      await expect(providerName(section, PROVIDER_OTHER)).toBeHidden();

      await searchProviders(section, '');

      await expect(providerName(section, PROVIDER_OTHER)).toBeVisible();
      await expect(providerName(section, PROVIDER_MATCH)).toHaveCount(0);
    });

    test('Scrolling the list loads the next page', async ({ page }) => {
      await openProviders(page, PROVIDER_PAGE);
      const section = providersSection(page);

      await expect(providerCards(section)).toHaveCount(PROVIDER_PAGE);
      await expect(providerName(section, PROVIDER_OTHER)).toBeVisible();
      await expect(providerName(section, PROVIDER_MATCH)).toHaveCount(0);

      await expect(async () => {
        await scrollProviders(section);
        await expect(providerName(section, PROVIDER_MATCH)).toBeAttached();
      }).toPass({ timeout: 20_000 });

      expect(await providerCards(section).count()).toBeGreaterThan(
        PROVIDER_PAGE,
      );
    });

    test('A search that matches nothing says so', async ({ page }) => {
      await openProviders(page);
      const section = providersSection(page);
      await expect(providerName(section, PROVIDER_OTHER)).toBeVisible();

      await searchProviders(section, 'no-such-provider');

      await expect(section.getByText('No OIDC providers found')).toBeVisible();
      await expect(providerName(section, PROVIDER_OTHER)).toBeHidden();
    });
  });

  test.describe('oidc provider users', () => {
    test.beforeEach(async ({ playwright }) => {
      await e2eClient({ playwright, seedScript: 'seed_searchable_accounts' });
      await e2eClient({
        playwright,
        seedScript: 'seed_searchable_oidc_providers',
      });
      await e2eClient({ playwright, seedScript: 'seed_searchable_oidc_users' });
    });

    test('A search keeps the user whose name matches', async ({ page }) => {
      await openProviders(page, USER_PAGE);
      const drawer = await openProviderUsers(page, providersSection(page));

      await expect(drawer.getByText(USER_OTHER, { exact: true })).toBeVisible();
      await expect(drawer.getByText(USER_MATCH, { exact: true })).toHaveCount(
        0,
      );

      await searchUsers(drawer, USER_MATCH);

      await expect(drawer.getByText(USER_MATCH, { exact: true })).toBeVisible();
      await expect(drawer.getByText(USER_OTHER, { exact: true })).toBeHidden();

      await searchUsers(drawer, '');

      await expect(drawer.getByText(USER_OTHER, { exact: true })).toBeVisible();
      await expect(drawer.getByText(USER_MATCH, { exact: true })).toHaveCount(
        0,
      );
    });

    test('Scrolling the list loads the next page', async ({ page }) => {
      await openProviders(page, USER_PAGE);
      const drawer = await openProviderUsers(page, providersSection(page));

      await expect(userRows(drawer)).toHaveCount(USER_PAGE);
      await expect(drawer.getByText(USER_OTHER, { exact: true })).toBeVisible();
      await expect(drawer.getByText(USER_MATCH, { exact: true })).toHaveCount(
        0,
      );

      await expect(async () => {
        await scrollUsers(drawer);
        await expect(
          drawer.getByText(USER_MATCH, { exact: true }),
        ).toBeAttached();
      }).toPass();

      expect(await userRows(drawer).count()).toBeGreaterThan(USER_PAGE);
    });

    test('A search that matches nothing says so', async ({ page }) => {
      await openProviders(page);
      const drawer = await openProviderUsers(page, providersSection(page));
      await expect(drawer.getByText(USER_OTHER, { exact: true })).toBeVisible();

      await searchUsers(drawer, 'no-such-user');

      await expect(drawer.getByText('No accounts found')).toBeVisible();
      await expect(drawer.getByText(USER_OTHER, { exact: true })).toBeHidden();
    });
  });
});
