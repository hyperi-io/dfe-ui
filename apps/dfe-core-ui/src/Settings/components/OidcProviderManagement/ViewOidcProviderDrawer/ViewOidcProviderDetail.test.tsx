import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { ViewOidcProviderDetail } from './ViewOidcProviderDetail';

const NO_GROUPS: TOidcProviderListItem['groups'] = {
  mode: 'manual',
  claim_name: '',
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

const PROVIDER: TOidcProviderListItem = {
  name: 'provider',
  type: 'generic',
  enabled: true,
  display_name: 'Provider',
  issuer: 'https://idp.example.com',
  client_id: 'client-id',
  client_id_env: 'IDP_CLIENT_ID',
  client_secret_env: 'IDP_CLIENT_SECRET',
  client_secret_path: 'oidc/provider/client_secret',
  scopes: ['openid', 'email', 'profile', 'groups'],
  groups: NO_GROUPS,
  created_at: '2026-09-01T00:00:00Z',
  last_sync_at: '',
  last_sync_status: '',
  sync_error: '',
};

const OKTA: TOidcProviderListItem = {
  ...PROVIDER,
  type: 'okta',
  client_id_env: 'OKTA_CLIENT_ID',
  client_secret_env: 'OKTA_CLIENT_SECRET',
  groups: {
    ...NO_GROUPS,
    mode: 'api',
    enrich_on_login: true,
    api_token_env: 'OKTA_API_TOKEN',
    okta_domain: 'example.okta.com',
  },
};

const ENTRA_ID: TOidcProviderListItem = {
  ...PROVIDER,
  type: 'entra_id',
  client_id_env: 'ENTRA_CLIENT_ID',
  client_secret_env: 'ENTRA_CLIENT_SECRET',
  groups: {
    ...NO_GROUPS,
    mode: 'api',
    tenant_id_env: 'ENTRA_TENANT_ID',
    client_secret_env: 'ENTRA_GRAPH_SECRET',
  },
};

const GOOGLE_GROUPS_SCOPE =
  'https://www.googleapis.com/auth/cloud-identity.groups.readonly';

const GOOGLE: TOidcProviderListItem = {
  ...PROVIDER,
  type: 'google',
  scopes: ['openid', 'email', 'profile', GOOGLE_GROUPS_SCOPE],
  groups: {
    ...NO_GROUPS,
    service_account_json_env: 'GOOGLE_SA_JSON',
    domain: 'example.com',
  },
};

const { wrapper } = buildTestWrapper().withTheme();

const renderRows = (provider: TOidcProviderListItem) => {
  const { container } = render(
    <ViewOidcProviderDetail oidcProvider={provider} />,
    { wrapper },
  );
  return Array.from(container.querySelectorAll('dt')).map((term) => [
    term.textContent,
    term.nextElementSibling?.textContent,
  ]);
};

describe('ViewOidcProviderDetail', () => {
  test.each([
    ['Okta', OKTA],
    ['Entra ID', ENTRA_ID],
    ['Google', GOOGLE],
  ])('%s gives every row its own label', (_name, provider) => {
    const labels = renderRows(provider).map(([label]) => label);

    expect(new Set(labels).size).toBe(labels.length);
  });

  test.each([
    [
      'Okta',
      OKTA,
      [
        ['Client ID Environment Variable:', 'OKTA_CLIENT_ID'],
        ['Client Secret Environment Variable:', 'OKTA_CLIENT_SECRET'],
        ['API Token Environment Variable:', 'OKTA_API_TOKEN'],
      ],
    ],
    [
      'Entra ID',
      ENTRA_ID,
      [
        ['Client ID Environment Variable:', 'ENTRA_CLIENT_ID'],
        ['Client Secret Environment Variable:', 'ENTRA_CLIENT_SECRET'],
        ['Tenant ID Environment Variable:', 'ENTRA_TENANT_ID'],
        ['Directory Client Secret Environment Variable:', 'ENTRA_GRAPH_SECRET'],
      ],
    ],
    [
      'Google',
      GOOGLE,
      [['Service Account JSON Environment Variable:', 'GOOGLE_SA_JSON']],
    ],
  ])(
    '%s names each environment variable as a variable, in plain text',
    (_name, provider, expected) => {
      const rows = renderRows(provider);

      for (const row of expected) {
        expect(rows).toContainEqual(row);
      }
      expect(
        screen.queryByRole('button', { name: /value/ }),
      ).not.toBeInTheDocument();
    },
  );

  test('no environment variable name is labelled as the secret it points at', () => {
    const labels = [OKTA, ENTRA_ID, GOOGLE].flatMap((provider) =>
      renderRows(provider).map(([label]) => label),
    );

    for (const secretLabel of [
      'Client Secret:',
      'API Token:',
      'Service Account JSON:',
    ]) {
      expect(labels).not.toContain(secretLabel);
    }
  });

  test('the client id and tenant id show as themselves, beside their variables', () => {
    const rows = renderRows({
      ...ENTRA_ID,
      groups: { ...ENTRA_ID.groups, tenant_id: 'contoso.onmicrosoft.com' },
    });

    expect(rows).toContainEqual(['Client ID:', 'client-id']);
    expect(rows).toContainEqual(['Tenant ID:', 'contoso.onmicrosoft.com']);
    expect(rows).toContainEqual([
      'Tenant ID Environment Variable:',
      'ENTRA_TENANT_ID',
    ]);
  });

  test('Google lists each scope it requests and no admin email', () => {
    const rows = renderRows(GOOGLE);

    expect(rows).toContainEqual([
      'Scopes:',
      `openidemailprofile${GOOGLE_GROUPS_SCOPE}`,
    ]);
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['openid', 'email', 'profile', GOOGLE_GROUPS_SCOPE]);
    expect(rows.map(([label]) => label)).not.toContain('Admin Email:');
  });

  test('a provider with no scopes says so', () => {
    expect(renderRows({ ...PROVIDER, scopes: [] })).toContainEqual([
      'Scopes:',
      'None',
    ]);
  });

  test('enrich on login shows No when it is off', () => {
    expect(renderRows(GOOGLE)).toContainEqual(['Enrich on Login:', 'No']);
    expect(renderRows(OKTA)).toContainEqual(['Enrich on Login:', 'Yes']);
  });
});

const SYNCED_AT = '2026-10-10T08:30:00Z';
const SYNCED_AT_LABEL = '10 Oct 2026, 08:30';
const NOT_CONFIGURED_MESSAGE =
  'The directory credential is not configured, so no groups were synced; configure it on the provider and sync again';
const REFUSED_MESSAGE =
  'The directory API could not use the configured credential: check it is current and valid; the engine log has the reason';

describe('ViewOidcProviderDetail sync status', () => {
  test.each([
    { status: 'ok', label: 'OK', syncError: '', message: undefined },
    {
      status: 'not_configured',
      label: 'Not configured',
      syncError: NOT_CONFIGURED_MESSAGE,
      message: NOT_CONFIGURED_MESSAGE,
    },
    {
      status: 'error',
      label: 'Failed',
      syncError: REFUSED_MESSAGE,
      message: REFUSED_MESSAGE,
    },
  ])(
    'a $status sync reads $label, with the engine message when it sent one',
    ({ status, label, syncError, message }) => {
      const rows = renderRows({
        ...OKTA,
        last_sync_at: SYNCED_AT,
        last_sync_status: status,
        sync_error: syncError,
      });

      expect(rows).toContainEqual(['Last Sync:', `${label}${SYNCED_AT_LABEL}`]);
      expect(rows.find(([term]) => term === 'Sync Message:')?.[1]).toBe(
        message,
      );
      expect(screen.queryByText(status)).not.toBeInTheDocument();
    },
  );

  test('a partial sync says how many groups it left and why', () => {
    const rows = renderRows({
      ...OKTA,
      last_sync_at: SYNCED_AT,
      last_sync_status:
        'partial: 2 of 10 groups skipped, their identifier makes no valid group name',
      sync_error: '',
    });

    expect(rows).toContainEqual(['Last Sync:', `Partial${SYNCED_AT_LABEL}`]);
    expect(rows).toContainEqual([
      'Sync Message:',
      '2 of 10 groups skipped, their identifier makes no valid group name',
    ]);
  });

  test('a status the engine adds later shows as written', () => {
    const rows = renderRows({
      ...OKTA,
      last_sync_at: SYNCED_AT,
      last_sync_status: 'throttled',
    });

    expect(rows).toContainEqual(['Last Sync:', `throttled${SYNCED_AT_LABEL}`]);
  });

  test('a provider that has never synced shows no sync row', () => {
    const rows = renderRows(OKTA);

    expect(rows.map(([term]) => term)).not.toContain('Last Sync:');
    expect(rows.map(([term]) => term)).not.toContain('Sync Message:');
    expect(screen.getByText('Not synced yet')).toBeInTheDocument();
  });

  test('the status and message are on the page without a hover', () => {
    renderRows({
      ...OKTA,
      last_sync_at: SYNCED_AT,
      last_sync_status: 'not_configured',
      sync_error: NOT_CONFIGURED_MESSAGE,
    });

    expect(screen.getByText('Not configured')).toBeVisible();
    expect(screen.getByText(NOT_CONFIGURED_MESSAGE)).toBeVisible();
  });
});
