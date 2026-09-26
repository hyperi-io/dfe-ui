import { Page, expect, test } from '@playwright/test';

import { seedAppManagement } from '../config/appManagement.helpers';
import { BASE_URL, e2eClient } from '../config/e2e.client';
import { loginAs } from '../config/login.helpers';

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await seedAppManagement({
    playwright,
    seedScript: 'seed_app_scaling_state',
  });
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

/*
 * A Compose deployment has no KEDA, so the endpoint refuses the dials.
 * The Kubernetes form is covered by ScalingCard.test.tsx.
 */
test('Scaling dials are refused on a Compose deployment @docker-only', async ({
  page,
}) => {
  await openComponents(page);

  await expect(page.getByText('Scaling')).toBeVisible();
  await expect(page.getByText('Deploy target: docker')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Scaling dials do not apply here' }),
  ).toBeVisible();
  await expect(
    page.getByText('Compose has no KEDA', { exact: false }),
  ).toBeVisible();

  /* The refusal replaces the dials, so neither label reaches the DOM */
  await expect(
    page.getByLabel('Minimum replicas', { exact: true }),
  ).toBeHidden();
  await expect(
    page.getByLabel('Maximum replicas', { exact: true }),
  ).toBeHidden();
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

  /*
   * reset_all clears the substrate overlay, so the count starts undeclared.
   * The floor of 1 is the field's minimum, below which the guard never runs.
   */
  const base = Math.max(Number(await replicas.inputValue()) || 0, 1);

  await replicas.fill(String(base + 1));
  await raise.click();
  /* Exact: the history table below tags every commit 'committed' */
  await expect(page.getByText('Committed', { exact: true })).toBeVisible();

  /* Declared at the raised count now, so lowering it is refused */
  await replicas.fill(String(base));
  await expect(page.getByText('Cannot be lowered here')).toBeVisible();
  await expect(
    page.getByText('Removing a node drops a copy of the data', {
      exact: false,
    }),
  ).toBeVisible();
  await expect(raise).toBeDisabled();
});
