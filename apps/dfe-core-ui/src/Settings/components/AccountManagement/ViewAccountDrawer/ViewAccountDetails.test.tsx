import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TAccountDetailResponse } from '@/Settings/hooks/accounts/useFetchAccountDetail/types';
import { render, screen } from '@testing-library/react';
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
  enabled: true,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
  external: false,
  password_change_required: false,
  groups: [],
  email: '',
  phone: '',
  name: '',
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
        }),
      }),
    );

    render(<ViewAccountDetails username={OIDC_SUBJECT} />, { wrapper });

    expect(await screen.findByText('Name:')).toBeInTheDocument();
    expect(definitionFor('Name:')).toHaveTextContent('DFE dfe-test');
    expect(definitionFor('Email:')).toHaveTextContent('dfe-test@dfe-oidc.test');
    expect(definitionFor('Username:')).toHaveTextContent(OIDC_SUBJECT);
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
  });
});
