import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Names sort alphabetically and the list asks for 25 at a time.
 * `searchable-api-key-49` lands on the second page. `searchable-api-key-0` is on the first.
 * Search matches the name or the description.
 */
const FIRST_PAGE = 25;
const MATCH = 'searchable-api-key-49';
const OTHER = 'searchable-api-key-0';

test.setTimeout(180_000);

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await e2eClient({ playwright, seedScript: 'seed_searchable_api_keys' });
  await loginAs(page, 'dfe_admin');
});

const openApiKeys = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/admin/api-key-management`);
  await expect(page).toHaveURL(`${BASE_URL}/settings/admin/api-key-management`);
};

/** The API keys card. The header holds the search box and not the table. */
const apiKeysSection = (page: Page) =>
  page
    .locator('div')
    .filter({ has: page.getByText('API keys', { exact: true }) })
    .filter({ has: page.getByPlaceholder('Search', { exact: true }) })
    .filter({ has: page.locator('.ant-table') })
    .last();

const dataRows = (section: Locator) =>
  section.locator('.ant-table-tbody tr.ant-table-row');

const searchKeys = async (section: Locator, keyword: string) => {
  const field = section.getByPlaceholder('Search', { exact: true });
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
  test('A search keeps the key whose name matches', async ({ page }) => {
    await openApiKeys(page);
    const section = apiKeysSection(page);

    await expect(section.getByText(OTHER, { exact: true })).toBeVisible();
    await expect(section.getByText(MATCH, { exact: true })).toHaveCount(0);

    await searchKeys(section, MATCH);

    await expect(section.getByText(MATCH, { exact: true })).toBeVisible();
    await expect(section.getByText(OTHER, { exact: true })).toBeHidden();

    await searchKeys(section, '');

    await expect(section.getByText(OTHER, { exact: true })).toBeVisible();
    await expect(section.getByText(MATCH, { exact: true })).toHaveCount(0);
  });

  test('Scrolling the list loads the next page', async ({ page }) => {
    await openApiKeys(page);
    const section = apiKeysSection(page);

    await expect(dataRows(section)).toHaveCount(FIRST_PAGE);
    await expect(section.getByText(OTHER, { exact: true })).toBeVisible();
    await expect(section.getByText(MATCH, { exact: true })).toHaveCount(0);

    await expect(async () => {
      await scrollRows(section);
      await expect(section.getByText(MATCH, { exact: true })).toBeAttached();
    }).toPass();

    expect(await dataRows(section).count()).toBeGreaterThan(FIRST_PAGE);
  });

  test('A search that matches nothing says so', async ({ page }) => {
    await openApiKeys(page);
    const section = apiKeysSection(page);
    await expect(section.getByText(OTHER, { exact: true })).toBeVisible();

    await searchKeys(section, 'no-such-api-key');

    await expect(
      section.getByRole('heading', { name: 'No data found' }),
    ).toBeVisible();
    await expect(section.getByText(OTHER, { exact: true })).toBeHidden();
  });
});
