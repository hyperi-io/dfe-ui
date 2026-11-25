import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  onTestFinished,
  test,
  vi,
} from 'vitest';
import { OidcProviderManagement } from '.';

// The list has tests of its own; here the page only decides which sections and buttons it offers, and what it hands each list.
const listProps = vi.hoisted(() => [] as Record<string, unknown>[]);
vi.mock('./OidcProviderList', () => ({
  OidcProviderList: (props: Record<string, unknown>) => {
    listProps.push(props);
    return null;
  },
}));

const CUSTOMER_OPENER = 'Configure Customer OIDC Provider';
const CUSTOMER_SECTION = 'Customer OIDC providers';
const YOUR_SECTION = "Your organisation's OIDC providers";

const signedInWith = (roles: string[], permissions: string[]) =>
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: {
      org_id: 'acme',
      user_id: 'kim',
      roles,
      permissions,
      groups: [],
      external: false,
      blocked: false,
      disabled_at: '',
      blocked_at: '',
      password_change_required: false,
      hyperdx_role: '',
      hyperdx_identity: '',
    } satisfies TAuthMeResponse,
  });

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

describe('OidcProviderManagement', () => {
  test("a platform admin sees customers' providers in a section of their own, with its own button", async () => {
    server.use(signedInWith(['admin'], ['*']));
    render(<OidcProviderManagement />, { wrapper });

    await waitFor(() => expect(useAuthStore.getState().me).not.toBeNull());
    expect(
      screen.getByRole('button', { name: 'Configure New OIDC Provider' }),
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: CUSTOMER_OPENER })).toBeEnabled();
    // Your organisation's section leads, customers' below it.
    expect(
      screen
        .getByText(YOUR_SECTION)
        .compareDocumentPosition(screen.getByText(CUSTOMER_SECTION)),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  test("an organisation's link opens its providers over the whole customer section", async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('org=globex') as ReturnType<typeof useSearchParams>,
    );
    onTestFinished(() => {
      vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams('') as ReturnType<typeof useSearchParams>,
      );
    });
    server.use(signedInWith(['admin'], ['*']));
    render(<OidcProviderManagement />, { wrapper });

    await waitFor(() =>
      expect(listProps.at(-1)).toMatchObject({ scope: 'customer' }),
    );
    expect(listProps.findLast(({ scope }) => scope === 'customer')).toEqual({
      onOrgClosed: expect.any(Function),
      openOrg: 'globex',
      scope: 'customer',
      search: '',
    });
    expect(
      listProps.findLast(({ scope }) => scope === 'yours')?.openOrg,
    ).toBeUndefined();
  });

  test("an org admin sees its own organisation's section only", async () => {
    server.use(signedInWith(['org_admin'], ['oidc:read', 'oidc:write']));
    render(<OidcProviderManagement />, { wrapper });

    // Which buttons show depends on the signed-in account, so an absent one means something only once it loads.
    await waitFor(() => expect(useAuthStore.getState().me).not.toBeNull());
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: CUSTOMER_OPENER }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: 'Configure New OIDC Provider' }),
    ).toBeEnabled();
    expect(screen.queryByText(CUSTOMER_SECTION)).not.toBeInTheDocument();
    expect(screen.getByText(YOUR_SECTION)).toBeInTheDocument();
  });
});
