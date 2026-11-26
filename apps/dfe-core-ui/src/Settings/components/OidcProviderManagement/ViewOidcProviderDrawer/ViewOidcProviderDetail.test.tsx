import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { ViewOidcProviderDetail } from './ViewOidcProviderDetail';
import { ViewOidcProviderGroups } from './ViewOidcProviderGroups';

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
  org: '',
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
  trusted_email_domains: [],
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

const rowsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('dt')).map((term) => [
    term.textContent,
    term.nextElementSibling?.textContent,
  ]);

/** The Details and Groups tabs together, as label and value pairs. */
const renderRows = (provider: TOidcProviderListItem) => {
  const { container } = render(
    <>
      <ViewOidcProviderDetail oidcProvider={provider} />
      <ViewOidcProviderGroups oidcProvider={provider} />
    </>,
    { wrapper },
  );
  return rowsOf(container);
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

  test.each([
    { enabled: true, status: 'Enabled', heading: 'Okta' },
    { enabled: false, status: 'Disabled', heading: 'OktaDisabled' },
  ])(
    'heads the details with the name and reads as $status',
    ({ enabled, status, heading }) => {
      const rows = renderRows({ ...OKTA, display_name: 'Okta', enabled });

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        heading,
      );
      expect(rows).toContainEqual(['Status:', status]);
      expect(rows.map(([label]) => label)).toContain('Created At:');
    },
  );

  test('the group settings sit on their own tab', () => {
    const { container } = render(
      <ViewOidcProviderDetail oidcProvider={OKTA} />,
      { wrapper },
    );
    const labels = rowsOf(container).map(([label]) => label);

    expect(labels).toContain('Issuer:');
    expect(labels).not.toContain('Mode:');
    expect(labels).not.toContain('API Token Environment Variable:');
  });

  test('a client credential with no variable shows no variable row', () => {
    const labels = renderRows({
      ...PROVIDER,
      client_id_env: '',
      client_secret_env: '',
      groups: { ...NO_GROUPS, sync_interval: 0 },
    }).map(([label]) => label);

    expect(labels).toContain('Client ID:');
    expect(labels).not.toContain('Client ID Environment Variable:');
    expect(labels).not.toContain('Client Secret Environment Variable:');
    expect(labels).not.toContain('Sync Interval:');
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
  // Groups read at login never sync, so neither the stored time, the scheduler's last look, nor a message the tag already gives is shown.
  test.each([
    {
      status: 'ok',
      syncError: '',
      syncRow: ['Last Sync:', `OK${SYNCED_AT_LABEL}`],
      header: /^Last synced /,
      message: 'Every directory group synced.',
    },
    {
      status: 'not_configured',
      syncError: NOT_CONFIGURED_MESSAGE,
      syncRow: ['Last Sync:', `Not configured${SYNCED_AT_LABEL}`],
      header: /^Last synced /,
      message:
        'The provider has no directory credential. Edit the provider to add one, then sync again.',
    },
    {
      status: 'user_token',
      syncError: '',
      syncRow: ['Group Sync:', 'Read at login'],
      header: /^Groups read at login$/,
      message: undefined,
    },
    {
      status: 'error',
      syncError: REFUSED_MESSAGE,
      syncRow: ['Last Sync:', `Failed${SYNCED_AT_LABEL}`],
      header: /^Last synced /,
      message: REFUSED_MESSAGE,
    },
  ])(
    'a $status sync reads $syncRow, with what happened under it',
    ({ header, message, status, syncError, syncRow }) => {
      const rows = renderRows({
        ...OKTA,
        last_sync_at: SYNCED_AT,
        last_sync_status: status,
        sync_error: syncError,
      });

      expect(rows).toContainEqual(syncRow);
      expect(screen.getByText(header)).toBeInTheDocument();
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

  test('sync_error reads only for a failed sync', () => {
    renderRows({
      ...OKTA,
      last_sync_at: SYNCED_AT,
      last_sync_status: 'not_configured',
      sync_error: NOT_CONFIGURED_MESSAGE,
    });

    expect(screen.queryByText(NOT_CONFIGURED_MESSAGE)).not.toBeInTheDocument();
  });

  test('a failed sync with no engine message still says it failed', () => {
    const rows = renderRows({
      ...OKTA,
      last_sync_at: SYNCED_AT,
      last_sync_status: 'error',
      sync_error: '',
    });

    expect(rows).toContainEqual(['Sync Message:', 'No groups changed.']);
  });

  test('a status the engine adds later shows as written, with no message', () => {
    const rows = renderRows({
      ...OKTA,
      last_sync_at: SYNCED_AT,
      last_sync_status: 'throttled',
      sync_error: 'rate limited',
    });

    expect(rows).toContainEqual(['Last Sync:', `throttled${SYNCED_AT_LABEL}`]);
    expect(rows.map(([term]) => term)).not.toContain('Sync Message:');
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
      last_sync_status: 'error',
      sync_error: REFUSED_MESSAGE,
    });

    expect(screen.getByText('Failed')).toBeVisible();
    expect(screen.getByText(REFUSED_MESSAGE)).toBeVisible();
  });
});
