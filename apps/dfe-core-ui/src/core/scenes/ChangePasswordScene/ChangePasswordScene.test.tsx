import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import type { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import type { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import {
  pendingReviewStorageKey,
  readPendingReview,
  savePendingReview,
} from './pendingReviewStorage';

const { replace } = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock('@/core/utils/navigation', () => ({
  navigateWithReload: replace,
}));

const { ChangePasswordScene } = await import('.');
const signOut = vi.mocked((await import('next-auth/react')).signOut);

const ADMIN = 'admin';
const COMMAND =
  'git fetch && git switch main && git merge --no-ff dfe/governance/admin/1a2b3c4d && git push';
// CopyCodeBlock renders each token in its own element, so match the whole block's text.
const commandBlock = (_: string, element: Element | null) =>
  element?.tagName === 'CODE' && element.textContent === COMMAND;
const PR_URL = 'https://forge.example/pr/7';

type TBreakGlass = NonNullable<TFetchSetupStatusResponse['break_glass']>;

const SETTLED: TBreakGlass = {
  enabled: true,
  auto_merge: false,
  committed: true,
  merged: true,
  pending: null,
};
// What setup-status reports while a review holds the change: it never carries the instruction.
const UNMERGED: TBreakGlass = { ...SETTLED, merged: false };

const me = (passwordChangeRequired: boolean) =>
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: {
      org_id: '',
      user_id: ADMIN,
      roles: [],
      permissions: [],
      groups: [],
      external: false,
      blocked: false,
      disabled_at: '',
      blocked_at: '',
      password_change_required: passwordChangeRequired,
      hyperdx_role: 'string',
      hyperdx_identity: 'string',
    } satisfies TAuthMeResponse,
  });

const setupStatus = (breakGlass: TBreakGlass) =>
  API_CONFIG_MOCKS.auth.setupStatus.get.success({
    mockedResponse: {
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
      break_glass: breakGlass,
      default_credentials: false,
      deploy_kind: 'local',
      credential_fetch_command: '',
      default_engine: 'MergeTree',
      default_ttl_days: 90,
      admin_username: ADMIN,
      admin_retired: false,
      retire_admin_available: false,
    },
  });

// The first visit: an account on an issued password, nothing under review.
const server = setupServer(me(true), setupStatus(SETTLED));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const ISSUED_PASSWORD = 'the-password-issued';
const NEW_PASSWORD = 'a-password-of-my-own';
const SIGN_IN_AGAIN = { callbackUrl: '/login?notice=password-changed' };

const submit = async (password = NEW_PASSWORD, confirm = password) => {
  const user = userEvent.setup();
  render(<ChangePasswordScene />, { wrapper });
  await user.type(
    await screen.findByLabelText('Current Password'),
    ISSUED_PASSWORD,
  );
  await user.type(screen.getByLabelText('New Password'), password);
  await user.type(screen.getByLabelText('Confirm Password'), confirm);
  await user.click(screen.getByRole('button', { name: 'Set password' }));
};

// Answers the change and keeps the body the console sent.
const recordChange = (sent: { body?: unknown }) =>
  server.use(
    http.post(
      API_CONFIG_MOCKS.accounts.resetCurrentUserPassword.mockedUrl,
      async ({ request }) => {
        sent.body = await request.json();
        return HttpResponse.json({
          message: 'password reset',
          git: {
            enabled: false,
            committed: false,
            auto_merge: false,
            merged: false,
          },
        });
      },
    ),
  );

const refuseCurrentPassword = () =>
  server.use(
    http.post(
      API_CONFIG_MOCKS.accounts.resetCurrentUserPassword.mockedUrl,
      () =>
        HttpResponse.json(
          {
            code: 'invalid_current_password',
            message: "current_password is not this account's password",
          },
          { status: 403 },
        ),
    ),
  );

// The screen as it loads again after the change, with the account no longer flagged.
const reload = (breakGlass: TBreakGlass) => {
  server.use(me(false), setupStatus(breakGlass));
  render(<ChangePasswordScene />, { wrapper });
};

const refuseStorage = () => {
  const refuse = () => {
    throw new DOMException('blocked', 'SecurityError');
  };
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(refuse);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(refuse);
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(refuse);
};

const REUSED = 'New password may not match any of the last 5 passwords';

const refuseAsReused = () =>
  server.use(
    http.post(
      API_CONFIG_MOCKS.accounts.resetCurrentUserPassword.mockedUrl,
      () =>
        HttpResponse.json(
          { code: 'password_reused', message: REUSED, errors: [] },
          { status: 400 },
        ),
    ),
  );

const answerWithReview = (pending: { pr_url?: string; command?: string }) =>
  server.use(
    API_CONFIG_MOCKS.accounts.resetCurrentUserPassword.post.success({
      mockedResponse: {
        message: 'password reset',
        git: {
          enabled: true,
          auto_merge: false,
          committed: true,
          merged: false,
          pending,
        },
      },
    }),
  );

const expectNoForm = () => {
  expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'Set your own password' }),
  ).not.toBeInTheDocument();
};

describe('ChangePasswordScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().reset();
    window.localStorage.clear();
  });

  test('says why the change is due and offers a way out', async () => {
    render(<ChangePasswordScene />, { wrapper });

    expect(
      await screen.findByRole('heading', { name: 'Set your own password' }),
    ).toBeInTheDocument();
    // The rule is stated before the operator can break it.
    expect(screen.getByText(/at least 12 characters/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log out/ })).toBeInTheDocument();
  });

  test('logs out to the plain login, so a later sign-in is not sent back here', async () => {
    render(<ChangePasswordScene />, { wrapper });

    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: /Log out/ }));

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
  });

  test('changes the password with the issued one as current, then signs out to sign in again', async () => {
    const sent: { body?: unknown } = {};
    recordChange(sent);

    await submit();

    await waitFor(() => expect(signOut).toHaveBeenCalledWith(SIGN_IN_AGAIN));
    expect(sent.body).toEqual({
      current_password: ISSUED_PASSWORD,
      new_password: NEW_PASSWORD,
    });
    // The change ended this session, so nothing tries to enter the console on it.
    expect(replace).not.toHaveBeenCalled();
    expect(readPendingReview(ADMIN)).toBeNull();
  });

  test('a wrong current password is marked on that field, and nothing signs out', async () => {
    refuseCurrentPassword();

    await submit();

    expect(
      await screen.findByText('That is not your current password.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("current_password is not this account's password"),
    ).not.toBeInTheDocument();
    expect(signOut).not.toHaveBeenCalled();
  });

  test('holds on the pending review before signing in again', async () => {
    answerWithReview({ pr_url: PR_URL });

    await submit();

    expect(
      await screen.findByText('Merge the review to keep this password'),
    ).toBeInTheDocument();
    // The change is made by now, so the screen no longer asks for one.
    expect(
      screen.getByRole('heading', { name: 'Password set' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Choose your own/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open the review' }),
    ).toHaveAttribute('href', PR_URL);
    expect(replace).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Continue' }));
    expect(signOut).toHaveBeenCalledWith(SIGN_IN_AGAIN);
    expect(replace).not.toHaveBeenCalled();
  });

  test('keeps the merge command for a reload, and never the password', async () => {
    answerWithReview({ command: COMMAND });

    await submit();

    expect(await screen.findByText(commandBlock)).toBeInTheDocument();
    const stored = window.localStorage.getItem(pendingReviewStorageKey(ADMIN));
    expect(stored).not.toContain(NEW_PASSWORD);
    expect(readPendingReview(ADMIN)).toEqual({
      pr_url: null,
      command: COMMAND,
      branch: null,
    });
  });

  test('a reload with the review unmerged shows the stored merge command, not the form', async () => {
    savePendingReview(ADMIN, { command: COMMAND });

    reload(UNMERGED);

    expect(await screen.findByText(commandBlock)).toBeInTheDocument();
    expect(
      screen.getByText('Merge the review to keep this password'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Password set' }),
    ).toBeInTheDocument();
    expectNoForm();
    expect(replace).not.toHaveBeenCalled();
  });

  test('a reload on a forge deployment shows the stored review link, not the form', async () => {
    savePendingReview(ADMIN, { pr_url: PR_URL });

    reload(UNMERGED);

    expect(
      await screen.findByRole('link', { name: 'Open the review' }),
    ).toHaveAttribute('href', PR_URL);
    expectNoForm();
  });

  test('once the review merges, the stored instruction is cleared and the console opens', async () => {
    savePendingReview(ADMIN, { command: COMMAND });

    reload(SETTLED);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(readPendingReview(ADMIN)).toBeNull();
    expectNoForm();
  });

  test('a reload with nothing stored and the review unmerged says a merge is waiting, not the form', async () => {
    reload(UNMERGED);

    expect(
      await screen.findByText('A merge is still needed to keep this password'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Password set' }),
    ).toBeInTheDocument();
    expectNoForm();
    expect(screen.getByRole('button', { name: /Log out/ })).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  test('a storage that throws still gives the waiting state on a reload', async () => {
    refuseStorage();

    reload(UNMERGED);

    expect(
      await screen.findByText('A merge is still needed to keep this password'),
    ).toBeInTheDocument();
    expectNoForm();
  });

  test('a storage that throws still shows the command the change was given', async () => {
    refuseStorage();
    answerWithReview({ command: COMMAND });

    await submit();

    expect(await screen.findByText(commandBlock)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  test('an account still on an issued password gets the form, whatever is stored', async () => {
    savePendingReview(ADMIN, { command: COMMAND });
    server.use(me(true), setupStatus(UNMERGED));

    render(<ChangePasswordScene />, { wrapper });

    expect(
      await screen.findByRole('heading', { name: 'Set your own password' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(commandBlock)).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  test('an unreachable setup-status keeps the stored instruction rather than reading as merged', async () => {
    savePendingReview(ADMIN, { command: COMMAND });
    server.use(
      me(false),
      http.get(API_CONFIG_MOCKS.auth.setupStatus.mockedUrl, () =>
        HttpResponse.json({ message: 'unavailable' }, { status: 503 }),
      ),
    );

    render(<ChangePasswordScene />, { wrapper });

    expect(await screen.findByText(commandBlock)).toBeInTheDocument();
    expect(readPendingReview(ADMIN)).not.toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  test('shows the engine refusal and stays put', async () => {
    refuseAsReused();

    await submit();

    expect(await screen.findByText(REUSED)).toBeInTheDocument();
    expect(signOut).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  test.each(['Current Password', 'New Password', 'Confirm Password'])(
    'clears the engine refusal once %s is edited',
    async (field) => {
      refuseAsReused();

      await submit();
      expect(await screen.findByText(REUSED)).toBeInTheDocument();

      await userEvent.setup().type(screen.getByLabelText(field), 'x');

      await waitFor(() =>
        expect(screen.queryByText(REUSED)).not.toBeInTheDocument(),
      );
    },
  );

  test('refuses mismatched passwords before calling the engine', async () => {
    await submit(NEW_PASSWORD, `${NEW_PASSWORD}-typo`);

    expect(
      await screen.findByText('Passwords do not match'),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  test('the wrong-password mark clears once the current password is edited', async () => {
    refuseCurrentPassword();

    await submit();
    expect(
      await screen.findByText('That is not your current password.'),
    ).toBeInTheDocument();

    await userEvent
      .setup()
      .type(screen.getByLabelText('Current Password'), 'x');

    await waitFor(() =>
      expect(
        screen.queryByText('That is not your current password.'),
      ).not.toBeInTheDocument(),
    );
  });
});
