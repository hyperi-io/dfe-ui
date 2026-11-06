import { Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/** The list asks for a page and then loads the next as it scrolls, so the count moves. */
const SEEDED = /of 50 results/;
const FIRST_PAGE = '25 of 50 results';
const ALL_PAGES = '50 of 50 results';
/** A seeded display name past the first page, so a hit cannot be the loaded rows alone. */
const MATCH = 'Searchable Rule 49';
const OTHER = 'Searchable Rule 0';

test.setTimeout(60_000);

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });

  await e2eClient({ playwright, seedScript: 'seed_searchable_rules' });
  await loginAs(page, 'dfe_admin');
});

const openRules = async (page: Page) => {
  await page.goto(`${BASE_URL}/rules`);
  await expect(page).toHaveURL(`${BASE_URL}/rules`);
};

/** The next page loads when the sentinel under the last row scrolls into view. */
const scrollListToEnd = async (page: Page) => {
  const list = page.getByRole('list').filter({
    has: page.getByText(OTHER, { exact: true }),
  });
  await list.evaluate((node) => {
    const scroller = node.parentElement;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  });
};

const searchRules = async (page: Page, keyword: string) => {
  const filters = page.getByRole('button', { name: /^Filters/ });
  const field = page.getByRole('textbox', { name: /Keyword/ });
  await filters.click();
  await expect(field).toBeVisible();
  await field.fill(keyword);
  await expect(field).toHaveValue(keyword);
  await page
    .getByRole('button', { name: 'Apply Filters', exact: true })
    .click();
  await expect(page).toHaveURL(
    (url) => url.searchParams.get('search') === keyword,
  );
};

test.describe('', { tag: [TAGS.core, TAGS.search, TAGS.pagination] }, () => {
  test('A search keeps the rules whose name matches', async ({ page }) => {
    await openRules(page);

    await expect(page.getByText(SEEDED)).toBeVisible();
    await expect(page.getByText(OTHER, { exact: true })).toBeVisible();

    await searchRules(page, MATCH);

    await expect(page.getByText('1 of 1 result')).toBeVisible();
    await expect(page.getByText(MATCH, { exact: true })).toBeVisible();
    await expect(page.getByText(OTHER, { exact: true })).toBeHidden();

    await page.getByRole('button', { name: /^Filters/ }).click();
    await page
      .getByRole('button', { name: 'Clear Filters', exact: true })
      .click();

    await expect(page.getByText(SEEDED)).toBeVisible();
    await expect(page.getByText(OTHER, { exact: true })).toBeVisible();
  });

  test('Scrolling the list loads the next page', async ({ page }) => {
    await openRules(page);

    await expect(page.getByText(FIRST_PAGE)).toBeVisible();
    await expect(page.getByText(OTHER, { exact: true })).toBeVisible();
    await expect(page.getByText(MATCH, { exact: true })).toHaveCount(0);

    await expect(async () => {
      await scrollListToEnd(page);
      await expect(page.getByText(ALL_PAGES)).toBeVisible();
    }).toPass();

    await expect(page.getByText(MATCH, { exact: true })).toBeAttached();
  });

  test('A search that matches nothing says so', async ({ page }) => {
    await openRules(page);
    await expect(page.getByText(SEEDED)).toBeVisible();

    await searchRules(page, 'no-such-rule');

    await expect(
      page.getByRole('heading', { name: 'No rules match your filters' }),
    ).toBeVisible();
    await expect(page.getByText('0 of 0 results')).toBeVisible();
    await expect(page.getByText(OTHER, { exact: true })).toBeHidden();
  });
});
