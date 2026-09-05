import { APIRequestContext, expect } from '@playwright/test';
import { ENGINE_API_URL, transportOptions } from './e2e.client';
import { adminPassword, bootstrapPassword } from './login.helpers';

/**
 * Acceptance-tier helpers: everything here talks to a real DEPLOYMENT.
 *
 * The rest of the suite seeds through /api/e2e/seed-static, which is mounted
 * only under DFE_E2E_SERVER on a non-production posture. A deployment answers
 * that 404, so an acceptance spec has to reach its preconditions the way an
 * operator would -- through /api/v1, with the deployment's own credentials.
 */

/** The break-glass account name. Deployments may rename it. */
export const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME || 'admin';

/** The receiver's HTTP ingest edge -- where events enter the deployment. */
export const RECEIVER_INGEST_URL =
  process.env.E2E_RECEIVER_URL || 'http://localhost:8080/ingest';

/** The embedded HyperDX origin, as dfe-proxy re-serves it for the iframe. */
export const HYPERDX_EMBED_URL =
  process.env.E2E_HYPERDX_URL || 'http://localhost:8091';

/**
 * The engine's raw-query datasource name. dfe-ui reads rows through the
 * engine rather than ClickHouse directly, so this is the console's own path.
 */
export const QUERY_DATASOURCE =
  process.env.E2E_QUERY_DATASOURCE || 'clickhouse:default';

/** The data database the deployment lands rows in. */
export const DATA_DATABASE = process.env.E2E_DATA_DATABASE || 'dfe';

type Playwright = typeof import('playwright-core');

export const engineContext = async (
  playwright: Playwright,
): Promise<APIRequestContext> =>
  playwright.request.newContext({
    baseURL: ENGINE_API_URL,
    ...transportOptions(),
  });

/**
 * A bearer token for the break-glass admin, rotating off the bootstrap
 * password first if that is still what the deployment answers to.
 *
 * Idempotent on purpose: every acceptance spec can call it, in any order, and
 * a re-run against an already-rotated deployment takes the second branch.
 */
export const adminTokenAfterRotation = async (
  api: APIRequestContext,
): Promise<string> => {
  const rotated = await api.post('/api/v1/auth/login', {
    data: { username: ADMIN_USERNAME, password: adminPassword() },
  });
  if (rotated.ok()) {
    const { access_token: token } = await rotated.json();
    return token;
  }

  const bootstrap = await api.post('/api/v1/auth/login', {
    data: { username: ADMIN_USERNAME, password: bootstrapPassword() },
  });
  expect(
    bootstrap.ok(),
    'neither the rotated nor the deployment bootstrap password logs in -- ' +
      'set E2E_BOOTSTRAP_PASSWORD to the deployment DFE_AUTH_LOCAL_ADMIN_PASSWORD',
  ).toBeTruthy();
  const { access_token: bootstrapToken } = await bootstrap.json();

  const reset = await api.post(
    `/api/v1/auth/accounts/${ADMIN_USERNAME}/reset-password`,
    {
      headers: { Authorization: `Bearer ${bootstrapToken}` },
      data: { new_password: adminPassword() },
    },
  );
  expect(
    reset.ok(),
    'rotation through the product API must succeed',
  ).toBeTruthy();

  const afterReset = await api.post('/api/v1/auth/login', {
    data: { username: ADMIN_USERNAME, password: adminPassword() },
  });
  expect(
    afterReset.ok(),
    'the rotated password must log in immediately afterwards',
  ).toBeTruthy();
  const { access_token: token } = await afterReset.json();
  return token;
};

export const setupStatus = async (api: APIRequestContext) => {
  const response = await api.get('/api/v1/auth/setup-status');
  expect(response.ok(), 'setup-status is public and must answer').toBeTruthy();
  return response.json();
};

/**
 * Bring the deployment to "setup complete" through /api/v1.
 *
 * The wizard cannot do it on a deployment that rotated its break-glass
 * password (dfe-ui#206), and every spec below the wizard needs a console that
 * is past the first-run redirect. So the preconditions are established the way
 * an init script would, and the wizard itself is what rotateThenOnboard tests.
 */
export const ensureSetupComplete = async ({
  api,
  token,
  organisation,
  username,
  password,
}: {
  api: APIRequestContext;
  token: string;
  organisation: string;
  username: string;
  password: string;
}): Promise<void> => {
  const headers = { Authorization: `Bearer ${token}` };

  const status = await setupStatus(api);
  const pending: string[] = status.initial_setup?.pending_steps ?? [];

  if (pending.includes('organisations')) {
    const created = await api.post('/api/v1/orgs', {
      headers,
      data: {
        name: organisation,
        display_name: organisation,
        org_ids: [organisation],
      },
    });
    expect(
      created.ok() || created.status() === 409,
      `creating the first organisation failed: ${created.status()}`,
    ).toBeTruthy();
  }

  if (pending.includes('first_user')) {
    const created = await api.post('/api/v1/auth/accounts', {
      headers,
      data: { username, password, groups: ['dfe-admins'] },
    });
    expect(
      created.ok() || created.status() === 409,
      `creating the first user failed: ${created.status()}`,
    ).toBeTruthy();
  }

  const after = await setupStatus(api);
  expect(
    after.initial_setup?.complete,
    `setup is still incomplete: ${JSON.stringify(after.initial_setup?.pending_steps)}`,
  ).toBeTruthy();
};

/** The organisation the acceptance specs onboard the deployment with. */
export const ACCEPTANCE_ORG = process.env.E2E_ORG || 'acceptance';

/** Remove a source if it is there, so a re-run starts from the same place. */
export const ensureSourceAbsent = async ({
  api,
  token,
  source,
}: {
  api: APIRequestContext;
  token: string;
  source: string;
}): Promise<void> => {
  const response = await api.delete(`/api/v1/sources/${source}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(
    response.ok() || response.status() === 404,
    `deleting ${source} failed: ${response.status()}`,
  ).toBeTruthy();
};

/** Rows a SELECT returns through the engine's query API -- the console's path. */
export const queryRows = async ({
  api,
  token,
  sql,
}: {
  api: APIRequestContext;
  token: string;
  sql: string;
}): Promise<Record<string, unknown>[]> => {
  const response = await api.post('/api/v1/queries/raw', {
    headers: { Authorization: `Bearer ${token}` },
    data: { datasource: QUERY_DATASOURCE, query: sql },
  });
  expect(
    response.ok(),
    `the engine query API refused the query: ${response.status()} ${await response.text()}`,
  ).toBeTruthy();
  const body = await response.json();
  return body.rows ?? [];
};

/**
 * Give the embedded HyperDX a source over one DFE table, and return its id.
 *
 * Nothing provisions this: a deployment seeds HyperDX with a fixed set of
 * sources (`dfe.default`, the hunts table, the otel tables), so a table created
 * for a DFE source of its own is invisible there until somebody registers it.
 * Doing it here through HyperDX's own API is what an operator does today, and
 * it keeps the assertion below about the ROWS rather than about the seed.
 */
export const ensureHyperdxSource = async ({
  hyperdx,
  name,
  table,
}: {
  hyperdx: APIRequestContext;
  name: string;
  table: string;
}): Promise<string> => {
  const listed = await hyperdx.get('/api/sources');
  expect(
    listed.ok(),
    'the embedded HyperDX must answer for its sources',
  ).toBeTruthy();
  const sources = await listed.json();
  const existing = sources.find(
    (source: { name: string }) => source.name === name,
  );
  if (existing) return existing.id;

  const created = await hyperdx.post('/api/sources', {
    data: {
      name,
      kind: 'log',
      connection: sources[0].connection,
      from: { databaseName: DATA_DATABASE, tableName: table },
      timestampValueExpression: '_timestamp',
      displayedTimestampValueExpression: '_timestamp',
      implicitColumnExpression: '_json',
      bodyExpression: '_json',
      serviceNameExpression: '_source',
      eventAttributesExpression: '_json',
      defaultTableSelectExpression:
        '_timestamp,_source,host_name,log_file_path,message',
    },
  });
  expect(
    created.ok(),
    `registering the HyperDX source failed: ${created.status()}`,
  ).toBeTruthy();
  return (await created.json()).id;
};

/** POST one JSON event at the receiver's ingest edge. */
export const postEvent = async (
  api: APIRequestContext,
  body: Record<string, unknown>,
): Promise<void> => {
  const response = await api.post(RECEIVER_INGEST_URL, { data: body });
  expect(
    response.ok(),
    `the receiver rejected the event: ${response.status()}`,
  ).toBeTruthy();
};

/**
 * Poll *probe* until it returns a truthy value, or give up.
 *
 * Landing is asynchronous across a broker and a batching loader, so every data
 * assertion in this tier polls a real signal rather than sleeping a guess.
 */
export const pollUntil = async <T>(
  probe: () => Promise<T>,
  { timeoutMs = 180_000, intervalMs = 3_000 } = {},
): Promise<T | undefined> => {
  const deadline = Date.now() + timeoutMs;
  let last: T | undefined;
  while (Date.now() < deadline) {
    last = await probe();
    if (last) return last;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return last;
};
