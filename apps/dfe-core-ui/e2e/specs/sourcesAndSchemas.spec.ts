import { APIRequestContext, Page, expect, test } from '@playwright/test';
import {
  ACCEPTANCE_ORG,
  ADMIN_USERNAME,
  DATA_DATABASE,
  adminTokenAfterRotation,
  engineContext,
  ensureSetupComplete,
  ensureSourceAbsent,
  pollUntil,
  postEvent,
  queryRows,
} from '../config/acceptance.helpers';
import { BASE_URL, UI_TIMEOUT } from '../config/e2e.client';
import { adminPassword, loginAs } from '../config/login.helpers';

/**
 * The console's core surface, against a real deployment.
 *
 * Preconditions come from /api/v1 rather than the seed router, which a
 * deployment does not mount. The wizard is not used to reach them because
 * dfe-ui#206 stops it on any deployment that rotated its break-glass password
 * -- rotateThenOnboard.spec.ts is the spec that holds that to account.
 */

const FIRST_USER = 'acceptance_user';
const QUERY_SOURCE = 'accquery';
const CRUD_SOURCE = 'accsource';

// Posting at the ingest edge and polling for the rows crosses a broker and a
// batching loader, which does not fit the 30s default.
test.describe.configure({ timeout: 300_000 });

let api: APIRequestContext;
let token: string;
const run = `acc${Date.now()}`;

test.beforeAll(async ({ playwright }) => {
  api = await engineContext(playwright);
  token = await adminTokenAfterRotation(api);
  await ensureSetupComplete({
    api,
    token,
    organisation: ACCEPTANCE_ORG,
    username: FIRST_USER,
    password: adminPassword(),
  });
  await ensureSourceAbsent({ api, token, source: CRUD_SOURCE });
  await ensureSourceAbsent({ api, token, source: QUERY_SOURCE });
});

test.afterAll(async () => {
  await ensureSourceAbsent({ api, token, source: CRUD_SOURCE });
  await ensureSourceAbsent({ api, token, source: QUERY_SOURCE });
  await api.dispose();
});

const addSource = async (
  page: Page,
  { name, field, value }: { name: string; field: string; value: string },
) => {
  await page.goto(`${BASE_URL}/sources`);
  await page
    .getByRole('main')
    .getByRole('button', { name: 'Add Source', exact: true })
    .click();
  const drawer = page.getByRole('dialog').filter({ hasText: 'Add Source' });
  await drawer.getByRole('textbox', { name: 'Source', exact: true }).fill(name);
  await drawer.getByRole('textbox', { name: 'Field', exact: true }).fill(field);
  await drawer.getByRole('textbox', { name: 'Value', exact: true }).fill(value);
  const created = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/v1/sources') &&
      response.request().method() === 'POST',
  );
  await drawer.getByRole('button', { name: 'Add Source', exact: true }).click();
  const response = await created;
  expect(
    response.ok(),
    `the console's create-source call failed: ${response.status()} ${await response.text()}`,
  ).toBeTruthy();
  await expect(drawer).toBeHidden();
};

test('@acceptance the console creates, lists and deletes a source', async ({
  page,
}) => {
  await loginAs(page, ADMIN_USERNAME);

  await addSource(page, {
    name: CRUD_SOURCE,
    field: '_source',
    value: CRUD_SOURCE,
  });

  await page.goto(`${BASE_URL}/sources`);
  await expect(
    page.getByRole('treeitem').filter({ hasText: CRUD_SOURCE }),
  ).toHaveCount(1, { timeout: UI_TIMEOUT });

  // The deployment agrees with the console, not just the console with itself.
  const listed = await api.get('/api/v1/sources', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(listed.ok()).toBeTruthy();
  const body = await listed.json();
  expect(body.items.map((item: { name: string }) => item.name)).toContain(
    CRUD_SOURCE,
  );

  // The row's hover-action strip sits over the button it contains, so the
  // click is forced rather than waiting for a stability it never reaches.
  await page
    .getByRole('button', { name: `Delete ${CRUD_SOURCE}`, exact: true })
    .first()
    .click({ force: true });
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: `Delete ${CRUD_SOURCE}`, exact: true }),
  ).toHaveCount(0, { timeout: UI_TIMEOUT });
});

test('@acceptance the console lists the meta schemas the deployment ships', async ({
  page,
}) => {
  await loginAs(page, ADMIN_USERNAME);
  await page.goto(`${BASE_URL}/schemas`);

  // Shipped inside the engine image, so any deployment has them.
  await expect(
    page.getByRole('treeitem').filter({ hasText: 'syslog' }).first(),
  ).toBeVisible({ timeout: UI_TIMEOUT });
  const beats = page.getByRole('treeitem').filter({ hasText: 'beats' }).first();
  await expect(beats).toBeVisible({ timeout: UI_TIMEOUT });
  await beats.click();
  await expect(
    page.getByRole('treeitem').filter({ hasText: 'filebeat' }).first(),
  ).toBeVisible({ timeout: UI_TIMEOUT });
});

test('@acceptance a query returns this run’s rows, and the console shows them', async ({
  page,
}) => {
  const marker = `${run}query`;

  await loginAs(page, ADMIN_USERNAME);
  await addSource(page, {
    name: QUERY_SOURCE,
    field: '_json.tags.acc_run',
    value: marker,
  });

  for (let i = 0; i < 3; i += 1) {
    await postEvent(api, {
      message: `acceptance marker ${marker} ${i}`,
      tags: { acc_run: marker },
    });
  }

  const landed = await pollUntil(async () => {
    const rows = await queryRows({
      api,
      token,
      sql:
        `SELECT count() AS c FROM ${DATA_DATABASE}.default ` +
        `WHERE _raw LIKE '%${marker}%'`,
    });
    const count = Number(Object.values(rows[0] ?? {})[0] ?? 0);
    return count >= 3 ? count : 0;
  });
  expect(
    landed,
    `no rows for ${marker} reached ${DATA_DATABASE}.default through the ingest path`,
  ).toBeTruthy();

  // The console reads rows through the source's own match rule, so this is the
  // operator's view of the same data rather than a second query of our own.
  await page.goto(
    `${BASE_URL}/sources?source_name=${QUERY_SOURCE}&source_version=1.0.0`,
  );
  await page.getByRole('tab', { name: 'Sample Events', exact: true }).click();
  await expect(page.getByText(marker).first()).toBeVisible({ timeout: 60_000 });
});

test('@acceptance the services surface renders the deployment’s components', async ({
  page,
}) => {
  await loginAs(page, ADMIN_USERNAME);
  await page.goto(`${BASE_URL}/services/surfaces`);

  await expect(page.getByText('dfe-loader').first()).toBeVisible({
    timeout: UI_TIMEOUT,
  });
  await expect(page.getByText('dfe-receiver').first()).toBeVisible({
    timeout: UI_TIMEOUT,
  });
});
