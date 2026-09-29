/** @vitest-environment node */

import type { JWT } from 'next-auth/jwt';
import { describe, expect, test } from 'vitest';
import { renewEngineSession } from './renewEngineSession';

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

type TCall = { url: string; method: string; auth: string | null };

/** Answers /auth/refresh and /auth/me in turn, recording what the engine was asked. */
const engine = (
  refresh: Response | Error,
  me: Response | Error = jsonResponse(200, { roles: ['data_viewer'] }),
) => {
  const calls: TCall[] = [];
  const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({
      url,
      method: init?.method ?? 'GET',
      auth: new Headers(init?.headers).get('authorization'),
    });
    const answer = url.endsWith('/auth/refresh') ? refresh : me;
    if (answer instanceof Error) throw answer;
    return answer;
  };
  return { calls, fetchImpl };
};

const SESSION: JWT = {
  sub: 'admin',
  accessToken: 'held-jwt',
  accessTokenExpiresAt: 1,
  roles: ['admin'],
  passwordChangeRequired: true,
};

describe('renewEngineSession', () => {
  test('refreshes the token the session holds, then asks /auth/me for its roles', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const renewedJwt = jwtWith({ sub: 'admin', exp });
    const { calls, fetchImpl } = engine(
      jsonResponse(200, {
        access_token: renewedJwt,
        expires_in: 3600,
        roles: ['admin'],
        password_change_required: false,
      }),
    );

    const token = await renewEngineSession(SESSION, BASE, fetchImpl);

    expect(calls).toEqual([
      {
        url: `${BASE}/api/v1/auth/refresh`,
        method: 'POST',
        auth: 'Bearer held-jwt',
      },
      {
        url: `${BASE}/api/v1/auth/me`,
        method: 'GET',
        auth: `Bearer ${renewedJwt}`,
      },
    ]);
    expect(token).toMatchObject({
      sub: 'admin',
      accessToken: renewedJwt,
      accessTokenExpiresAt: exp * 1000,
      roles: ['data_viewer'],
      passwordChangeRequired: false,
    });
    expect(token.error).toBeUndefined();
  });

  test('the expiry is the one the token states, whatever expires_in claims', async () => {
    const exp = Math.floor(Date.now() / 1000) + 600;
    const { fetchImpl } = engine(
      jsonResponse(200, {
        access_token: jwtWith({ exp }),
        expires_in: 31_536_000,
      }),
    );

    const token = await renewEngineSession(SESSION, BASE, fetchImpl);

    expect(token.accessTokenExpiresAt).toBe(exp * 1000);
  });

  test('keeps the engine refresh roles when /auth/me cannot answer', async () => {
    const { fetchImpl } = engine(
      jsonResponse(200, {
        access_token: jwtWith({ exp: 9_999_999_999 }),
        roles: ['org_viewer'],
      }),
      jsonResponse(503, {}),
    );

    const token = await renewEngineSession(SESSION, BASE, fetchImpl);

    expect(token.roles).toEqual(['org_viewer']);
  });

  test.each([
    ['refuses the token', jsonResponse(401, { code: 'unauthorized' })],
    ['answers without a token', jsonResponse(200, { expires_in: 3600 })],
    ['is unreachable', new TypeError('fetch failed')],
  ])('marks the session expired when the engine %s', async (_why, refresh) => {
    const { fetchImpl } = engine(refresh);

    const token = await renewEngineSession(SESSION, BASE, fetchImpl);

    expect(token).toEqual({ ...SESSION, error: 'AccessTokenExpired' });
  });

  test('asks the engine nothing for a session with no token', async () => {
    const { calls, fetchImpl } = engine(jsonResponse(200, {}));

    const token = await renewEngineSession({ sub: 'admin' }, BASE, fetchImpl);

    expect(calls).toEqual([]);
    expect(token.error).toBe('AccessTokenExpired');
  });
});
