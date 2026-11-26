import { formatDateToString } from '@/core/helpers/date.helpers';
import { groupModeLabel } from '@/core/helpers/oidcProviderFieldRules';
import {
  isReadAtLogin,
  OidcSyncStatusTag,
  syncStatusDetail,
} from '@/Settings/components/OidcProviderManagement/OidcSyncStatusTag';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { Fragment } from 'react';
import { dataListGridStyle, dataListTermStyle } from './ViewOidcProviderDetail';

/** How the provider's groups reach DFE, and how the last sync went. */
export const ViewOidcProviderGroups = ({
  oidcProvider,
}: {
  oidcProvider: TOidcProviderListItem;
}) => {
  const groups = oidcProvider.groups;
  const syncDetail = syncStatusDetail(
    oidcProvider.last_sync_status,
    oidcProvider.sync_error,
  );
  const readAtLogin = isReadAtLogin(oidcProvider.last_sync_status);
  // Each row shows only once the provider sets it.
  const optionalRows: [string, string | undefined][] = [
    ['Claim Name:', groups?.claim_name],
    [
      'Sync Interval:',
      groups?.sync_interval ? `${groups.sync_interval} seconds` : undefined,
    ],
  ];
  const directoryRows: [string, string | undefined][] = [
    [
      'Service Account JSON Environment Variable:',
      groups?.service_account_json_env,
    ],
    ['Domain:', groups?.domain],
    ['Tenant ID:', groups?.tenant_id],
    ['Tenant ID Environment Variable:', groups?.tenant_id_env],
    [
      'Directory Client Secret Environment Variable:',
      groups?.client_secret_env,
    ],
    ['API Token Environment Variable:', groups?.api_token_env],
    ['Okta Domain:', groups?.okta_domain],
  ];
  const rows = (items: [string, string | undefined][]) =>
    items.map(
      ([label, value]) =>
        value && (
          <Fragment key={label}>
            <dt className={dataListTermStyle}>{label}</dt>
            <dd className="break-all">{value}</dd>
          </Fragment>
        ),
    );

  return (
    <dl className={dataListGridStyle}>
      <dt className={dataListTermStyle}>Mode:</dt>
      <dd>{groupModeLabel(groups?.mode ?? '')}</dd>
      {rows(optionalRows)}
      <dt className={dataListTermStyle}>Enrich on Login:</dt>
      <dd>{groups?.enrich_on_login ? 'Yes' : 'No'}</dd>
      {rows(directoryRows)}
      {oidcProvider.last_sync_at && (
        <>
          <dt className={dataListTermStyle}>
            {readAtLogin ? 'Group Sync:' : 'Last Sync:'}
          </dt>
          <dd className="flex flex-wrap items-center gap-x-2">
            <OidcSyncStatusTag status={oidcProvider.last_sync_status} />
            {!readAtLogin && formatDateToString(oidcProvider.last_sync_at)}
          </dd>
          {/* The Read at login tag already says it. */}
          {syncDetail && !readAtLogin && (
            <>
              <dt className={dataListTermStyle}>Sync Message:</dt>
              <dd>{syncDetail}</dd>
            </>
          )}
        </>
      )}
    </dl>
  );
};
