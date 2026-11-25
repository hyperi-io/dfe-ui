import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  TAccountsItemSummary,
  TAccountsResponse,
} from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
import { render, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
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
import { FilteredAccounts } from '.';

vi.mock('@/core/components/RbacProtected/hooks/useRbac', () => ({
  useRbac: () => ({ isAuthorized: true, isLoading: false, isError: false }),
}));

const server = setupServer();
const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const page = (
  username: string,
  account: Partial<TAccountsItemSummary> = {},
): TAccountsResponse => ({
  items: [
    {
      username,
      enabled: true,
      blocked: false,
      disabled_at: '',
      blocked_at: '',
      external: false,
      email_verified: false,
      identities: [],
      password_change_required: false,
      groups: [],
      created_at: '',
      updated_at: '',
      last_login_at: '',
      email: '',
      phone: '',
      name: '',
      org: 'acme',
      org_enabled: true,
      oidc_id: '',
      oidc_type: '',
      admin: false,
      org_display_name: 'Acme',
      ...account,
    },
  ],
  total_size: 1,
  next_page_token: null,
});

describe('FilteredAccounts', () => {
  test.each([
    { filter: { org: 'acme' }, expected: { org: 'acme' } },
    {
      filter: { blocked: false, oidc_id: 'okta' },
      expected: { blocked: 'false', oidc_id: 'okta' },
    },
  ])('lists the accounts $filter selects', async ({ filter, expected }) => {
    const asked: Record<string, string>[] = [];
    server.use(
      API_CONFIG_MOCKS.system.organisation.get.success(),
      API_CONFIG_MOCKS.auth.setupStatus.get.success(),
      http.get('/api/v1/auth/accounts', ({ request }) => {
        asked.push(
          Object.fromEntries(new URL(request.url).searchParams.entries()),
        );
        return HttpResponse.json(page('ida'));
      }),
    );

    render(<FilteredAccounts filter={filter} />, { wrapper });

    expect(await screen.findByText('ida')).toBeInTheDocument();
    expect(asked[0]).toMatchObject(expected);
    expect(
      screen.queryByRole('link', { name: 'Manage users' }),
    ).not.toBeInTheDocument();
  });

  test('links to where the accounts are edited', async () => {
    server.use(
      API_CONFIG_MOCKS.system.organisation.get.success(),
      API_CONFIG_MOCKS.auth.setupStatus.get.success(),
      http.get('/api/v1/auth/accounts', () => HttpResponse.json(page('ida'))),
    );

    render(
      <FilteredAccounts
        filter={{ org: 'acme' }}
        manageHref="/settings/admin/account-management?org=acme"
      />,
      { wrapper },
    );

    expect(
      await screen.findByRole('link', { name: 'Manage users' }),
    ).toHaveAttribute('href', '/settings/admin/account-management?org=acme');
    expect(screen.getByPlaceholderText('Search users')).toBeInTheDocument();
  });

  test.each([
    {
      filter: { oidc_id: 'okta' },
      account: {},
      columns: ['Org', 'User', 'Username', 'Groups', 'Status'],
      cell: null,
    },
    {
      filter: { org: 'acme' },
      account: {},
      columns: ['User', 'Username', 'Groups', 'Status'],
      cell: null,
    },
    {
      filter: { org: 'globex' },
      account: { org: 'globex', groups: ['globex-admins'] },
      columns: ['User', 'Username', 'Role', 'Status'],
      cell: 'Admin',
    },
    {
      filter: { org: 'globex' },
      account: { org: 'globex', groups: ['globex-viewers'] },
      columns: ['User', 'Username', 'Role', 'Status'],
      cell: 'Viewer',
    },
  ])(
    'shows $columns for $filter',
    async ({ filter, account, columns, cell }) => {
      server.use(
        API_CONFIG_MOCKS.system.organisation.get.success(),
        API_CONFIG_MOCKS.auth.setupStatus.get.success(),
        http.get('/api/v1/auth/accounts', () =>
          HttpResponse.json(page('ida', account)),
        ),
      );

      render(<FilteredAccounts filter={filter} />, { wrapper });

      const row = (await screen.findByText('ida')).closest('tr');
      await screen.findByRole('columnheader', { name: columns[2] });
      const headers = screen
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
        .filter(Boolean);
      expect(headers).toEqual(columns);
      if (cell && row) {
        expect(within(row).getByText(cell)).toBeInTheDocument();
      }
    },
  );
});
