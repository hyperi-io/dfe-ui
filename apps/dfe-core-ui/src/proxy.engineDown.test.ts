/** @vitest-environment node */

import { createServer, type Server } from 'node:http';
import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const { authMiddleware, getToken, TEST_BUDGET_MS } = vi.hoisted(() => ({
  authMiddleware: vi.fn(),
  getToken: vi.fn(),
  TEST_BUDGET_MS: 300,
}));

vi.mock('next-auth/middleware', () => ({
  withAuth: () => authMiddleware,
}));

vi.mock('next-auth/jwt', () => ({
  getToken,
}));

// The budget is config, so a short one keeps the silent-engine cases quick.
// The listeners and the sockets stay real.
vi.mock('@/core/config/engineTimeout', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/core/config/engineTimeout')>()),
  ENGINE_CALL_TIMEOUT_MS: TEST_BUDGET_MS,
}));

// Well past the budget, so a missing timeout fails the test instead of hanging it.
const NO_TIMEOUT_FAILS_AFTER_MS = 3000;

// getSetupStatus is the real one: the engine is a real listener, or a port
// nothing listens on, so the proxy meets the failure the way production does.
const { default: proxy } = await import('./proxy');

const servers: Server[] = [];

const urlOf = (server: Server): string => {
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('the test server is not listening on a port');
  }
  return `http://127.0.0.1:${address.port}`;
};

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

// Accepts the connection and never writes a byte: a blackholed engine, which
// a refused port is not.
const engineSilent = async (): Promise<string> => {
  const server = createServer(() => undefined);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return urlOf(server);
};

const engineDown = async (): Promise<string> => {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = urlOf(server);
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return url;
};

const request = (path: string) => new NextRequest(`http://localhost${path}`);

const rewriteOf = (response: Response) =>
  response.headers.get('x-middleware-rewrite');

const passesThrough = (response: Response) =>
  response.headers.get('x-middleware-next') === '1' &&
  rewriteOf(response) === null;

const closeServers = async () => {
  await Promise.all(
    servers.splice(0).map((server) => {
      // A silent engine holds its socket open, and close() waits for it.
      server.closeAllConnections();
      return new Promise<void>((resolve) => server.close(() => resolve()));
    }),
  );
};

describe('proxy with the engine unreachable', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('INTERNAL_API_URL', await engineDown());
    getToken.mockResolvedValue(null);
    authMiddleware.mockResolvedValue(
      NextResponse.redirect(new URL('http://localhost/login')),
    );
  });

  afterEach(closeServers);

  test.each(['/login', '/setup', '/setup/welcome'])(
    'answers %s with a 503 that rewrites to the unavailable page',
    async (path) => {
      const response = await proxy(request(path), undefined as never);

      expect(response.status).toBe(503);
      expect(rewriteOf(response)).toBe('http://localhost/engine-unavailable');
      expect(authMiddleware).not.toHaveBeenCalled();
    },
  );

  test('keeps the nonce policy and forbids caching on the 503', async () => {
    const response = await proxy(request('/login'), undefined as never);

    const policy = response.headers.get('content-security-policy');
    expect(policy).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(
      response.headers.get('x-middleware-request-content-security-policy'),
    ).toBe(policy);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  test('answers an authenticated page with a 503 as well', async () => {
    authMiddleware.mockResolvedValue(NextResponse.next());
    getToken.mockResolvedValue({
      accessToken: 'engine-jwt',
      passwordChangeRequired: false,
    });

    const response = await proxy(request('/sources'), undefined as never);

    expect(response.status).toBe(503);
    expect(rewriteOf(response)).toBe('http://localhost/engine-unavailable');
  });

  test('still sends an anonymous page to /login without asking the engine', async () => {
    const response = await proxy(request('/sources'), undefined as never);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/login');
  });

  test.each(['/login/oidc', '/change-password'])(
    'lets %s through, since it reads nothing from the engine on render',
    async (path) => {
      const response = await proxy(request(path), undefined as never);

      expect(passesThrough(response)).toBe(true);
      expect(response.status).toBe(200);
    },
  );

  // The rewrite's own destination must not meet the auth guard or rewrite again.
  test('serves the unavailable page itself, with no auth check and no further rewrite', async () => {
    const response = await proxy(
      request('/engine-unavailable'),
      undefined as never,
    );

    expect(passesThrough(response)).toBe(true);
    expect(response.status).toBe(200);
    expect(authMiddleware).not.toHaveBeenCalled();
  });
});

describe('proxy with an engine that accepts the connection and never answers', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('INTERNAL_API_URL', await engineSilent());
    getToken.mockResolvedValue(null);
    authMiddleware.mockResolvedValue(
      NextResponse.redirect(new URL('http://localhost/login')),
    );
  });

  afterEach(closeServers);

  test.each(['/login', '/setup'])(
    'answers %s with the 503 once the budget is spent',
    { timeout: NO_TIMEOUT_FAILS_AFTER_MS },
    async (path) => {
      const started = Date.now();

      const response = await proxy(request(path), undefined as never);

      expect(response.status).toBe(503);
      expect(rewriteOf(response)).toBe('http://localhost/engine-unavailable');
      expect(Date.now() - started).toBeLessThan(NO_TIMEOUT_FAILS_AFTER_MS);
    },
  );

  test(
    'answers an authenticated page with the 503 as well',
    { timeout: NO_TIMEOUT_FAILS_AFTER_MS },
    async () => {
      authMiddleware.mockResolvedValue(NextResponse.next());
      getToken.mockResolvedValue({
        accessToken: 'engine-jwt',
        passwordChangeRequired: false,
      });

      const response = await proxy(request('/sources'), undefined as never);

      expect(response.status).toBe(503);
      expect(rewriteOf(response)).toBe('http://localhost/engine-unavailable');
    },
  );
});

describe('proxy with an engine that answers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    getToken.mockResolvedValue(null);
  });

  afterEach(closeServers);

  test.each([502, 503, 504])(
    'treats a %s from the gateway in front of it as unreachable',
    async (status) => {
      vi.stubEnv('INTERNAL_API_URL', await engineAnswering(status));

      const response = await proxy(request('/login'), undefined as never);

      expect(response.status).toBe(503);
      expect(rewriteOf(response)).toBe('http://localhost/engine-unavailable');
    },
  );

  test('lets /login through when setup is complete', async () => {
    vi.stubEnv(
      'INTERNAL_API_URL',
      await engineAnswering(200, '{"initial_setup":{"complete":true}}'),
    );

    const response = await proxy(request('/login'), undefined as never);

    expect(passesThrough(response)).toBe(true);
    expect(response.status).toBe(200);
  });

  test('leaves any other failing status to the page', async () => {
    vi.stubEnv('INTERNAL_API_URL', await engineAnswering(500));

    const response = await proxy(request('/login'), undefined as never);

    expect(passesThrough(response)).toBe(true);
  });

  test('leaves a missing engine URL to the page, which names it', async () => {
    vi.stubEnv('INTERNAL_API_URL', '');
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');

    const response = await proxy(request('/login'), undefined as never);

    expect(passesThrough(response)).toBe(true);
  });
});
