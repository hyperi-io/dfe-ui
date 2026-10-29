/** @vitest-environment node */

import { createServer, type Server } from 'node:http';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { getAuthPermissions } from '.';

const { TEST_BUDGET_MS } = vi.hoisted(() => ({ TEST_BUDGET_MS: 300 }));
vi.mock('@/core/config/engineTimeout', () => ({
  ENGINE_CALL_TIMEOUT_MS: TEST_BUDGET_MS,
}));

const servers: Server[] = [];
const seenAuth: (string | undefined)[] = [];

const listen = async (server: Server): Promise<string> => {
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('the test server is not listening on a port');
  }
  return `http://127.0.0.1:${address.port}`;
};

const engineAnswering = (status: number, body: string) =>
  listen(
    createServer((request, response) => {
      seenAuth.push(request.headers.authorization);
      response.writeHead(status, { 'content-type': 'application/json' });
      response.end(body);
    }),
  );

afterEach(async () => {
  vi.unstubAllEnvs();
  seenAuth.length = 0;
  await Promise.all(
    servers
      .splice(0)
      .map(
        (server) =>
          new Promise<void>((resolve) => server.close(() => resolve())),
      ),
  );
});

describe('getAuthPermissions', () => {
  test('returns the permissions the engine grants the token', async () => {
    vi.stubEnv(
      'INTERNAL_API_URL',
      await engineAnswering(
        200,
        '{"roles":["org_viewer"],"permissions":["source:read","query:execute"]}',
      ),
    );

    await expect(getAuthPermissions('tok')).resolves.toEqual([
      'source:read',
      'query:execute',
    ]);
    expect(seenAuth).toEqual(['Bearer tok']);
  });

  test.each([
    ['a refusal', 401, '{"code":"unauthorized"}'],
    ['a server error', 500, '{}'],
    ['a body with no permissions', 200, '{"roles":[]}'],
    ['permissions that are not a list', 200, '{"permissions":"*"}'],
    ['a body that is not JSON', 200, 'not json'],
  ])('reads %s as none', async (_case, status, body) => {
    vi.stubEnv('INTERNAL_API_URL', await engineAnswering(status, body));

    await expect(getAuthPermissions('tok')).resolves.toEqual([]);
  });

  test('drops entries that are not strings', async () => {
    vi.stubEnv(
      'INTERNAL_API_URL',
      await engineAnswering(200, '{"permissions":["source:read",7,null]}'),
    );

    await expect(getAuthPermissions('tok')).resolves.toEqual(['source:read']);
  });

  test('asks nothing without a token', async () => {
    vi.stubEnv('INTERNAL_API_URL', await engineAnswering(200, '{}'));

    await expect(getAuthPermissions(undefined)).resolves.toEqual([]);
    expect(seenAuth).toEqual([]);
  });

  test('reads an engine that never answers as none', async () => {
    vi.stubEnv('INTERNAL_API_URL', await listen(createServer(() => undefined)));

    await expect(getAuthPermissions('tok')).resolves.toEqual([]);
  });

  test('reads no engine URL as none', async () => {
    vi.stubEnv('INTERNAL_API_URL', '');
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');

    await expect(getAuthPermissions('tok')).resolves.toEqual([]);
  });
});
