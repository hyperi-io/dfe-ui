import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Names sort alphabetically and each list shows three roles until Show more.
 * Custom: `searchable-role-0` is on the first page, `searchable-role-11` is the
 * first name on the next, and `searchable-role-49` is a unique search hit.
 * Core: `admin` is first, `data_viewer` is the first name on the next page.
 */
const FIRST_PAGE = 3;
const CUSTOM_MATCH = 'searchable-role-49';
const CUSTOM_OTHER = 'searchable-role-0';
const CUSTOM_NEXT = 'searchable-role-11';
const CORE_MATCH = 'org_viewer';
const CORE_OTHER = 'admin';
const CORE_NEXT = 'data_viewer';

test.setTimeout(180_000);

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await loginAs(page, 'dfe_admin');
});

const openRoles = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/admin/role-management`);
  await expect(page).toHaveURL(`${BASE_URL}/settings/admin/role-management`);
};

/** The card. The header holds the search box; its parent holds the role list. */
const roleSection = (page: Page, title: string, placeholder: string) =>
  page
    .locator('div')
    .filter({ has: page.getByText(title, { exact: true }) })
    .filter({ has: page.getByPlaceholder(placeholder, { exact: true }) })
    .last()
    .locator('..');

const roleName = (section: Locator, name: string) =>
  section.getByRole('heading', { name, exact: true });

const cards = (section: Locator) => section.locator('ul.grid > li');

const searchRoles = async (
  section: Locator,
  placeholder: string,
  keyword: string,
) => {
  const field = section.getByPlaceholder(placeholder, { exact: true });
  await field.scrollIntoViewIfNeeded();
  await field.fill(keyword);
  await expect(field).toHaveValue(keyword);
};

test.describe('', { tag: [TAGS.core, TAGS.search, TAGS.pagination] }, () => {
  test.describe('custom roles', () => {
    test.beforeEach(async ({ playwright }) => {
      await e2eClient({ playwright, seedScript: 'seed_searchable_roles' });
    });

    test('A search keeps the role whose name matches', async ({ page }) => {
      await openRoles(page);
      const section = roleSection(page, 'Manage roles', 'Search custom roles');

      await expect(roleName(section, CUSTOM_OTHER)).toBeVisible();
      await expect(roleName(section, CUSTOM_MATCH)).toHaveCount(0);

      await searchRoles(section, 'Search custom roles', CUSTOM_MATCH);

      await expect(roleName(section, CUSTOM_MATCH)).toBeVisible();
      await expect(roleName(section, CUSTOM_OTHER)).toBeHidden();

      await searchRoles(section, 'Search custom roles', '');

      await expect(roleName(section, CUSTOM_OTHER)).toBeVisible();
      await expect(roleName(section, CUSTOM_MATCH)).toHaveCount(0);
    });

    test('Show more loads the next page', async ({ page }) => {
      await openRoles(page);
      const section = roleSection(page, 'Manage roles', 'Search custom roles');

      await expect(cards(section)).toHaveCount(FIRST_PAGE);
      await expect(roleName(section, CUSTOM_OTHER)).toBeVisible();
      await expect(roleName(section, CUSTOM_NEXT)).toHaveCount(0);

      await section
        .getByRole('button', { name: 'Show more', exact: true })
        .click();

      await expect(roleName(section, CUSTOM_NEXT)).toBeVisible();
      expect(await cards(section).count()).toBeGreaterThan(FIRST_PAGE);
    });

    test('A search that matches nothing says so', async ({ page }) => {
      await openRoles(page);
      const section = roleSection(page, 'Manage roles', 'Search custom roles');
      await expect(roleName(section, CUSTOM_OTHER)).toBeVisible();

      await searchRoles(section, 'Search custom roles', 'no-such-role');

      await expect(section.getByText('No custom roles found')).toBeVisible();
      await expect(roleName(section, CUSTOM_OTHER)).toBeHidden();
    });
  });

  test.describe('core roles', () => {
    test('A search keeps the role whose name matches', async ({ page }) => {
      await openRoles(page);
      const section = roleSection(
        page,
        'Core roles',
        'Search predefined roles',
      );
      await section.scrollIntoViewIfNeeded();

      await expect(roleName(section, CORE_OTHER)).toBeVisible();
      await expect(roleName(section, CORE_MATCH)).toHaveCount(0);

      await searchRoles(section, 'Search predefined roles', CORE_MATCH);

      await expect(roleName(section, CORE_MATCH)).toBeVisible();
      await expect(roleName(section, CORE_OTHER)).toBeHidden();

      await searchRoles(section, 'Search predefined roles', '');

      await expect(roleName(section, CORE_OTHER)).toBeVisible();
      await expect(roleName(section, CORE_MATCH)).toHaveCount(0);
    });

    test('Show more loads the next page', async ({ page }) => {
      await openRoles(page);
      const section = roleSection(
        page,
        'Core roles',
        'Search predefined roles',
      );
      await section.scrollIntoViewIfNeeded();

      await expect(cards(section)).toHaveCount(FIRST_PAGE);
      await expect(roleName(section, CORE_OTHER)).toBeVisible();
      await expect(roleName(section, CORE_NEXT)).toHaveCount(0);

      await section
        .getByRole('button', { name: 'Show more', exact: true })
        .click();

      await expect(roleName(section, CORE_NEXT)).toBeVisible();
      expect(await cards(section).count()).toBeGreaterThan(FIRST_PAGE);
    });

    test('A search that matches nothing says so', async ({ page }) => {
      await openRoles(page);
      const section = roleSection(
        page,
        'Core roles',
        'Search predefined roles',
      );
      await section.scrollIntoViewIfNeeded();
      await expect(roleName(section, CORE_OTHER)).toBeVisible();

      await searchRoles(section, 'Search predefined roles', 'no-such-role');

      await expect(section.getByText('No core roles found')).toBeVisible();
      await expect(roleName(section, CORE_OTHER)).toBeHidden();
    });
  });
});
