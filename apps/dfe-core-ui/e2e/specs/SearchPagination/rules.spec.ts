import { Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../../config/e2e.client';
import { loginAs } from '../../config/login.helpers';

/** The list asks for a page and then loads the next as it scrolls, so the count moves. */
const SEEDED = /of 50 results/;
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

test.describe('', { tag: ['@core', '@search'] }, () => {
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
