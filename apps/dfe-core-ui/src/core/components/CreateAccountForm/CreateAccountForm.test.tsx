import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useCreateAccount } from '@/core/hooks/useCreateAccount';
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
import { CreateAccountForm } from '.';

// The group picker reads RBAC and the groups list, and the password rule depends on neither.
vi.mock('@/core/components/AccountGroupSelect', () => ({
  AccountGroupSelect: () => null,
}));

const server = setupServer();
const sent: Request[] = [];

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  sent.length = 0;
  server.events.on('request:start', ({ request }) => {
    sent.push(request.clone());
  });
});
afterEach(() => {
  server.events.removeAllListeners();
  server.resetHandlers();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const CreateAccount = () => {
  const { mutate, error, isPending } = useCreateAccount();
  return (
    <CreateAccountForm onFinish={mutate} error={error} isPending={isPending} />
  );
};

const FLOOR_MESSAGE = 'Password must contain at least 12 characters';
const ELEVEN_CHARS = 'eleven-char';
const TWELVE_CHARS = 'twelve-chars';

const submit = async (password: string) => {
  const user = userEvent.setup();
  render(<CreateAccount />, { wrapper });
  await user.type(screen.getByLabelText(/^Username/), 'new-user');
  await user.type(screen.getByLabelText(/^Email/), 'new-user@example.com');
  await user.type(screen.getByLabelText(/^Password/), password);
  await user.click(screen.getByRole('button', { name: 'Create Account' }));
};

describe('CreateAccountForm password floor', () => {
  test('refuses an 11-character password before any request goes out', async () => {
    server.use(API_CONFIG_MOCKS.accounts.default.post.success());

    await submit(ELEVEN_CHARS);

    expect(await screen.findByText(FLOOR_MESSAGE)).toBeInTheDocument();
    expect(sent).toEqual([]);
  });

  test('sends a 12-character password to the engine', async () => {
    server.use(API_CONFIG_MOCKS.accounts.default.post.success());

    await submit(TWELVE_CHARS);

    await waitFor(() => expect(sent).toHaveLength(1));
    const [request] = sent;
    expect(request?.method).toBe('POST');
    expect(new URL(request?.url ?? '').pathname).toBe(
      API_CONFIG_MOCKS.accounts.default.mockedUrl,
    );
    expect(await request?.json()).toMatchObject({
      username: 'new-user',
      password: TWELVE_CHARS,
    });
    expect(screen.queryByText(FLOOR_MESSAGE)).not.toBeInTheDocument();
  });

  test('names the refused field when the engine answers 422', async () => {
    server.use(
      http.post(API_CONFIG_MOCKS.accounts.default.mockedUrl, () =>
        HttpResponse.json(
          {
            code: 'validation_error',
            message: '1 validation error(s)',
            errors: [
              {
                field: 'password',
                message: 'String should have at least 12 characters',
                code: 'string_too_short',
              },
            ],
          },
          { status: 422 },
        ),
      ),
    );

    await submit(TWELVE_CHARS);

    expect(
      await screen.findByText(
        'password: String should have at least 12 characters',
      ),
    ).toBeInTheDocument();
  });
});
