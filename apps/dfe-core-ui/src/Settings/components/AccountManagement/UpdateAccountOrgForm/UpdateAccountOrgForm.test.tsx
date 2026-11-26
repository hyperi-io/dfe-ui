import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TAccountDetailResponse } from '@/Settings/hooks/accounts/useFetchAccountDetail/types';
import { TAccountUpdateRequestBody } from '@/Settings/hooks/accounts/useUpdateAccount/types';
import { render, screen, waitFor } from '@testing-library/react';
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
import { UpdateAccountOrgForm } from '.';

// The group picker reads RBAC and the groups list, and the organisation rules depend on neither.
vi.mock('@/core/components/AccountGroupSelect', () => ({
  AccountGroupSelect: () => null,
}));

const ORGS = {
  items: [
    {
      name: 'acme',
      display_name: 'Acme',
      org_ids: ['acme'],
      enabled: true,
      created_at: 'string',
      updated_at: 'string',
    },
    {
      name: 'globex',
      display_name: 'Globex',
      org_ids: ['globex'],
      enabled: true,
      created_at: 'string',
      updated_at: 'string',
    },
  ],
  total_size: 2,
  next_page_token: null,
};

const server = setupServer(
  API_CONFIG_MOCKS.accounts.me.get.success(),
  API_CONFIG_MOCKS.orgs.default.get.success({ mockedResponse: ORGS }),
  API_CONFIG_MOCKS.system.organisation.get.success({
    mockedResponse: { name: 'hyperi', display_name: 'HyperI' },
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const kim = (org: string, groups: string[]): TAccountDetailResponse => ({
  username: 'kim',
  oidc_id: '',
  oidc_type: '',
  admin: false,
  org_display_name: '',
  org_enabled: true,
  enabled: true,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
  external: false,
  email_verified: true,
  identities: [],
  password_change_required: false,
  groups,
  email: 'kim@example.test',
  phone: '',
  name: 'Kim',
  org,
  created_at: 'string',
  updated_at: 'string',
  last_login_at: '',
});

const renderForm = (stored: { groups: string[]; org: string }) => {
  const onFinish = vi.fn<(values: TAccountUpdateRequestBody) => void>();
  server.use(
    API_CONFIG_MOCKS.accounts.account.get.success({
      mockedResponse: kim(stored.org, stored.groups),
      username: 'kim',
    }),
  );
  render(
    <UpdateAccountOrgForm
      error={null}
      isPending={false}
      onFinish={onFinish}
      username="kim"
    />,
    { wrapper },
  );
  return { onFinish, user: userEvent.setup() };
};

const pickCustomer = async (
  user: ReturnType<typeof userEvent.setup>,
  title: string,
) => {
  await user.click(
    await screen.findByRole('radio', { name: 'Customer organisation' }),
  );
  await user.click(screen.getByRole('combobox', { name: 'Organisation name' }));
  await user.click(await screen.findByTitle(title));
};

describe('UpdateAccountOrgForm', () => {
  test.each([
    {
      name: 'a root account stays root and keeps its groups',
      stored: { org: '', groups: ['sys-analysts'] },
      expected: { org: '', groups: ['sys-analysts'] },
    },
    {
      name: 'an org admin keeps its org and role',
      stored: { org: 'acme', groups: ['acme-admins'] },
      expected: { org: 'acme', groups: ['acme-admins'] },
    },
    {
      name: 'an account of your org keeps its groups',
      stored: { org: 'hyperi', groups: ['sys-analysts'] },
      expected: { org: 'hyperi', groups: ['sys-analysts'] },
    },
  ])('$name', async ({ expected, stored }) => {
    const { onFinish, user } = renderForm(stored);

    await screen.findByRole('radio', { name: /^Your organisation/ });
    await user.click(
      screen.getByRole('button', { name: 'Update Organisation' }),
    );

    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onFinish.mock.calls[0]?.[0]).toEqual(expected);
  });

  test.each([
    {
      name: 'a root account moves to the picked org as a viewer once confirmed',
      stored: { org: '', groups: ['sys-analysts'] },
      role: '',
      expected: { org: 'globex', groups: ['globex-viewers'] },
    },
    {
      name: 'a root account moves to the picked org as an admin once confirmed',
      stored: { org: '', groups: [] },
      role: 'Admin',
      expected: { org: 'globex', groups: ['globex-admins'] },
    },
  ])('$name', async ({ expected, role, stored }) => {
    const { onFinish, user } = renderForm(stored);

    await pickCustomer(user, 'Globex');
    if (role) {
      await user.click(await screen.findByRole('radio', { name: role }));
    }
    await user.click(
      screen.getByRole('button', { name: 'Update Organisation' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Move account' }),
    );

    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onFinish.mock.calls[0]?.[0]).toEqual(expected);
  });

  test('a move names both organisations and the groups it leaves, and saves nothing until confirmed', async () => {
    const { onFinish, user } = renderForm({
      org: '',
      groups: ['sys-analysts'],
    });

    await pickCustomer(user, 'Globex');
    await user.click(
      screen.getByRole('button', { name: 'Update Organisation' }),
    );

    expect(
      await screen.findByText('Move kim from your organisation to globex?'),
    ).toBeInTheDocument();
    expect(screen.getByText('It leaves sys-analysts.')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });
});
