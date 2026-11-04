import { Page, expect, test } from '@playwright/test';

import { seedAppManagement } from '../../config/appManagement.helpers';
import { BASE_URL, e2eClient } from '../../config/e2e.client';
import { loginAs } from '../../config/login.helpers';

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  /* Deploys the receiver and the loader: two pool names a search can tell apart. */
  await seedAppManagement({
    playwright,
    seedScript: 'seed_app_scaling_state',
  });
  await loginAs(page, 'dfe_admin');
});

const openComponents = async (page: Page) => {
  await page.goto(`${BASE_URL}/components`);
  await expect(page).toHaveURL(`${BASE_URL}/components`);
};

const searchComponents = (page: Page) =>
  page.getByRole('searchbox', { name: 'Search components' });

test.describe('', { tag: ['@core', '@search'] }, () => {
  test('A search keeps the components whose name matches', async ({ page }) => {
    await openComponents(page);

    await expect(page.getByRole('tab', { name: /dfe-receiver/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /dfe-loader/ })).toBeVisible();

    await searchComponents(page).fill('loader');

    await expect(page.getByRole('tab', { name: /dfe-loader/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /dfe-receiver/ })).toBeHidden();

    /* The data layer is not a pool, so a pool search leaves it in place */
    await expect(
      page.getByRole('heading', { name: 'Backing services', exact: true }),
    ).toBeVisible();

    await searchComponents(page).fill('');

    await expect(page.getByRole('tab', { name: /dfe-receiver/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /dfe-loader/ })).toBeVisible();
  });

  test('A search that matches nothing says so', async ({ page }) => {
    await openComponents(page);

    await searchComponents(page).fill('no-such-component');

    await expect(
      page.getByText('No components match this search.'),
    ).toBeVisible();
    await expect(page.getByRole('tab', { name: /dfe-receiver/ })).toBeHidden();
    await expect(page.getByRole('tab', { name: /dfe-loader/ })).toBeHidden();
    await expect(
      page.getByRole('heading', { name: 'Backing services', exact: true }),
    ).toBeVisible();
  });
});
