import {
  chooseCredentialSource,
  SOURCE_SWITCH_TEST_TIMEOUT_MS,
} from '@/core/components/CredentialField/CredentialField.mocks';
import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { GOOGLE_SERVICE_ACCOUNT_HINT } from '@/core/constants/oidcProviders.constants';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { UpdateOidcProviderDrawer } from '@/Settings/components/OidcProviderManagement/UpdateOidcDrawer';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
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

const NO_GROUPS: TOidcProviderListItem['groups'] = {
  mode: 'manual',
  claim_name: 'groups',
  sync_interval: 3600,
  enrich_on_login: false,
  service_account_json_env: '',
  service_account_json_path: '',
  domain: '',
  tenant_id_env: '',
  client_secret_env: '',
  client_secret_path: '',
  api_token_env: '',
  api_token_path: '',
  okta_domain: '',
  tenant_id: '',
};

const OKTA: TOidcProviderListItem = {
  name: 'okta',
  type: 'okta',
  enabled: true,
  display_name: 'Okta',
  issuer: 'https://example.okta.com',
  client_id: 'okta-client-id',
  client_id_env: 'OKTA_CLIENT_ID',
  client_secret_env: 'OKTA_CLIENT_SECRET',
  client_secret_path: 'oidc/okta/client_secret',
  scopes: ['openid', 'email', 'profile', 'groups'],
  groups: {
    ...NO_GROUPS,
    mode: 'api',
    api_token_env: 'OKTA_API_TOKEN',
    api_token_path: 'oidc/okta/groups_api_token',
    okta_domain: 'example.okta.com',
  },
  created_at: '2026-09-01T00:00:00Z',
  last_sync_at: '',
  last_sync_status: '',
  sync_error: '',
};

const GOOGLE: TOidcProviderListItem = {
  ...OKTA,
  name: 'google',
  type: 'google',
  display_name: 'Google',
  issuer: 'https://accounts.google.com',
  client_id_env: 'GOOGLE_CLIENT_ID',
  client_secret_env: 'GOOGLE_CLIENT_SECRET',
  scopes: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/cloud-identity.groups.readonly',
  ],
  groups: {
    ...NO_GROUPS,
    mode: 'api',
    enrich_on_login: true,
    service_account_json_env: 'GOOGLE_SA_JSON',
    domain: 'example.com',
  },
};

const ENTRA_ID: TOidcProviderListItem = {
  ...OKTA,
  name: 'entra_id',
  type: 'entra_id',
  display_name: 'Entra ID',
  issuer: 'https://login.microsoftonline.com/tenant/v2.0',
  client_id_env: 'ENTRA_CLIENT_ID',
  client_secret_env: 'ENTRA_CLIENT_SECRET',
  groups: {
    ...NO_GROUPS,
    mode: 'api',
    sync_interval: 900,
    tenant_id_env: 'ENTRA_TENANT_ID',
    client_secret_env: 'ENTRA_GRAPH_SECRET',
    client_secret_path: 'oidc/entra_id/groups_client_secret',
  },
};

// The PUT request fields, without the stored secret paths a response carries.
const groupsRequest = ({
  service_account_json_path: _sa,
  client_secret_path: _cs,
  api_token_path: _at,
  ...rest
}: TOidcProviderListItem['groups']) => rest;

const onPut = vi.fn();

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  http.put(
    API_CONFIG_MOCKS.oidcProviders.provider.mockedUrl.replace(
      '{name}',
      ':name',
    ),
    async ({ request }) => {
      onPut(await request.json());
      return HttpResponse.json(OKTA);
    },
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => onPut.mockReset());
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

// A plain control's id is its form field name, which is what these cases assert on.
const field = (id: string) => {
  const control = document.getElementById(id);
  if (!control) {
    throw new Error(`no form control with id "${id}"`);
  }
  return control;
};

// `hidden: true` skips the accessibility check, which costs seconds on a drawer this size.
const openEditDrawer = async (provider: TOidcProviderListItem) => {
  const user = userEvent.setup();
  render(<UpdateOidcProviderDrawer oidcProvider={provider} />, { wrapper });
  await user.click(
    await screen.findByRole(
      'button',
      { name: `Edit ${provider.display_name}` },
      { timeout: 15_000 },
    ),
  );
  await screen.findByRole('button', { hidden: true, name: 'Update' });
  return user;
};

const retype = async (user: UserEvent, control: HTMLElement, value: string) => {
  await user.clear(control);
  await user.paste(value);
};

const chooseGroupMode = async (user: UserEvent, label: string) => {
  await user.click(field('groups_mode'));
  await user.click(await screen.findByTitle(label));
};

const submitAndReadBody = async (user: UserEvent) => {
  await user.click(
    screen.getByRole('button', { hidden: true, name: 'Update' }),
  );
  await waitFor(() => expect(onPut).toHaveBeenCalledTimes(1), {
    timeout: 15_000,
  });
  return onPut.mock.calls[0]?.[0];
};

const STORED_SECRET_HINT = 'Secret stored - leave blank to keep it';

// Each credential label with what it is set to as a value and as an env var.
const CREDENTIALS = [
  { label: 'Client ID', value: 'rotated-client-id', env: 'OKTA_WORKFORCE_ID' },
  {
    label: 'Client Secret',
    value: 'new-client-secret',
    env: 'OKTA_WORKFORCE_SECRET',
  },
  {
    label: 'Directory Secret',
    value: 'directory-secret',
    env: 'ENTRA_DIRECTORY_SECRET',
  },
  { label: 'API Token', value: 'new-api-token', env: 'OKTA_DIRECTORY_TOKEN' },
  {
    label: 'Service Account JSON',
    value: '{"type":"service_account"}',
    env: 'GOOGLE_SA_JSON',
  },
];

const setCredentials = async (
  user: UserEvent,
  source: 'Value' | 'Env Var',
  labels: string[],
) => {
  for (const { env, label, value } of CREDENTIALS) {
    if (!labels.includes(label)) {
      continue;
    }
    const shown = screen
      .getByLabelText(`${label} source`)
      .closest('.ant-select')?.textContent;
    if (!shown?.includes(source)) {
      await chooseCredentialSource(user, label, source);
    }
    await retype(
      user,
      screen.getByLabelText(label),
      source === 'Value' ? value : env,
    );
  }
};

describe(
  'UpdateOidcProviderDrawer',
  { timeout: SOURCE_SWITCH_TEST_TIMEOUT_MS },
  () => {
    test('an unedited save keeps each credential in the source it shows and sends no secret', async () => {
      const user = await openEditDrawer(OKTA);

      expect(await submitAndReadBody(user)).toEqual({
        enabled: true,
        display_name: 'Okta',
        client_id: 'okta-client-id',
        client_id_env: '',
        client_secret_env: '',
        groups: { ...groupsRequest(OKTA.groups), api_token_env: '' },
      });
    });

    test('the provider settings the engine accepts reach the PUT body', async () => {
      const user = await openEditDrawer(OKTA);

      await user.click(field('enabled'));
      await retype(user, field('display_name'), 'Okta Workforce');

      expect(await submitAndReadBody(user)).toMatchObject({
        enabled: false,
        display_name: 'Okta Workforce',
      });
    });

    test.each<{
      expected: Record<string, unknown>;
      labels: string[];
      provider: TOidcProviderListItem;
    }>([
      {
        provider: OKTA,
        labels: ['Client ID', 'Client Secret', 'API Token'],
        expected: {
          client_id: 'rotated-client-id',
          client_id_env: '',
          client_secret: 'new-client-secret',
          client_secret_env: '',
          groups: { api_token: 'new-api-token', api_token_env: '' },
        },
      },
      {
        provider: ENTRA_ID,
        labels: ['Directory Secret'],
        expected: {
          groups: {
            tenant_id: '',
            tenant_id_env: 'ENTRA_TENANT_ID',
            client_secret: 'directory-secret',
            client_secret_env: '',
          },
        },
      },
      {
        provider: GOOGLE,
        labels: ['Service Account JSON'],
        expected: {
          groups: {
            service_account_json: '{"type":"service_account"}',
            service_account_json_env: '',
          },
        },
      },
    ])(
      '$provider.display_name credentials typed as values are sent with their env vars blanked',
      async ({ expected, labels, provider }) => {
        const user = await openEditDrawer(provider);

        await setCredentials(user, 'Value', labels);

        expect(await submitAndReadBody(user)).toMatchObject(expected);
      },
    );

    test('the client ID and secret set by env var send a blank client ID and no secret', async () => {
      const user = await openEditDrawer(OKTA);

      await setCredentials(user, 'Env Var', ['Client ID', 'Client Secret']);

      const body = await submitAndReadBody(user);
      expect(body).toMatchObject({
        client_id: '',
        client_id_env: 'OKTA_WORKFORCE_ID',
        client_secret_env: 'OKTA_WORKFORCE_SECRET',
      });
      expect(body).not.toHaveProperty('client_secret');
    });

    test('the Entra directory secret set by env var sends no secret', async () => {
      const user = await openEditDrawer(ENTRA_ID);

      await setCredentials(user, 'Env Var', ['Directory Secret']);

      const body = await submitAndReadBody(user);
      expect(body.groups).toMatchObject({
        client_secret_env: 'ENTRA_DIRECTORY_SECRET',
      });
      expect(body.groups).not.toHaveProperty('client_secret');
    });

    test('the Okta token set by env var sends no secret', async () => {
      const user = await openEditDrawer(OKTA);

      await setCredentials(user, 'Env Var', ['API Token']);

      const body = await submitAndReadBody(user);
      expect(body.groups.api_token_env).toBe('OKTA_DIRECTORY_TOKEN');
      expect(body.groups).not.toHaveProperty('api_token');
    });

    test.each([
      ['Client Secret', 'client_secret'],
      ['API Token', 'groups.api_token'],
    ])(
      'a %s value typed then cleared keeps the stored secret',
      async (label, path) => {
        const user = await openEditDrawer(OKTA);

        await user.type(screen.getByLabelText(label), 'typo');
        await user.clear(screen.getByLabelText(label));

        expect(await submitAndReadBody(user)).not.toHaveProperty(path);
      },
    );

    test('a stored secret is hinted at and an absent one is not', async () => {
      await openEditDrawer({
        ...OKTA,
        groups: { ...OKTA.groups, api_token_env: '', api_token_path: '' },
      });

      expect(screen.getByLabelText('Client Secret')).toHaveAttribute(
        'placeholder',
        STORED_SECRET_HINT,
      );
      expect(screen.getByLabelText('API Token')).not.toHaveAttribute(
        'placeholder',
        STORED_SECRET_HINT,
      );
    });

    test('a credential set only by env var opens on its env var', async () => {
      const user = await openEditDrawer(GOOGLE);

      expect(screen.getByLabelText('Service Account JSON')).toHaveValue(
        'GOOGLE_SA_JSON',
      );

      const body = await submitAndReadBody(user);
      expect(body.groups.service_account_json_env).toBe('GOOGLE_SA_JSON');
      expect(body).not.toHaveProperty('groups.service_account_json');
    });

    test('Okta group edits reach the PUT body', async () => {
      const user = await openEditDrawer(OKTA);

      await user.click(field('groups_enrich_on_login'));
      await retype(user, field('groups_okta_domain'), 'corp.okta.com');
      await chooseCredentialSource(user, 'API Token', 'Env Var');
      await retype(user, screen.getByLabelText('API Token'), 'OKTA_DIR_TOKEN');
      await retype(user, field('groups_sync_interval'), '600');

      const body = await submitAndReadBody(user);
      expect(body.groups).toEqual({
        ...groupsRequest(OKTA.groups),
        enrich_on_login: true,
        okta_domain: 'corp.okta.com',
        api_token_env: 'OKTA_DIR_TOKEN',
        sync_interval: 600,
      });
    });

    test('Google group edits reach the PUT body with the mode locked to API and enrichment kept on', async () => {
      const user = await openEditDrawer(GOOGLE);

      await retype(user, field('groups_domain'), 'corp.example.com');
      await retype(
        user,
        screen.getByLabelText('Service Account JSON'),
        'GOOGLE_DIR_SA',
      );
      await retype(user, field('groups_sync_interval'), '900');
      expect(field('groups_mode')).toBeDisabled();
      expect(field('groups_enrich_on_login')).toBeDisabled();

      const body = await submitAndReadBody(user);
      expect(body.groups).toEqual({
        ...groupsRequest(GOOGLE.groups),
        mode: 'api',
        enrich_on_login: true,
        domain: 'corp.example.com',
        service_account_json_env: 'GOOGLE_DIR_SA',
        sync_interval: 900,
      });
      expect(body.groups).not.toHaveProperty('admin_email');
    });

    test('Google shows only its own group fields, with no admin email', async () => {
      await openEditDrawer(GOOGLE);

      expect(field('groups_domain')).toBeInTheDocument();
      expect(screen.getByLabelText('Service Account JSON')).toBeInTheDocument();
      for (const id of [
        'groups_admin_email',
        'groups_claim_name',
        'groups_okta_domain',
      ]) {
        expect(document.getElementById(id)).toBeNull();
      }
      for (const label of ['Tenant ID', 'Directory Secret', 'API Token']) {
        expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
      }
      expect(screen.getByText(GOOGLE_SERVICE_ACCOUNT_HINT)).toBeInTheDocument();
    });

    test('the stored scopes show as a list and an unedited save leaves them out', async () => {
      const user = await openEditDrawer(GOOGLE);

      for (const scope of GOOGLE.scopes) {
        expect(screen.getByTitle(scope)).toBeInTheDocument();
      }
      expect(await submitAndReadBody(user)).not.toHaveProperty('scopes');
    });

    test('an added scope sends the whole list', async () => {
      const user = await openEditDrawer(OKTA);

      await user.type(field('scopes'), 'offline_access ');

      expect((await submitAndReadBody(user)).scopes).toEqual([
        ...OKTA.scopes,
        'offline_access',
      ]);
    });

    test('Entra ID group edits reach the PUT body', async () => {
      const user = await openEditDrawer(ENTRA_ID);

      await retype(
        user,
        screen.getByLabelText('Tenant ID'),
        'ENTRA_DIRECTORY_TENANT',
      );
      await chooseCredentialSource(user, 'Directory Secret', 'Env Var');
      await retype(
        user,
        screen.getByLabelText('Directory Secret'),
        'ENTRA_DIRECTORY_SECRET',
      );

      const body = await submitAndReadBody(user);
      expect(body.groups).toEqual({
        ...groupsRequest(ENTRA_ID.groups),
        tenant_id: '',
        tenant_id_env: 'ENTRA_DIRECTORY_TENANT',
        client_secret_env: 'ENTRA_DIRECTORY_SECRET',
      });
    });

    test.each([
      ['an env var', { tenant_id: '', tenant_id_env: 'ENTRA_TENANT_ID' }],
      ['a value', { tenant_id: 'stored-tenant', tenant_id_env: '' }],
    ])(
      'an unedited Entra ID save sends a tenant stored as %s back as stored',
      async (_source, tenant) => {
        const user = await openEditDrawer({
          ...ENTRA_ID,
          groups: { ...ENTRA_ID.groups, ...tenant },
        });

        expect((await submitAndReadBody(user)).groups).toMatchObject(tenant);
      },
    );

    test('a switch to manual mode clears the directory settings the engine refuses there and keeps the rest', async () => {
      const user = await openEditDrawer(ENTRA_ID);

      await chooseGroupMode(user, 'Manual');

      const body = await submitAndReadBody(user);
      expect(body.groups).toEqual({
        ...groupsRequest(ENTRA_ID.groups),
        mode: 'manual',
        tenant_id_env: '',
        client_secret_env: '',
      });
      expect(body.groups.sync_interval).toBe(900);
    });

    test('Entra ID in api mode with a stored login secret needs no directory secret', async () => {
      const user = await openEditDrawer({
        ...ENTRA_ID,
        groups: {
          ...ENTRA_ID.groups,
          client_secret_env: '',
          client_secret_path: '',
        },
      });

      expect((await submitAndReadBody(user)).groups.client_secret_env).toBe('');
    });

    test('Okta in api mode with a stored API token saves without retyping it', async () => {
      const user = await openEditDrawer({
        ...OKTA,
        groups: { ...OKTA.groups, api_token_env: '' },
      });

      const body = await submitAndReadBody(user);
      expect(body.groups).not.toHaveProperty('api_token');
      expect(body.groups.api_token_env).toBe('');
    });

    test('the fields the engine cannot change are read-only and never sent', async () => {
      const user = await openEditDrawer(OKTA);

      expect(field('name')).toBeDisabled();
      expect(field('type')).toBeDisabled();
      expect(field('issuer')).toBeDisabled();
      expect(field('issuer')).toHaveValue(OKTA.issuer);

      const body = await submitAndReadBody(user);
      expect(body).not.toHaveProperty('name');
      expect(body).not.toHaveProperty('type');
      expect(body).not.toHaveProperty('issuer');
    });
  },
);
