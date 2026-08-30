import { Page, expect, test } from '@playwright/test';

import { seedAppManagement } from '../config/appManagement.helpers';
import { BASE_URL, e2eClient } from '../config/e2e.client';
import { loginAs } from '../config/login.helpers';

const SEED_ARTEFACT = 'seed-artefact';

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await seedAppManagement({
    playwright,
    seedScript: 'seed_library_artefact',
  });
  await loginAs(page, 'initial_user');
});

const openLibrary = async (page: Page) => {
  await page.goto(`${BASE_URL}/library`);
  await expect(page).toHaveURL(`${BASE_URL}/library`);
};

test('Artefact list', async ({ page }) => {
  await openLibrary(page);

  await expect(
    page.getByRole('button', { name: SEED_ARTEFACT, exact: true }),
  ).toBeVisible();
  await expect(page.getByText('vrl', { exact: true })).toBeVisible();
  await expect(page.getByText('seed', { exact: true })).toBeVisible();
  await expect(page.getByText('enabled', { exact: true })).toBeVisible();

  /* Tags point at versions; labels classify. Both render, and apart */
  await expect(page.getByText('stable -> 1')).toBeVisible();
  await expect(page.getByText('team=platform')).toBeVisible();
  await expect(page.getByText('tier=gold')).toBeVisible();
});

test('Versions', async ({ page }) => {
  await openLibrary(page);
  await page.getByRole('button', { name: SEED_ARTEFACT, exact: true }).click();

  await expect(page.getByRole('tab', { name: 'Versions' })).toBeVisible();
  await expect(page.getByText('seeded version 1')).toBeVisible();
  await expect(page.getByText('seeded version 2')).toBeVisible();

  /* The seed publishes two and leaves the later one current */
  await expect(page.getByText('current', { exact: true })).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'Make current', exact: true }),
  ).toHaveCount(1);
});

test('Tags', async ({ page }) => {
  await openLibrary(page);
  await page.getByRole('button', { name: SEED_ARTEFACT, exact: true }).click();
  await page.getByRole('tab', { name: 'Tags' }).click();

  await expect(page.getByText('stable', { exact: true })).toBeVisible();
  await expect(page.getByText('version 1', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Remove tag stable', exact: true }),
  ).toBeVisible();
});

test('Labels', async ({ page }) => {
  await openLibrary(page);
  await page.getByRole('button', { name: SEED_ARTEFACT, exact: true }).click();
  await page.getByRole('tab', { name: 'Labels' }).click();

  /* By role: the tab panel carries the same accessible name as the field */
  await expect(page.getByRole('textbox', { name: 'Labels' })).toHaveValue(
    'team=platform\ntier=gold',
  );
  await expect(page.getByRole('textbox', { name: 'Group' })).toHaveValue(
    'seed',
  );
});

test('Usage', async ({ page }) => {
  await openLibrary(page);
  await page.getByRole('button', { name: SEED_ARTEFACT, exact: true }).click();
  await page.getByRole('tab', { name: 'Usage' }).click();

  await expect(page.getByText('dfe-transform-vrl')).toBeVisible();
  await expect(page.getByText('seedsource')).toBeVisible();
  await expect(page.getByText('seed_library.vrl')).toBeVisible();
  await expect(page.getByText('version 1', { exact: true })).toBeVisible();
});
