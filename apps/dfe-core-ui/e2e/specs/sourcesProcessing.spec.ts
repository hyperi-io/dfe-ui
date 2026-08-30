import { Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../config/e2e.client';
import { loginAs } from '../config/login.helpers';
import { GITOPS_REQUIRED, trySeed } from '../config/appManagement.helpers';

/** The fixture source every app-management seed binds its instances to. */
const SEED_SOURCE = 'seedsource';

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  const seeded = await trySeed({
    playwright,
    seedScript: 'seed_source_with_transform',
  });
  test.skip(!seeded, GITOPS_REQUIRED);
  await e2eClient({ playwright, seedScript: 'seed_library_artefact' });
  await loginAs(page, 'initial_user');
});

const openProcessingTab = async (page: Page) => {
  await page.goto(`${BASE_URL}/sources`);
  await page.getByText(SEED_SOURCE, { exact: true }).first().click();
  await page.getByRole('tab', { name: 'Processing', exact: true }).click();
};

test('Receiver routing', async ({ page }) => {
  await openProcessingTab(page);

  await expect(page.getByText('Receiver routing')).toBeVisible();
  await expect(
    page.getByText('Compiled by the receiver compiler into config.routing'),
  ).toBeVisible();

  /* The compiled rule and the deployed one, side by side */
  await expect(page.getByText('_json.tags.collector.type')).toHaveCount(2);
  await expect(page.getByText('key_value_set')).toHaveCount(2);

  /* The seeded routing is synced, so no sync action is offered */
  await expect(page.getByText('synced', { exact: true })).toBeVisible();
  await expect(page.getByText('drift', { exact: true })).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Sync routing', exact: true }),
  ).toBeHidden();
});

test('Transform instance', async ({ page }) => {
  await openProcessingTab(page);

  await expect(page.getByText('dfe-transform-vrl')).toBeVisible();
  await expect(page.getByText(`Instance ${SEED_SOURCE}`)).toHaveCount(2);

  /* The file set the manifest declares for this app */
  await expect(
    page.getByRole('tab', { name: 'transforms', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('tab', { name: 'enrichment', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Read from config.transforms.dir. Accepts .vrl.'),
  ).toBeVisible();

  /* The seeded program, and the file resolved from the library */
  await expect(page.getByText(`${SEED_SOURCE}.vrl`)).toBeVisible();
  await expect(page.getByText('seed_library.vrl')).toBeVisible();
});

test('Library link', async ({ page }) => {
  await openProcessingTab(page);

  /* The seed pins the link a version behind the artefact's current one */
  await expect(page.getByText('seed-artefact@1')).toBeVisible();
  await expect(page.getByText('outdated', { exact: true })).toBeVisible();
  await expect(page.getByText('edited locally', { exact: true })).toBeHidden();

  await expect(
    page.getByRole('button', { name: 'Link from library', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Relink all', exact: true }),
  ).toBeVisible();
});

test('An app that declares no file set gets no editor', async ({ page }) => {
  await openProcessingTab(page);

  /* Every per-source app in the catalogue is listed */
  await expect(page.getByText('dfe-transform-elastic')).toBeVisible();
  await expect(page.getByText('dfe-transform-vector')).toBeVisible();
  await expect(page.getByText('dfe-fetcher')).toBeVisible();

  /* Only a deployed app whose manifest declares a file set carries a Files panel */
  await expect(page.getByText('Files', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Not deployed for this source.')).toHaveCount(2);
});

test('Deploy action for an undeployed per-source app', async ({ page }) => {
  await openProcessingTab(page);

  await expect(
    page.getByRole('button', { name: 'Deploy', exact: true }),
  ).toHaveCount(2);
  await expect(
    page.getByRole('button', { name: 'Undeploy', exact: true }),
  ).toHaveCount(2);
});
