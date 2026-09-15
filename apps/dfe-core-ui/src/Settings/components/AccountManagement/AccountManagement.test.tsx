import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TAccountsResponse } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
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
import { AccountManagement } from '.';
import { server } from './AccountManagement.mocks';

// The account list observes a sentinel row to page; jsdom has no observer.
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const accounts = (): TAccountsResponse => ({
  items: [
    {
      username: 'admin',
      enabled: false,
      groups: ['dfe-admins'],
      created_at: 'string',
      updated_at: 'string',
      email: 'string',
      phone: 'string',
      name: 'string',
    },
    {
      username: 'alice',
      enabled: true,
      groups: ['dfe-admins'],
      created_at: 'string',
      updated_at: 'string',
      email: 'string',
      phone: 'string',
      name: 'string',
    },
  ],
  total: 2,
  page: 1,
  per_page: 10,
  total_pages: 1,
  next_page: 1,
  prev_page: 1,
});

const setupStatus = (
  overrides: Partial<TFetchSetupStatusResponse>,
): TFetchSetupStatusResponse => ({
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
  ...overrides,
});

describe('AccountManagement', () => {
  test('marks the retired bootstrap admin as retired, not merely inactive', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.default.get.success({
        mockedResponse: accounts(),
      }),
      API_CONFIG_MOCKS.auth.setupStatus.get.success({
        mockedResponse: setupStatus({ admin_retired: true }),
      }),
    );

    render(<AccountManagement />, { wrapper });

    expect(await screen.findByText('Retired')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
  });

  test('a disabled account is only inactive while the admin is not retired', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.default.get.success({
        mockedResponse: accounts(),
      }),
      API_CONFIG_MOCKS.auth.setupStatus.get.success({
        mockedResponse: setupStatus({ admin_retired: false }),
      }),
    );

    render(<AccountManagement />, { wrapper });

    expect(await screen.findByText('Inactive')).toBeInTheDocument();
    expect(screen.queryByText('Retired')).not.toBeInTheDocument();
  });
});
