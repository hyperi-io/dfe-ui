import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
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
  admin_email: '',
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
  groups: {
    ...NO_GROUPS,
    service_account_json_env: 'GOOGLE_SA_JSON',
    admin_email: 'admin@example.com',
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

// A control's id is its form field name, which is what each case asserts on.
const field = (id: string) => {
  const control = document.getElementById(id);
  if (!control) {
    throw new Error(`no form control with id "${id}"`);
  }
  return control;
};

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
  await screen.findByRole('button', { name: 'Update' });
  return user;
};

const retype = async (user: UserEvent, id: string, value: string) => {
  await user.clear(field(id));
  await user.paste(value);
};

const chooseGroupMode = async (user: UserEvent, label: string) => {
  await user.click(field('groups_mode'));
  await user.click(await screen.findByTitle(label));
};

const submitAndReadBody = async (user: UserEvent) => {
  await user.click(screen.getByRole('button', { name: 'Update' }));
  await waitFor(() => expect(onPut).toHaveBeenCalledTimes(1), {
    timeout: 15_000,
  });
  return onPut.mock.calls[0]?.[0];
};

describe('UpdateOidcProviderDrawer', () => {
  test('an unedited save sends the stored settings back and no secret', async () => {
    const user = await openEditDrawer(OKTA);

    expect(await submitAndReadBody(user)).toEqual({
      enabled: true,
      display_name: 'Okta',
      client_id: 'okta-client-id',
      client_id_env: 'OKTA_CLIENT_ID',
      client_secret_env: 'OKTA_CLIENT_SECRET',
      groups: groupsRequest(OKTA.groups),
    });
  });

  test('every provider field the engine accepts reaches the PUT body', async () => {
    const user = await openEditDrawer(OKTA);

    await user.click(field('enabled'));
    await retype(user, 'display_name', 'Okta Workforce');
    await retype(user, 'client_id', 'rotated-client-id');
    await retype(user, 'client_id_env', 'OKTA_WORKFORCE_CLIENT_ID');
    await retype(user, 'client_secret_env', 'OKTA_WORKFORCE_CLIENT_SECRET');
    await retype(user, 'client_secret', 'new-client-secret');

    expect(await submitAndReadBody(user)).toEqual({
      enabled: false,
      display_name: 'Okta Workforce',
      client_id: 'rotated-client-id',
      client_id_env: 'OKTA_WORKFORCE_CLIENT_ID',
      client_secret_env: 'OKTA_WORKFORCE_CLIENT_SECRET',
      client_secret: 'new-client-secret',
      groups: groupsRequest(OKTA.groups),
    });
  });

  test('a client secret typed and then cleared is not sent', async () => {
    const user = await openEditDrawer(OKTA);

    await user.type(field('client_secret'), 'typo');
    await user.clear(field('client_secret'));

    expect(await submitAndReadBody(user)).not.toHaveProperty('client_secret');
  });

  test('Okta group edits reach the PUT body', async () => {
    const user = await openEditDrawer(OKTA);

    await user.click(field('groups_enrich_on_login'));
    await retype(user, 'groups_okta_domain', 'corp.okta.com');
    await retype(user, 'groups_api_token_env', 'OKTA_DIRECTORY_TOKEN');
    await retype(user, 'groups_sync_interval', '600');

    const body = await submitAndReadBody(user);
    expect(body.groups).toEqual({
      ...groupsRequest(OKTA.groups),
      tenant_id: '',
      enrich_on_login: true,
      okta_domain: 'corp.okta.com',
      api_token_env: 'OKTA_DIRECTORY_TOKEN',
      sync_interval: 600,
    });
  });

  test('Google group edits and a token-claim mode reach the PUT body', async () => {
    const user = await openEditDrawer(GOOGLE);

    await retype(user, 'groups_admin_email', 'it@example.com');
    await retype(user, 'groups_domain', 'corp.example.com');
    await retype(user, 'groups_service_account_json_env', 'GOOGLE_DIR_SA');
    await chooseGroupMode(user, 'Token Claim');
    await retype(user, 'groups_claim_name', 'roles');

    const body = await submitAndReadBody(user);
    expect(body.groups).toEqual({
      ...groupsRequest(GOOGLE.groups),
      tenant_id: '',
      mode: 'token_claim',
      claim_name: 'roles',
      admin_email: 'it@example.com',
      domain: 'corp.example.com',
      service_account_json_env: 'GOOGLE_DIR_SA',
    });
  });

  test('Entra ID group edits reach the PUT body and a hidden setting is kept', async () => {
    const user = await openEditDrawer(ENTRA_ID);

    await retype(user, 'groups_tenant_id_env', 'ENTRA_DIRECTORY_TENANT');
    await retype(user, 'groups_client_secret_env', 'ENTRA_DIRECTORY_SECRET');
    await chooseGroupMode(user, 'Manual');

    const body = await submitAndReadBody(user);
    expect(body.groups).toEqual({
      ...groupsRequest(ENTRA_ID.groups),
      mode: 'manual',
      tenant_id_env: 'ENTRA_DIRECTORY_TENANT',
      tenant_id: '',
      client_secret_env: 'ENTRA_DIRECTORY_SECRET',
    });
    expect(body.groups.sync_interval).toBe(900);
  });

  test('the fields the engine cannot change are read-only and never sent', async () => {
    const user = await openEditDrawer(OKTA);

    expect(field('name')).toBeDisabled();
    expect(field('type')).toBeDisabled();
    expect(field('issuer')).toBeDisabled();

    const body = await submitAndReadBody(user);
    expect(body).not.toHaveProperty('name');
    expect(body).not.toHaveProperty('type');
    expect(body).not.toHaveProperty('issuer');
  });
});
