import { Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../config/e2e.client';
import { loginAs } from '../config/login.helpers';
import { seedAppManagement } from '../config/appManagement.helpers';

/** The fixture source every app-management seed binds its instances to. */
const SEED_SOURCE = 'seedsource';
/** The fetcher-based fixture source, deployed, with its fetcher instance seeded. */
const SEED_FETCHER_SOURCE = 'seedfetch';

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

const openProcessingTab = async (page: Page, source = SEED_SOURCE) => {
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

test('Receiver routing', async ({ page }) => {
  await openProcessingTab(page);

  await expect(
    page.getByRole('heading', { name: 'dfe-receiver routing', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Compiled by the receiver compiler into config.routing'),
  ).toBeVisible();

  /* Scoped: the source's own match rule is shown above the tabs as well.
     The seed's match field carries no `_json.` prefix -- the receiver splits on
     '.' and walks the raw payload, so that prefix is a segment no record has. */
  const rule = page.locator('dl').filter({ hasText: 'From the sources' });
  await expect(rule.getByText('tags.collector.type')).toHaveCount(2);
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
    page.getByRole('heading', { name: 'Transform', exact: true }),
  ).toBeVisible();
  /* This seed writes the instance and leaves the source naming no engine, so
     the card reports the instance that exists rather than a choice it cannot
     see. The files and health of that instance stay reachable either way. */
  await expect(
    page.getByRole('radio', { name: /dfe-transform-vrl[\s\S]*Running/ }),
  ).toBeVisible();

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

  /* Every transform in the catalogue is offered as one choice */
  await expect(
    page.getByRole('radio', { name: /dfe-transform-elastic/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('radio', { name: /dfe-transform-vector/ }),
  ).toBeVisible();
  /* dfe-fetcher belongs to fetcher sources, so a receiver source shows no card for it */
  await expect(
    page.getByRole('heading', { name: 'dfe-fetcher', exact: true }),
  ).toBeHidden();

  /* Only the transform with an instance carries panels, and only it declares files */
  await expect(page.getByText('Files', { exact: true })).toHaveCount(1);
});

test('A transform offers no deploy of its own', async ({ page }) => {
  await openProcessingTab(page);

  /* The source names which transform runs, and the engine deploys and removes
     the instance with it. A receiver source has no fetcher card either. */
  await expect(
    page.getByRole('button', { name: 'Deploy', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Undeploy', exact: true }),
  ).toHaveCount(0);
});

test('A fetcher source starts at its fetcher, with no receiver routing', async ({
  page,
}) => {
  await openProcessingTab(page, SEED_FETCHER_SOURCE);

  const fetcher = page.getByRole('heading', {
    name: 'dfe-fetcher',
    exact: true,
  });
  await expect(fetcher).toBeVisible();
  /* The seed deploys this source's fetcher instance, so the card offers its removal */
  await expect(
    page.getByRole('button', { name: 'Undeploy', exact: true }),
  ).toHaveCount(1);

  /* Its records never pass the receiver, so there is no rule there to report */
  await expect(
    page.getByRole('heading', { name: 'dfe-receiver routing', exact: true }),
  ).toBeHidden();
  await expect(page.getByText('no rule', { exact: true })).toHaveCount(0);

  /* The fetcher is where its records start, so it leads and the transform follows */
  const transform = page.getByRole('heading', {
    name: 'Transform',
    exact: true,
  });
  const [fetcherTop, transformTop] = await Promise.all(
    [fetcher, transform].map(
      async (heading) => (await heading.boundingBox())?.y ?? Number.NaN,
    ),
  );
  expect(fetcherTop).toBeLessThan(transformTop);
});
