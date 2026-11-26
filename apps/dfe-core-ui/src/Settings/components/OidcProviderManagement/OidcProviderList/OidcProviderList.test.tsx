import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import type { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { OidcProviderList } from '.';
import {
  EVERY_PROVIDER,
  provider,
  PROVIDER_PAGE_HANDLERS,
  providersServed,
} from './OidcProviderList.mocks';

vi.mock('@/core/components/RbacProtected/hooks/useRbac', () => ({
  useRbac: () => ({ isAuthorized: true, isLoading: false, isError: false }),
}));

const server = setupServer(...PROVIDER_PAGE_HANDLERS);

const serve = (providers: TOidcProviderListItem[]) =>
  server.use(providersServed(providers));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

describe('OidcProviderList', () => {
  test("your organisation's section shows its own providers and no customer's", async () => {
    serve(EVERY_PROVIDER);

    render(<OidcProviderList scope="yours" />, { wrapper });

    expect(await screen.findByText('Platform Okta')).toBeInTheDocument();
    expect(screen.queryByText('Acme Entra')).not.toBeInTheDocument();
    expect(screen.queryByText('Globex')).not.toBeInTheDocument();
  });

  test('the customer section has one card per organisation, which opens to its providers', async () => {
    serve(EVERY_PROVIDER);
    const user = userEvent.setup();

    render(<OidcProviderList scope="customer" />, { wrapper });

    // The organisation list loads after the providers, so the names show a moment later.
    expect(
      await screen.findByRole('heading', { name: 'Acme' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2 providers')).toBeInTheDocument();
    expect(screen.getAllByText('1 provider')).toHaveLength(2);
    expect(screen.queryByText('Platform Okta')).not.toBeInTheDocument();
    expect(screen.queryByText('Globex Okta')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Globex actions' }));
    await user.click(
      await screen.findByRole('button', { name: 'View Globex OIDC providers' }),
    );

    expect(await screen.findByText('Globex Okta')).toBeInTheDocument();
    expect(screen.getByText('Globex Google')).toBeInTheDocument();
  });

  test("a link's organisation opens on its providers, ready to edit", async () => {
    serve(EVERY_PROVIDER);

    render(<OidcProviderList openOrg="globex" scope="customer" />, { wrapper });

    expect(
      await screen.findByRole('dialog', { name: 'Globex OIDC Providers' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Globex Okta')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'OIDC Provider actions' }),
    ).toHaveLength(2);
  });

  test("an organisation's name finds its card alone", async () => {
    serve(EVERY_PROVIDER);

    render(<OidcProviderList scope="customer" search="initech" />, {
      wrapper,
    });

    expect(
      await screen.findByRole('heading', { name: 'Initech' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Acme' }),
    ).not.toBeInTheDocument();
  });

  test("an org admin's own organisation is its section, though the deployment's is another", async () => {
    server.use(
      API_CONFIG_MOCKS.auth.me.get.success({
        mockedResponse: {
          org_id: 'globex',
          user_id: 'kim',
          roles: ['org_admin'],
          permissions: ['oidc:read'],
          groups: [],
          external: false,
          blocked: false,
          disabled_at: '',
          blocked_at: '',
          password_change_required: false,
          hyperdx_role: '',
          hyperdx_identity: '',
        } satisfies TAuthMeResponse,
      }),
    );
    serve([
      provider('globex-okta', 'globex', 'Globex Okta'),
      provider('globex-google', 'globex', 'Globex Google'),
    ]);

    render(<OidcProviderList scope="yours" />, { wrapper });

    expect(await screen.findByText('Globex Okta')).toBeInTheDocument();
    expect(screen.getByText('Globex Google')).toBeInTheDocument();
  });

  test.each([
    { scope: 'yours', says: 'No OIDC providers found' },
    { scope: 'customer', says: 'No customer OIDC providers found' },
  ] as const)(
    'the $scope section says so when no provider matches',
    async ({ says, scope }) => {
      serve(EVERY_PROVIDER);

      render(<OidcProviderList scope={scope} search="nothing-like-this" />, {
        wrapper,
      });

      expect(await screen.findByText(says)).toBeInTheDocument();
    },
  );
});
