import { EmptyDetail } from '@/core/components/EmptyDetail';
import { Tooltip } from '@/core/components/Tooltip';
import {
  formatDateToString,
  formatDateXAgo,
} from '@/core/helpers/date.helpers';
import { cn } from '@/core/utils/style';
import { TAG_CLASS } from '@/Settings/components/GroupManagement/GroupCard/TagList';
import { isReadAtLogin } from '@/Settings/components/OidcProviderManagement/OidcSyncStatusTag';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { Tag } from 'antd';

export const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
// Labels never wrap: the label column grows past 160px to fit the longest, and baselines line each label up with its value's first line.
export const dataListGridStyle =
  'grid grid-cols-[minmax(160px,max-content)_1fr] items-baseline gap-x-6 gap-y-3';
const PILL_STYLE =
  'flex shrink-0 items-center text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-full px-4 py-1';

/** When the provider's groups last changed hands: a sync's time, or that they are read at each login and never synced. */
const SyncPill = ({
  oidcProvider,
}: {
  oidcProvider: TOidcProviderListItem;
}) => {
  if (isReadAtLogin(oidcProvider.last_sync_status)) {
    return <p className={PILL_STYLE}>Groups read at login</p>;
  }
  if (!oidcProvider.last_sync_at) {
    return <p className={PILL_STYLE}>Not synced yet</p>;
  }
  return (
    <Tooltip
      destroyOnHidden
      title={formatDateToString(oidcProvider.last_sync_at)}
    >
      <p className={PILL_STYLE}>
        Last synced {formatDateXAgo(oidcProvider.last_sync_at)}
      </p>
    </Tooltip>
  );
};

const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);

const Tags = ({ items }: { items: readonly string[] }) =>
  items.length ? (
    <ul className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <li key={item} className={cn(TAG_CLASS, 'whitespace-normal break-all')}>
          {item}
        </li>
      ))}
    </ul>
  ) : (
    <EmptyData />
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
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <h1 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
          {oidcProvider.display_name || oidcProvider.name}
          {!oidcProvider.enabled && <Tag className="m-0">Disabled</Tag>}
        </h1>
        <SyncPill oidcProvider={oidcProvider} />
      </div>
      <dl className={dataListGridStyle}>
        <dt className={dataListTermStyle}>Name:</dt>
        <dd className="break-all">{oidcProvider.name}</dd>
        <dt className={dataListTermStyle}>Status:</dt>
        <dd>{oidcProvider.enabled ? 'Enabled' : 'Disabled'}</dd>
        <dt className={dataListTermStyle}>Type:</dt>
        <dd>{oidcProvider.type}</dd>
        <dt className={dataListTermStyle}>Issuer:</dt>
        <dd className="break-all">{oidcProvider.issuer || <EmptyData />}</dd>
        <dt className={dataListTermStyle}>Scopes:</dt>
        <dd>
          <Tags items={oidcProvider.scopes ?? []} />
        </dd>
        <dt className={dataListTermStyle}>Trusted Email Domains:</dt>
        <dd>
          <Tags items={oidcProvider.trusted_email_domains ?? []} />
        </dd>
        <dt className={dataListTermStyle}>Client ID:</dt>
        <dd className="break-all">{oidcProvider.client_id || <EmptyData />}</dd>
        {oidcProvider.client_id_env && (
          <>
            <dt className={dataListTermStyle}>
              Client ID Environment Variable:
            </dt>
            <dd className="break-all">{oidcProvider.client_id_env}</dd>
          </>
        )}
        {oidcProvider.client_secret_env && (
          <>
            <dt className={dataListTermStyle}>
              Client Secret Environment Variable:
            </dt>
            <dd className="break-all">{oidcProvider.client_secret_env}</dd>
          </>
        )}
        <dt className={dataListTermStyle}>Created At:</dt>
        <dd>{formatDateToString(oidcProvider.created_at)}</dd>
      </dl>
    </div>
  );
};
