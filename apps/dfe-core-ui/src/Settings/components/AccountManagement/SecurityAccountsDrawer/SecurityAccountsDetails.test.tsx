import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAccountResetPasswordResponse } from '@/core/hooks/useAccountResetPassword/types';
import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TAccountDetailResponse } from '@/Settings/hooks/accounts/useFetchAccountDetail/types';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { SecurityAccountsDetails } from './SecurityAccountsDetails';

const ACCOUNT_URL = API_CONFIG_MOCKS.accounts.account.mockedUrl;
const RESET_URL = API_CONFIG_MOCKS.accounts.resetPassword.mockedUrl;
const NEW_PASSWORD = 'a-new-Passw0rd-for-tests';
const BACKSTOP = { timeout: 15_000 };

const account = (
  username: string,
  overrides: Partial<TAccountDetailResponse> = {},
): TAccountDetailResponse => ({
  username,
  oidc_id: '',
  enabled: true,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
  external: false,
  password_change_required: false,
  groups: ['dfe-admins'],
  created_at: '2026-10-14T00:00:00Z',
  updated_at: '2026-10-14T00:00:00Z',
  email: `${username}@dfe.local`,
  phone: '',
  name: '',
  ...overrides,
});

const status = (
  overrides: Partial<TFetchSetupStatusResponse> = {},
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
  deploy_kind: 'kubernetes',
  credential_fetch_command: '',
  default_engine: 'MergeTree',
  default_ttl_days: 90,
  admin_username: 'admin',
  admin_retired: false,
  retire_admin_available: false,
  ...overrides,
});

const present = (detail: TAccountDetailResponse) =>
  http.get(ACCOUNT_URL.replace('{username}', detail.username), () =>
    HttpResponse.json(detail),
  );

const absent = (username: string) =>
  http.get(ACCOUNT_URL.replace('{username}', username), () =>
    HttpResponse.json(
      { code: 'not_found', message: `Account '${username}' not found` },
      { status: 404 },
    ),
  );

const setupStatus = (overrides: Partial<TFetchSetupStatusResponse> = {}) =>
  API_CONFIG_MOCKS.auth.setupStatus.get.success({
    mockedResponse: status(overrides),
  });

const resetAnswer = (
  username: string,
  git: TAccountResetPasswordResponse['git'],
  seen: { username: string; body: unknown }[] = [],
) =>
  http.post(RESET_URL.replace('{username}', username), async ({ request }) => {
    seen.push({ username, body: await request.json() });
    return HttpResponse.json({ message: 'password reset', git });
  });

const DIRECT_COMMIT = {
  enabled: true,
  auto_merge: false,
  committed: true,
  merged: true,
  pending: null,
};

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withReactQuery()
  .withTheme()
  .withWrapper(({ children }) => <App>{children}</App>);

// The SectionCard root holds both the account's details and its action.
const card = async (name: string) =>
  (await screen.findByText(`${name}@dfe.local`, {}, BACKSTOP)).closest(
    'div.mb-4',
  ) as HTMLElement;

const resetThrough = async (username: string) => {
  const user = userEvent.setup();
  const target = await card(username);
  await user.click(
    await within(target).findByRole(
      'button',
      { name: /Reset Password/ },
      BACKSTOP,
    ),
  );
  const dialog = await screen.findByRole('dialog', {}, BACKSTOP);
  await user.type(within(dialog).getByLabelText('New Password'), NEW_PASSWORD);
  await user.type(
    within(dialog).getByLabelText('Confirm Password'),
    NEW_PASSWORD,
  );
  await user.click(
    within(dialog).getByRole('button', { name: /Reset Password/ }),
  );
  return dialog;
};

describe('SecurityAccountsDetails', () => {
  test('a gitops deployment lists both accounts, each with Reset Password and nothing else', async () => {
    server.use(
      setupStatus(),
      present(account('admin')),
      present(account('breakglass')),
    );

    render(<SecurityAccountsDetails />, { wrapper });

    for (const name of ['admin', 'breakglass']) {
      const target = await card(name);
      expect(
        await within(target).findByRole(
          'button',
          { name: /Reset Password/ },
          BACKSTOP,
        ),
      ).toBeEnabled();
    }
    expect(screen.queryByRole('button', { name: /Rotate/ })).toBeNull();
  });

  test('without gitops it lists the admin alone, with no error and no empty notice', async () => {
    server.use(setupStatus(), present(account('admin')), absent('breakglass'));

    render(<SecurityAccountsDetails />, { wrapper });

    await card('admin');
    await waitFor(() =>
      expect(screen.queryByText('Loading security accounts...')).toBeNull(),
    );
    expect(screen.queryByText('breakglass@dfe.local')).toBeNull();
    expect(screen.queryByText(/no admin or break-glass account/)).toBeNull();
    expect(screen.queryByText(/not found/)).toBeNull();
  });

  test('finds a renamed admin by the name the engine gives', async () => {
    server.use(
      setupStatus({ admin_username: 'installer' }),
      present(account('installer')),
      absent('breakglass'),
    );

    render(<SecurityAccountsDetails />, { wrapper });

    expect(await card('installer')).toBeTruthy();
  });

  test('a retired admin stays listed, marked Retired, with the reset disabled', async () => {
    server.use(
      setupStatus({ admin_retired: true }),
      present(account('admin', { enabled: false })),
      present(account('breakglass')),
    );

    render(<SecurityAccountsDetails />, { wrapper });

    const target = await card('admin');
    expect(within(target).getByText('Retired')).toBeInTheDocument();
    expect(
      within(target).getByRole('button', { name: /Reset Password/ }),
    ).toBeDisabled();
    expect(
      within(await card('breakglass')).getByRole('button', {
        name: /Reset Password/,
      }),
    ).toBeEnabled();
  });

  test('never comes up empty: with neither account it says how to get one back', async () => {
    server.use(setupStatus(), absent('admin'), absent('breakglass'));

    render(<SecurityAccountsDetails />, { wrapper });

    expect(
      await screen.findByText(
        'This deployment has no admin or break-glass account',
        {},
        BACKSTOP,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/set DFE_AUTH_LOCAL_ADMIN_PASSWORD for the engine/),
    ).toBeInTheDocument();
  });

  test('an engine failure is shown rather than an empty panel', async () => {
    server.use(
      setupStatus(),
      http.get(ACCOUNT_URL.replace('{username}', 'admin'), () =>
        HttpResponse.json(
          { code: 'internal', message: 'The account store is unreachable.' },
          { status: 500 },
        ),
      ),
      absent('breakglass'),
    );

    render(<SecurityAccountsDetails />, { wrapper });

    expect(
      await screen.findByText(
        'The account store is unreachable.',
        {},
        BACKSTOP,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/no admin or break-glass account/)).toBeNull();
  });

  test.each(['admin', 'breakglass'])(
    'resets %s through its own reset endpoint and closes once committed',
    async (username) => {
      const seen: { username: string; body: unknown }[] = [];
      server.use(
        setupStatus(),
        present(account('admin')),
        present(account('breakglass')),
        resetAnswer(username, DIRECT_COMMIT, seen),
      );

      render(<SecurityAccountsDetails />, { wrapper });
      await resetThrough(username);

      await waitFor(
        () =>
          expect(seen).toEqual([
            { username, body: { new_password: NEW_PASSWORD } },
          ]),
        BACKSTOP,
      );
      expect(
        await screen.findByText(
          `${username} password reset successfully`,
          {},
          BACKSTOP,
        ),
      ).toBeInTheDocument();
    },
  );

  test('on a review deployment it shows the pull request to merge', async () => {
    server.use(
      setupStatus(),
      present(account('admin')),
      present(account('breakglass')),
      resetAnswer('breakglass', {
        enabled: true,
        auto_merge: false,
        committed: true,
        merged: false,
        pending: {
          pr_url: 'https://forge.example/deploy/pulls/9',
          command: null,
          branch: 'dfe/governance/account-breakglass/abc',
        },
      }),
    );

    render(<SecurityAccountsDetails />, { wrapper });
    await resetThrough('breakglass');

    expect(
      await screen.findByText(
        'Merge the review to keep this password',
        {},
        BACKSTOP,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open the review' }),
    ).toHaveAttribute('href', 'https://forge.example/deploy/pulls/9');
  });

  test('on a review deployment with no forge it shows the merge command', async () => {
    const command =
      'git fetch && git switch main && git merge --no-ff dfe/governance/account-admin/abc && git push';
    server.use(
      setupStatus(),
      present(account('admin')),
      absent('breakglass'),
      resetAnswer('admin', {
        enabled: true,
        auto_merge: false,
        committed: true,
        merged: false,
        pending: {
          pr_url: null,
          command,
          branch: 'dfe/governance/account-admin/abc',
        },
      }),
    );

    render(<SecurityAccountsDetails />, { wrapper });
    await resetThrough('admin');

    // CopyCodeBlock wraps each word, so the command is the code element's text.
    const commandBlock = (_: string, element: Element | null) =>
      element?.tagName === 'CODE' && element.textContent === command;
    expect(
      await screen.findByText(commandBlock, {}, BACKSTOP),
    ).toBeInTheDocument();
  });

  test('shows the engine refusal in plain words inside the dialog', async () => {
    server.use(
      setupStatus(),
      present(account('admin')),
      absent('breakglass'),
      http.post(RESET_URL.replace('{username}', 'admin'), () =>
        HttpResponse.json(
          {
            code: 'password_reused',
            message:
              "The new password must differ from the account's current password and from the password it was last issued",
          },
          { status: 400 },
        ),
      ),
    );

    render(<SecurityAccountsDetails />, { wrapper });
    const dialog = await resetThrough('admin');

    expect(
      await within(dialog).findByText(
        /must differ from the account's current password/,
        {},
        BACKSTOP,
      ),
    ).toBeInTheDocument();
  });
});
