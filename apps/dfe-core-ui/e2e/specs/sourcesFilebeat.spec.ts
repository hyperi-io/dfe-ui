import {
  APIRequestContext,
  Locator,
  Page,
  expect,
  test,
} from '@playwright/test';
import {
  ACCEPTANCE_ORG,
  ADMIN_USERNAME,
  DATA_DATABASE,
  HYPERDX_EMBED_URL,
  adminTokenAfterRotation,
  engineContext,
  ensureHyperdxSource,
  ensureSetupComplete,
  ensureSourceAbsent,
  pollUntil,
  postEvent,
  queryRows,
} from '../config/acceptance.helpers';
import { filebeatCorpus, filebeatEvent } from '../config/filebeat.corpus';
import { BASE_URL, UI_TIMEOUT, transportOptions } from '../config/e2e.client';
import { adminPassword, loginAs } from '../config/login.helpers';

/**
 * The filebeat case, end to end: a source with a transform, real filebeat
 * data, and the rows visible where an operator looks for them.
 *
 * Split deliberately. The first test is the CONFIG plane and passes on any
 * deployment. The second is the DATA plane, and needs a deployment that runs a
 * transform instance for this source -- dfe-docker's `kafka-filebeat` profile
 * is the compose shape that does.
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
  await expect(page.getByText(META_SCHEMA).first()).toBeVisible({
    timeout: UI_TIMEOUT,
  });
});

// The data plane, from the schema deploy through to the rows. Runs after the
// test above and depends on the source it created.
test('@acceptance filebeat corpus lands in dfe.filebeat and is visible in the console and HyperDX', async ({
  page,
  playwright,
}) => {
  const corpus = filebeatCorpus();
  test.skip(
    corpus.length === 0,
    'set E2E_FILEBEAT_CORPUS to the filebeat sample archive to run this',
  );
  // A brokerless tier wires the receiver straight to the loader over gRPC, so
  // no transform instance consumes this source and the rows never arrive.
  test.skip(
    process.env.E2E_TRANSFORMS === '0',
    'brokerless tier: no per-source transform instance runs for this source',
  );

  // Authoring a source does not materialise its table -- the deploy is a
  // second, explicit step. Taken through /api/v1 because it is the idempotent
  // one: the console's own path is DDL Preview -> Build -> Deploy, and those
  // buttons give way to View Deployment once a table exists, so a re-run
  // against the same deployment could not find them.
  const deployed = await api.post(
    `/api/v1/sources/${SOURCE}/deploy?version=1.0.0`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  expect(
    deployed.ok(),
    `deploying the source schema failed: ${deployed.status()} ${await deployed.text()}`,
  ).toBeTruthy();

  const count = async (predicate: string): Promise<number> => {
    const rows = await queryRows({
      api,
      token,
      sql: `SELECT count() AS c FROM ${DATA_DATABASE}.${SOURCE} WHERE ${predicate}`,
    });
    return Number(Object.values(rows[0] ?? {})[0] ?? 0);
  };

  // A delta, not an absolute count: the table survives a re-run, and rows left
  // by the last one would otherwise pass this without anything moving.
  const before = await count('1');
  const run = `acc${Date.now()}`;
  for (const sample of corpus) {
    await postEvent(api, filebeatEvent(sample, run));
  }

  const landed = await pollUntil(async () => {
    const now = await count('1');
    return now > before ? now - before : 0;
  });
  expect(
    landed,
    `no rows reached ${DATA_DATABASE}.${SOURCE} for ${corpus.length} corpus events`,
  ).toBeTruthy();

  // The transform ran, rather than the raw lines being loaded as they arrived:
  // log_file_path is set by the umbrella branch, and source_ip is the IPv4 the
  // loader used to reject outright.
  expect(
    await count("log_file_path != ''"),
    'no row carries a parsed log.file.path -- the VRL program did not run',
  ).toBeTruthy();
  expect(
    await count('source_ip IS NOT NULL'),
    'no row carries a source_ip -- an IPv4 in the corpus was rejected',
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
  const hyperdx = await playwright.request.newContext({
    baseURL: HYPERDX_EMBED_URL,
    ...transportOptions(),
  });
  const hyperdxSource = await ensureHyperdxSource({
    hyperdx,
    name: SOURCE,
    table: SOURCE,
  });
  await hyperdx.dispose();
  await page.goto(
    `${HYPERDX_EMBED_URL}/search?embed=1&source=${hyperdxSource}`,
  );
  await expect(page.getByText('log_file_path').first()).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByText('/filebeat/cisco_umbrella/').first()).toBeVisible(
    { timeout: 60_000 },
  );
});
