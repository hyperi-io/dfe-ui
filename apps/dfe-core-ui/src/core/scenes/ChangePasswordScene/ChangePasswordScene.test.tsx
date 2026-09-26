import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
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

const { replace, executeAccessTokenRefresh } = vi.hoisted(() => ({
  replace: vi.fn(),
  executeAccessTokenRefresh: vi.fn(),
}));

vi.mock('@/core/utils/navigation', () => ({
  navigateWithReload: replace,
}));

vi.mock('@/core/auth/refreshAccessToken', () => ({
  executeAccessTokenRefresh,
}));

const { ChangePasswordScene } = await import('.');

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const NEW_PASSWORD = 'a-password-of-my-own';

const submit = async (password = NEW_PASSWORD, confirm = password) => {
  const user = userEvent.setup();
  render(<ChangePasswordScene />, { wrapper });
  await user.type(screen.getByLabelText('New Password'), password);
  await user.type(screen.getByLabelText('Confirm Password'), confirm);
  await user.click(screen.getByRole('button', { name: 'Set password' }));
};

describe('ChangePasswordScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    executeAccessTokenRefresh.mockResolvedValue({});
  });

  test('says why the change is due and offers a way out', () => {
    render(<ChangePasswordScene />, { wrapper });

    expect(
      screen.getByRole('heading', { name: 'Set your own password' }),
    ).toBeInTheDocument();
    // The rule is stated before the operator can break it.
    expect(screen.getByText(/at least 12 characters/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log out/ })).toBeInTheDocument();
  });

  test('changes the password, renews the session, then enters the console', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.resetCurrentUserPassword.post.success(),
    );

    await submit();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(executeAccessTokenRefresh).toHaveBeenCalledTimes(1);
  });

  test('holds on the pending review before entering', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.resetCurrentUserPassword.post.success({
        mockedResponse: {
          message: 'password reset',
          git: {
            enabled: true,
            auto_merge: false,
            committed: true,
            merged: false,
            pending: { pr_url: 'https://forge.example/pr/7' },
          },
        },
      }),
    );

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
    ).toHaveAttribute('href', 'https://forge.example/pr/7');
    expect(replace).not.toHaveBeenCalled();

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Continue' }));
    expect(replace).toHaveBeenCalledWith('/');
  });

  test('shows the engine refusal and stays put', async () => {
    server.use(
      http.post(
        API_CONFIG_MOCKS.accounts.resetCurrentUserPassword.mockedUrl,
        () =>
          HttpResponse.json(
            {
              code: 'password_reused',
              message: 'New password may not match any of the last 5 passwords',
              errors: [],
            },
            { status: 400 },
          ),
      ),
    );

    await submit();

    expect(
      await screen.findByText(
        'New password may not match any of the last 5 passwords',
      ),
    ).toBeInTheDocument();
    expect(executeAccessTokenRefresh).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  test('refuses mismatched passwords before calling the engine', async () => {
    await submit(NEW_PASSWORD, `${NEW_PASSWORD}-typo`);

    expect(
      await screen.findByText('Passwords do not match'),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  test('says how to recover when the session cannot be renewed', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.resetCurrentUserPassword.post.success(),
    );
    executeAccessTokenRefresh.mockRejectedValue(new Error('500'));

    await submit();

    expect(
      await screen.findByText(/this session could not be renewed/),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
