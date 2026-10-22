/** @vitest-environment node */

import { createServer, type Server } from 'node:http';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { EngineUnreachableError, getSetupStatus, MissingApiUrlError } from '.';

const servers: Server[] = [];

const urlOf = (server: Server): string => {
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('the test server is not listening on a port');
  }
  return `http://127.0.0.1:${address.port}`;
};

// A real listener, so the status comes off the wire rather than out of a mock.
const engineAnswering = async (
  status: number,
  body = '{}',
): Promise<string> => {
  const server = createServer((_request, response) => {
    response.writeHead(status, { 'content-type': 'application/json' });
    response.end(body);
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return urlOf(server);
};

// A port that was just released, so the connection is refused for real.
const engineDown = async (): Promise<string> => {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = urlOf(server);
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return url;
};

describe('getSetupStatus', () => {
  afterEach(async () => {
    await Promise.all(
      servers
        .splice(0)
        .map(
          (server) =>
            new Promise<void>((resolve) => server.close(() => resolve())),
        ),
    );
  });

  test('returns the engine payload when it answers', async () => {
    vi.stubEnv(
      'INTERNAL_API_URL',
      await engineAnswering(200, '{"initial_setup":{"complete":true}}'),
    );

    await expect(getSetupStatus()).resolves.toEqual({
      initial_setup: { complete: true },
    });
  });

  test('reports a refused connection as an unreachable engine', async () => {
    vi.stubEnv('INTERNAL_API_URL', await engineDown());

    await expect(getSetupStatus()).rejects.toBeInstanceOf(
      EngineUnreachableError,
    );
  });

  test.each([502, 503, 504])(
    'reports a %s from the gateway in front of the engine as unreachable',
    async (status) => {
      vi.stubEnv('INTERNAL_API_URL', await engineAnswering(status));

      await expect(getSetupStatus()).rejects.toBeInstanceOf(
        EngineUnreachableError,
      );
    },
  );

  test('keeps any other failing status as a plain error', async () => {
    vi.stubEnv('INTERNAL_API_URL', await engineAnswering(500));

    const error = await getSetupStatus().catch((caught: unknown) => caught);

    expect(error).not.toBeInstanceOf(EngineUnreachableError);
    expect(error).toHaveProperty('message', expect.stringContaining('500'));
  });

  test('never puts the engine address in the unreachable message', async () => {
    const url = await engineDown();
    vi.stubEnv('INTERNAL_API_URL', url);

    const error = await getSetupStatus().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(EngineUnreachableError);
    expect(error).toHaveProperty(
      'message',
      expect.not.stringContaining(new URL(url).host),
    );
  });

  test('keeps a missing engine URL apart from an unreachable engine', async () => {
    vi.stubEnv('INTERNAL_API_URL', '');
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');

    const error = await getSetupStatus().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(MissingApiUrlError);
    expect(error).not.toBeInstanceOf(EngineUnreachableError);
  });
});
