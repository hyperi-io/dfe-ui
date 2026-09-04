import { APIRequestContext, Locator, Page, expect, test } from '@playwright/test';
import {
  ACCEPTANCE_ORG,
  ADMIN_USERNAME,
  DATA_DATABASE,
  HYPERDX_EMBED_URL,
  adminTokenAfterRotation,
  engineContext,
  ensureSetupComplete,
  ensureSourceAbsent,
  pollUntil,
  postEvent,
  queryRows,
} from '../config/acceptance.helpers';
import { filebeatCorpus, filebeatEvent } from '../config/filebeat.corpus';
import { BASE_URL } from '../config/e2e.client';
import { adminPassword, loginAs } from '../config/login.helpers';

/**
 * The filebeat case, end to end: a source with a transform, real filebeat
 * data, and the rows visible where an operator looks for them.
 *
 * Split deliberately. The first test is the CONFIG plane and passes on any
 * deployment. The second is the DATA plane and is fixme'd on the rc.12 docker
 * stack -- see its own note for the two reasons.
 */

const SOURCE = 'filebeat';
const META_SCHEMA = 'meta/beats/filebeat';
const FIRST_USER = 'acceptance_user';

// Driving the create drawer through four tabs and three selects, then polling
// a real ingest path, does not fit the 30s default.
test.describe.configure({ timeout: 300_000 });

let api: APIRequestContext;
let token: string;

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
  await ensureSourceAbsent({ api, token, source: SOURCE });
});

test.afterAll(async () => {
  await ensureSourceAbsent({ api, token, source: SOURCE });
  await api.dispose();
});

/**
 * Pick an option from an antd Select.
 *
 * Retried as a unit: a panel that has just been revealed by a radio re-renders
 * under the open dropdown and closes it, and reopening is the recovery.
 */
const chooseOption = async (
  page: Page,
  container: Locator,
  fieldId: string,
  option: string,
): Promise<void> => {
  // The dropdown opens on the selector box, not on the input the form item
  // labels, and antd keeps a hidden measurement copy of every option -- so the
  // choice is taken from the dropdown that is actually on screen.
  const select = container.locator(`.ant-select:has(#${fieldId})`);
  const open = page.locator(
    '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
  );
  await expect(async () => {
    await select.click();
    const choice = open.getByText(option, { exact: true }).last();
    await choice.waitFor({ state: 'visible', timeout: 2_000 });
    await choice.click({ timeout: 2_000 });
    await expect(select).toContainText(option, {
      ignoreCase: true,
      timeout: 2_000,
    });
  }).toPass({ timeout: 20_000 });
};

test('@acceptance a filebeat source with the VRL transform is created through the console', async ({
  page,
}) => {
  await loginAs(page, ADMIN_USERNAME);
  await page.goto(`${BASE_URL}/sources`);
  await page
    .getByRole('main')
    .getByRole('button', { name: 'Add Source', exact: true })
    .click();

  const drawer = page.getByRole('dialog').filter({ hasText: 'Add Source' });
  await drawer
    .getByRole('textbox', { name: 'Source', exact: true })
    .fill(SOURCE);
  await drawer
    .getByRole('textbox', { name: 'Field', exact: true })
    .fill('_source');
  await drawer
    .getByRole('textbox', { name: 'Value', exact: true })
    .fill(SOURCE);

  // The meta schema is what gives the source its own typed table, and the
  // Transform tab only appears once one is chosen.
  await drawer.getByRole('tab', { name: 'Meta Schema', exact: true }).click();
  await drawer.getByRole('radio', { name: 'Define Schema' }).check();
  await chooseOption(page, drawer, 'header_type', 'timeseries');
  await chooseOption(page, drawer, 'header_version', '1.0.1');
  const metaSchema = drawer.locator('#schema_meta_schema');
  await metaSchema.click();
  // Options carry the leaf name; the path is the group heading above them.
  await metaSchema.fill(SOURCE);
  await page.getByRole('option', { name: SOURCE, exact: true }).click();

  await drawer.getByRole('tab', { name: 'Transform', exact: true }).click();
  await drawer.getByRole('radio', { name: 'Define Transform' }).check();
  await chooseOption(page, drawer, 'transform_engine', 'VRL');

  const created = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/v1/sources') &&
      response.request().method() === 'POST',
  );
  await drawer.getByRole('button', { name: 'Add Source', exact: true }).click();
  await expect(
    drawer.getByText('There are validation errors in the following tabs'),
  ).toBeHidden();
  const response = await created;
  expect(
    response.ok(),
    `the console's create-source call failed: ${response.status()} ${await response.text()}`,
  ).toBeTruthy();
  await expect(drawer).toBeHidden();

  // What the DEPLOYMENT stored, not what the form thinks it sent.
  const stored = await api.get(`/api/v1/sources/${SOURCE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(stored.ok()).toBeTruthy();
  const body = await stored.json();
  expect(JSON.stringify(body)).toContain(META_SCHEMA);
  expect(JSON.stringify(body)).toContain('vrl');

  // And what the console shows an operator afterwards.
  await page.goto(
    `${BASE_URL}/sources?source_name=${SOURCE}&source_version=1.0.0`,
  );
  await expect(page.getByText(META_SCHEMA).first()).toBeVisible();
});

// Two deployment-side blockers, both verified on the rc.12 compose stack.
// dfe-docker runs ONE dfe-transform-vrl, consuming default_land with a
// passthrough program, while the receiver routes _source=filebeat to
// filebeat_land -- so a source-scoped filebeat pipeline has nothing to run in.
// Wire that by hand and dfe-loader#127 takes over: source.ip="192.168.0.1" is
// rejected as "encoding error for column 'source_ip': invalid IPv6", the batch
// salvage fails all 15 rows, and with no DLQ the offsets are withheld, so
// dfe.filebeat stays empty and the shared load topic stops moving.
// Unfixme once a deployment carries a per-source transform and that fix.
test.fixme(
  '@acceptance filebeat corpus lands in dfe.filebeat and is visible in the console and HyperDX',
  async ({ page }) => {
    const corpus = filebeatCorpus();
    test.skip(
      corpus.length === 0,
      'set E2E_FILEBEAT_CORPUS to the filebeat sample archive to run this',
    );

    const run = `acc${Date.now()}`;
    for (const sample of corpus) {
      await postEvent(api, filebeatEvent(sample, run));
    }

    const landed = await pollUntil(async () => {
      const rows = await queryRows({
        api,
        token,
        sql:
          `SELECT count() AS c FROM ${DATA_DATABASE}.${SOURCE} ` +
          "WHERE host_name != '' OR log_file_path != ''",
      });
      return Number(Object.values(rows[0] ?? {})[0] ?? 0);
    });
    expect(
      landed,
      `no transformed rows reached ${DATA_DATABASE}.${SOURCE}`,
    ).toBeTruthy();

    await loginAs(page, ADMIN_USERNAME);
    await page.goto(
      `${BASE_URL}/sources?source_name=${SOURCE}&source_version=1.0.0`,
    );
    await page.getByRole('tab', { name: 'Sample Events', exact: true }).click();
    await expect(page.getByText('log_file_path').first()).toBeVisible({
      timeout: 60_000,
    });

    // The same rows through the embedded HyperDX, which reads ClickHouse on
    // its own connection rather than through the engine.
    await page.goto(`${HYPERDX_EMBED_URL}/search?embed=1`);
    await expect(page.getByText(SOURCE).first()).toBeVisible({
      timeout: 60_000,
    });
  },
);
