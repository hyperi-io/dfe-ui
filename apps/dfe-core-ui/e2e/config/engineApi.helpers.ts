import { execFileSync } from 'node:child_process';

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

/** Which instances of each app the deploy repo carries. */
export type AppRow = { service: string; instances: string[] };

export const appInstances = async (service: string) => {
  const rows = await engine<AppRow[]>('GET', '/api/v1/apps?per_page=50');
  return rows.find((row) => row.service === service)?.instances ?? [];
};

/**
 * ClickHouse, for the reads no product surface answers: the columns and the
 * data-skipping indices ON THE LIVE TABLE. Everything else goes through the engine.
 *
 * Through the container's own client rather than the HTTP port, so the test
 * needs no warehouse credential of its own.
 */
export const CLICKHOUSE_CONTAINER =
  process.env.DFE_CLICKHOUSE_CONTAINER ||
  `${process.env.DFE_CONTAINER_PREFIX || 'e2e-'}dfe-clickhouse`;

export const clickhouse = async (query: string) =>
  execFileSync(
    'docker',
    ['exec', CLICKHOUSE_CONTAINER, 'clickhouse-client', '--query', query],
    { encoding: 'utf8' },
  ).trim();

export const tableColumns = async (table: string) =>
  (
    await clickhouse(
      `SELECT name FROM system.columns WHERE database = 'dfe' AND table = '${table}' ORDER BY position FORMAT TSV`,
    )
  )
    .split('\n')
    .filter(Boolean);

export const tableIndices = async (table: string) =>
  Object.fromEntries(
    (
      await clickhouse(
        `SELECT expr, type_full FROM system.data_skipping_indices WHERE database = 'dfe' AND table = '${table}' FORMAT TSV`,
      )
    )
      .split('\n')
      .filter(Boolean)
      .map((row) => row.split('\t') as [string, string]),
  );

export const ENGINE_CONTAINER =
  process.env.DFE_ENGINE_CONTAINER ||
  `${process.env.DFE_CONTAINER_PREFIX || 'e2e-'}dfe-engine`;

/**
 * Drop a source's build, plan and deploy records.
 *
 * They are a filesystem store beside the source registry, and reset_all does
 * not reach them -- so a recreated source of the same name shows in the console
 * as already built and deployed against a table that no longer exists.
 */
export const forgetDeployRecords = (source: string) => {
  execFileSync('docker', [
    'exec',
    ENGINE_CONTAINER,
    'sh',
    '-c',
    `rm -f /app/config/source-builds/${source}.yaml /app/config/source-plans/${source}.yaml /app/config/source-deploys/${source}.yaml`,
  ]);
};

export const rowCount = async (table: string) =>
  Number(await clickhouse(`SELECT count() FROM dfe.\`${table}\``));

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
