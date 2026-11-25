import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { signedInAs } from '@/core/components/OrgChoiceFormItem/OrgChoiceFormItem.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useAuthStore } from '@/core/stores/authStore';
import { confirmReauth } from '@/core/utils/test-utils/confirmReauth';
import { expectLabelTooltip } from '@/core/utils/test-utils/expectLabelTooltip';
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
  org_enabled: true,
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
  last_login_at: '',
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
  return {
    reset: await screen.findByRole('button', { name: 'Reset Password' }),
    user,
  };
};

describe('EditAccountDrawer username', () => {
  test("says in the ? beside its label that a username can't be changed", async () => {
    const { user } = await openDrawer('kim');

    await user.hover(screen.getByLabelText(/^Username/));
    await expect(
      screen.findByText("Usernames can't be changed", {}, { timeout: 500 }),
    ).rejects.toThrow();
    await expectLabelTooltip(user, 'Username', "Usernames can't be changed");
  });
});

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
  test('opens without a password prompt', async () => {
    await openDrawer('bob');

    expect(screen.queryByText("Confirm it's you")).not.toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Update Account' }),
    ).toBeInTheDocument();
  });

  test('asks for the password when the engine says the save needs it, then retries with the grant', async () => {
    const sent: (string | null)[] = [];
    server.use(
      http.put(
        API_CONFIG_MOCKS.accounts.account.mockedUrl.replace(
          '{username}',
          'bob',
        ),
        ({ request }) => {
          const grant = request.headers.get('X-DFE-Reauth');
          sent.push(grant);
          return grant
            ? HttpResponse.json(account('bob', false))
            : HttpResponse.json(
                {
                  title: 'Forbidden',
                  code: 'reauth_required',
                  detail: 'Confirm it is you',
                },
                { status: 403 },
              );
        },
      ),
    );
    const { user } = await openDrawer('bob');

    await user.click(
      await screen.findByRole('button', { name: 'Update Account' }),
    );
    await confirmReauth(user);

    await waitFor(() => expect(sent).toEqual([null, 'reauth-grant']));
  });
});
