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
  ...overrides,
});

const definitionFor = (term: string) =>
  screen.getByText(term).nextElementSibling;

describe('ViewAccountDetails', () => {
  test('shows the name and email alongside the username', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.account.get.success({
        username: OIDC_SUBJECT,
        mockedResponse: accountDetail({
          name: 'DFE dfe-test',
          email: 'dfe-test@dfe-oidc.test',
          org_display_name: 'Acme',
        }),
      }),
    );

    render(<ViewAccountDetails username={OIDC_SUBJECT} />, { wrapper });

    expect(await screen.findByText('Name:')).toBeInTheDocument();
    expect(definitionFor('Name:')).toHaveTextContent('DFE dfe-test');
    expect(definitionFor('Email:')).toHaveTextContent('dfe-test@dfe-oidc.test');
    expect(definitionFor('Username:')).toHaveTextContent(OIDC_SUBJECT);
    expect(definitionFor('Organisation:')).toHaveTextContent('Acme');
  });

  test('marks an empty or whitespace name and email as none', async () => {
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

    expect(await screen.findByText('Name:')).toBeInTheDocument();
    expect(definitionFor('Name:')).toHaveTextContent('None');
    expect(definitionFor('Email:')).toHaveTextContent('None');
    expect(definitionFor('Username:')).toHaveTextContent('admin');
    expect(definitionFor('Organisation:')).toHaveTextContent('None');
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
    // The unlink asks for the password first.
    await user.type(await screen.findByLabelText('Your password'), 'pw');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(screen.queryByText('kaz@example.test')).not.toBeInTheDocument(),
    );
    expect(definitionFor('Linked Sign-ins:')).toHaveTextContent('None');
  });
});
