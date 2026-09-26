import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const Layout = (await import('@/app/(no-auth)/setup/layout')).default;

const getServerSession = vi.mocked(
  (await import('next-auth')).getServerSession,
);
const redirect = vi.mocked((await import('next/navigation')).redirect);

describe('Layout (setup)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('redirects to /login when there is no session', async () => {
    // The wizard's every step posts to the engine as the signed-in operator, so
    // an anonymous render would only produce forms that 401 (dfe-ui#206).
    getServerSession.mockResolvedValue(null);

    try {
      await Layout({ children: <div>Wizard</div> });
    } catch {
      // redirect() throws in Next.js - ignore
    }

    expect(redirect).toHaveBeenCalledWith('/login?callbackUrl=%2Fsetup');
  });

  test('redirects to /login when the session carries no engine token', async () => {
    getServerSession.mockResolvedValue({
      user: { name: 'test', email: 'test@example.com' },
      expires: '2025-12-31',
    });

    try {
      await Layout({ children: <div>Wizard</div> });
    } catch {
      // redirect() throws in Next.js - ignore
    }

    expect(redirect).toHaveBeenCalledWith('/login?callbackUrl=%2Fsetup');
  });

  test('redirects to /login when the engine token has expired', async () => {
    // The login page sends a session here on the same predicate. A weaker one
    // on this side and the pair bounce the operator between the two routes.
    getServerSession.mockResolvedValue({
      user: {
        name: 'test',
        email: 'test@example.com',
        accessToken: 'expired',
      },
      expires: '2025-12-31',
      error: 'AccessTokenExpired',
    });

    try {
      await Layout({ children: <div>Wizard</div> });
    } catch {
      // redirect() throws in Next.js - ignore
    }

    expect(redirect).toHaveBeenCalledWith('/login?callbackUrl=%2Fsetup');
  });

  test('sends a session on an issued password to the change screen first', async () => {
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
      await Layout({ children: <div>Wizard</div> });
    } catch {
      // redirect() throws in Next.js - ignore
    }

    expect(redirect).toHaveBeenCalledWith('/change-password');
  });

  test('renders the wizard for an authenticated operator', async () => {
    getServerSession.mockResolvedValue({
      user: {
        name: 'test',
        email: 'test@example.com',
        accessToken: 'valid-token',
      },
      expires: '2025-12-31',
    });

    render(await Layout({ children: <div>Wizard</div> }));

    expect(screen.getByText('Wizard')).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});
