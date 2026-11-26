import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TAccountDetailResponse } from '@/Settings/hooks/accounts/useFetchAccountDetail/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { ViewAccountDetails } from './ViewAccountDetails';
import { server } from './ViewAccountDetails.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const OIDC_SUBJECT = '00u15mxs3ecygt7oj698';

const accountDetail = (
  overrides: Partial<TAccountDetailResponse>,
): TAccountDetailResponse => ({
  username: OIDC_SUBJECT,
  oidc_id: 'string',
  oidc_type: 'string',
  admin: false,
  org_display_name: '',
  org_enabled: true,
  enabled: true,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
  external: false,
  email_verified: false,
  identities: [],
  password_change_required: false,
  groups: [],
  email: '',
  phone: '',
  name: '',
  org: '',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  last_login_at: '',
  ...overrides,
});

const definitionFor = (term: string) =>
  screen.getByText(term).nextElementSibling;

describe('ViewAccountDetails', () => {
  test('heads the details with the name, beside the username and email', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.account.get.success({
        username: OIDC_SUBJECT,
        mockedResponse: accountDetail({
          name: 'DFE dfe-test',
          email: 'dfe-test@dfe-oidc.test',
          org: 'acme',
          org_display_name: 'Acme',
        }),
      }),
    );

    render(<ViewAccountDetails username={OIDC_SUBJECT} />, { wrapper });

    expect(
      await screen.findByRole('heading', { name: 'DFE dfe-test' }),
    ).toBeInTheDocument();
    expect(definitionFor('Username:')).toHaveTextContent(OIDC_SUBJECT);
    expect(definitionFor('Email:')).toHaveTextContent('dfe-test@dfe-oidc.test');
    expect(definitionFor('Organisation:')).toHaveTextContent('Acme');
  });

  test('heads an unnamed account with its username and marks an empty email as none', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.account.get.success({
        username: 'admin',
        mockedResponse: accountDetail({
          username: 'admin',
          name: '   ',
          email: '',
        }),
      }),
    );

    render(<ViewAccountDetails username="admin" />, { wrapper });

    expect(
      await screen.findByRole('heading', { name: 'admin' }),
    ).toBeInTheDocument();
    expect(definitionFor('Email:')).toHaveTextContent('None');
    expect(definitionFor('Organisation:')).toHaveTextContent('None');
  });

  test.each([
    {
      account: { org: 'globex', groups: ['globex-admins'] },
      term: 'Role:',
      value: 'Admin',
    },
    {
      account: { org: 'globex', groups: ['globex-viewers'] },
      term: 'Role:',
      value: 'Viewer',
    },
    {
      account: { org: 'acme', groups: ['dfe-viewers'] },
      term: 'Groups:',
      value: 'dfe-viewers',
    },
  ])(
    'shows $term $value for an account of $account.org',
    async ({ account, term, value }) => {
      server.use(
        API_CONFIG_MOCKS.accounts.account.get.success({
          username: 'kim',
          mockedResponse: accountDetail({ username: 'kim', ...account }),
        }),
      );

      render(<ViewAccountDetails username="kim" />, { wrapper });

      await waitFor(() => expect(definitionFor(term)).toHaveTextContent(value));
    },
  );

  test('marks a group held through a sign-in with its provider', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.account.get.success({
        username: 'kaz',
        mockedResponse: accountDetail({
          username: 'kaz',
          org: 'acme',
          groups: ['dfe-admins', 'google-admins'],
          linked_groups: [
            {
              name: 'google-admins',
              provider: 'google-workspace',
              provider_type: 'google',
            },
          ],
        }),
      }),
    );
    const user = userEvent.setup();

    render(<ViewAccountDetails username="kaz" />, { wrapper });

    const linked = await screen.findByText('google-admins');
    await user.hover(linked);
    expect(
      await screen.findByText(
        'Held through its google-workspace sign-in, so it follows what google-workspace asserts',
      ),
    ).toBeInTheDocument();
    await user.unhover(linked);
    await user.hover(screen.getByText('dfe-admins'));
    expect(screen.queryAllByText(/Held through its/)).toHaveLength(1);
  });

  test.each([
    { account: {}, status: 'Active' },
    { account: { enabled: false }, status: 'Inactive' },
    { account: { blocked: true }, status: 'Blocked' },
    { account: { org_enabled: false }, status: 'Organisation disabled' },
  ])('reads as $status', async ({ account, status }) => {
    server.use(
      API_CONFIG_MOCKS.accounts.account.get.success({
        username: 'kim',
        mockedResponse: accountDetail({ username: 'kim', ...account }),
      }),
    );

    render(<ViewAccountDetails username="kim" />, { wrapper });

    expect(await screen.findByText('Status:')).toBeInTheDocument();
    expect(definitionFor('Status:')).toHaveTextContent(status);
  });

  test.each([
    { last_login_at: '', shown: 'Never' },
    {
      last_login_at: new Date(Date.now() - 3 * 3_600_000).toISOString(),
      shown: '3 hours ago',
    },
  ])('reads its last sign-in as $shown', async ({ last_login_at, shown }) => {
    server.use(
      API_CONFIG_MOCKS.accounts.account.get.success({
        username: 'kim',
        mockedResponse: accountDetail({ username: 'kim', last_login_at }),
      }),
    );

    render(<ViewAccountDetails username="kim" />, { wrapper });

    expect(await screen.findByText('Last Sign-in:')).toBeInTheDocument();
    expect(definitionFor('Last Sign-in:')).toHaveTextContent(shown);
  });

  test('lists linked sign-ins and unlinks one', async () => {
    const linked = accountDetail({
      username: 'kaz',
      identities: [
        {
          key: 'stub-kaz',
          provider: 'okta',
          provider_type: 'okta',
          subject: 'stub-kaz',
          email: 'kaz@example.test',
          linked_at: '2026-11-13T00:00:00Z',
          last_login_at: '',
        },
      ],
    });
    server.use(
      API_CONFIG_MOCKS.auth.me.get.success({
        mockedResponse: ADMIN_MOCKED_RESPONSE,
      }),
      API_CONFIG_MOCKS.accounts.account.get.success({
        username: 'kaz',
        mockedResponse: linked,
      }),
      API_CONFIG_MOCKS.accounts.identity.delete.success({
        key: 'stub-kaz',
        username: 'kaz',
      }),
    );
    const user = userEvent.setup();

    render(<ViewAccountDetails username="kaz" />, { wrapper });

    expect(await screen.findByText('kaz@example.test')).toBeInTheDocument();
    server.use(
      API_CONFIG_MOCKS.accounts.account.get.success({
        username: 'kaz',
        mockedResponse: { ...linked, identities: [] },
      }),
      API_CONFIG_MOCKS.auth.reauth.post.success(),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Unlink okta sign-in' }),
    );
    await user.click(await screen.findByRole('button', { name: 'Unlink' }));
    // The unlink asks for the password first, and the prompt names the unlink.
    expect(
      await screen.findByText(
        (_, element) =>
          element?.tagName === 'P' &&
          element.textContent ===
            'You are about to unlink a sign-in from account kaz.',
      ),
    ).toBeInTheDocument();
    await user.type(await screen.findByLabelText('Your password'), 'pw');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(screen.queryByText('kaz@example.test')).not.toBeInTheDocument(),
    );
    expect(definitionFor('Linked Sign-ins:')).toHaveTextContent('None');
  });
});
