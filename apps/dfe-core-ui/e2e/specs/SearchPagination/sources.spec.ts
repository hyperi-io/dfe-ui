import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * The list asks for 25 at a time. The tree is built from every match, so a
 * later name is already on screen while the count still shows the first page.
 * Search matches the name, the display name, or the description. Core sources
 * such as main stay in the list, so the total is not 50.
 */
const MATCH = 'searchable-source-49';
const OTHER = 'searchable-source-0';

/**
 * `searchable-columns` is deployed with the syslog schema. That schema resolves
 * to fewer columns than the table's page of 50, so they all arrive together.
 */
const COLUMNS_SOURCE = 'searchable-columns';

/**
 * The catalogue table asks for 10 at a time and turns the page with its pager.
 * Entries stay in name order. Search matches the name or the dataset.
 */
const CATALOGUE_MATCH = 'okta';

test.setTimeout(180_000);

test.beforeEach(async ({ playwright, page }) => {
  // The dev indicator sits on the drawer's controls and takes the click.
  await page.addInitScript(() => {
    const hide = () => {
      document.querySelectorAll('nextjs-portal').forEach((node) => {
        (node as HTMLElement).style.setProperty('pointer-events', 'none');
      });
    };
    hide();
    new MutationObserver(hide).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await loginAs(page, 'dfe_admin');
});

const openSources = async (page: Page) => {
  await page.goto(`${BASE_URL}/sources`);
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/sources`));
};

const sourceRow = (page: Page, name: string) =>
  page.getByTestId(`source-tree-item-${name}`);

const resultCount = (page: Page) => page.getByText(/\d+ of \d+ results?/);

const loadedCount = async (page: Page) => {
  const text = await resultCount(page).innerText();
  const match = /(\d+) of (\d+)/.exec(text);
  if (!match) {
    throw new Error(`No source count in ${text}`);
  }
  return { loaded: Number(match[1]), total: Number(match[2]) };
};

const searchSources = async (page: Page, keyword: string) => {
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
const scrollSources = async (page: Page) => {
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

const openCatalogue = async (page: Page) => {
  await openSources(page);
  await page
    .getByRole('button', { name: 'Add from catalogue', exact: true })
    .click();
  const drawer = page.getByRole('dialog', { name: 'Add from catalogue' });
  await expect(drawer).toBeVisible();
  return drawer;
};

const catalogueRows = (drawer: Locator) =>
  drawer.locator('.ant-table-tbody tr.ant-table-row');

const searchCatalogue = async (drawer: Locator, keyword: string) => {
  const field = drawer.getByPlaceholder('Search by name or dataset', {
    exact: true,
  });
  await field.fill(keyword);
  await expect(field).toHaveValue(keyword);
};

test.describe('', { tag: [TAGS.core] }, () => {
  test.describe('source list', { tag: [TAGS.search, TAGS.pagination] }, () => {
    test.beforeEach(async ({ playwright }) => {
      await e2eClient({
        playwright,
        seedScript: 'seed_searchable_sources',
      });
    });

    test('A search keeps the source whose name matches', async ({ page }) => {
      await openSources(page);

      await expect(sourceRow(page, OTHER)).toBeVisible();
      await expect(sourceRow(page, MATCH)).toBeVisible();

      await searchSources(page, MATCH);

      await expect(page.getByText('1 of 1 result')).toBeVisible();
      await expect(sourceRow(page, MATCH)).toBeVisible();
      await expect(sourceRow(page, OTHER)).toHaveCount(0);

      await page.getByRole('button', { name: /^Filters/ }).click();
      await page
        .getByRole('button', { name: 'Clear Filters', exact: true })
        .click();

      await expect(sourceRow(page, OTHER)).toBeVisible();
      await expect(sourceRow(page, MATCH)).toBeVisible();
    });

    test('Scrolling the list loads the next page', async ({ page }) => {
      await openSources(page);

      // The count renders as "0 of 0" while the list request is in flight.
      await expect(page.getByRole('tree')).toBeVisible();
      let first = { loaded: 0, total: 0 };
      await expect(async () => {
        first = await loadedCount(page);
        expect(first.loaded).toBeGreaterThan(0);
        expect(first.loaded).toBeLessThan(first.total);
      }).toPass();

      await expect(async () => {
        await scrollSources(page);
        const next = await loadedCount(page);
        expect(next.loaded).toBeGreaterThan(first.loaded);
      }).toPass({ timeout: 20_000 });
    });

    test('A search that matches nothing says so', async ({ page }) => {
      await openSources(page);
      await expect(sourceRow(page, OTHER)).toBeVisible();

      await searchSources(page, 'no-such-source');

      await expect(
        page.getByRole('heading', { name: 'No sources match your filters' }),
      ).toBeVisible();
      await expect(page.getByText('0 of 0 results')).toBeVisible();
      await expect(sourceRow(page, OTHER)).toHaveCount(0);
    });
  });

  test.describe('source columns', () => {
    test.beforeEach(async ({ playwright }) => {
      await e2eClient({
        playwright,
        seedScript: 'seed_searchable_source_columns',
      });
    });

    test('The seeded source lists its columns', async ({ page }) => {
      await openSources(page);
      const source = page.getByTestId(`source-tree-item-${COLUMNS_SOURCE}`);
      await source.scrollIntoViewIfNeeded();
      await source.click();
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('source_name') === COLUMNS_SOURCE,
      );

      await page.getByRole('tab', { name: 'Columns', exact: true }).click();
      const panel = page.getByRole('tabpanel', { name: 'Columns' });
      const heading = panel.getByText(/\d+ columns/);
      await expect(heading).toBeVisible();
      const total = Number(/\d+/.exec(await heading.innerText())?.[0]);

      await expect(
        panel.locator('.ant-table-tbody tr.ant-table-row'),
      ).toHaveCount(total);
      await expect(
        panel.getByRole('cell', { name: 'hostname', exact: true }),
      ).toBeVisible();
    });
  });

  test.describe(
    'add from catalogue',
    { tag: [TAGS.search, TAGS.pagination] },
    () => {
      test('A search keeps the entry whose name matches', async ({ page }) => {
        const drawer = await openCatalogue(page);
        const first = catalogueRows(drawer).first();
        await expect(first).toBeVisible();
        const firstName = (
          await first.getByRole('cell').nth(1).innerText()
        ).trim();

        await searchCatalogue(drawer, CATALOGUE_MATCH);

        await expect(
          drawer.getByRole('cell', { name: CATALOGUE_MATCH, exact: true }),
        ).toBeVisible();
        await expect(
          drawer.getByRole('cell', { name: firstName, exact: true }),
        ).toHaveCount(0);

        await searchCatalogue(drawer, '');

        await expect(
          drawer.getByRole('cell', { name: firstName, exact: true }),
        ).toBeVisible();
      });

      test('The next page replaces the rows on screen', async ({ page }) => {
        const drawer = await openCatalogue(page);
        const first = catalogueRows(drawer).first();
        await expect(first).toBeVisible();
        const firstName = (
          await first.getByRole('cell').nth(1).innerText()
        ).trim();
        await expect(catalogueRows(drawer)).toHaveCount(10);

        await drawer.locator('.ant-pagination-next').click();

        await expect(
          drawer.getByRole('cell', { name: firstName, exact: true }),
        ).toHaveCount(0);
        await expect(catalogueRows(drawer)).toHaveCount(10);
      });

      test('A search that matches nothing says so', async ({ page }) => {
        const drawer = await openCatalogue(page);
        await expect(catalogueRows(drawer).first()).toBeVisible();

        await searchCatalogue(drawer, 'no-such-catalogue-entry');

        await expect(
          drawer.getByRole('heading', {
            name: 'No catalogue is mounted on this deployment, or nothing matches the filter.',
          }),
        ).toBeVisible();
        await expect(catalogueRows(drawer)).toHaveCount(0);
      });
    },
  );
});
