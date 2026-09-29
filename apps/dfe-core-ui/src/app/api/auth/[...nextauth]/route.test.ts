/** @vitest-environment node */

import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const { nextAuthHandler } = vi.hoisted(() => ({
  nextAuthHandler: vi.fn(),
}));

vi.mock('next-auth', () => ({ default: () => nextAuthHandler }));
vi.mock('@/core/config/auth', () => ({ authOptions: {} }));

const { GET, POST } = await import('./route');

const call = (action: string, origin = 'https://dfe.example.com') =>
  [
    new NextRequest(`${origin}/api/auth/${action}`, { method: 'POST' }),
    { params: Promise.resolve({ nextauth: [action] }) },
  ] as const;

const dfeTokenCookies = (response: Response) =>
  response.headers
    .getSetCookie()
    .filter((cookie) => cookie.startsWith('dfe_token='));

describe('NextAuth route', () => {
  beforeEach(() => {
    nextAuthHandler.mockImplementation(async () => {
      const response = new Response(JSON.stringify({ url: '/login' }), {
        headers: { 'Content-Type': 'application/json' },
      });
      response.headers.append(
        'Set-Cookie',
        '__Secure-next-auth.session-token=; Path=/; Max-Age=0',
      );
      return response;
    });
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    nextAuthHandler.mockReset();
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
    expect(response.headers.getSetCookie()).toContain(
      '__Secure-next-auth.session-token=; Path=/; Max-Age=0',
    );
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

  test('other NextAuth posts leave dfe_token alone', async () => {
    for (const action of ['session', 'callback', '_log']) {
      const response = await POST(...call(action));

      expect(dfeTokenCookies(response)).toEqual([]);
    }
  });

  test('GET is NextAuth untouched', () => {
    expect(GET).toBe(nextAuthHandler);
  });
});
