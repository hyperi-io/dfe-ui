import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
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
import { SettingsActionPopoverContent } from '.';
import { server } from './SettingsActionPopoverContent.mocks';

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

const account = (
  overrides: Partial<TCurrentUserResponse>,
): TCurrentUserResponse => ({
  username: OIDC_SUBJECT,
  oidc_id: 'string',
  enabled: true,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
  external: false,
  password_change_required: false,
  groups: [],
  email: '',
  phone: '',
  name: '',
  org: '',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('SettingsActionPopoverContent', () => {
  test('shows the account name and email while keeping the user ID', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.me.get.success({
        mockedResponse: account({
          name: 'DFE dfe-test',
          email: 'dfe-test@dfe-oidc.test',
        }),
      }),
    );

    render(<SettingsActionPopoverContent />, { wrapper });

    expect(await screen.findByText('DFE dfe-test')).toBeInTheDocument();
    expect(screen.getByText('dfe-test@dfe-oidc.test')).toBeInTheDocument();
  });
});
