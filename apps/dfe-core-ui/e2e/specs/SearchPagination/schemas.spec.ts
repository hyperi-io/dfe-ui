import { Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/** Leaf title. The path search uses the directory prefix so the two lists do not share a hit. */
const MATCH = 'searchable-49';
const OTHER = 'searchable-0';

test.setTimeout(180_000);

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await loginAs(page, 'dfe_admin');
});

const openSchemas = async (page: Page, path: string) => {
  await page.goto(`${BASE_URL}${path}`);
  await expect(page).toHaveURL(new RegExp(`${path}$`));
};

const resultCount = (page: Page) => page.getByText(/\d+ of \d+ results?/);

const loadedCount = async (page: Page) => {
  const text = await resultCount(page).innerText();
  const match = /(\d+) of (\d+)/.exec(text);
  if (!match) {
    throw new Error(`No schema count in ${text}`);
  }
  return { loaded: Number(match[1]), total: Number(match[2]) };
};

const searchSchemas = async (page: Page, keyword: string) => {
  const field = page.getByRole('textbox', { name: /Keyword/ });
  await page.getByRole('button', { name: /^Filters/ }).click();
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

/** The next page loads when the sentinel under the tree scrolls into view. */
const scrollSchemas = async (page: Page) => {
  const tree = page.getByRole('tree');
  await tree.evaluate((node) => {
    let scroller = node.parentElement;
    while (scroller) {
      const overflow = getComputedStyle(scroller).overflowY;
      if (overflow === 'auto' || overflow === 'scroll') {
        scroller.scrollTop = scroller.scrollHeight;
        return;
      }
      scroller = scroller.parentElement;
    }
  });
};

const expectNextPageOnScroll = async (page: Page) => {
  // The count renders as "0 of 0" while the list request is in flight.
  await expect(page.getByRole('tree')).toBeVisible();
  let first = { loaded: 0, total: 0 };
  await expect(async () => {
    first = await loadedCount(page);
    expect(first.loaded).toBeGreaterThan(0);
    expect(first.loaded).toBeLessThan(first.total);
  }).toPass();

  await expect(async () => {
    await scrollSchemas(page);
    const next = await loadedCount(page);
    expect(next.loaded).toBeGreaterThan(first.loaded);
  }).toPass();
};

test.describe('', { tag: [TAGS.core, TAGS.search, TAGS.pagination] }, () => {
  test.describe('meta schemas', () => {
    test.beforeEach(async ({ playwright }) => {
      await e2eClient({
        playwright,
        seedScript: 'seed_searchable_meta_schemas',
      });
    });

    test('A search keeps the meta schema whose path matches', async ({
      page,
    }) => {
      await openSchemas(page, '/schemas/meta-schemas');
      await expect(resultCount(page)).toBeVisible();

      await searchSchemas(page, `meta/${MATCH}`);

      await expect(page.getByText('1 of 1 result')).toBeVisible();
      await expect(
        page.getByRole('tree').getByText(MATCH, { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('tree').getByText(OTHER, { exact: true }),
      ).toHaveCount(0);

      await page.getByRole('button', { name: /^Filters/ }).click();
      await page
        .getByRole('button', { name: 'Clear Filters', exact: true })
        .click();

      await expect(page.getByText('1 of 1 result')).toBeHidden();
      await expect(resultCount(page)).toBeVisible();
    });

    test('Scrolling the list loads the next page', async ({ page }) => {
      await openSchemas(page, '/schemas/meta-schemas');
      await expectNextPageOnScroll(page);
    });

    test('A search that matches nothing says so', async ({ page }) => {
      await openSchemas(page, '/schemas/meta-schemas');
      await expect(resultCount(page)).toBeVisible();

      await searchSchemas(page, 'no-such-schema');

      await expect(
        page.getByRole('heading', { name: 'No schemas match your filters' }),
      ).toBeVisible();
      await expect(page.getByText('0 of 0 results')).toBeVisible();
      await expect(
        page.getByRole('tree').getByText(MATCH, { exact: true }),
      ).toHaveCount(0);
    });
  });

  test.describe('other schemas', () => {
    test.beforeEach(async ({ playwright }) => {
      await e2eClient({
        playwright,
        seedScript: 'seed_searchable_common_headers',
      });
      await e2eClient({
        playwright,
        seedScript: 'seed_searchable_hunt_schemas',
      });
    });

    test('A search keeps the other schema whose path matches', async ({
      page,
    }) => {
      await openSchemas(page, '/schemas/other-schemas');
      await expect(resultCount(page)).toBeVisible();

      await searchSchemas(page, `hunts/${MATCH}`);

      await expect(page.getByText('1 of 1 result')).toBeVisible();
      const tree = page.getByRole('tree');
      await tree.getByText('hunts', { exact: true }).click();
      await expect(tree.getByText(MATCH, { exact: true })).toBeVisible();
      await expect(
        tree.getByText('common-header', { exact: true }),
      ).toHaveCount(0);
      await expect(tree.getByText(OTHER, { exact: true })).toHaveCount(0);

      await page.getByRole('button', { name: /^Filters/ }).click();
      await page
        .getByRole('button', { name: 'Clear Filters', exact: true })
        .click();

      await expect(page.getByText('1 of 1 result')).toBeHidden();
      await expect(
        tree.getByText('common-header', { exact: true }),
      ).toBeVisible();
    });

    test('Scrolling the list loads the next page', async ({ page }) => {
      await openSchemas(page, '/schemas/other-schemas');
      await expectNextPageOnScroll(page);
    });

    test('A search that matches nothing says so', async ({ page }) => {
      await openSchemas(page, '/schemas/other-schemas');
      await expect(resultCount(page)).toBeVisible();

      await searchSchemas(page, 'no-such-schema');

      await expect(
        page.getByRole('heading', { name: 'No schemas match your filters' }),
      ).toBeVisible();
      await expect(page.getByText('0 of 0 results')).toBeVisible();
      await expect(
        page.getByRole('tree').getByText('hunts', { exact: true }),
      ).toHaveCount(0);
    });
  });
});
