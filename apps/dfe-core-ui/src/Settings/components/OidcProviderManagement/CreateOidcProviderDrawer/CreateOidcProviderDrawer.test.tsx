import {
  chooseCredentialSource,
  SOURCE_SWITCH_TEST_TIMEOUT_MS,
} from '@/core/components/CredentialField/CredentialField.mocks';
import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TCreateOidcProviderResponse } from '@/core/hooks/useCreateOidcProvider/types';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { CreateOidcProviderDrawer } from '@/Settings/components/OidcProviderManagement/CreateOidcProviderDrawer';
import {
  chooseOption,
  fillField,
} from '@/Settings/components/OidcProviderManagement/CreateUpdateOidcProviderForm/IssuerField.mocks';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { App } from 'antd';
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

const CREATED: TCreateOidcProviderResponse = {
  name: 'google',
  type: 'google',
  enabled: true,
  display_name: 'Google',
  issuer: 'https://accounts.google.com',
  client_id: '',
  client_id_env: 'DFE_OIDC_GOOGLE_CLIENT_ID',
  client_secret_env: 'DFE_OIDC_GOOGLE_CLIENT_SECRET',
  client_secret_path: '',
  groups: {
    mode: 'manual',
    claim_name: '',
    sync_interval: 3600,
    enrich_on_login: true,
    service_account_json_env: '',
    service_account_json_path: '',
    admin_email: '',
    domain: '',
    tenant_id: '',
    tenant_id_env: '',
    client_secret_env: '',
    client_secret_path: '',
    api_token_env: '',
    api_token_path: '',
    okta_domain: '',
  },
  created_at: '2026-09-01T00:00:00Z',
  last_sync_at: '',
  last_sync_status: '',
  sync_error: '',
};

const onPost = vi.fn();

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  http.post(
    API_CONFIG_MOCKS.oidcProviders.default.mockedUrl,
    async ({ request }) => {
      onPost(await request.json());
      return HttpResponse.json(CREATED);
    },
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => onPost.mockReset());
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withReactQuery()
  .withTheme()
  .withWrapper(({ children }) => <App>{children}</App>);

// `hidden: true` skips the accessibility check, which costs seconds on a drawer this size.
const openCreateDrawer = async () => {
  const user = userEvent.setup();
  render(<CreateOidcProviderDrawer title="Add OIDC Provider" />, { wrapper });
  await user.click(
    await screen.findByRole(
      'button',
      { name: 'Add OIDC Provider' },
      { timeout: 15_000 },
    ),
  );
  await screen.findByRole('button', { hidden: true, name: 'Create' });
  return user;
};

const chooseType = async (user: UserEvent, type: string) => {
  await user.click(screen.getByLabelText('Type'));
  await user.click(await screen.findByTitle(type));
};

const submitAndReadBody = async (user: UserEvent) => {
  await user.click(
    screen.getByRole('button', { hidden: true, name: 'Create' }),
  );
  await waitFor(() => expect(onPost).toHaveBeenCalledTimes(1), {
    timeout: 15_000,
  });
  return onPost.mock.calls[0]?.[0];
};

describe(
  'CreateOidcProviderDrawer',
  { timeout: SOURCE_SWITCH_TEST_TIMEOUT_MS },
  () => {
    test("Google is sent with the preset's client env vars and API groups", async () => {
      const user = await openCreateDrawer();

      const body = await submitAndReadBody(user);
      expect(body.groups.mode).toBe('api');
      expect(body.groups.enrich_on_login).toBe(true);
      expect(body.client_id_env).toBe('DFE_OIDC_GOOGLE_CLIENT_ID');
      expect(body.client_secret_env).toBe('DFE_OIDC_GOOGLE_CLIENT_SECRET');
      expect(body).not.toHaveProperty('client_id');
      expect(body).not.toHaveProperty('client_secret');
    });

    test("client values replace the preset's env vars", async () => {
      const user = await openCreateDrawer();

      await chooseCredentialSource(user, 'Client ID', 'Value');
      await fillField(user, 'Client ID', 'google-client-id');
      await chooseCredentialSource(user, 'Client Secret', 'Value');
      await fillField(user, 'Client Secret', 'client-secret');

      const body = await submitAndReadBody(user);
      expect(body).toMatchObject({
        client_id: 'google-client-id',
        client_secret: 'client-secret',
      });
      expect(body).not.toHaveProperty('client_id_env');
      expect(body).not.toHaveProperty('client_secret_env');
    });

    test('the Entra tenant and directory secret are sent from their sources', async () => {
      const user = await openCreateDrawer();

      await chooseType(user, 'Entra ID');
      await fillField(user, 'Directory (Tenant) ID', 'tenant-guid');
      await chooseCredentialSource(user, 'Directory Client Secret', 'Env Var');
      await fillField(
        user,
        'Directory Client Secret',
        'ENTRA_DIRECTORY_SECRET',
      );

      const body = await submitAndReadBody(user);
      expect(body.groups).toMatchObject({
        tenant_id: 'tenant-guid',
        client_secret_env: 'ENTRA_DIRECTORY_SECRET',
      });
      expect(body.groups).not.toHaveProperty('tenant_id_env');
      expect(body.groups).not.toHaveProperty('client_secret');
    });

    test('the Google service account is sent from its source', async () => {
      const user = await openCreateDrawer();

      await chooseCredentialSource(user, 'Service Account JSON', 'Env Var');
      await fillField(user, 'Service Account JSON', 'GOOGLE_SA_JSON');

      const body = await submitAndReadBody(user);
      expect(body.groups.service_account_json_env).toBe('GOOGLE_SA_JSON');
      expect(body.groups).not.toHaveProperty('service_account_json');
    });

    test('the Okta token is sent from its source', async () => {
      const user = await openCreateDrawer();

      await chooseType(user, 'Okta');
      await fillField(user, 'API Token', 'okta-token');

      const body = await submitAndReadBody(user);
      expect(body.groups.api_token).toBe('okta-token');
      expect(body.groups).not.toHaveProperty('api_token_env');
    });

    test('a custom provider is sent with token claim groups and no enrichment', async () => {
      const user = await openCreateDrawer();

      await chooseType(user, 'Custom OIDC Provider');

      const body = await submitAndReadBody(user);
      expect(body.groups.mode).toBe('token_claim');
      expect(body.groups.enrich_on_login).toBe(false);
    });

    test.each<{
      enter: (user: UserEvent) => Promise<void>;
      issuer: string;
      name: string;
    }>([
      {
        name: 'Google sends its fixed issuer',
        enter: async () => {},
        issuer: 'https://accounts.google.com',
      },
      {
        name: 'Okta builds the org issuer from a pasted org URL',
        enter: async (user) => {
          await chooseType(user, 'Okta');
          await fillField(user, 'Okta Org Domain', 'https://dev-123.okta.com/');
        },
        issuer: 'https://dev-123.okta.com',
      },
      {
        name: 'Okta Manual sends the issuer as typed',
        enter: async (user) => {
          await chooseType(user, 'Okta');
          await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');
          await chooseOption(user, 'Issuer mode', 'Full URL');
          await fillField(user, 'Issuer', 'https://id.example.com/oauth2/aus9');
        },
        issuer: 'https://id.example.com/oauth2/aus9',
      },
      {
        name: 'Entra ID builds the tenant issuer',
        enter: async (user) => {
          await chooseType(user, 'Entra ID');
          await fillField(user, 'Directory (Tenant) ID', 'tenant-guid');
        },
        issuer: 'https://login.microsoftonline.com/tenant-guid/v2.0',
      },
      {
        name: 'Entra ID Manual sends the issuer as typed',
        enter: async (user) => {
          await chooseType(user, 'Entra ID');
          await chooseOption(user, 'Issuer mode', 'Full URL');
          await fillField(
            user,
            'Issuer',
            'https://tenant-guid.ciamlogin.com/tenant-guid/v2.0',
          );
        },
        issuer: 'https://tenant-guid.ciamlogin.com/tenant-guid/v2.0',
      },
      {
        name: 'a custom provider sends the issuer as typed',
        enter: async (user) => {
          await chooseType(user, 'Custom OIDC Provider');
          await fillField(user, 'Issuer', 'https://idp.example.com');
        },
        issuer: 'https://idp.example.com',
      },
      {
        name: 'switching Okta to Entra ID drops the Okta issuer',
        enter: async (user) => {
          await chooseType(user, 'Okta');
          await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');
          await chooseType(user, 'Entra ID');
        },
        issuer: '',
      },
    ])('$name', async ({ enter, issuer }) => {
      const user = await openCreateDrawer();

      await enter(user);

      const body = await submitAndReadBody(user);
      expect(body.issuer).toBe(issuer);
    });
  },
);
