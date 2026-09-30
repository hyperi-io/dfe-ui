/** @vitest-environment node */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { Account, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { CredentialsConfig } from 'next-auth/providers/credentials';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { authOptions, forwardedForHeader } from './auth';

const ENGINE = 'http://localhost';

const jwt = authOptions.callbacks?.jwt;
const sessionCallback = authOptions.callbacks?.session;
const redirect = authOptions.callbacks?.redirect;

// An unsigned ES384-shaped JWT is enough: the engine verifies, the console only decodes.
const engineJwt = (claims: Record<string, unknown>): string => {
  const b64 = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64({ alg: 'ES384', typ: 'JWT' })}.${b64(claims)}.sig`;
};

const seen: { refreshAuth?: string | null; loginForwardedFor?: string | null } =
  {};

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  delete seen.refreshAuth;
  delete seen.loginForwardedFor;
});
afterAll(() => server.close());

/** The engine answering a refresh of the session's token, and /auth/me for the renewed one. */
const engineRenews = (answer: {
  access_token: string;
  expires_in?: number;
  roles?: string[];
  password_change_required?: boolean;
}) =>
  server.use(
    http.post(`${ENGINE}/api/v1/auth/refresh`, ({ request }) => {
      seen.refreshAuth = request.headers.get('authorization');
      return HttpResponse.json(answer);
    }),
    http.get(`${ENGINE}/api/v1/auth/me`, () =>
      HttpResponse.json({ user_id: 'admin', roles: answer.roles ?? [] }),
    ),
  );

const update = (token: JWT, session: unknown) =>
  jwt!({
    token,
    user: undefined as unknown as User,
    account: null,
    trigger: 'update',
    session,
  });

const signIn = (user: Partial<User>) =>
  jwt!({
    token: {} as JWT,
    user: { id: 'admin', ...user } as User,
    account: null as unknown as Account,
  });

describe('the session carries the forced-change flag', () => {
  test('a login on an issued password marks the token', async () => {
    const token = await signIn({
      accessToken: 'engine-jwt',
      passwordChangeRequired: true,
    });

    expect(token.passwordChangeRequired).toBe(true);
  });

  test("a login on the account's own password leaves it clear", async () => {
    const token = await signIn({ accessToken: 'engine-jwt' });

    expect(token.passwordChangeRequired).toBe(false);
  });

  test('a renewed session after the change clears it, because the engine says so', async () => {
    const renewed = engineJwt({ sub: 'admin', exp: 9_999_999_999 });
    engineRenews({
      access_token: renewed,
      expires_in: 3600,
      roles: ['admin'],
      password_change_required: false,
    });

    const token = await update(
      { accessToken: 'old', passwordChangeRequired: true } as JWT,
      undefined,
    );

    expect(token.passwordChangeRequired).toBe(false);
    expect(token.accessToken).toBe(renewed);
  });

  test("the session exposes the token's flag", async () => {
    const session = await sessionCallback!({
      session: { user: {}, expires: '2099-01-01' } as Session,
      token: { accessToken: 'engine-jwt', passwordChangeRequired: true } as JWT,
      user: undefined as unknown as never,
      newSession: undefined,
      trigger: 'update',
    });

    expect((session as Session).passwordChangeRequired).toBe(true);
  });
});

describe('a session update is renewed by the engine, never by the caller', () => {
  test('a posted token, roles, lifetime and flag are all ignored', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const renewed = engineJwt({ sub: 'viewer', exp });
    engineRenews({
      access_token: renewed,
      expires_in: 3600,
      roles: ['data_viewer'],
      password_change_required: true,
    });

    const token = await update(
      {
        accessToken: 'held-jwt',
        roles: ['data_viewer'],
        passwordChangeRequired: true,
      } as JWT,
      {
        accessToken: 'forged-jwt',
        roles: ['admin'],
        expiresIn: 31_536_000,
        passwordChangeRequired: false,
      },
    );

    expect(seen.refreshAuth).toBe('Bearer held-jwt');
    expect(token.accessToken).toBe(renewed);
    expect(token.roles).toEqual(['data_viewer']);
    expect(token.passwordChangeRequired).toBe(true);
    // The dfe_token cookie's Max-Age derives from this, so it must be the token's own expiry.
    expect(token.accessTokenExpiresAt).toBe(exp * 1000);
  });

  test('an update the engine refuses marks the session expired instead of keeping it alive', async () => {
    server.use(
      http.post(`${ENGINE}/api/v1/auth/refresh`, () =>
        HttpResponse.json({ code: 'unauthorized' }, { status: 401 }),
      ),
    );

    const token = await update(
      { accessToken: 'revoked-jwt', roles: ['admin'] } as JWT,
      { accessToken: 'forged-jwt', roles: ['admin'] },
    );

    expect(token.error).toBe('AccessTokenExpired');
    expect(token.accessToken).toBe('revoked-jwt');
  });
});

describe('every NextAuth redirect stays on the console', () => {
  test.each([
    ['/rules?name=a', 'https://dfe.example.com/rules?name=a'],
    ['https://dfe.example.com/sources', 'https://dfe.example.com/sources'],
    ['/\\evil.example', 'https://dfe.example.com/'],
    ['https://evil.example/', 'https://dfe.example.com/'],
  ])('%s -> %s', async (url, expected) => {
    expect(await redirect!({ url, baseUrl: 'https://dfe.example.com' })).toBe(
      expected,
    );
  });
});

describe('the login audit names the client, not this pod', () => {
  test('forwards the incoming X-Forwarded-For chain', () => {
    expect(
      forwardedForHeader({ 'x-forwarded-for': '203.0.113.7, 10.0.0.2' }),
    ).toEqual({ 'X-Forwarded-For': '203.0.113.7, 10.0.0.2' });
  });

  test('adds nothing when the request carried none', () => {
    expect(forwardedForHeader({})).toEqual({});
    expect(forwardedForHeader(undefined)).toEqual({});
    expect(forwardedForHeader({ 'x-forwarded-for': '  ' })).toEqual({});
  });

  test('the password login sends it to the engine', async () => {
    server.use(
      http.post(`${ENGINE}/api/v1/auth/login`, ({ request }) => {
        seen.loginForwardedFor = request.headers.get('x-forwarded-for');
        return HttpResponse.json({ access_token: 'engine-jwt' });
      }),
      http.get(`${ENGINE}/api/v1/auth/me`, () =>
        HttpResponse.json({ user_id: 'admin', roles: ['admin'] }),
      ),
    );
    const provider = authOptions.providers[0] as CredentialsConfig & {
      options: CredentialsConfig;
    };

    await provider.options.authorize(
      { username: 'admin', password: 'correct horse battery' },
      {
        headers: { 'x-forwarded-for': '203.0.113.7' },
        body: {},
        query: {},
        method: 'POST',
      },
    );

    expect(seen.loginForwardedFor).toBe('203.0.113.7');
  });
});
