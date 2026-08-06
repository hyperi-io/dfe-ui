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
  setup_complete: true,
  initial_setup_required: false,
  pending_steps: [],
  completed_steps: ['organisations', 'admin_password'],
};

describe('Layout (auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSetupStatus.mockResolvedValue(setupComplete);
  });

  test('redirects to /setup when initial setup is required', async () => {
    getSetupStatus.mockResolvedValue({
      setup_complete: false,
      initial_setup_required: true,
      pending_steps: ['organisations'],
      completed_steps: [],
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
      setup_complete: false,
      initial_setup_required: true,
      pending_steps: ['organisations'],
      completed_steps: [],
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

  test('renders children when access token expired but refresh may run on client', async () => {
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

    const element = await Layout({
      children: <div>Dashboard content</div>,
    });
    render(<ThemeWrapper>{element}</ThemeWrapper>);

    expect(screen.getByText('Dashboard content')).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
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
