import { Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../config/e2e.client';
import { loginAs } from '../config/login.helpers';
import {
  CorpusModule,
  ENRICHMENT,
  PROGRAMS,
  agentEnvelope,
  corpusAvailable,
  corpusLines,
  datasetOf,
  programsAvailable,
  pushEnvelopes,
  readProgram,
  restartFor,
} from '../config/filebeatCorpus.helpers';
import {
  HyperdxTeams,
  appInstances,
  clickhouse,
  engine,
  forgetDeployRecords,
  forgetEngineToken,
  loaderFallbacks,
  rowCount,
  tableColumns,
  tableIndices,
} from '../config/engineApi.helpers';

/**
 * The filebeat corpus, from the console to the source's own table and back out
 * through HyperDX.
 *
 * Every source here matches on `data_stream.dataset`, which is the catalogue's
 * routing convention for a beats source: Elastic already guarantees the
 * identifier is unique per data stream, so one rule shape covers every
 * beats+module combination and only the value changes.
 *
 * One transform app per source, because Compose declares its services in a
 * committed file and creates none at run time -- so the deployment runs one of
 * each and the engine binds it to a single source.
 *
 * Two legs are RED against the stack as it ships, and correctly so.
 *
 * dfe-transform-vector: the compose service mounts its config from the repo and
 * neither mounts the dfe-app-config volume nor points --config at it, so the
 * engine renders an instance config the running container never reads.
 * dfe-transform-vrl (docker-compose.yml:892-931) and dfe-transform-elastic
 * (709-744) both take the volume and a DFE_TRANSFORM_*_CONFIG_FILE override;
 * giving dfe-transform-vector (797-832) the same two lines turns it green.
 *
 * dfe-transform-elastic: it writes a whole batch as ONE Kafka record of
 * newline-delimited JSON, and dfe-loader parses a record as a single JSON value
 * and rejects it -- 93 records in, one record out, nothing loaded.
 */
const SOURCES: { name: string; module: CorpusModule; engine: string }[] = [
  { name: 'cisco-meraki', module: 'cisco_meraki', engine: 'dfe-transform-vrl' },
  {
    name: 'cisco-umbrella',
    module: 'cisco_umbrella',
    engine: 'dfe-transform-vector',
  },
  { name: 'cisco-ios', module: 'cisco_ios', engine: 'dfe-transform-elastic' },
];

const META_SCHEMA = 'filebeat';
const META_SCHEMA_VERSION = '1.0.0';

/** The catch-all a record lands on when nothing claims it. */
const DEFAULT_TABLE = 'main';

/** Build and plan both reach ClickHouse, so they are slower than a UI action. */
const PLAN_TIMEOUT = 30_000;

test.skip(
  !corpusAvailable(),
  'DFE_FILEBEAT_CORPUS is not set: the corpus is read where it lies, never unpacked here',
);

test.describe.configure({ mode: 'serial' });

// Each step drives the console AND waits on a real deploy, a broker and a
// warehouse, so the default per-test budget is nowhere near enough.
test.setTimeout(300_000);

const addSource = async (
  page: Page,
  { name, module, engine: transformEngine }: (typeof SOURCES)[number],
) => {
  await page.goto(`${BASE_URL}/sources`);
  await page.getByRole('button', { name: 'Add Source' }).first().click();
  const drawer = page.locator('.ant-drawer');

  // The Transform tab is disclosed only once a meta schema is chosen, so the
  // schema is picked before the name.
  await drawer.getByRole('tab', { name: 'Table Settings' }).click();
  await page.getByText('Define Schema', { exact: true }).click();
  await page.locator('#schema_meta_schema').click();
  await page
    .locator('.ant-select-dropdown:visible .ant-select-item-option-content', {
      hasText: META_SCHEMA,
    })
    .first()
    .click();
  await page.locator('#schema_meta_schema_version').click();
  await page
    .locator('.ant-select-dropdown:visible .ant-select-item-option-content', {
      hasText: META_SCHEMA_VERSION,
    })
    .last()
    .click();

  await drawer.getByRole('tab', { name: 'Configuration', exact: true }).click();
  await page.locator('#source').fill(name);
  await page.locator('#match_field').fill('data_stream.dataset');
  await page.locator('#match_value').fill(datasetOf(module));

  await drawer.getByRole('tab', { name: 'Transform', exact: true }).click();
  await page.getByText('Define Transform', { exact: true }).click();
  await page.locator('#transform_engine').click();
  await page
    .locator('.ant-select-dropdown:visible .ant-select-item-option-content', {
      hasText: transformEngine,
    })
    .first()
    .click();

  await drawer.getByRole('button', { name: 'Add Source' }).click();
  await expect(page).toHaveURL(
    (url) => url.searchParams.get('source_name') === name,
  );
};

const buildAndDeploy = async (page: Page, name: string) => {
  await page.goto(
    `${BASE_URL}/sources?source_name=${name}&source_version=1.0.0&tab=ddl-preview`,
  );
  const build = page.getByRole('button', { name: 'Build' });
  await expect(
    build.or(page.getByRole('tab', { name: 'Generated DDL' })),
  ).toBeVisible({ timeout: PLAN_TIMEOUT });
  if (await build.count()) {
    await build.click();
  }
  // The build renders the DDL, and the Deploy action only exists once it has.
  await expect(page.getByRole('tab', { name: 'Generated DDL' })).toBeVisible({
    timeout: PLAN_TIMEOUT,
  });
  await page.getByRole('button', { name: 'Deploy' }).first().click();
  const drawer = page.locator('.ant-drawer-body');
  // The plan senses the live table engine and ON CLUSTER before it answers.
  await expect(drawer.getByText('Review Deploy Plan')).toBeVisible({
    timeout: PLAN_TIMEOUT,
  });
  await drawer.getByRole('button', { name: 'Deploy' }).click();
  await expect(drawer.getByText('Successfully applied changes')).toBeVisible({
    timeout: PLAN_TIMEOUT,
  });
  await page.keyboard.press('Escape');
};

test.beforeAll(async () => {
  forgetEngineToken();
  await e2eClient({
    playwright: await import('playwright-core'),
    seedScript: 'reset_all',
  });
  await e2eClient({
    playwright: await import('playwright-core'),
    seedScript: 'seed_setup_complete',
  });
  // reset_all clears the source registry and leaves ClickHouse alone, and the
  // plan refuses a version with no DDL to apply, so the tables go with them.
  for (const { name } of SOURCES) {
    await clickhouse(`DROP TABLE IF EXISTS dfe.\`${name}\``);
    forgetDeployRecords(name);
  }
  // The receiver and loader compile their routing from an instance overlay, so
  // without one they keep the committed defaults and no source rule is in force.
  for (const service of ['dfe-receiver', 'dfe-loader']) {
    await engine('POST', `/api/v1/apps/${service}/instances`, {
      instance: 'default',
    });
  }
});

test('a source is created on the catalogue routing convention', async ({
  page,
}) => {
  await loginAs(page, 'initial_user');
  for (const source of SOURCES) {
    await addSource(page, source);
  }

  for (const { name, module } of SOURCES) {
    const stored = await engine<{
      match: { field: string; operator: string; value: string };
    }>('GET', `/api/v1/sources/${name}`);
    expect(stored.match).toEqual({
      field: 'data_stream.dataset',
      operator: 'equals',
      value: datasetOf(module),
    });
  }
});

test('deploying a source binds its own transform app', async ({ page }) => {
  await loginAs(page, 'initial_user');
  for (const { name } of SOURCES) {
    await buildAndDeploy(page, name);
  }

  // One instance per app, each named for the source it serves: this is what
  // makes the surface per-SOURCE rather than one shared transform.
  for (const { name, engine: transformEngine } of SOURCES) {
    expect(await appInstances(transformEngine)).toEqual([name]);
  }
});

/**
 * Give one transform instance the bundled pipeline and restart it.
 *
 * A new instance starts with an empty file set, so the app idles with "no work
 * configured" until its program arrives.
 */
const giveInstanceItsPipeline = async (
  transformEngine: string,
  name: string,
) => {
  const program = PROGRAMS[transformEngine];
  if (!program?.path) {
    return;
  }
  const hints: string[] = [];
  const written = await engine<{ restart_required: string[] }>(
    'PUT',
    `/api/v1/apps/${transformEngine}/${name}/files/transforms/${program.file}`,
    { content: readProgram(program.path) },
  );
  hints.push(...written.restart_required);
  // The pipeline looks the timezone up in a table, and compiles only once it is
  // loaded.
  const table = await engine<{ restart_required: string[] }>(
    'PUT',
    `/api/v1/apps/${transformEngine}/${name}/files/enrichment/${ENRICHMENT.file}`,
    { content: readProgram(ENRICHMENT.path!) },
  );
  hints.push(...table.restart_required);
  await restartFor(hints);
};

test('each transform instance takes the bundled filebeat pipeline', async () => {
  test.skip(
    !programsAvailable(),
    'the bundled pipelines are not named: set DFE_FILEBEAT_VRL_PROGRAM, DFE_FILEBEAT_VECTOR_PROGRAM and DFE_FILEBEAT_ENRICHMENT',
  );

  for (const source of SOURCES) {
    await giveInstanceItsPipeline(source.engine, source.name);
  }

  for (const { name, engine: transformEngine } of SOURCES) {
    if (!PROGRAMS[transformEngine]) {
      continue;
    }
    const files = await engine<{ items?: { name: string }[] }>(
      'GET',
      `/api/v1/apps/${transformEngine}/${name}/files/transforms`,
    );
    expect(JSON.stringify(files)).toContain(PROGRAMS[transformEngine].file);
  }
});

const landsOnItsOwnTable = async ({
  name,
  module,
}: (typeof SOURCES)[number]) => {
  const before = await rowCount(DEFAULT_TABLE);
  const fallbacksBefore = await loaderFallbacks();
  const landed = await rowCount(name);
  const lines = corpusLines([module])[module];

  await pushEnvelopes(lines.map((line) => agentEnvelope(module, line, 'spec')));

  await expect
    .poll(() => rowCount(name), { timeout: 180_000 })
    .toBe(landed + lines.length);

  // A transform that does not stamp `_source` sends its records to the default
  // table and the loader only warns, so the catch-all is asserted too.
  expect(await rowCount(DEFAULT_TABLE)).toBe(before);
  expect(await loaderFallbacks()).toBe(fallbacksBefore);
};

test('cisco-meraki: the corpus lands on its own table, not the catch-all', () =>
  landsOnItsOwnTable(SOURCES[0]));

test('HyperDX carries the source, pointed at its own table', async ({
  page,
}) => {
  await loginAs(page, 'initial_user');
  // A team gets its connection on first contact, and the source is written to
  // every team that has one -- so the console has to have been opened once.
  await page.goto(`${BASE_URL}/observe`);
  await expect(page.locator('iframe')).toBeVisible();

  for (const { name } of SOURCES) {
    const deployed = await engine<{ hyperdx_source_teams: number | null }>(
      'POST',
      `/api/v1/sources/${name}/deploy`,
    );
    expect(deployed.hyperdx_source_teams).toBeGreaterThan(0);
  }

  const { teams } = await engine<HyperdxTeams>(
    'GET',
    '/api/v1/hyperdx/sources',
  );
  for (const { name } of SOURCES) {
    const holding = teams.filter((team) =>
      team.sources.some(
        (source) =>
          source.name === name &&
          source.table.databaseName === 'dfe' &&
          source.table.tableName === name,
      ),
    );
    expect(holding.length).toBeGreaterThan(0);
  }
});

test('cisco-ios: the corpus lands on its own table, not the catch-all', () => {
  // Expected to fail until dfe-transform-elastic frames its output the way
  // dfe-loader reads it: it writes a batch as one Kafka record of
  // newline-delimited JSON, and the loader parses a record as one JSON value.
  test.fail();
  return landsOnItsOwnTable(SOURCES[2]);
});

test('a source changes transform app and the data follows', async ({
  page,
}) => {
  await loginAs(page, 'initial_user');
  // cisco-ios is the one to move: it is the control for the elastic leg above,
  // because the same corpus through vrl lands and through elastic does not.
  const moved = SOURCES[2];
  const freed = SOURCES[0];
  const before = await rowCount(moved.name);

  // Compose runs one of each transform, so the target app's slot is freed
  // first. Deleting the instance is not enough -- the next reconcile derives it
  // again from the source still bound to that engine -- so the source goes.
  await engine('DELETE', `/api/v1/sources/${freed.name}`);

  await page.goto(
    `${BASE_URL}/sources?source_name=${moved.name}&source_version=1.0.0`,
  );
  // The accessible name on the actions trigger arrives with this change; a
  // console built before it has an icon-only button in the same place.
  const actions = page.getByRole('button', { name: 'Actions', exact: true });
  await (
    (await actions.count())
      ? actions
      : page.locator('div.ml-auto.relative > button').first()
  ).click();
  await page.getByRole('button', { name: 'Edit Source' }).click();
  const drawer = page.locator('.ant-drawer');
  await drawer.getByRole('tab', { name: 'Transform', exact: true }).click();
  await page.locator('#transform_engine').click();
  await page
    .locator('.ant-select-dropdown:visible .ant-select-item-option-content', {
      hasText: freed.engine,
    })
    .first()
    .click();
  await drawer.getByRole('button', { name: 'Update Source' }).click();

  // The edit mints a version and the apps follow the DEPLOYED one, so the new
  // version is what moves the instance. A refused save leaves the old one
  // selected, which would otherwise deploy as a no-op and assert nothing.
  await expect(page).toHaveURL(
    (url) => url.searchParams.get('source_version') !== '1.0.0',
  );
  const version = await page.evaluate(
    () => new URL(window.location.href).searchParams.get('source_version')!,
  );
  const deployed = await engine<{ restart_required: string[] }>(
    'POST',
    `/api/v1/sources/${moved.name}/deploy?version=${version}`,
  );
  await restartFor(deployed.restart_required);

  expect(await appInstances(moved.engine)).toEqual([]);
  expect(await appInstances(freed.engine)).toContain(moved.name);

  // The instance the switch created is new, so it carries no pipeline yet.
  await giveInstanceItsPipeline(freed.engine, moved.name);

  await pushEnvelopes(
    corpusLines([moved.module])[moved.module].map((line) =>
      agentEnvelope(moved.module, line, 'switched'),
    ),
  );
  await expect
    .poll(() => rowCount(moved.name), { timeout: 120_000 })
    .toBeGreaterThan(before);
});

test('cisco-umbrella: the corpus lands on its own table, not the catch-all', () => {
  // Expected to fail until the dfe-transform-vector compose service mounts the
  // dfe-app-config volume and points --config at it, as vrl and elastic do.
  test.fail();
  return landsOnItsOwnTable(SOURCES[1]);
});

/** A source whose schema config names a derived schema mounted on the engine. */
const LEAN_SOURCE = 'cisco-ios-lean';

test('a derived schema narrows its base on the deployed table', async () => {
  // A derived schema is a file in the engine's schemas tree, which the console
  // has no field for and this spec cannot write, so the source is a precondition.
  const lean = await tableColumns(LEAN_SOURCE);
  test.skip(
    lean.length === 0,
    `${LEAN_SOURCE} is not deployed: create a source whose schema.derived_schema names a narrowed filebeat schema`,
  );

  // The base promotes what suits a system or nginx module; a cisco source fills
  // four of its twelve columns and pays for the rest. The derived schema drops
  // them -- everything it leaves out is still in _json, just not indexed.
  const base = await tableColumns(SOURCES[2].name);

  expect(base).toEqual(expect.arrayContaining(['host_name', 'user_name']));
  // Exactly the select list in its order, after the common header: the point of
  // a derived schema is what is NOT there, so absence is what is asserted.
  expect(lean.slice(-4)).toEqual([
    'timestamp',
    'agent_type',
    'agent_version',
    'message',
  ]);
  for (const dropped of [
    'host_name',
    'event_module',
    'event_dataset',
    'log_file_path',
    'source_ip',
    'user_name',
    'process_name',
    'process_pid',
  ]) {
    expect(lean).not.toContain(dropped);
  }

  // The index use case the schema declares, resolved to the ClickHouse primitive.
  const indices = await tableIndices(LEAN_SOURCE);
  expect(indices['timestamp']).toBe('minmax');
  expect(indices['agent_type']).toBe('set(0)');
  expect(indices['message']).toContain('text(tokenizer');
  expect(indices['agent_version']).toBeUndefined();
});
