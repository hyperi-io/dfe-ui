import { EmptyDetail } from '@/core/components/EmptyDetail';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import {
  formatDateToString,
  formatDateXAgo,
} from '@/core/helpers/date.helpers';
import { cn } from '@/core/utils/style';
import { TOidcProviderListItem } from '@/Settings/hooks/useFetchInfiniteFilteredOidcProviders/types';
import { Tooltip } from 'antd';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);

export const ViewOidcProviderDetail = ({
  oidcProvider,
}: {
  oidcProvider: TOidcProviderListItem;
}) => {
  if (!oidcProvider) {
    return (
      <EmptyDetail
        title="No OIDC provider detail found."
        description="Please try again later."
      />
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <h1 className="text-lg font-semibold">{oidcProvider?.display_name}</h1>
        <Tooltip
          destroyOnHidden
          title={
            oidcProvider?.last_sync_at ? (
              <div className="flex flex-col gap-2">
                <span className="font-medium">Previous Sync Details</span>
                <span>
                  Synced at: {formatDateToString(oidcProvider?.last_sync_at)}
                </span>
                <span>Status: {oidcProvider?.last_sync_status}</span>
                {oidcProvider?.sync_error ? (
                  <span>Error: {oidcProvider?.sync_error}</span>
                ) : null}
              </div>
            ) : null
          }
        >
          <p className="flex items-center text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-full px-4 py-1">
            {oidcProvider?.last_sync_at ? (
              <>Last synced {formatDateXAgo(oidcProvider?.last_sync_at)}</>
            ) : (
              <span>Not synced yet</span>
            )}
          </p>
        </Tooltip>
      </div>
      <dl className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
        <dt className={dataListTermStyle}>Name:</dt>
        <dd>{oidcProvider?.name}</dd>
        <dt className={dataListTermStyle}>Display Name:</dt>
        <dd>{oidcProvider?.display_name}</dd>
        <dt className={dataListTermStyle}>Type:</dt>
        <dd>{oidcProvider?.type}</dd>
        <dt className={dataListTermStyle}>Issuer:</dt>
        <dd>{oidcProvider?.issuer}</dd>
        <dt className={dataListTermStyle}>Client ID Environment:</dt>
        <dd>
          {oidcProvider?.client_id_env ? (
            oidcProvider.client_id_env
          ) : (
            <EmptyData />
          )}
        </dd>
      </dl>

      <SimpleCollapse
        className="border-none px-0"
        title="Groups"
        defaultOpen={true}
      >
        <dl className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
          <dt className={dataListTermStyle}>Mode:</dt>
          <dd>{oidcProvider?.groups?.mode}</dd>
          {oidcProvider?.groups?.claim_name && (
            <>
              <dt className={dataListTermStyle}>Claim Name:</dt>
              <dd>{oidcProvider?.groups?.claim_name}</dd>
            </>
          )}
          {oidcProvider?.groups?.sync_interval && (
            <>
              <dt className={dataListTermStyle}>Sync Interval:</dt>
              <dd>{oidcProvider?.groups?.sync_interval} seconds</dd>
            </>
          )}
          {oidcProvider?.groups?.service_account_json_env && (
            <>
              <dt className={dataListTermStyle}>Service Account JSON:</dt>
              <dd>{oidcProvider?.groups?.service_account_json_env}</dd>
            </>
          )}
          {oidcProvider?.groups?.admin_email && (
            <>
              <dt className={dataListTermStyle}>Admin Email:</dt>
              <dd>{oidcProvider?.groups?.admin_email}</dd>
            </>
          )}
          {oidcProvider?.groups?.domain && (
            <>
              <dt className={dataListTermStyle}>Domain:</dt>
              <dd>{oidcProvider?.groups?.domain}</dd>
            </>
          )}
          {oidcProvider?.groups?.tenant_id_env && (
            <>
              <dt className={dataListTermStyle}>Tenant ID:</dt>
              <dd>{oidcProvider?.groups?.tenant_id_env}</dd>
            </>
          )}
          {oidcProvider?.groups?.client_secret_env && (
            <>
              <dt className={dataListTermStyle}>Client Secret:</dt>
              <dd>{oidcProvider?.groups?.client_secret_env}</dd>
            </>
          )}
          {oidcProvider?.groups?.api_token_env && (
            <>
              <dt className={dataListTermStyle}>API Token:</dt>
              <dd>{oidcProvider?.groups?.api_token_env}</dd>
            </>
          )}
          {oidcProvider?.groups?.okta_domain && (
            <>
              <dt className={dataListTermStyle}>Okta Domain:</dt>
              <dd>{oidcProvider?.groups?.okta_domain}</dd>
            </>
          )}
        </dl>
      </SimpleCollapse>

      <dl
        className={cn(
          // Grid
          'grid grid-cols-[160px_1fr] gap-x-6 gap-y-1',
          // Text
          'text-foreground/60 dark:text-dark-foreground/60',
          // Border & Spacing
          'mt-2 border-t border-foreground/10 dark:border-dark-foreground/10 pt-2',
        )}
      >
        <dt className={cn(dataListTermStyle)}>Created At:</dt>
        <dd>{formatDateToString(oidcProvider?.created_at)}</dd>
      </dl>
    </div>
  );
};
