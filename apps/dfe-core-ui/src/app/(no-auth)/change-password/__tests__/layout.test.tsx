import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const Layout = (await import('@/app/(no-auth)/change-password/layout'))
  .default;

const getServerSession = vi.mocked(
  (await import('next-auth')).getServerSession,
);
const redirect = vi.mocked((await import('next/navigation')).redirect);

describe('Layout (change-password)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sends a visitor with no session to the login, and back here after', async () => {
    getServerSession.mockResolvedValue(null);

    try {
      await Layout({ children: <div>Change</div> });
    } catch {
      // redirect() throws in Next.js - ignore
    }

    expect(redirect).toHaveBeenCalledWith(
      '/login?callbackUrl=%2Fchange-password',
    );
  });

  test('renders the change screen for a signed-in account on an issued password', async () => {
    getServerSession.mockResolvedValue({
      user: {
        name: 'admin',
        email: 'admin@example.com',
        accessToken: 'valid-token',
      },
      expires: '2025-12-31',
      passwordChangeRequired: true,
    });

    render(await Layout({ children: <div>Change</div> }));

    expect(screen.getByText('Change')).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});
