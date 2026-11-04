import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { ENGINE_API_URL } from './e2e.client';
import { adminPassword } from './login.helpers';

/**
 * The engine's own API, as the console's user.
 *
 * The spec asserts through the product's surfaces rather than the stores behind
 * them: what the engine reports is what an operator sees.
 */
let held: string | undefined;

export const engineToken = async (user = 'initial_user') => {
  if (held) {
    return held;
  }
  const response = await fetch(`${ENGINE_API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user, password: adminPassword() }),
  });
  if (!response.ok) {
    throw new Error(`engine login failed (${response.status})`);
  }
  held = (await response.json()).access_token as string;
  return held;
};

/** Forget the held token, so a reset that re-mints the account is not answered with a stale one. */
export const forgetEngineToken = () => {
  held = undefined;
};

export const engine = async <T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> => {
  const response = await fetch(`${ENGINE_API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await engineToken()}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${path} -> ${response.status}: ${text}`);
  }
  return (text ? JSON.parse(text) : null) as T;
};

/** Which teams HyperDX holds a source on, read back through the engine. */
export type HyperdxTeams = {
  teams: {
    team: string;
    team_name: string;
    sources: {
      name: string;
      table: { databaseName: string; tableName: string };
    }[];
  }[];
};

/** Which instances of each app the deploy repo carries, and the name a console shows for it. */
export type AppRow = {
  service: string;
  display_name?: string | null;
  multiplicity: string;
  instances: string[];
};

export const appCatalogue = async () =>
  (await engine<{ items: AppRow[] }>('GET', '/api/v1/apps?page_size=1000'))
    .items;

export const appInstances = async (service: string) =>
  (await appCatalogue()).find((row) => row.service === service)?.instances ??
  [];

/**
 * Container names carry the stack's own prefix, which is why it is a setting
 * rather than a literal. Set it empty for a stack whose containers are named
 * after their compose services, as dfe-docker's are.
 */
export const CONTAINER_PREFIX = process.env.DFE_CONTAINER_PREFIX ?? 'e2e-';

/**
 * ClickHouse, for the reads no product surface answers: the columns and the
 * data-skipping indices ON THE LIVE TABLE. Everything else goes through the engine.
 *
 * Through the container's own client rather than the HTTP port, so the test
 * needs no warehouse credential of its own.
 */
const containerIsRunning = (name: string) => {
  try {
    return (
      execFileSync('docker', ['inspect', '-f', '{{.State.Running}}', name], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim() === 'true'
    );
  } catch {
    return false;
  }
};

/** The prefixed name when that container is up, else the compose service name. */
const resolveContainer = (
  explicit: string | undefined,
  prefixed: string,
  bare: string,
) => {
  if (explicit) return explicit;
  if (containerIsRunning(prefixed)) return prefixed;
  if (prefixed !== bare && containerIsRunning(bare)) return bare;
  return prefixed;
};

export const CLICKHOUSE_CONTAINER = resolveContainer(
  process.env.DFE_CLICKHOUSE_CONTAINER,
  `${CONTAINER_PREFIX}dfe-clickhouse`,
  'dfe-clickhouse',
);

export const clickhouse = async (query: string) =>
  execFileSync(
    'docker',
    ['exec', CLICKHOUSE_CONTAINER, 'clickhouse-client', '--query', query],
    { encoding: 'utf8' },
  ).trim();

let dataDb: string | undefined;

/** The database the engine deploys source tables into. */
export const dataDatabase = async () => {
  if (dataDb) return dataDb;
  const settings = await engine<{ clickhouse_data_database: string }>(
    'GET',
    '/api/v1/system/settings',
  );
  dataDb = settings.clickhouse_data_database;
  return dataDb;
};

const quoteIdent = (name: string) => `\`${name.replaceAll('`', '``')}\``;

/** `database`.`table` for the engine's data database. */
export const qualifiedTable = async (table: string) =>
  `${quoteIdent(await dataDatabase())}.${quoteIdent(table)}`;

export const tableColumns = async (table: string) =>
  (
    await clickhouse(
      `SELECT name FROM system.columns WHERE database = '${await dataDatabase()}' AND table = '${table}' ORDER BY position FORMAT TSV`,
    )
  )
    .split('\n')
    .filter(Boolean);

export const tableIndices = async (table: string) =>
  Object.fromEntries(
    (
      await clickhouse(
        `SELECT expr, type_full FROM system.data_skipping_indices WHERE database = '${await dataDatabase()}' AND table = '${table}' FORMAT TSV`,
      )
    )
      .split('\n')
      .filter(Boolean)
      .map((row) => row.split('\t') as [string, string]),
  );

export const ENGINE_CONTAINER = resolveContainer(
  process.env.DFE_ENGINE_CONTAINER,
  `${CONTAINER_PREFIX}dfe-engine`,
  'dfe-engine',
);

/**
 * Drop a source's build, plan and deploy records.
 *
 * They are a filesystem store beside the source registry, and reset_all does
 * not reach them -- so a recreated source of the same name shows in the console
 * as already built and deployed against a table that no longer exists.
 */
export const forgetDeployRecords = async (source: string) => {
  const { sources_dir } = await engine<{ sources_dir: string }>(
    'GET',
    '/api/v1/system/settings',
  );
  const parent = dirname(sources_dir);
  const files = ['source-builds', 'source-plans', 'source-deploys'].map((dir) =>
    join(parent, dir, `${source}.yaml`),
  );
  // A host engine reports a path this process can see. A container engine
  // reports the path inside the container, which is removed there.
  if (files.some((file) => existsSync(file))) {
    for (const file of files) rmSync(file, { force: true });
    return;
  }
  if (!containerIsRunning(ENGINE_CONTAINER)) return;
  execFileSync('docker', ['exec', ENGINE_CONTAINER, 'rm', '-f', ...files]);
};

export const rowCount = async (table: string) =>
  Number(
    await clickhouse(`SELECT count() FROM ${await qualifiedTable(table)}`),
  );

/** Records that named no table and fell back to the default, which is a WARN and not an error. */
export const loaderFallbacks = async () => {
  const url =
    process.env.DFE_LOADER_METRICS_URL || 'http://127.0.0.1:29091/metrics';
  const body = await (await fetch(url)).text();
  const line = body
    .split('\n')
    .find((row) => row.startsWith('dfe_loader_routing_field_absent_total '));
  return line ? Number(line.split(' ')[1]) : 0;
};
