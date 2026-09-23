import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { TCurrentUserResponse } from '@/core/hooks/useFetchCurrentUser/types';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { UserActionsPopoverContent } from '.';
import { server } from './UserActionsPopoverContent.mocks';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useRouter: () => ({ push: vi.fn() }),
}));

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const OIDC_SUBJECT = '00u15mxs3ecygt7oj698';

const authMe = (userId: string): TAuthMeResponse => ({
  org_id: 'default',
  user_id: userId,
  roles: ['viewer'],
  permissions: [],
  groups: [],
  external: false,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
});

const account = (
  overrides: Partial<TCurrentUserResponse>,
): TCurrentUserResponse => ({
  username: OIDC_SUBJECT,
  enabled: true,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
  external: false,
  groups: [],
  email: '',
  phone: '',
  name: '',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
  external: overrides.external ?? false,
});

const definitionFor = (term: string) =>
  screen.getByText(term).nextElementSibling;

describe('UserActionsPopoverContent', () => {
  test('shows the account name and email while keeping the user ID', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.me.get.success({
        mockedResponse: authMe(OIDC_SUBJECT),
      }),
      API_CONFIG_MOCKS.accounts.me.get.success({
        mockedResponse: account({
          name: 'DFE dfe-test',
          email: 'dfe-test@dfe-oidc.test',
        }),
      }),
    );

    render(<UserActionsPopoverContent />, { wrapper });

    expect(await screen.findByText('DFE dfe-test')).toBeInTheDocument();
    expect(await screen.findByText('Permissions:')).toBeInTheDocument();
    expect(definitionFor('Name:')).toHaveTextContent('DFE dfe-test');
    expect(definitionFor('Email:')).toHaveTextContent('dfe-test@dfe-oidc.test');
    expect(definitionFor('User ID:')).toHaveTextContent(OIDC_SUBJECT);
  });

  test('falls back to the username and omits the email for a local account without either', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.me.get.success({ mockedResponse: authMe('admin') }),
      API_CONFIG_MOCKS.accounts.me.get.success({
        mockedResponse: account({ username: 'admin', name: ' ', email: '' }),
      }),
    );

    render(<UserActionsPopoverContent />, { wrapper });

    expect(await screen.findByText('Name:')).toBeInTheDocument();
    expect(await screen.findByText('Permissions:')).toBeInTheDocument();
    expect(definitionFor('Name:')).toHaveTextContent('admin');
    expect(definitionFor('User ID:')).toHaveTextContent('admin');
    expect(screen.queryByText('Email:')).not.toBeInTheDocument();
  });
});
