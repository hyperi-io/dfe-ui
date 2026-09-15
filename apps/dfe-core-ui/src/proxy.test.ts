/** @vitest-environment node */

import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';

const { authMiddleware, getSetupStatus } = vi.hoisted(() => ({
  authMiddleware: vi.fn(),
  getSetupStatus: vi.fn(),
}));

vi.mock('next-auth/middleware', () => ({
  withAuth: () => authMiddleware,
}));

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn().mockResolvedValue(null),
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

  test('bounces a proxy-trust arrival to /login so the gate can mint its session', async () => {
    vi.stubEnv('DFE_AUTH_MODE', 'proxy');
    getSetupStatus.mockResolvedValue(setupStatus(false));

    const response = await proxy(
      request('/', 'dfe_token=engine-jwt'),
      undefined as never,
    );

    expect(response.headers.get('location')).toBe(
      'http://localhost/login?callbackUrl=%2F',
    );
  });

  test('defers to withAuth when initial setup is complete', async () => {
    await proxy(request('/sources'), undefined as never);

    expect(authMiddleware).toHaveBeenCalled();
  });
});
