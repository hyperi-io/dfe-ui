import { confirmReauth } from '@/core/utils/test-utils/confirmReauth';
import {
  chooseCredentialSource,
  SOURCE_SWITCH_TEST_TIMEOUT_MS,
} from '@/core/components/CredentialField/CredentialField.mocks';
import {
  chooseOption,
  fillField,
} from '@/core/components/IssuerField/IssuerField.mocks';
import {
  listedOrgs,
  MockIntersectionObserver,
} from '@/core/components/OrgChoiceFormItem/OrgChoiceFormItem.mocks';
import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TCreateOidcProviderResponse } from '@/core/hooks/useCreateOidcProvider/types';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { expectFieldError } from '@/core/utils/test-utils/expectFieldError';
import { CreateOidcProviderDrawer } from '@/Settings/components/OidcProviderManagement/CreateOidcProviderDrawer';
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
  org: '',
  type: 'google',
  enabled: true,
  display_name: 'Google',
  issuer: 'https://accounts.google.com',
  client_id: '',
  client_id_env: 'DFE_OIDC_GOOGLE_CLIENT_ID',
  client_secret_env: 'DFE_OIDC_GOOGLE_CLIENT_SECRET',
  client_secret_path: '',
  scopes: ['openid', 'email', 'profile'],
  groups: {
    mode: 'api',
    claim_name: '',
    sync_interval: 3600,
    enrich_on_login: true,
    service_account_json_env: '',
    service_account_json_path: '',
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
  trusted_email_domains: [],
  sync_error: '',
};

const onPost = vi.fn();

// The customer drawer's organisation picker pages its list on scroll.
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const server = setupServer(
  listedOrgs,
  API_CONFIG_MOCKS.auth.reauth.post.success(),
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.accounts.me.get.success(),
  API_CONFIG_MOCKS.system.organisation.get.success({
    mockedResponse: { name: 'hyperi', display_name: 'HyperI' },
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

const OPENERS = {
  customer: 'Configure Customer OIDC Provider',
  yours: 'Configure New OIDC Provider',
};

// `hidden: true` skips the accessibility check, which costs seconds on a drawer this size.
const openCreateDrawer = async (scope: 'customer' | 'yours' = 'yours') => {
  const user = userEvent.setup();
  render(<CreateOidcProviderDrawer scope={scope} />, { wrapper });
  await user.click(
    await screen.findByRole(
      'button',
      { name: OPENERS[scope] },
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

// A new Okta provider starts in API mode, which needs its directory token.
const chooseOkta = async (user: UserEvent) => {
  await chooseType(user, 'Okta');
  await fillField(user, 'API Token', 'okta-token');
};

const clickCreate = async (user: UserEvent) => {
  await user.click(
    screen.getByRole('button', { hidden: true, name: 'Create' }),
  );
};

const submitAndReadBody = async (user: UserEvent) => {
  await clickCreate(user);
  await waitFor(() => expect(onPost).toHaveBeenCalledTimes(1), {
    timeout: 15_000,
  });
  return onPost.mock.calls[0]?.[0];
};

describe(
  'CreateOidcProviderDrawer',
  { timeout: SOURCE_SWITCH_TEST_TIMEOUT_MS },
  () => {
    test('opens without a password prompt and asks only when the engine says the create needs it', async () => {
      const grants: (string | null)[] = [];
      server.use(
        http.post(
          API_CONFIG_MOCKS.oidcProviders.default.mockedUrl,
          ({ request }) => {
            const grant = request.headers.get('X-DFE-Reauth');
            grants.push(grant);
            return grant
              ? HttpResponse.json(CREATED)
              : HttpResponse.json(
                  {
                    title: 'Forbidden',
                    code: 'reauth_required',
                    detail: 'Confirm it is you',
                  },
                  { status: 403 },
                );
          },
        ),
      );
      const user = await openCreateDrawer();
      expect(screen.queryByLabelText('Your password')).not.toBeInTheDocument();

      await chooseOkta(user);
      await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');
      await clickCreate(user);
      await confirmReauth(user);

      await waitFor(() => expect(grants).toHaveLength(2), { timeout: 15_000 });
      expect(grants[0]).toBeNull();
      expect(grants[1]).toBeTruthy();
    });

    test("Google is sent with the preset's client env vars and API groups", async () => {
      const user = await openCreateDrawer();

      const body = await submitAndReadBody(user);
      expect(body.org).toBe('');
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

    test('the Entra tenant comes from the issuer and the directory secret from its source', async () => {
      const user = await openCreateDrawer();

      await chooseType(user, 'Entra ID');
      await fillField(user, 'Directory (Tenant) ID', 'tenant-guid');
      await chooseCredentialSource(user, 'Directory Secret', 'Env Var');
      await fillField(user, 'Directory Secret', 'ENTRA_DIRECTORY_SECRET');

      const body = await submitAndReadBody(user);
      expect(body.groups).toMatchObject({
        tenant_id: 'tenant-guid',
        tenant_id_env: '',
        client_secret_env: 'ENTRA_DIRECTORY_SECRET',
      });
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

    test('the Okta token and domain are sent with API groups', async () => {
      const user = await openCreateDrawer();

      await chooseOkta(user);
      await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');

      const body = await submitAndReadBody(user);
      expect(body.groups).toMatchObject({
        mode: 'api',
        api_token: 'okta-token',
        okta_domain: 'dev-123.okta.com',
      });
      expect(body.groups).not.toHaveProperty('api_token_env');
    });

    test('a custom provider is sent with token claim groups and no enrichment', async () => {
      const user = await openCreateDrawer();

      await chooseType(user, 'Custom OIDC Provider');

      const body = await submitAndReadBody(user);
      expect(body.groups.mode).toBe('token_claim');
      expect(body.groups.enrich_on_login).toBe(false);
    });

    // Each provider is named after what tells it from others of its type, and its credential variables after its name.
    test.each<{
      clientIdEnv: string;
      enter: (user: UserEvent) => Promise<void>;
      issuer: string;
      name: string;
      providerName: string;
    }>([
      {
        name: 'Google sends its fixed issuer',
        enter: async () => {},
        issuer: 'https://accounts.google.com',
        providerName: 'google',
        clientIdEnv: 'DFE_OIDC_GOOGLE_CLIENT_ID',
      },
      {
        name: 'Google is named after its first trusted domain',
        enter: async (user) => {
          await user.type(
            screen.getByLabelText('Trusted Email Domains'),
            'hyperi.io{Enter}',
          );
        },
        issuer: 'https://accounts.google.com',
        providerName: 'google-hyperi.io',
        clientIdEnv: 'DFE_OIDC_GOOGLE_HYPERI_IO_CLIENT_ID',
      },
      {
        name: 'Okta builds the org issuer from a pasted org URL',
        enter: async (user) => {
          await chooseOkta(user);
          await fillField(user, 'Okta Org Domain', 'https://dev-123.okta.com/');
        },
        issuer: 'https://dev-123.okta.com',
        providerName: 'okta-dev-123',
        clientIdEnv: 'DFE_OIDC_OKTA_DEV_123_CLIENT_ID',
      },
      {
        name: 'Okta Manual sends the issuer as typed',
        enter: async (user) => {
          await chooseOkta(user);
          await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');
          await chooseOption(user, 'Issuer mode', 'Full URL');
          await fillField(user, 'Issuer', 'https://id.example.com/oauth2/aus9');
        },
        issuer: 'https://id.example.com/oauth2/aus9',
        providerName: 'okta-id.example.com',
        clientIdEnv: 'DFE_OIDC_OKTA_ID_EXAMPLE_COM_CLIENT_ID',
      },
      {
        name: 'Entra ID builds the tenant issuer',
        enter: async (user) => {
          await chooseType(user, 'Entra ID');
          await fillField(user, 'Directory (Tenant) ID', 'tenant-guid');
        },
        issuer: 'https://login.microsoftonline.com/tenant-guid/v2.0',
        providerName: 'entra-tenant-guid',
        clientIdEnv: 'DFE_OIDC_ENTRA_TENANT_GUID_CLIENT_ID',
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
        providerName: 'entra-tenant-guid',
        clientIdEnv: 'DFE_OIDC_ENTRA_TENANT_GUID_CLIENT_ID',
      },
      {
        name: 'a custom provider sends the issuer as typed',
        enter: async (user) => {
          await chooseType(user, 'Custom OIDC Provider');
          await fillField(user, 'Issuer', 'https://idp.example.com');
        },
        issuer: 'https://idp.example.com',
        providerName: 'custom-idp.example.com',
        clientIdEnv: 'DFE_OIDC_CUSTOM_IDP_EXAMPLE_COM_CLIENT_ID',
      },
    ])('$name', async ({ clientIdEnv, enter, issuer, providerName }) => {
      const user = await openCreateDrawer();

      await enter(user);

      const body = await submitAndReadBody(user);
      expect(body).toMatchObject({
        client_id_env: clientIdEnv,
        issuer,
        name: providerName,
      });
    });

    test('a typed name stops following the issuer, and the credential variables follow it', async () => {
      const user = await openCreateDrawer();

      await chooseOkta(user);
      await fillField(user, 'Name', 'okta-prod');
      await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');

      const body = await submitAndReadBody(user);
      expect(body).toMatchObject({
        client_id_env: 'DFE_OIDC_OKTA_PROD_CLIENT_ID',
        client_secret_env: 'DFE_OIDC_OKTA_PROD_CLIENT_SECRET',
        name: 'okta-prod',
      });
    });

    test("your organisation's drawer shows the organisation read-only, with no customer picker", async () => {
      await openCreateDrawer();

      expect(
        screen.getByRole('dialog', {
          hidden: true,
          name: 'Create OIDC Provider',
        }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Organisation')).toBeDisabled();
      expect(screen.getByLabelText('Organisation')).toHaveValue(
        'HyperI (your organisation)',
      );
    });

    test('a customer provider is refused until its organisation is picked, then sent with it', async () => {
      const user = await openCreateDrawer('customer');
      expect(
        screen.getByRole('dialog', {
          hidden: true,
          name: 'Create Customer OIDC Provider',
        }),
      ).toBeInTheDocument();

      await clickCreate(user);
      await expectFieldError('Organisation', 'Select an organisation');
      expect(onPost).not.toHaveBeenCalled();

      await user.click(screen.getByLabelText('Organisation'));
      await user.click(await screen.findByTitle('Acme Corp'));
      const body = await submitAndReadBody(user);
      expect(body.org).toBe('acme');
    });

    test('a refused create no longer shows its reason once the drawer is reopened', async () => {
      const message = "OIDC provider 'google' already exists";
      server.use(
        http.post(API_CONFIG_MOCKS.oidcProviders.default.mockedUrl, () =>
          HttpResponse.json(
            { title: 'Conflict', code: 'conflict', detail: message },
            { status: 409 },
          ),
        ),
      );
      const user = await openCreateDrawer();
      await clickCreate(user);
      expect(
        await screen.findByText(message, {}, { timeout: 15_000 }),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole('button', { hidden: true, name: 'Close' }),
      );
      await user.click(
        screen.getByRole('button', { name: 'Configure New OIDC Provider' }),
      );
      await screen.findByRole('button', { hidden: true, name: 'Create' });

      expect(screen.queryByText(message)).not.toBeInTheDocument();
    });

    test('switching Okta to Entra ID drops the Okta issuer, so none is sent', async () => {
      const user = await openCreateDrawer();

      await chooseType(user, 'Okta');
      await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');
      await chooseType(user, 'Entra ID');
      await clickCreate(user);

      await expectFieldError('Issuer', 'Issuer is required');
      expect(onPost).not.toHaveBeenCalled();
    });
  },
);
