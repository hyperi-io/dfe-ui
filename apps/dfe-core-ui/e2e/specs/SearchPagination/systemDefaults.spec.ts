import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Drift rows sort by source name and the drawer asks for 10 at a time.
 * `searchable-default-0` is on the first page and `searchable-default-49` is not.
 * Search matches the source name, a drifted field, or a stored value.
 */
const FIRST_PAGE = 10;
const MATCH = 'searchable-default-49';
const OTHER = 'searchable-default-0';

test.setTimeout(180_000);

test.beforeEach(async ({ playwright, page }) => {
  // The dev indicator sits on the menu and the drawer and takes the click.
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
  await e2eClient({
    playwright,
    seedScript: 'seed_searchable_system_defaults',
  });
  await loginAs(page, 'dfe_admin');
});

const openDrift = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/platform`);
  await expect(page).toHaveURL(`${BASE_URL}/settings/platform`);
  const actions = page.getByRole('button', { name: 'System defaults actions' });
  await actions.scrollIntoViewIfNeeded();
  await actions.click();
  await page
    .getByRole('button', { name: 'Identify Config Drift', exact: true })
    .click();
  const drawer = page.getByRole('dialog', { name: 'Identify Config Drift' });
  await expect(drawer).toBeVisible();
  return drawer;
};

const rows = (drawer: Locator) =>
  drawer.locator('.ant-table-tbody tr.ant-table-row');

const sourceName = (drawer: Locator, name: string) =>
  drawer.getByRole('cell', { name, exact: true });

const searchDrift = async (drawer: Locator, keyword: string) => {
  const field = drawer.getByPlaceholder('Search sources', { exact: true });
  await field.fill(keyword);
  await expect(field).toHaveValue(keyword);
};

/** The next page loads when the sentinel under the table scrolls into view. */
const scrollDrift = async (drawer: Locator) => {
  await drawer.locator('.ant-drawer-body').evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
};

test.describe(
  'config drift',
  { tag: [TAGS.core, TAGS.search, TAGS.pagination] },
  () => {
    test('A search keeps the source whose name matches', async ({ page }) => {
      const drawer = await openDrift(page);

      await expect(sourceName(drawer, OTHER)).toBeVisible();
      await expect(sourceName(drawer, MATCH)).toHaveCount(0);

      await searchDrift(drawer, MATCH);

      await expect(sourceName(drawer, MATCH)).toBeVisible();
      await expect(sourceName(drawer, OTHER)).toBeHidden();

      await searchDrift(drawer, '');

      await expect(sourceName(drawer, OTHER)).toBeVisible();
      await expect(sourceName(drawer, MATCH)).toHaveCount(0);
    });

    test('Scrolling the list loads the next page', async ({ page }) => {
      const drawer = await openDrift(page);

      await expect(rows(drawer)).toHaveCount(FIRST_PAGE);
      await expect(sourceName(drawer, OTHER)).toBeVisible();
      await expect(sourceName(drawer, MATCH)).toHaveCount(0);

      await expect(async () => {
        await scrollDrift(drawer);
        await expect(sourceName(drawer, MATCH)).toBeAttached();
      }).toPass({ timeout: 20_000 });

      expect(await rows(drawer).count()).toBeGreaterThan(FIRST_PAGE);
    });

    test('A search that matches nothing says so', async ({ page }) => {
      const drawer = await openDrift(page);
      await expect(sourceName(drawer, OTHER)).toBeVisible();

      await searchDrift(drawer, 'no-such-drift');

      await expect(
        drawer.getByRole('heading', {
          name: 'No sources with config drift found in your environment.',
        }),
      ).toBeVisible();
      await expect(sourceName(drawer, OTHER)).toBeHidden();
    });
  },
);
