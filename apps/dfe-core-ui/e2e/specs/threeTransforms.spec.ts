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
    .getByText(source, { exact: true })
    .first()
    .click({ position: { x: 2, y: 2 } });
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

    // The other two apps are catalogued per-source as well, so each is listed
    // here and each says it is not deployed for THIS source. That count is what
    // proves the instance is bound to one source rather than shared.
    await expect(page.getByText('Not deployed for this source.')).toHaveCount(
      TRANSFORMS.length - 1,
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
  // Two undeployed per-source apps on each page, so two Deploy actions and one
  // Undeploy for the app that IS bound here.
  for (const { source } of TRANSFORMS) {
    await openProcessingTab(page, source);
    await expect(
      page.getByRole('button', { name: 'Deploy', exact: true }),
    ).toHaveCount(TRANSFORMS.length - 1);
    await expect(
      page.getByRole('button', { name: 'Undeploy', exact: true }),
    ).toHaveCount(1);
  }
});
