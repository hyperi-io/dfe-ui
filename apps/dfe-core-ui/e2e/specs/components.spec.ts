import { Page, expect, test } from '@playwright/test';

import { GITOPS_REQUIRED, trySeed } from '../config/appManagement.helpers';
import { BASE_URL, e2eClient } from '../config/e2e.client';
import { loginAs } from '../config/login.helpers';

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  const seeded = await trySeed({
    playwright,
    seedScript: 'seed_app_scaling_state',
  });
  test.skip(!seeded, GITOPS_REQUIRED);
  await loginAs(page, 'initial_user');
});

const openComponents = async (page: Page) => {
  await page.goto(`${BASE_URL}/components`);
  await expect(page).toHaveURL(`${BASE_URL}/components`);
};

test('Pools', async ({ page }) => {
  await openComponents(page);

  /* The seed deploys the receiver and the loader; the archiver has no instance */
  await expect(page.getByRole('tab', { name: /dfe-receiver/ })).toBeVisible();
  await expect(page.getByRole('tab', { name: /dfe-loader/ })).toBeVisible();
  await expect(page.getByRole('tab', { name: /dfe-archiver/ })).toBeHidden();

  /* Per-source apps belong to their source, not to this page */
  await expect(
    page.getByRole('tab', { name: /dfe-transform-vrl/ }),
  ).toBeHidden();
});

test('Seeded scaling dials', async ({ page }) => {
  await openComponents(page);

  await expect(page.getByText('Scaling')).toBeVisible();
  await expect(page.getByText('Deploy target: kubernetes')).toBeVisible();

  await expect(page.getByLabel('Minimum replicas')).toHaveValue('2');
  await expect(page.getByLabel('Maximum replicas')).toHaveValue('12');
  await expect(page.getByLabel('CPU request')).toHaveValue('250m');
  await expect(page.getByLabel('Memory request')).toHaveValue('512Mi');
  await expect(page.getByLabel('CPU limit')).toHaveValue('1');
  await expect(page.getByLabel('Memory limit')).toHaveValue('1Gi');
});

test('Backing services', async ({ page }) => {
  await openComponents(page);

  await expect(page.getByText('Backing services')).toBeVisible();
  await expect(page.getByText('clickhouse', { exact: true })).toBeVisible();
  await expect(page.getByText('kafka', { exact: true })).toBeVisible();

  /* The deploy repo declares nothing, so every value is a tier default */
  await expect(page.getByText('tier default').first()).toBeVisible();

  /* Storage is read-only, with the capacity remedy where a resize would be */
  await expect(page.getByText('Storage is read-only')).toHaveCount(2);
  await expect(
    page.getByText("Capacity is the storage model's job", { exact: false }),
  ).toHaveCount(2);
});

test('A node count may be raised and not lowered', async ({ page }) => {
  await openComponents(page);

  const replicas = page.getByLabel('clickhouse replicas');
  const raise = page
    .getByRole('button', { name: 'Raise count', exact: true })
    .first();

  /* Undeclared: the tier default is invisible, so a decrease cannot be caught */
  await replicas.fill('3');
  await expect(page.getByText('Tier default not visible')).toBeVisible();
  await raise.click();
  await expect(page.getByText('Committed')).toBeVisible();

  /* Declared now, so lowering it is refused with the reason it costs data */
  await replicas.fill('2');
  await expect(page.getByText('Cannot be lowered here')).toBeVisible();
  await expect(
    page.getByText('Removing a node drops a copy of the data', {
      exact: false,
    }),
  ).toBeVisible();
  await expect(raise).toBeDisabled();
});
