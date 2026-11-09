import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Usernames sort alphabetically. The engine's own page is 50, which is this
 * whole seed, so the search and scroll tests ask for 25.
 * `searchable-account-49` / `searchable-blocked-49` then land on the second page.
 * The open list also contains dfe_admin. Core accounts stay out of both lists.
 */
const FIRST_PAGE = 25;
const ACCOUNT_MATCH = 'Searchable Account 49';
const ACCOUNT_OTHER = 'Searchable Account 0';
const BLOCKED_MATCH = 'Searchable Blocked 49';
const BLOCKED_OTHER = 'Searchable Blocked 0';

test.setTimeout(180_000);

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await loginAs(page, 'dfe_admin');
});

const openAccounts = async (page: Page, pageSize?: number) => {
  const path = pageSize
    ? `/settings/admin/account-management?page_size=${pageSize}`
    : '/settings/admin/account-management';
  await page.goto(`${BASE_URL}${path}`);
  await expect(page).toHaveURL(`${BASE_URL}${path}`);
};

/** The section card. Ancestors hold both lists, so the other title is excluded. */
const listSection = (page: Page, title: string, otherTitle: string) =>
  page
    .locator('div')
    .filter({ has: page.getByText(title, { exact: true }) })
    .filter({ has: page.getByPlaceholder('Search accounts') })
    .filter({ hasNot: page.getByText(otherTitle, { exact: true }) })
    .first();

const dataRows = (section: Locator) =>
  section.locator('.ant-table-tbody tr.ant-table-row');

const searchAccounts = async (section: Locator, keyword: string) => {
  const field = section.getByPlaceholder('Search accounts');
  await field.scrollIntoViewIfNeeded();
  await field.fill(keyword);
  await expect(field).toHaveValue(keyword);
};

/** The next page loads when the table body scrolls near its last row. */
const scrollRows = async (section: Locator) => {
  const body = section.locator('.ant-table-body');
  await body.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
};

test.describe('', { tag: [TAGS.core, TAGS.search, TAGS.pagination] }, () => {
  test.describe('account list', () => {
    test.beforeEach(async ({ playwright }) => {
      await e2eClient({
        playwright,
        seedScript: 'seed_searchable_accounts',
      });
    });

    test('A search keeps the account whose name matches', async ({ page }) => {
      await openAccounts(page, FIRST_PAGE);
      const section = listSection(
        page,
        'Manage existing accounts',
        'Blocked accounts',
      );

      await expect(
        section.getByText(ACCOUNT_OTHER, { exact: true }),
      ).toBeVisible();
      await expect(
        section.getByText(ACCOUNT_MATCH, { exact: true }),
      ).toHaveCount(0);

      await searchAccounts(section, ACCOUNT_MATCH);

      await expect(
        section.getByText(ACCOUNT_MATCH, { exact: true }),
      ).toBeVisible();
      await expect(
        section.getByText(ACCOUNT_OTHER, { exact: true }),
      ).toBeHidden();

      await searchAccounts(section, '');

      await expect(
        section.getByText(ACCOUNT_OTHER, { exact: true }),
      ).toBeVisible();
      await expect(
        section.getByText(ACCOUNT_MATCH, { exact: true }),
      ).toHaveCount(0);
    });

    test('Scrolling the list loads the next page', async ({ page }) => {
      await openAccounts(page, FIRST_PAGE);
      const section = listSection(
        page,
        'Manage existing accounts',
        'Blocked accounts',
      );

      await expect(dataRows(section)).toHaveCount(FIRST_PAGE);
      await expect(
        section.getByText(ACCOUNT_OTHER, { exact: true }),
      ).toBeVisible();
      await expect(
        section.getByText(ACCOUNT_MATCH, { exact: true }),
      ).toHaveCount(0);

      await expect(async () => {
        await scrollRows(section);
        await expect(
          section.getByText(ACCOUNT_MATCH, { exact: true }),
        ).toBeAttached();
      }).toPass();

      expect(await dataRows(section).count()).toBeGreaterThan(FIRST_PAGE);
    });

    test('A search that matches nothing says so', async ({ page }) => {
      await openAccounts(page);
      const section = listSection(
        page,
        'Manage existing accounts',
        'Blocked accounts',
      );
      await expect(
        section.getByText(ACCOUNT_OTHER, { exact: true }),
      ).toBeVisible();

      await searchAccounts(section, 'no-such-account');

      await expect(section.getByText('No accounts found')).toBeVisible();
      await expect(
        section.getByText(ACCOUNT_OTHER, { exact: true }),
      ).toBeHidden();
    });
  });

  test.describe('blocked accounts', () => {
    test.beforeEach(async ({ playwright }) => {
      await e2eClient({
        playwright,
        seedScript: 'seed_searchable_blocked_accounts',
      });
    });

    test('A search keeps the blocked account whose name matches', async ({
      page,
    }) => {
      await openAccounts(page, FIRST_PAGE);
      const section = listSection(
        page,
        'Blocked accounts',
        'Manage existing accounts',
      );
      await section.scrollIntoViewIfNeeded();

      await expect(
        section.getByText(BLOCKED_OTHER, { exact: true }),
      ).toBeVisible();
      await expect(
        section.getByText(BLOCKED_MATCH, { exact: true }),
      ).toHaveCount(0);

      await searchAccounts(section, BLOCKED_MATCH);

      await expect(
        section.getByText(BLOCKED_MATCH, { exact: true }),
      ).toBeVisible();
      await expect(
        section.getByText(BLOCKED_OTHER, { exact: true }),
      ).toBeHidden();

      await searchAccounts(section, '');

      await expect(
        section.getByText(BLOCKED_OTHER, { exact: true }),
      ).toBeVisible();
      await expect(
        section.getByText(BLOCKED_MATCH, { exact: true }),
      ).toHaveCount(0);
    });

    test('Scrolling the list loads the next page', async ({ page }) => {
      await openAccounts(page, FIRST_PAGE);
      const section = listSection(
        page,
        'Blocked accounts',
        'Manage existing accounts',
      );
      await section.scrollIntoViewIfNeeded();

      await expect(dataRows(section)).toHaveCount(FIRST_PAGE);
      await expect(
        section.getByText(BLOCKED_OTHER, { exact: true }),
      ).toBeVisible();
      await expect(
        section.getByText(BLOCKED_MATCH, { exact: true }),
      ).toHaveCount(0);

      await expect(async () => {
        await scrollRows(section);
        await expect(
          section.getByText(BLOCKED_MATCH, { exact: true }),
        ).toBeAttached();
      }).toPass();

      expect(await dataRows(section).count()).toBeGreaterThan(FIRST_PAGE);
    });

    test('A search that matches nothing says so', async ({ page }) => {
      await openAccounts(page);
      const section = listSection(
        page,
        'Blocked accounts',
        'Manage existing accounts',
      );
      await section.scrollIntoViewIfNeeded();
      await expect(
        section.getByText(BLOCKED_OTHER, { exact: true }),
      ).toBeVisible();

      await searchAccounts(section, 'no-such-account');

      await expect(section.getByText('No accounts found')).toBeVisible();
      await expect(
        section.getByText(BLOCKED_OTHER, { exact: true }),
      ).toBeHidden();
    });
  });
});
