import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  EVERY_PROVIDER,
  PROVIDER_PAGE_HANDLERS,
  providersServed,
} from '@/Settings/components/OidcProviderManagement/OidcProviderList/OidcProviderList.mocks';
import { render, screen } from '@testing-library/react';
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
import { OrgOidcProviders } from '.';

vi.mock('@/core/components/RbacProtected/hooks/useRbac', () => ({
  useRbac: () => ({ isAuthorized: true, isLoading: false, isError: false }),
}));

const server = setupServer(
  ...PROVIDER_PAGE_HANDLERS,
  providersServed(EVERY_PROVIDER),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

describe('OrgOidcProviders', () => {
  // Your organisation's view includes the platform providers, which name no organisation.
  test.each([
    {
      org: 'globex',
      shown: ['Globex Google', 'Globex Okta'],
      hidden: ['Platform Okta', 'Acme Entra'],
    },
    {
      org: 'hyperi',
      shown: ['HyperI Entra', 'Platform Okta'],
      hidden: ['Globex Okta', 'Acme Entra'],
    },
  ])(
    "$org's view shows its own providers only",
    async ({ hidden, org, shown }) => {
      render(<OrgOidcProviders org={org} />, { wrapper });

      for (const name of shown) {
        expect(await screen.findByText(name)).toBeInTheDocument();
      }
      for (const name of hidden) {
        expect(screen.queryByText(name)).not.toBeInTheDocument();
      }
    },
  );

  test('a read-only view offers no actions, only the link to where providers are managed', async () => {
    render(
      <OrgOidcProviders
        manageHref="/settings/admin/oidc-provider-management?org=globex"
        org="globex"
        readOnly
      />,
      { wrapper },
    );

    expect(await screen.findByText('Globex Okta')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'OIDC Provider actions' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Manage OIDC providers' }),
    ).toHaveAttribute(
      'href',
      '/settings/admin/oidc-provider-management?org=globex',
    );
  });

  test("the provider page view keeps each card's actions", async () => {
    render(<OrgOidcProviders org="globex" />, { wrapper });

    expect(await screen.findByText('Globex Okta')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'OIDC Provider actions' }),
    ).toHaveLength(2);
  });
});
