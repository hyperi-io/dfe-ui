import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useCreateAccount } from '@/core/hooks/useCreateAccount';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { STORE_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
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
  listedOrgs,
  MockIntersectionObserver,
  signedInAs,
} from '@/core/components/OrgChoiceFormItem/OrgChoiceFormItem.mocks';
import { expectLabelTooltip } from '@/core/utils/test-utils/expectLabelTooltip';
import { STAND_IN_GROUP } from '@/core/components/AccountGroupSelect/AccountGroupSelect.mocks';
import { CreateAccountForm } from '.';

vi.mock('@/core/components/AccountGroupSelect', async () => ({
  AccountGroupSelect: (
    await import('@/core/components/AccountGroupSelect/AccountGroupSelect.mocks')
  ).AccountGroupSelectStandIn,
}));

// The organisation picker lists the organisations and starts on the signed-in user's own.
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const server = setupServer(
  signedInAs(''),
  listedOrgs,
  API_CONFIG_MOCKS.accounts.availability.get.success(),
  API_CONFIG_MOCKS.system.organisation.get.success({
    mockedResponse: { name: 'hyperi', display_name: 'HyperI' },
  }),
);
// Only the writes, so a check that nothing went out ignores the pickers' reads.
const sent: Request[] = [];

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  sent.length = 0;
  server.events.on('request:start', ({ request }) => {
    if (request.method !== 'GET') sent.push(request.clone());
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
// The accented letter takes two bytes, so each is one byte longer than its length.
const ACCENTED = String.fromCodePoint(0xe9);
const SEVENTY_TWO_BYTES = `${'a'.repeat(70)}${ACCENTED}`;
const SEVENTY_THREE_BYTES = `${'a'.repeat(71)}${ACCENTED}`;
// Each emoji is one code point and two UTF-16 units, so six are 12 units long.
const EMOJI = String.fromCodePoint(0x1f511);

const OWN_ORG = /^Your organisation/;

/** Fill the details step and go on, landing on the organisation step only when the details pass. */
const fillDetails = async (
  user: ReturnType<typeof userEvent.setup>,
  password: string,
  name = 'New User',
) => {
  await user.type(screen.getByLabelText(/^Username/), 'new-user');
  await user.type(screen.getByLabelText(/^Email/), 'new-user@example.com');
  if (name) {
    await user.type(screen.getByLabelText(/^Name/), name);
  }
  await user.click(screen.getByLabelText(/^Password/));
  await user.paste(password);
  await user.click(screen.getByRole('button', { name: 'Next' }));
};

const submit = async (password: string, name = 'New User') => {
  const user = userEvent.setup();
  render(<CreateAccount />, { wrapper });
  await fillDetails(user, password, name);
  // Refused details keep the form on its first step, with nothing to create.
  const own = await screen
    .findByRole('radio', { name: OWN_ORG }, { timeout: 1000 })
    .catch(() => undefined);
  if (own) {
    await user.click(own);
    await user.click(screen.getByRole('checkbox', { name: 'Choose a group' }));
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
  }
};

describe('CreateAccountForm password length', () => {
  test('refuses an 11-character password before any request goes out', async () => {
    server.use(API_CONFIG_MOCKS.accounts.default.post.success());

    await submit(ELEVEN_CHARS);

    expect(await screen.findByText(FLOOR_MESSAGE)).toBeInTheDocument();
    expect(sent).toEqual([]);
  });

  test('refuses 6 emoji before any request goes out', async () => {
    server.use(API_CONFIG_MOCKS.accounts.default.post.success());

    await submit(EMOJI.repeat(6));

    expect(await screen.findByText(FLOOR_MESSAGE)).toBeInTheDocument();
    expect(sent).toEqual([]);
  });

  test('sends 12 emoji to the engine', async () => {
    server.use(API_CONFIG_MOCKS.accounts.default.post.success());

    await submit(EMOJI.repeat(12));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(await sent[0]?.json()).toMatchObject({
      password: EMOJI.repeat(12),
    });
  });

  test('refuses a 73-byte password before any request goes out', async () => {
    server.use(API_CONFIG_MOCKS.accounts.default.post.success());

    await submit(SEVENTY_THREE_BYTES);

    expect(
      await screen.findByText(
        'Use at most 72 bytes. Most characters count as 1, but accented letters, other scripts and emoji count as 2 to 4.',
      ),
    ).toBeInTheDocument();
    expect(sent).toEqual([]);
  });

  test('sends a 72-byte password to the engine', async () => {
    server.use(API_CONFIG_MOCKS.accounts.default.post.success());

    await submit(SEVENTY_TWO_BYTES);

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(await sent[0]?.json()).toMatchObject({
      password: SEVENTY_TWO_BYTES,
    });
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
            title: 'Error',
            code: 'validation_error',
            detail: '1 validation error(s)',
            errors: [
              {
                field: 'password',
                detail: 'String should have at least 12 characters',
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

describe('CreateAccountForm name', () => {
  test.each([
    { name: '', label: 'missing' },
    { name: '   ', label: 'blank' },
  ])('refuses a $label name before any request goes out', async ({ name }) => {
    server.use(API_CONFIG_MOCKS.accounts.default.post.success());

    await submit(TWELVE_CHARS, name);

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(sent).toEqual([]);
  });

  test('sends the name it was given', async () => {
    server.use(API_CONFIG_MOCKS.accounts.default.post.success());

    await submit(TWELVE_CHARS, '  New User ');

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(await sent[0]?.json()).toMatchObject({ name: 'New User' });
  });
});

describe('CreateAccountForm username', () => {
  test('explains the username in the ? beside its label, not over the field', async () => {
    const hint = "A username identifies the account and can't be changed later";
    const user = userEvent.setup();
    render(<CreateAccount />, { wrapper });

    await user.hover(screen.getByLabelText(/^Username/));
    await expect(
      screen.findByText(hint, {}, { timeout: 500 }),
    ).rejects.toThrow();
    await expectLabelTooltip(user, 'Username', hint);
  });

  test('shows an invalid username until it is fixed', async () => {
    const user = userEvent.setup();
    render(<CreateAccount />, { wrapper });

    await user.type(screen.getByLabelText(/^Username/), '-user');

    expect(
      await screen.findByText(STORE_NAME_VALIDATOR.message('Username')),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/^Username/));
    await user.type(screen.getByLabelText(/^Username/), 'new-user');

    await waitFor(() => {
      expect(
        screen.queryByText(STORE_NAME_VALIDATOR.message('Username')),
      ).not.toBeInTheDocument();
    });
  });

  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(<CreateAccount />, { wrapper });

      await expectNameRule({
        input: screen.getByLabelText(/^Username/),
        message: STORE_NAME_VALIDATOR.message('Username'),
        accepts: ['new-user.1', 'a'.repeat(128)],
        refuses: ['-user', '.user', 'new user', 'a'.repeat(129)],
      });
    },
  );
});

describe('CreateAccountForm organisation', () => {
  test.each([
    {
      name: 'your organisation as a root account, with the groups chosen',
      pick: undefined,
      sends: { groups: [STAND_IN_GROUP], org: '' },
    },
    {
      name: 'the customer organisation picked, in its viewers group',
      pick: 'Globex',
      sends: { groups: ['globex-viewers'], org: 'globex' },
    },
  ])('sends $name', async ({ pick, sends }) => {
    server.use(API_CONFIG_MOCKS.accounts.default.post.success());
    const user = userEvent.setup();
    render(<CreateAccount />, { wrapper });
    await fillDetails(user, TWELVE_CHARS);

    if (pick) {
      await user.click(
        await screen.findByRole('radio', { name: 'Customer organisation' }),
      );
      await user.click(
        screen.getByRole('combobox', { name: 'Organisation name' }),
      );
      await user.click(await screen.findByTitle(pick));
    } else {
      await user.click(await screen.findByRole('radio', { name: OWN_ORG }));
      await user.click(
        screen.getByRole('checkbox', { name: 'Choose a group' }),
      );
    }
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(await sent[0]?.json()).toMatchObject(sends);
  });

  test('creates nothing in your organisation until a group is chosen', async () => {
    server.use(API_CONFIG_MOCKS.accounts.default.post.success());
    const user = userEvent.setup();
    render(<CreateAccount />, { wrapper });
    await fillDetails(user, TWELVE_CHARS);

    await user.click(await screen.findByRole('radio', { name: OWN_ORG }));
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(
      await screen.findByText('Choose at least one group'),
    ).toBeInTheDocument();
    expect(sent).toEqual([]);
  });

  test('offers the role, not groups, the moment a customer organisation is chosen', async () => {
    const user = userEvent.setup();
    render(<CreateAccount />, { wrapper });
    await fillDetails(user, TWELVE_CHARS);
    const own = await screen.findByRole('radio', { name: OWN_ORG });
    const offered = () => ({
      groups: screen.queryByText('Groups') !== null,
      role: screen.queryByRole('radio', { name: 'Viewer' }) !== null,
    });

    const unchosen = offered();
    await user.click(own);
    const ownOrg = offered();
    await user.click(
      screen.getByRole('radio', { name: 'Customer organisation' }),
    );

    expect({ customer: offered(), ownOrg, unchosen }).toEqual({
      customer: { groups: false, role: true },
      ownOrg: { groups: true, role: false },
      unchosen: { groups: false, role: false },
    });
  });

  test('creates nothing until an organisation is chosen', async () => {
    const user = userEvent.setup();
    render(<CreateAccount />, { wrapper });
    await fillDetails(user, TWELVE_CHARS);

    const create = await screen.findByRole('button', {
      name: 'Create Account',
    });

    expect(create).toBeDisabled();
    expect(
      screen.queryByRole('radio', { checked: true, name: OWN_ORG }),
    ).not.toBeInTheDocument();
  });

  test('names where the account lands before it is created', async () => {
    const user = userEvent.setup();
    render(<CreateAccount />, { wrapper });
    await fillDetails(user, TWELVE_CHARS);

    await user.click(
      await screen.findByRole('radio', { name: 'Customer organisation' }),
    );
    await user.click(
      screen.getByRole('combobox', { name: 'Organisation name' }),
    );
    await user.click(await screen.findByTitle('Globex'));

    expect(
      await screen.findByText('new-user is created in globex as Viewer.'),
    ).toBeInTheDocument();
  });

  test('sends no org from the setup wizard, and asks for no signed-in user', async () => {
    server.use(API_CONFIG_MOCKS.accounts.default.post.success());
    const reads: string[] = [];
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'GET') reads.push(new URL(request.url).pathname);
    });
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <CreateAccountForm
        onFinish={onFinish}
        error={null}
        isPending={false}
        disabledFields={{ groups: true }}
        hiddenFields={{ org: true }}
        initialValues={{
          email: '',
          groups: ['dfe-admins'],
          name: '',
          password: '',
          phone: '',
          username: '',
        }}
      />,
      { wrapper },
    );

    expect(
      screen.queryByRole('radio', { name: OWN_ORG }),
    ).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/^Username/), 'new-user');
    await user.type(screen.getByLabelText(/^Email/), 'new-user@example.com');
    await user.type(screen.getByLabelText(/^Name/), 'New User');
    await user.click(screen.getByLabelText(/^Password/));
    await user.paste(TWELVE_CHARS);
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(onFinish.mock.calls[0]?.[0]).toMatchObject({
      groups: ['dfe-admins'],
      org: '',
    });
    expect(reads).not.toContain(API_CONFIG_MOCKS.accounts.me.mockedUrl);
  });
});

describe('CreateAccountForm availability', () => {
  test.each([
    {
      field: /^Username/,
      message: "Account 'kaz' already exists",
      answer: { email: '', username: "Account 'kaz' already exists" },
      value: 'kaz',
    },
    {
      field: /^Email/,
      message: 'Another account already uses this email',
      answer: {
        email: 'Another account already uses this email',
        username: '',
      },
      value: 'kaz@example.test',
    },
  ])(
    'shows "$message" while typing, before any request goes out',
    async ({ answer, field, message, value }) => {
      server.use(
        API_CONFIG_MOCKS.accounts.availability.get.success({
          mockedResponse: answer,
        }),
      );
      const user = userEvent.setup();
      render(<CreateAccount />, { wrapper });

      await user.type(screen.getByLabelText(field), value);

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(sent).toEqual([]);
    },
  );
});

describe('CreateAccountForm organisation role', () => {
  test('an organisation account takes a role instead of groups', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <CreateAccountForm onFinish={onFinish} error={null} isPending={false} />,
      { wrapper },
    );

    await fillDetails(user, TWELVE_CHARS);
    await user.click(
      await screen.findByRole('radio', { name: 'Customer organisation' }),
    );
    await user.click(
      screen.getByRole('combobox', { name: 'Organisation name' }),
    );
    await user.click(await screen.findByTitle('Globex'));
    await user.click(await screen.findByRole('radio', { name: 'Admin' }));
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect({
      groupsField: screen.queryByText('Groups'),
      sent: onFinish.mock.calls[0]?.[0],
    }).toMatchObject({
      groupsField: null,
      sent: { org: 'globex', groups: ['globex-admins'] },
    });
  });
});
