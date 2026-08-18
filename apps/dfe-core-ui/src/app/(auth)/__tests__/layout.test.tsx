import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/core/server/actions/getSetupStatus', () => ({
  getSetupStatus: vi.fn(),
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
};

describe('Layout (auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSetupStatus.mockResolvedValue(setupComplete);
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

  test('redirects to /setup when initial setup is required and user is not authenticated', async () => {
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
    });
    getServerSession.mockResolvedValue(null);

    try {
      await Layout({ children: <div>Child</div> });
    } catch {
      // redirect() throws in Next.js - ignore
    }

    expect(redirect).toHaveBeenCalledWith('/setup');
  });

  test('redirects to /login when user is not authenticated', async () => {
    getServerSession.mockResolvedValue(null);

    try {
      const element = await Layout({ children: <div>Child</div> });
      render(element);
    } catch {
      // redirect() throws in Next.js - ignore
    }

    expect(redirect).toHaveBeenCalledWith('/login');
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

    expect(redirect).toHaveBeenCalledWith('/login');
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

    expect(redirect).toHaveBeenCalledWith('/login');
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
