import { Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../config/e2e.client';
import { loginAs } from '../config/login.helpers';
import { seedAppManagement } from '../config/appManagement.helpers';

/** The fixture source every app-management seed binds its instances to. */
const SEED_SOURCE = 'seedsource';

// RED on a docker-slim deployment, and correctly so: seed_source_with_transform
// also seeds a fetcher source, and that tier does not offer dfe-fetcher, so the
// seed is refused. dfe-engine#452 carries the trace and the two ways out.

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await seedAppManagement({
    playwright,
    seedScript: 'seed_source_with_transform',
  });
  await seedAppManagement({
    playwright,
    seedScript: 'seed_library_artefact',
  });
  await loginAs(page, 'initial_user');
});

const openProcessingTab = async (page: Page) => {
  await page.goto(`${BASE_URL}/sources`);
  // The row's hover actions sit over its right-hand side, so the click lands on
  // the label's leading edge rather than the row centre.
  await page
    .getByText(SEED_SOURCE, { exact: true })
    .first()
    .click({ position: { x: 2, y: 2 } });
  await page.getByRole('tab', { name: 'Processing', exact: true }).click();
};

test('Receiver routing', async ({ page }) => {
  await openProcessingTab(page);

  await expect(
    page.getByRole('heading', { name: 'dfe-receiver routing', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Compiled by the receiver compiler into config.routing'),
  ).toBeVisible();

  /* Scoped: the source's own match rule is shown above the tabs as well */
  const rule = page.locator('dl').filter({ hasText: 'From the sources' });
  await expect(rule.getByText('_json.tags.collector.type')).toHaveCount(2);
  await expect(rule.getByText('key_value_set')).toHaveCount(2);

  /* The seeded routing is synced, so no sync action is offered */
  await expect(page.getByText('synced', { exact: true })).toBeVisible();
  await expect(page.getByText('drift', { exact: true })).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Sync routing', exact: true }),
  ).toBeHidden();
});

test('Transform instance', async ({ page }) => {
  await openProcessingTab(page);

  await expect(
    page.getByRole('heading', { name: 'dfe-transform-vrl', exact: true }),
  ).toBeVisible();
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
  await expect(
    page.getByRole('heading', { name: 'dfe-transform-elastic', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'dfe-transform-vector', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'dfe-fetcher', exact: true }),
  ).toBeVisible();

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
