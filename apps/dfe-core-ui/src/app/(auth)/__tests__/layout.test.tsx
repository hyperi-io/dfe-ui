import Layout from '@/app/(auth)/layout';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { wrapper: ThemeWrapper } = buildTestWrapper().withTheme();

const getServerSession = vi.mocked(
  (await import('next-auth')).getServerSession,
);
const redirect = vi.mocked((await import('next/navigation')).redirect);

describe('Layout (auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  test('renders children when user is authenticated', async () => {
    getServerSession.mockResolvedValue({
      user: { name: 'test', email: 'test@example.com' },
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
