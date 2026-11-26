import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  EVERY_PROVIDER,
  PROVIDER_PAGE_HANDLERS,
  providersServed,
} from '@/Settings/components/OidcProviderManagement/OidcProviderList/OidcProviderList.mocks';
import { adminTabPath } from '@/Settings/scenes/AdminControls/adminTabs';
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
import { ViewOrganisationDrawer } from '.';

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

describe('ViewOrganisationDrawer OIDC Providers tab', () => {
  // A customer's link opens its providers' drawer on the provider page; yours lead that page already.
  test.each([
    {
      org: 'globex',
      display: 'Globex',
      shown: 'Globex Okta',
      href: `${adminTabPath('oidc-provider-management')}?org=globex`,
    },
    {
      org: 'hyperi',
      display: 'HyperI',
      shown: 'HyperI Entra',
      href: adminTabPath('oidc-provider-management'),
    },
  ])(
    "$display's providers show without actions, linking to where they are edited",
    async ({ display, href, org, shown }) => {
      server.use(
        API_CONFIG_MOCKS.orgs.org.get.success({
          org_name: org,
          mockedResponse: {
            name: org,
            display_name: display,
            org_ids: [org],
            enabled: true,
            created_at: '',
            updated_at: '',
          },
        }),
      );
      const user = userEvent.setup();
      render(<ViewOrganisationDrawer org_name={org} display_name={display} />, {
        wrapper,
      });

      await user.click(
        screen.getByRole('button', { name: `View ${display} details` }),
      );
      await user.click(
        await screen.findByRole('tab', { name: 'OIDC Providers' }),
      );

      expect(await screen.findByText(shown)).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'OIDC Provider actions' }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Manage OIDC providers' }),
      ).toHaveAttribute('href', href);
    },
  );
});
