import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { UserProfile } from '.';

const searchParams = vi.hoisted(() => ({
  current: new URLSearchParams(),
}));
const replace = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams.current,
  usePathname: () => '/account',
  useRouter: () => ({ push: vi.fn(), replace }),
}));

const server = setupServer(API_CONFIG_MOCKS.accounts.me.get.success());

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  searchParams.current = new URLSearchParams();
  replace.mockReset();
  server.resetHandlers();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('UserProfile', () => {
  test('opens the reset password drawer when the page is opened with reset_password', async () => {
    searchParams.current = new URLSearchParams('reset_password=true');

    render(<UserProfile />, { wrapper });

    expect(
      await screen.findByRole('dialog', { name: 'Reset Password' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(replace).toHaveBeenCalledWith('/account');
    expect(
      screen.queryByRole('dialog', { name: 'Reset Password' }),
    ).not.toBeInTheDocument();
  });
});
