import { expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../config/e2e.client';
import {
  clickhouse,
  engine,
  forgetDeployRecords,
  forgetEngineToken,
  tableColumns,
  tableIndices,
} from '../config/engineApi.helpers';
import { loginAs } from '../config/login.helpers';

/**
 * A JSON path promoted out of `_json` into a meta-schema column.
 *
 * The console's promote surface had no end-to-end cover, so the engine renaming
 * a field on it reached main and surfaced as a TypeScript error on a generated
 * type rather than as a failing test.
 *
 * What is asserted is the META SCHEMA, never the HTTP status: a promotion whose
 * `expr` directive is wrong produces a column dfe-loader never fills, and every
 * call on the way there answers 200.
 */
const SOURCE = 'promoteproof';

/** Core meta-schemas fork per source on promote, so the base is left as it ships. */
const BASE_SCHEMA = 'meta/beats/filebeat';
const BASE_SCHEMA_VERSION = '1.0.0';
const FORKED_SCHEMA = `meta/beats/${SOURCE}_filebeat`;

/** Elastic's own identifier per source, which is what the catalogue routes on. */
const MATCH_FIELD = 'data_stream.dataset';
const MATCH_VALUE = 'promote_proof.log';

/** Promoted through the console, with no index: the drawer offers no picker. */
const UI_PATH = 'client.address';
const UI_COLUMN = 'client_address';

/** Promoted through the engine, carrying the index use case the console cannot set. */
const API_PATH = 'url.original';
const API_COLUMN = 'url_original';
const API_USE_CASE = 'substring_search';

type MetaSchemaColumns = {
  current: string;
  version: {
    columns: {
      items: {
        name: string;
        type: string;
        use_case: string | null;
        expr: string;
        _field_type: string;
      }[];
    };
  };
};

type PromoteResponse = {
  schema_version: string | null;
  results: {
    json_path: string;
    status: string;
    column_name?: string | null;
    use_case?: string | null;
  }[];
  diff?: {
    new_columns?: { name: string }[];
    ddl?: string[];
    copy_directives?: string[];
  };
};

type JsonPaths = { paths: { path: string; promoted_to?: string | null }[] };

const metaSchemaColumns = (schema: string, version: string) =>
  engine<MetaSchemaColumns>(
    'GET',
    `/api/v1/schemas/definitions/${schema}/versions/columns?version=${version}&per_page=-1`,
  );

const columnNamed = async (schema: string, version: string, name: string) => {
  const { version: v } = await metaSchemaColumns(schema, version);
  return v.columns.items.find((column) => column.name === name);
};

const sourceSchemaPin = async () => {
  const source = await engine<{
    current: string;
    versions: Record<
      string,
      {
        schema: {
          meta_schema: string | null;
          meta_schema_version: string | null;
        };
      }
    >;
  }>('GET', `/api/v1/sources/${SOURCE}`);
  return source.versions[source.current]!.schema;
};

const discover = (paths: string) =>
  engine<JsonPaths>(
    'GET',
    `/api/v1/schemas/${SOURCE}/json-paths?paths=${paths}`,
  );

/**
 * Rows carrying the two paths under `_json`, inserted straight into the table.
 *
 * The ingest path is proven by filebeatDataPath.spec.ts; what this spec needs is
 * `_json` content discovery can see, so it is written rather than shipped.
 */
const landRowsWithJson = async () => {
  const payload = JSON.stringify({
    client: { address: '198.51.100.7' },
    url: { original: 'https://example.test/a/b?c=d' },
  }).replace(/'/g, "\\'");
  await clickhouse(
    `INSERT INTO dfe.\`${SOURCE}\` (timestamp, event_dataset, _json) ` +
      `SELECT now(), '${MATCH_VALUE}', '${payload}' FROM numbers(5)`,
  );
};

test.describe.configure({ mode: 'serial' });

// Every step waits on a real engine, a schema commit and ClickHouse.
test.setTimeout(180_000);

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

  // reset_all clears the registry and leaves ClickHouse and the fork alone, so a
  // rerun would otherwise discover a table and a schema the registry has lost.
  await clickhouse(`DROP TABLE IF EXISTS dfe.\`${SOURCE}\``);
  forgetDeployRecords(SOURCE);
  await engine('DELETE', `/api/v1/schemas/definitions/${FORKED_SCHEMA}`).catch(
    () => undefined,
  );

  await engine('POST', '/api/v1/sources', {
    source: SOURCE,
    display_name: 'Promote proof',
    description: 'Fixture source for the JSON promote path.',
    header: { type: 'timeseries', version: '1.0.0' },
    schema: {
      meta_schema: BASE_SCHEMA,
      meta_schema_version: BASE_SCHEMA_VERSION,
    },
    match: { field: MATCH_FIELD, operator: 'equals', value: MATCH_VALUE },
  });
  await engine('POST', `/api/v1/sources/${SOURCE}/deploy`);
  await landRowsWithJson();
});

test('a discovered path is not promoted yet @docker-only', async () => {
  const before = await discover(`${UI_PATH},${API_PATH}`);
  expect(before.paths.map((path) => path.path).sort()).toEqual(
    [API_PATH, UI_PATH].sort(),
  );
  for (const path of before.paths) {
    expect(path.promoted_to ?? null).toBeNull();
  }

  // The base schema is what the source is pinned at, and carries neither column.
  const pinned = await sourceSchemaPin();
  expect(pinned.meta_schema).toBe(BASE_SCHEMA);
  expect(
    await columnNamed(BASE_SCHEMA, BASE_SCHEMA_VERSION, UI_COLUMN),
  ).toBeUndefined();
});

test('a dry run returns the diff and writes nothing @docker-only', async () => {
  const preview = await engine<PromoteResponse>(
    'POST',
    `/api/v1/schemas/${SOURCE}/promote-field?dry_run=true`,
    { json_path: [UI_PATH], atomic: false },
  );

  expect(preview.schema_version).toBeNull();
  expect(preview.diff?.new_columns?.map((column) => column.name)).toEqual([
    UI_COLUMN,
  ]);
  // The directive names the BARE record path, which is what dfe-loader reads on
  // ingest -- `_json.<path>` would be a column that stays empty forever.
  expect(preview.diff?.copy_directives).toEqual([`@source: ${UI_PATH}`]);

  // Nothing landed: no fork, and the base still has no such column.
  expect(
    await columnNamed(BASE_SCHEMA, BASE_SCHEMA_VERSION, UI_COLUMN),
  ).toBeUndefined();
  const pinned = await sourceSchemaPin();
  expect(pinned.meta_schema).toBe(BASE_SCHEMA);
});

test('the console promotes a path and the meta schema carries the column @docker-only', async ({
  page,
}) => {
  await loginAs(page, 'initial_user');
  await page.goto(
    `${BASE_URL}/sources?source_name=${SOURCE}&source_version=1.0.0&tab=sample-events`,
  );

  // The sample row is the console's own read of `_json`, so the tick is taken on
  // the rendered path rather than on a path this spec supplies.
  await page
    .getByRole('button', { name: `Actions for _json.${UI_PATH}` })
    .first()
    .click();
  await page
    .getByRole('button', { name: 'Promote Field', exact: true })
    .click();

  const drawer = page.locator('.ant-drawer');
  await page
    .getByRole('button', { name: 'Promote Fields', exact: true })
    .first()
    .click();
  await expect(drawer.getByRole('tab', { name: 'Discover' })).toBeVisible();

  // Test Promote is the dry run; the Review tab only opens once it answers.
  await drawer.getByRole('button', { name: 'Test Promote' }).click();
  await expect(drawer.getByRole('tab', { name: 'Review' })).toBeVisible();
  // The Review table lists the new column with the directive the loader fills it from.
  await expect(
    drawer
      .getByRole('row')
      .filter({
        has: page.getByRole('cell', { name: UI_COLUMN, exact: true }),
      })
      .getByRole('cell', { name: `@source: ${UI_PATH}`, exact: true }),
  ).toBeVisible();

  await drawer
    .getByRole('button', { name: 'Promote Fields', exact: true })
    .click();
  await expect(page.getByText('Fields promoted successfully')).toBeVisible();

  // THE assertion: the meta schema now carries the column, on a fork of the core
  // base, with the directive the loader fills it from.
  const pinned = await sourceSchemaPin();
  expect(pinned.meta_schema).toBe(FORKED_SCHEMA);
  expect(pinned.meta_schema_version).not.toBe(BASE_SCHEMA_VERSION);

  // The promotion also minted a SOURCE version and repinned it there, leaving the
  // deployed one behind. Without this the spec passes while the source still
  // points at the schema it had before.
  const moved = await engine<{
    current: string;
    deployed_version: string | null;
  }>('GET', `/api/v1/sources/${SOURCE}`);
  expect(moved.current).not.toBe('1.0.0');
  expect(moved.deployed_version).toBe('1.0.0');

  const promoted = await columnNamed(
    FORKED_SCHEMA,
    pinned.meta_schema_version!,
    UI_COLUMN,
  );
  expect(promoted).toMatchObject({
    name: UI_COLUMN,
    type: 'string',
    expr: `@source: ${UI_PATH}`,
    _field_type: 'promoted',
  });
  // The drawer offers no index picker, so a console promotion asks for no index.
  expect(promoted?.use_case ?? null).toBeNull();

  // The base schema is untouched: the fork is what carries the addition.
  expect(
    await columnNamed(BASE_SCHEMA, BASE_SCHEMA_VERSION, UI_COLUMN),
  ).toBeUndefined();
});

test('deploying the promoted version lands the column and discovery says so @docker-only', async () => {
  // A promotion repins the source at a NEW version that is not deployed, and
  // discovery falls back to the landing table until it is -- so a re-discover
  // before the deploy answers `paths: []` and proves nothing.
  const undeployed = await discover(UI_PATH);
  expect(undeployed.paths).toEqual([]);

  const { current } = await engine<{ current: string }>(
    'GET',
    `/api/v1/sources/${SOURCE}`,
  );
  await engine('POST', `/api/v1/sources/${SOURCE}/deploy?version=${current}`);

  expect(await tableColumns(SOURCE)).toContain(UI_COLUMN);
  const after = await discover(UI_PATH);
  expect(after.paths[0]?.promoted_to).toBe(UI_COLUMN);
});

test('a use case promoted with the path becomes an index on the table @docker-only', async () => {
  const before = await sourceSchemaPin();

  const promoted = await engine<PromoteResponse>(
    'POST',
    `/api/v1/schemas/${SOURCE}/promote-field`,
    { json_path: API_PATH, atomic: true, use_case: API_USE_CASE },
  );
  expect(promoted.results[0]).toMatchObject({
    json_path: API_PATH,
    status: 'ok',
    column_name: API_COLUMN,
    use_case: API_USE_CASE,
  });

  // A promotion mints a version and repins the source at it.
  const pinned = await sourceSchemaPin();
  expect(pinned.meta_schema_version).toBe(promoted.schema_version);
  expect(pinned.meta_schema_version).not.toBe(before.meta_schema_version);

  const column = await columnNamed(
    FORKED_SCHEMA,
    pinned.meta_schema_version!,
    API_COLUMN,
  );
  expect(column).toMatchObject({
    name: API_COLUMN,
    expr: `@source: ${API_PATH}`,
    use_case: API_USE_CASE,
    _field_type: 'promoted',
  });

  // The use case names the question; the engine picks the ClickHouse primitive.
  // Deploying the new version is what puts the column and its index on the table.
  await engine(
    'POST',
    `/api/v1/sources/${SOURCE}/deploy?version=${(await engine<{ current: string }>('GET', `/api/v1/sources/${SOURCE}`)).current}`,
  );
  expect(await tableColumns(SOURCE)).toContain(API_COLUMN);
  // Both forms are the substring primitive: the GA text index, and the
  // bloom-filter fallback a server older than v25.10 gets instead.
  expect((await tableIndices(SOURCE))[API_COLUMN]).toMatch(
    /ngrams\(3\)|ngrambf_v1/,
  );
});
