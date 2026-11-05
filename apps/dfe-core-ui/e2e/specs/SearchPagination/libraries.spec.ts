import { Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../../config/e2e.client';
import { loginAs } from '../../config/login.helpers';

/** The description of one seeded artefact. The table shows its name, not this text. */
const MATCH_DESCRIPTION = 'Searchable Library 49';
const MATCH = 'searchable-library-49';
const OTHER = 'searchable-library-0';

test.setTimeout(60_000);

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await e2eClient({ playwright, seedScript: 'seed_searchable_libraries' });
  await loginAs(page, 'dfe_admin');
});

const openLibrary = async (page: Page) => {
  await page.goto(`${BASE_URL}/library`);
  await expect(page).toHaveURL(`${BASE_URL}/library`);
};

const searchBox = (page: Page) =>
  page.getByRole('searchbox', { name: 'Search name or description' });

/** The field searches on enter, not on each keystroke. */
const searchLibraries = async (page: Page, keyword: string) => {
  const field = searchBox(page);
  await field.fill(keyword);
  await field.press('Enter');
};

test.describe('', { tag: ['@core', '@search'] }, () => {
  test('A search keeps the library whose name or description matches', async ({
    page,
  }) => {
    await openLibrary(page);

    await expect(
      page.getByRole('button', { name: OTHER, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: MATCH, exact: true }),
    ).toBeVisible();

    await searchLibraries(page, MATCH_DESCRIPTION);

    await expect(
      page.getByRole('button', { name: MATCH, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: OTHER, exact: true }),
    ).toBeHidden();

    await searchLibraries(page, '');

    await expect(
      page.getByRole('button', { name: OTHER, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: MATCH, exact: true }),
    ).toBeVisible();
  });

  test('A search that matches nothing says so', async ({ page }) => {
    await openLibrary(page);
    await expect(
      page.getByRole('button', { name: OTHER, exact: true }),
    ).toBeVisible();

    await searchLibraries(page, 'no-such-library');

    await expect(
      page.getByRole('heading', { name: 'No data found' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: OTHER, exact: true }),
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: MATCH, exact: true }),
    ).toBeHidden();
  });
});
