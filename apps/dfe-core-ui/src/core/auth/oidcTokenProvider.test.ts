import { authorizeEngineToken } from '@/core/auth/oidcTokenProvider';
import { describe, expect, test } from 'vitest';

const BASE = 'http://engine.test';

// An unsigned ES384-shaped JWT is enough: the engine verifies, the console only decodes.
const jwtWith = (claims: Record<string, unknown>): string => {
  const b64 = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64({ alg: 'ES384', typ: 'JWT' })}.${b64(claims)}.sig`;
};

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const fetchReturning =
  (response: Response, seen: { url?: string; auth?: string | null } = {}) =>
  async (input: RequestInfo | URL, init?: RequestInit) => {
    seen.url = String(input);
    seen.auth = new Headers(init?.headers).get('authorization');
    return response;
  };

describe('authorizeEngineToken', () => {
  test('asks /auth/me with the token and builds the session user from it', async () => {
    const exp = Math.floor(Date.now() / 1000) + 600;
    const token = jwtWith({ sub: 'abc', email: 'dfe-test@ms.hyperi.io', exp });
    const seen: { url?: string; auth?: string | null } = {};
    const fetchImpl = fetchReturning(
      jsonResponse(200, { user_id: 'abc', roles: ['admin'] }),
      seen,
    );

    const user = await authorizeEngineToken(token, BASE, fetchImpl);

    expect(seen.url).toBe(`${BASE}/api/v1/auth/me`);
    expect(seen.auth).toBe(`Bearer ${token}`);
    expect(user).toMatchObject({
      id: 'abc',
      name: 'dfe-test@ms.hyperi.io',
      email: 'dfe-test@ms.hyperi.io',
      accessToken: token,
      roles: ['admin'],
    });
    expect(user?.expiresIn).toBeGreaterThan(500);
    expect(user?.expiresIn).toBeLessThanOrEqual(600);
  });

  test('falls back to the subject as the name when the token carries no email', async () => {
    const token = jwtWith({ sub: 'XlZ_SJfeaMSC9HM8', email: '' });
    const user = await authorizeEngineToken(
      token,
      BASE,
      fetchReturning(
        jsonResponse(200, { user_id: 'XlZ_SJfeaMSC9HM8', roles: [] }),
      ),
    );
    expect(user).toMatchObject({
      id: 'XlZ_SJfeaMSC9HM8',
      name: 'XlZ_SJfeaMSC9HM8',
      email: undefined,
      roles: [],
      expiresIn: 86400,
    });
  });

  test('is null when the engine rejects the token', async () => {
    const user = await authorizeEngineToken(
      jwtWith({ sub: 'abc' }),
      BASE,
      fetchReturning(jsonResponse(401, { code: 'unauthorized' })),
    );
    expect(user).toBeNull();
  });

  test('is null for an empty token without calling the engine', async () => {
    let called = false;
    const user = await authorizeEngineToken('', BASE, async () => {
      called = true;
      return jsonResponse(200, { user_id: 'abc' });
    });
    expect(user).toBeNull();
    expect(called).toBe(false);
  });
});
