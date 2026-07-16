import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import {
  formatDateToString,
  formatDateXAgo,
} from '@/core/helpers/date.helpers';
import { cn } from '@/core/utils/style';
import { useFetchOidcProviderDetail } from '@/Settings/hooks/useFetchOidcProviderDetail';
import { Spin, Tooltip } from 'antd';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);

export const ViewOidcProviderDetail = ({
  oidcProviderName,
}: {
  oidcProviderName: string;
}) => {
  const {
    data: oidcProvider,
    isLoading,
    error,
  } = useFetchOidcProviderDetail({ name: oidcProviderName });

  if (isLoading) {
    return (
      <>
        <Spin />{' '}
        <p className="sr-only">Loading {oidcProvider?.display_name} detail</p>
      </>
    );
  }

  if (error) {
    return (
      <GenericErrorCard
        title={`Error fetching OIDC provider detail for ${oidcProvider?.display_name}`}
        description={error.message}
      />
    );
  }

  if (!oidcProvider) {
    return (
      <EmptyDetail
        title={`No OIDC provider detail found for ${oidcProviderName}`}
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
          title={formatDateToString(oidcProvider?.last_sync_at)}
        >
          <p className="flex items-center text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-full px-4 py-1">
            Last synced {formatDateXAgo(oidcProvider?.last_sync_at)}
          </p>
        </Tooltip>
      </div>
      <dl className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
        <dt className={dataListTermStyle}>Display Name:</dt>
        <dd>{oidcProvider?.display_name}</dd>
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

      <dl
        className={cn(
          // Grid
          'grid grid-cols-[160px_1fr] gap-x-6 gap-y-1',
          // Text
          'text-foreground/60 dark:text-dark-foreground/60',
          // Border & Spacing
          'mt-6 border-t border-foreground/10 dark:border-dark-foreground/10 pt-2',
        )}
      >
        <dt className={cn(dataListTermStyle)}>Created At:</dt>
        <dd>{formatDateToString(oidcProvider?.created_at)}</dd>
      </dl>
    </div>
  );
};
