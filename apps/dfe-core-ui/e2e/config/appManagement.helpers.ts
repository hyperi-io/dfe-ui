import { expect } from '@playwright/test';
import { ENGINE_API_URL } from './e2e.client';
import { adminPassword } from './login.helpers';
import { SeedRequest } from './e2e.client.types';

/**
 * Run an app-management seed, failing with what the engine actually answered.
 *
 * Same route as `e2eClient`, but these seeds write to the deploy repo and reach
 * the source registry, so they fail for more than one reason. The endpoint
 * turns every one of them into a bare 500 "internal_error" (dfe-engine#452), so
 * the status and the raw body go into the message and the reason itself is one
 * `docker logs` away. Do not guess a cause here again: the guess that used to
 * live on this line named DFE_GITOPS_ENABLED and cost a session.
 */
export const seedAppManagement = async ({
  playwright,
  seedScript,
}: {
  playwright: typeof import('playwright-core');
  seedScript: SeedRequest['script'];
}) => {
  const apiContext = await playwright.request.newContext({
    baseURL: ENGINE_API_URL,
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  });

  const response = await apiContext.post('/api/e2e/seed-static', {
    data: { script: seedScript },
  });

  const body = await response.text();
  expect(
    response.ok(),
    `Seed ${seedScript} failed (${response.status()}): ${body}. The engine log carries the traceback the body drops.`,
  ).toBeTruthy();
  expect(JSON.parse(body).success).toBeTruthy();

  await apiContext.dispose();
};

/** The meta schema the engine's own deployed fixtures use. */
const FIXTURE_META_SCHEMA = 'meta/syslog';

/**
 * Give each named source a meta schema and deploy it.
 *
 * The console offers Processing only for a deployed source that has a meta
 * schema, and the transform seeds leave their sources with neither. The
 * engine's source write undeploys the seeded transform instances, so
 * `seedScript` runs again afterwards to put them back: it creates nothing that
 * exists, and writes the instances.
 */
export const deploySeededSources = async ({
  playwright,
  sources,
  seedScript,
}: {
  playwright: typeof import('playwright-core');
  sources: readonly string[];
  seedScript: SeedRequest['script'];
}) => {
  const api = await playwright.request.newContext({
    baseURL: ENGINE_API_URL,
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  });
  try {
    const login = await api.post('/api/v1/auth/login', {
      data: { username: 'initial_user', password: adminPassword() },
    });
    expect(login.ok(), `login failed (${login.status()})`).toBeTruthy();
    const { access_token: token } = await login.json();
    const headers = { Authorization: `Bearer ${token}` };

    for (const name of sources) {
      const read = await api.get(`/api/v1/sources/${name}`, { headers });
      expect(read.ok(), `read ${name} failed (${read.status()})`).toBeTruthy();
      const source = await read.json();
      const version = source.versions[source.current];

      const write = await api.put(`/api/v1/sources/${name}`, {
        headers,
        data: {
          display_name: source.display_name,
          description: source.description,
          enabled: source.enabled,
          archive: source.archive,
          header: version.header,
          match: source.match,
          transform: source.transform,
          schema: { meta_schema: FIXTURE_META_SCHEMA, engine: '' },
        },
      });
      expect(
        write.ok(),
        `schema write for ${name} failed (${write.status()}): ${await write.text()}`,
      ).toBeTruthy();

      const deploy = await api.post(`/api/v1/sources/${name}/deploy`, {
        headers,
      });
      expect(
        deploy.ok(),
        `deploy of ${name} failed (${deploy.status()}): ${await deploy.text()}`,
      ).toBeTruthy();
    }
  } finally {
    await api.dispose();
  }

  await seedAppManagement({ playwright, seedScript });
};
