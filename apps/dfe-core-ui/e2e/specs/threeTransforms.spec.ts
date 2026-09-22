import { Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../config/e2e.client';
import { loginAs } from '../config/login.helpers';
import { seedAppManagement } from '../config/appManagement.helpers';

/**
 * One source per transform app.
 *
 * `sourcesProcessing.spec.ts` covers the catalogue rendering all three names
 * against a single deployed vrl instance. It cannot tell a per-APP surface from
 * a per-SOURCE one, because every other seed binds the same one instance.
 */
const TRANSFORMS = [
  {
    engine: 'vrl',
    source: 'filebeatvrl',
    app: 'dfe-transform-vrl',
  },
  {
    engine: 'vector',
    source: 'filebeatvector',
    app: 'dfe-transform-vector',
  },
  {
    engine: 'elastic',
    source: 'filebeatelastic',
    app: 'dfe-transform-elastic',
  },
] as const;

// dfe-fetcher is per-source as well, so a source page lists four apps.
const PER_SOURCE_APPS = TRANSFORMS.length + 1;

// Each seeded source binds one transform; the rest are offered, not deployed.
const UNDEPLOYED_HERE = PER_SOURCE_APPS - 1;

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await seedAppManagement({ playwright, seedScript: 'seed_three_transforms' });
  await loginAs(page, 'initial_user');
});

const openProcessingTab = async (page: Page, source: string) => {
  await page.goto(`${BASE_URL}/sources`);
  // The row's hover actions sit over its right-hand side, so the click lands on
  // the label's leading edge rather than the row centre.
  await page
    .getByTestId(`source-tree-item-${source}`)
    .click({ position: { x: 2, y: 2 } });
  // Selecting a source rewrites the query, and every tab reads the selection from it.
  await expect(page).toHaveURL(
    (url) => url.searchParams.get('source_name') === source,
  );
  await page.getByRole('tab', { name: 'Processing', exact: true }).click();
};

for (const { engine, source, app } of TRANSFORMS) {
  test(`${engine}: its own source carries its own instance`, async ({
    page,
  }) => {
    await openProcessingTab(page, source);

    await expect(
      page.getByRole('heading', { name: app, exact: true }),
    ).toBeVisible();
    await expect(page.getByText(`Instance ${source}`).first()).toBeVisible();

    // Every other per-source app says it is not deployed here, which is what
    // proves the instance is bound to one source rather than shared.
    await expect(page.getByText('Not deployed for this source.')).toHaveCount(
      UNDEPLOYED_HERE,
    );
  });
}

test('an app that authors files gets an editor, and elastic does not', async ({
  page,
}) => {
  await openProcessingTab(page, 'filebeatvrl');
  await expect(
    page.getByRole('tab', { name: 'transforms', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Read from config.transforms.dir. Accepts .vrl.'),
  ).toBeVisible();

  await openProcessingTab(page, 'filebeatvector');
  await expect(
    page.getByRole('tab', { name: 'transforms', exact: true }),
  ).toBeVisible();

  // dfe-transform-elastic selects a compiled-in program by source name and reads
  // no authored files, so it is the one app with nothing to edit.
  await openProcessingTab(page, 'filebeatelastic');
  await expect(page.getByText('Files', { exact: true })).toHaveCount(0);
});

test('every transform app is deployable from its own source', async ({
  page,
}) => {
  // One Undeploy for the app bound here, a Deploy for each app that is not.
  for (const { source } of TRANSFORMS) {
    await openProcessingTab(page, source);
    await expect(
      page.getByRole('button', { name: 'Deploy', exact: true }),
    ).toHaveCount(UNDEPLOYED_HERE);
    await expect(
      page.getByRole('button', { name: 'Undeploy', exact: true }),
    ).toHaveCount(1);
  }
});
