import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TAccountsResponse } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
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
      blocked: false,
      disabled_at: '',
      blocked_at: '',
      external: false,
      email_verified: false,
      identities: [],
      password_change_required: false,
      groups: ['dfe-admins'],
      created_at: 'string',
      updated_at: 'string',
      email: 'string',
      phone: 'string',
      name: 'string',
      org: '',
      oidc_id: 'string',
      oidc_type: 'string',
      admin: false,
      org_display_name: '',
    },
    {
      username: 'alice',
      enabled: true,
      blocked: false,
      disabled_at: '',
      blocked_at: '',
      external: false,
      email_verified: false,
      identities: [],
      password_change_required: false,
      groups: ['dfe-admins'],
      created_at: 'string',
      updated_at: 'string',
      email: 'string',
      phone: 'string',
      name: 'string',
      org: '',
      oidc_id: 'string',
      oidc_type: 'string',
      admin: false,
      org_display_name: '',
    },
  ],
  total_size: 2,
  next_page_token: null,
});

// The page loads the open list and the blocked list from the same endpoint.
// A blocked query is a different set of accounts, so it must not repeat the
// open-list rows the assertions look up by name.
const accountsHandler = (body: TAccountsResponse) =>
  http.get(API_CONFIG_MOCKS.accounts.default.mockedUrl, ({ request }) => {
    const blocked = new URL(request.url).searchParams.get('blocked') === 'true';
    return HttpResponse.json(blocked ? { ...body, items: [], total: 0 } : body);
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
      accountsHandler(accounts()),
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
      accountsHandler(accounts()),
      API_CONFIG_MOCKS.auth.setupStatus.get.success({
        mockedResponse: setupStatus({ admin_retired: false }),
      }),
    );

    render(<AccountManagement />, { wrapper });

    expect(await screen.findByText('Inactive')).toBeInTheDocument();
    expect(screen.queryByText('Retired')).not.toBeInTheDocument();
  });

  test('leads with the org and stacks the email under the name', async () => {
    server.use(
      accountsHandler({
        ...accounts(),
        items: [
          {
            username: '00u15mxs3ecygt7oj698',
            enabled: true,
            groups: [],
            created_at: 'string',
            updated_at: 'string',
            email: 'dfe-test@dfe-oidc.test',
            phone: '',
            name: 'DFE dfe-test',
            org: 'acme',
            org_display_name: 'Acme',
            oidc_id: 'string',
            oidc_type: 'string',
            admin: false,
            external: false,
            email_verified: false,
            identities: [],
            password_change_required: false,
            blocked: false,
            disabled_at: '',
            blocked_at: '',
          },
          {
            username: 'admin',
            enabled: true,
            groups: ['dfe-admins'],
            created_at: 'string',
            updated_at: 'string',
            email: '',
            phone: '',
            name: '',
            org: '',
            oidc_id: 'string',
            oidc_type: 'string',
            admin: false,
            org_display_name: 'HyperI',
            external: false,
            email_verified: false,
            identities: [],
            password_change_required: false,
            blocked: false,
            disabled_at: '',
            blocked_at: '',
          },
        ],
      }),
    );

    render(<AccountManagement />, { wrapper });

    const oidcRow = await screen.findByRole('row', { name: /DFE dfe-test/ });
    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual(['Org', 'User', 'Username', 'Groups', 'Status', 'Actions']);
    const userCell = within(oidcRow).getByRole('cell', {
      name: /^DFE dfe-test/,
    });
    expect(
      within(userCell).getByText('dfe-test@dfe-oidc.test'),
    ).toBeInTheDocument();
    expect(
      within(oidcRow).getByText('00u15mxs3ecygt7oj698'),
    ).toBeInTheDocument();

    const localRow = screen.getByRole('row', { name: /admin/ });
    expect(within(localRow).getAllByText('None')).toHaveLength(1);
    // Your organisation's tag waits for its name, so the cells settle once it arrives.
    await waitFor(() =>
      expect(
        [oidcRow, localRow].map(
          (row) => within(row).getAllByRole('cell')[0]?.textContent,
        ),
      ).toEqual(['Acme', 'HyperI (your organisation)']),
    );
  });

  test('marks your organisation, root accounts included', async () => {
    const [, base] = accounts().items;
    server.use(
      accountsHandler({
        ...accounts(),
        items: [
          {
            ...base,
            username: 'root-kim',
            org: '',
            org_display_name: 'HyperI',
          },
          {
            ...base,
            username: 'bound-jo',
            org: 'hyperi',
            org_display_name: 'HyperI',
          },
          {
            ...base,
            username: 'acme-amy',
            org: 'acme',
            org_display_name: 'Acme',
          },
        ],
      }),
    );

    render(<AccountManagement />, { wrapper });

    const marked = async (username: string) =>
      within(
        await screen.findByRole('row', { name: new RegExp(username) }),
      ).queryAllByText('(your organisation)').length;
    await waitFor(async () => expect(await marked('bound-jo')).toBe(1));
    expect({
      acme: await marked('acme-amy'),
      bound: await marked('bound-jo'),
      root: await marked('root-kim'),
    }).toEqual({ acme: 0, bound: 1, root: 1 });
  });

  test('crowns only the accounts holding the admin role', async () => {
    const [, base] = accounts().items;
    server.use(
      accountsHandler({
        ...accounts(),
        items: [
          { ...base, username: 'boss', name: 'Boss', admin: true },
          { ...base, username: 'worker', name: 'Worker', admin: false },
        ],
      }),
    );

    render(<AccountManagement />, { wrapper });

    // The crown sits inside the org tag, once your organisation's name has arrived.
    const crowned = (name: string) =>
      within(
        screen.getByRole('row', { name: new RegExp(name) }),
      ).queryAllByLabelText('Admin of every organisation').length;
    await screen.findByRole('row', { name: /Boss/ });
    await waitFor(() =>
      expect({ boss: crowned('Boss'), worker: crowned('Worker') }).toEqual({
        boss: 1,
        worker: 0,
      }),
    );
  });

  test('shows a badge beside the username for each identity provider that reaches the account', async () => {
    const [local, base] = accounts().items;
    server.use(
      accountsHandler({
        ...accounts(),
        items: [
          { ...base, username: 'local-only', external: false },
          {
            ...base,
            username: 'okta-owned',
            external: true,
            oidc_id: 'okta',
            oidc_type: 'okta',
            admin: false,
            org_display_name: '',
          },
          {
            ...local,
            username: 'linked-kaz',
            enabled: true,
            identities: [
              {
                email: 'kaz@example.test',
                key: 'corp-kaz',
                last_login_at: '',
                linked_at: '',
                provider: 'corp',
                provider_type: 'google',
                subject: 'corp-kaz',
              },
            ],
          },
        ],
      }),
    );

    render(<AccountManagement />, { wrapper });

    const providerBadges = (username: string) =>
      within(screen.getByRole('cell', { name: new RegExp(`^${username}`) }))
        .queryAllByRole('img', { name: /^Signs in through/ })
        .map((badge) => badge.getAttribute('aria-label'));
    await screen.findByRole('row', { name: /okta-owned/ });
    expect({
      local: providerBadges('local-only'),
      linked: providerBadges('linked-kaz'),
      owned: providerBadges('okta-owned'),
    }).toEqual({
      local: [],
      linked: ['Signs in through corp'],
      owned: ['Signs in through okta'],
    });
  });

  test("lists root accounts first, then only the chosen organisation's", async () => {
    const user = userEvent.setup();
    const requests: { org: string | null; order_by: string | null }[] = [];
    server.use(
      http.get(API_CONFIG_MOCKS.accounts.default.mockedUrl, ({ request }) => {
        const params = new URL(request.url).searchParams;
        if (params.get('blocked') !== 'true') {
          requests.push({
            org: params.get('org'),
            order_by: params.get('order_by'),
          });
        }
        return HttpResponse.json(accounts());
      }),
      API_CONFIG_MOCKS.orgs.default.get.success({
        mockedResponse: {
          items: [
            {
              name: 'acme',
              display_name: 'Acme',
              org_ids: ['acme'],
              enabled: true,
              created_at: 'string',
              updated_at: 'string',
            },
          ],
          total_size: 1,
          next_page_token: null,
        },
      }),
    );

    render(<AccountManagement />, { wrapper });

    await user.click(
      await screen.findByRole('combobox', { name: 'Filter by organisation' }),
    );
    await user.click(await screen.findByTitle('Acme'));
    await waitFor(() => expect(requests.at(-1)?.org).toBe('acme'));
    expect(requests[0]).toEqual({ org: null, order_by: 'org' });
  });
});
