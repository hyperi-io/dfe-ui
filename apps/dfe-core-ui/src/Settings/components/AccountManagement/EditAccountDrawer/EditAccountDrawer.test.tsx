import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { signedInAs } from '@/core/components/OrgChoiceFormItem/OrgChoiceFormItem.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TAccountDetailResponse } from '@/Settings/hooks/accounts/useFetchAccountDetail/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { EditAccountDrawer } from '.';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

const account = (
  username: string,
  external: boolean,
): TAccountDetailResponse => ({
  username,
  oidc_id: '',
  oidc_type: '',
  admin: false,
  org_display_name: '',
  enabled: true,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
  external,
  email_verified: true,
  identities: [],
  password_change_required: false,
  groups: [],
  email: `${username}@example.test`,
  phone: '',
  name: username,
  org: '',
  created_at: '',
  updated_at: '',
});

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  signedInAs(''),
  API_CONFIG_MOCKS.system.organisation.get.success({
    mockedResponse: { name: 'hyperi', display_name: 'HyperI' },
  }),
  API_CONFIG_MOCKS.auth.reauth.post.success(),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
  push.mockReset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

const openDrawer = async (username: string, external = false) => {
  server.use(
    API_CONFIG_MOCKS.accounts.account.get.success({
      mockedResponse: account(username, external),
      username,
    }),
  );
  const user = userEvent.setup();
  render(<EditAccountDrawer username={username} isExternal={external} />, {
    wrapper,
  });
  await user.click(
    await screen.findByRole('button', { name: `Edit ${username}` }),
  );
  await user.type(await screen.findByLabelText('Your password'), 'pw');
  await user.click(screen.getByRole('button', { name: 'Confirm' }));
  return {
    reset: await screen.findByRole('button', { name: 'Reset Password' }),
    user,
  };
};

describe('EditAccountDrawer reset password', () => {
  test('your own account goes to your profile to reset it', async () => {
    const { reset, user } = await openDrawer('admin');

    await user.click(reset);

    expect(push).toHaveBeenCalledWith('/account?reset_password=true');
  });

  test("an identity provider's account cannot be reset here", async () => {
    const { reset } = await openDrawer('ida', true);

    expect(reset).toBeDisabled();
  });

  test("another account's password is set in its own form", async () => {
    const { reset, user } = await openDrawer('bob');

    await user.click(reset);

    expect(
      await screen.findByText('Reset Password for bob'),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});

describe('EditAccountDrawer re-auth', () => {
  test('asks for the password before the drawer opens', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.account.get.success({
        mockedResponse: account('bob', false),
        username: 'bob',
      }),
    );
    const user = userEvent.setup();
    render(<EditAccountDrawer username="bob" isExternal={false} />, {
      wrapper,
    });

    await user.click(await screen.findByRole('button', { name: 'Edit bob' }));

    expect(await screen.findByText("Confirm it's you")).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Update Account' })).toBeNull();
  });

  test('sends the grant with the edit', async () => {
    const sent: (string | null)[] = [];
    server.use(
      http.put(
        API_CONFIG_MOCKS.accounts.account.mockedUrl.replace(
          '{username}',
          'bob',
        ),
        ({ request }) => {
          sent.push(request.headers.get('X-DFE-Reauth'));
          return HttpResponse.json(account('bob', false));
        },
      ),
    );
    const { user } = await openDrawer('bob');

    await user.click(
      await screen.findByRole('button', { name: 'Update Account' }),
    );

    await waitFor(() => expect(sent).toEqual(['reauth-grant']));
  });
});
