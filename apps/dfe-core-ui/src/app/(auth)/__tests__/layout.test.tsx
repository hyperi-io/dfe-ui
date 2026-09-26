import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { LOGIN_CALLBACK_PATH_HEADER } from '@/core/config/loginCallback';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/core/server/actions/getSetupStatus', () => ({
  getSetupStatus: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

const Layout = (await import('@/app/(auth)/layout')).default;

const { wrapper: ThemeWrapper } = buildTestWrapper()
  .withTheme()
  .withReactQuery();

const getServerSession = vi.mocked(
  (await import('next-auth')).getServerSession,
);
const redirect = vi.mocked((await import('next/navigation')).redirect);

const getSetupStatus = vi.mocked(
  (await import('@/core/server/actions/getSetupStatus')).getSetupStatus,
);
const headers = vi.mocked((await import('next/headers')).headers);

const setupComplete: Awaited<ReturnType<typeof getSetupStatus>> = {
  initial_setup: {
    complete: true,
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
};

describe('Layout (auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSetupStatus.mockResolvedValue(setupComplete);
    headers.mockResolvedValue(new Headers());
  });

  test('redirects to /setup when initial setup is required', async () => {
    getSetupStatus.mockResolvedValue({
      initial_setup: {
        complete: false,
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
    getServerSession.mockResolvedValue({
      user: {
        name: 'test',
        email: 'test@example.com',
        accessToken: 'valid-token',
      },
      expires: '2025-12-31',
    });

    try {
      await Layout({ children: <div>Child</div> });
    } catch {
      // redirect() throws in Next.js - ignore
    }

    expect(redirect).toHaveBeenCalledWith('/setup');
  });

  test('redirects to /login, not /setup, when setup is required and the user is not authenticated', async () => {
    // The wizard's every call is an authenticated engine call, so handing it to
    // an anonymous visitor produces a form that 401s on submit (dfe-ui#206).
    getSetupStatus.mockResolvedValue({
      initial_setup: {
        complete: false,
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
    getServerSession.mockResolvedValue(null);

    try {
      await Layout({ children: <div>Child</div> });
    } catch {
      // redirect() throws in Next.js - ignore
    }

    // The first call is the assertion: redirect() throws in Next.js, so the
    // real request stops there, where the mocked one runs on to the /setup
    // branch below it.
    expect(redirect.mock.calls[0]).toEqual(['/login?callbackUrl=%2F']);
  });

  test('redirects to /login when user is not authenticated', async () => {
    getServerSession.mockResolvedValue(null);

    try {
      const element = await Layout({ children: <div>Child</div> });
      render(element);
    } catch {
      // redirect() throws in Next.js - ignore
    }

    expect(redirect).toHaveBeenCalledWith('/login?callbackUrl=%2F');
  });

  test('redirects to login with callback URL including search params', async () => {
    headers.mockResolvedValue(
      new Headers({
        [LOGIN_CALLBACK_PATH_HEADER]: '/rules?name=foo',
      }),
    );
    getServerSession.mockResolvedValue(null);

    try {
      await Layout({ children: <div>Child</div> });
    } catch {
      // redirect() throws in Next.js - ignore
    }

    expect(redirect).toHaveBeenCalledWith(
      '/login?callbackUrl=%2Frules%3Fname%3Dfoo',
    );
  });

  test('redirects to /login when access token is missing', async () => {
    getServerSession.mockResolvedValue({
      user: { name: 'test', email: 'test@example.com' },
      expires: '2025-12-31',
    });

    try {
      await Layout({ children: <div>Child</div> });
    } catch {
      // redirect() throws in Next.js - ignore
    }

    expect(redirect).toHaveBeenCalledWith('/login?callbackUrl=%2F');
  });

  test('redirects to /login when the access token has expired (cannot be refreshed)', async () => {
    // An expired engine token cannot be refreshed (the engine's /auth/refresh
    // needs a still-valid one), so the layout must redirect rather than render a
    // page whose every API call 401s.
    getServerSession.mockResolvedValue({
      user: {
        name: 'test',
        email: 'test@example.com',
        accessToken: 'expired',
      },
      expires: '2025-12-31',
      error: 'AccessTokenExpired',
      accessTokenExpiresAt: Date.now() - 1000,
    });

    try {
      await Layout({ children: <div>Dashboard content</div> });
    } catch {
      // redirect() throws in Next.js - ignore
    }

    expect(redirect).toHaveBeenCalledWith('/login?callbackUrl=%2F');
  });

  test('redirects to the change screen, not the wizard, while the password is still the issued one', async () => {
    getSetupStatus.mockResolvedValue({
      ...setupComplete,
      initial_setup: { ...setupComplete.initial_setup, complete: false },
    });
    getServerSession.mockResolvedValue({
      user: {
        name: 'admin',
        email: 'admin@example.com',
        accessToken: 'valid-token',
      },
      expires: '2025-12-31',
      passwordChangeRequired: true,
    });

    try {
      await Layout({ children: <div>Dashboard content</div> });
    } catch {
      // redirect() throws in Next.js - ignore
    }

    // The first call is the one that counts: the real redirect() stops the render there.
    expect(redirect.mock.calls[0]).toEqual(['/change-password']);
  });

  test('renders children when user is authenticated', async () => {
    getServerSession.mockResolvedValue({
      user: {
        name: 'test',
        email: 'test@example.com',
        accessToken: 'valid-token',
      },
      expires: '2025-12-31',
    });

    const element = await Layout({
      children: <div>Dashboard content</div>,
    });
    render(<ThemeWrapper>{element}</ThemeWrapper>);

    expect(screen.getByText('Dashboard content')).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});
