/** @vitest-environment node */

import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const { nextAuthHandler, getToken, endEngineSessions } = vi.hoisted(() => ({
  nextAuthHandler: vi.fn(),
  getToken: vi.fn(),
  endEngineSessions: vi.fn(),
}));

vi.mock('next-auth', () => ({ default: () => nextAuthHandler }));
vi.mock('next-auth/jwt', () => ({ getToken }));
vi.mock('@/core/auth/endEngineSessions', () => ({ endEngineSessions }));
vi.mock('@/core/config/auth', () => ({
  authOptions: {},
  engineBaseUrl: 'http://engine.test',
}));

const { GET, POST } = await import('./route');

const SESSION_CLEARED =
  '__Secure-next-auth.session-token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax';

const call = (action: string, origin = 'https://dfe.example.com') =>
  [
    new NextRequest(`${origin}/api/auth/${action}`, { method: 'POST' }),
    { params: Promise.resolve({ nextauth: [action] }) },
  ] as const;

// What NextAuth answers: a passed sign-out clears its session cookie, a refused one does not.
const nextAuthAnswers = (setCookies: string[]) =>
  nextAuthHandler.mockImplementation(async () => {
    const response = new Response(JSON.stringify({ url: '/login' }), {
      headers: { 'Content-Type': 'application/json' },
    });
    for (const cookie of setCookies) {
      response.headers.append('Set-Cookie', cookie);
    }
    return response;
  });

const dfeTokenCookies = (response: Response) =>
  response.headers
    .getSetCookie()
    .filter((cookie) => cookie.startsWith('dfe_token='));

describe('NextAuth route', () => {
  beforeEach(() => {
    nextAuthAnswers([SESSION_CLEARED]);
    getToken.mockResolvedValue({ accessToken: 'engine-jwt' });
    endEngineSessions.mockResolvedValue(true);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  test('sign-out ends the engine sessions with the token the session held', async () => {
    await POST(...call('signout'));

    expect(endEngineSessions).toHaveBeenCalledWith(
      'engine-jwt',
      'http://engine.test',
    );
  });

  test('a sign-out NextAuth refused (no session cleared) leaves the engine sessions alone', async () => {
    nextAuthAnswers([]);

    await POST(...call('signout'));

    expect(endEngineSessions).not.toHaveBeenCalled();
  });

  test('an engine that cannot end the sessions does not stop the local sign-out', async () => {
    endEngineSessions.mockResolvedValue(false);

    const response = await POST(...call('signout'));

    expect(response.headers.getSetCookie()).toContain(SESSION_CLEARED);
    expect(dfeTokenCookies(response)).toHaveLength(1);
  });

  test('a browser with no session asks the engine nothing', async () => {
    getToken.mockResolvedValue(null);

    await POST(...call('signout'));

    expect(endEngineSessions).not.toHaveBeenCalled();
  });

  test('sign-out expires the Domain-scoped dfe_token the proxy planted, and the host-only one', async () => {
    vi.stubEnv('DFE_COOKIE_DOMAIN', 'example.com');

    const response = await POST(...call('signout'));

    const cleared = dfeTokenCookies(response);
    expect(cleared).toEqual([
      expect.stringMatching(
        /^dfe_token=; Domain=example\.com; Path=\/; Max-Age=0;.*; HttpOnly; SameSite=Lax; Secure$/,
      ),
      expect.stringMatching(
        /^dfe_token=; Path=\/; Max-Age=0;.*; HttpOnly; SameSite=Lax; Secure$/,
      ),
    ]);
    // NextAuth's own session cookie still goes out alongside.
    expect(response.headers.getSetCookie()).toContain(SESSION_CLEARED);
  });

  test('with no cookie domain only the host-only cookie exists to expire', async () => {
    const response = await POST(...call('signout'));

    expect(dfeTokenCookies(response)).toEqual([
      expect.stringMatching(/^dfe_token=; Path=\/; Max-Age=0;/),
    ]);
  });

  test('over plain http the expiry is not marked Secure, matching how it was planted', async () => {
    const response = await POST(...call('signout', 'http://localhost:3000'));

    expect(dfeTokenCookies(response)[0]).not.toContain('Secure');
  });

  test('other NextAuth posts leave the engine and dfe_token alone', async () => {
    for (const action of ['session', 'callback', '_log']) {
      const response = await POST(...call(action));

      expect(dfeTokenCookies(response)).toEqual([]);
    }
    expect(getToken).not.toHaveBeenCalled();
    expect(endEngineSessions).not.toHaveBeenCalled();
  });

  test('GET is NextAuth untouched', () => {
    expect(GET).toBe(nextAuthHandler);
  });
});
