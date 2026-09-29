/** @vitest-environment node */

import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { expiredEngineTokenCookies } from '@/core/config/engineTokenCookie';

const { authMiddleware, getSetupStatus, getToken } = vi.hoisted(() => ({
  authMiddleware: vi.fn(),
  getSetupStatus: vi.fn(),
  getToken: vi.fn(),
}));

vi.mock('next-auth/middleware', () => ({
  withAuth: () => authMiddleware,
}));

vi.mock('next-auth/jwt', () => ({
  getToken,
}));

vi.mock('@/core/server/actions/getSetupStatus', () => ({
  getSetupStatus,
}));

const { default: proxy } = await import('./proxy');

const setupStatus = (complete: boolean): TFetchSetupStatusResponse => ({
  initial_setup: {
    complete,
    current_step: null,
    steps: [],
    pending_steps: [],
    completed_steps: [],
    step_details: [],
  },
  oidc_providers: [],
  organisations: [],
  default_credentials: false,
  deploy_kind: 'local',
  credential_fetch_command: '',
  default_engine: 'MergeTree',
  default_ttl_days: 90,
  admin_username: 'admin',
  admin_retired: false,
  retire_admin_available: false,
});

const request = (path: string, cookie?: string) =>
  new NextRequest(`http://localhost${path}`, {
    headers: cookie ? { cookie } : undefined,
  });

describe('proxy (auth middleware)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    getToken.mockResolvedValue(null);
    getSetupStatus.mockResolvedValue(setupStatus(true));
    authMiddleware.mockResolvedValue(
      NextResponse.redirect(new URL('http://localhost/login')),
    );
  });

  test('sends an unauthenticated request to /login, not the wizard, while initial setup is incomplete', async () => {
    // The wizard's every call is an authenticated engine call, so handing it to
    // an anonymous visitor produces a form that 401s on submit (dfe-ui#206).
    getSetupStatus.mockResolvedValue(setupStatus(false));

    const response = await proxy(request('/sources'), undefined as never);

    expect(response.headers.get('location')).toBe('http://localhost/login');
    // The ordering, not just the destination: an anonymous request must cost no
    // engine round trip.
    expect(getSetupStatus).not.toHaveBeenCalled();
  });

  test('redirects an authenticated request to /setup while initial setup is incomplete', async () => {
    getSetupStatus.mockResolvedValue(setupStatus(false));
    authMiddleware.mockResolvedValue(NextResponse.next());

    const response = await proxy(request('/'), undefined as never);

    expect(response.headers.get('location')).toBe('http://localhost/setup');
  });

  test('a leftover dfe_token without a session is not a sign-in', async () => {
    const response = await proxy(
      request('/sources', 'dfe_token=engine-jwt'),
      undefined as never,
    );

    expect(authMiddleware).toHaveBeenCalled();
    expect(response.headers.get('location')).toBe('http://localhost/login');
  });

  test('defers to withAuth when initial setup is complete', async () => {
    await proxy(request('/sources'), undefined as never);

    expect(authMiddleware).toHaveBeenCalled();
  });

  test('sends a session on an issued password to the change screen, ahead of the wizard', async () => {
    getSetupStatus.mockResolvedValue(setupStatus(false));
    authMiddleware.mockResolvedValue(NextResponse.next());
    getToken.mockResolvedValue({
      accessToken: 'engine-jwt',
      passwordChangeRequired: true,
    });

    const response = await proxy(request('/sources'), undefined as never);

    expect(response.headers.get('location')).toBe(
      'http://localhost/change-password',
    );
    // The embedded data plane gets no token for an account that may use nothing yet.
    expect(response.cookies.get('dfe_token')).toBeUndefined();
  });

  test('lets a session that has changed its password through', async () => {
    authMiddleware.mockResolvedValue(NextResponse.next());
    getToken.mockResolvedValue({
      accessToken: 'engine-jwt',
      passwordChangeRequired: false,
    });

    const response = await proxy(request('/sources'), undefined as never);

    expect(response.headers.get('location')).toBeNull();
    expect(response.cookies.get('dfe_token')?.value).toBe('engine-jwt');
  });

  test('plants dfe_token on the Domain and Path sign-out expires it with', async () => {
    vi.stubEnv('DFE_COOKIE_DOMAIN', 'example.com');
    authMiddleware.mockResolvedValue(NextResponse.next());
    getToken.mockResolvedValue({
      accessToken: 'engine-jwt',
      passwordChangeRequired: false,
    });

    const response = await proxy(request('/sources'), undefined as never);

    expect(response.cookies.get('dfe_token')).toMatchObject({
      domain: 'example.com',
      path: '/',
    });
    expect(expiredEngineTokenCookies(false)[0]).toMatch(
      /^dfe_token=; Domain=example\.com; Path=\/;/,
    );
  });
});
