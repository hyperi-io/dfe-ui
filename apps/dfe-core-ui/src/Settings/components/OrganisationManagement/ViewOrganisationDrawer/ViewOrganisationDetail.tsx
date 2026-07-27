import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import {
  formatDateToString,
  formatDateXAgo,
} from '@/core/helpers/date.helpers';
import { cn } from '@/core/utils/style';
import { useFetchOrganisationDetail } from '@/Settings/hooks/organisations/useFetchOrganisationDetail';
import { IconCheck, IconX } from '@repo/dfe-icons';
import { Spin, Tooltip } from 'antd';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);

export const ViewOrganisationDetail = ({
  org_name,
  display_name,
}: {
  org_name: string;
  display_name: string;
}) => {
  const {
    data: organisationDetail,
    isLoading,
    error,
  } = useFetchOrganisationDetail({ org_name });

  if (isLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading {display_name} detail</p>
      </>
    );
  }

  if (error) {
    return (
      <GenericErrorCard
        title={`Error fetching organisation detail for ${display_name}`}
        description={error.message}
      />
    );
  }

  if (!organisationDetail) {
    return (
      <EmptyDetail
        title={`No organisation detail found for ${display_name}`}
        description="Please try again later."
      />
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <h1 className="text-lg font-semibold">
          {organisationDetail.display_name}
        </h1>
        <Tooltip
          destroyOnHidden
          title={formatDateToString(organisationDetail.updated_at)}
        >
          <p className="flex items-center text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-full px-4 py-1">
            Updated {formatDateXAgo(organisationDetail.updated_at)}
          </p>
        </Tooltip>
      </div>
      <dl className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
        <dt className={dataListTermStyle}>Organisation ID:</dt>
        <dd>{org_name}</dd>
        <dt className={dataListTermStyle}>Enabled:</dt>
        <dd className="flex items-center text-lg">
          {organisationDetail.enabled ? <IconCheck /> : <IconX />}
        </dd>
        <dt className={dataListTermStyle}>Organisation IDs:</dt>
        <dd>
          {organisationDetail.org_ids?.length > 0 ? (
            <ul className="flex items-center gap-1">
              {organisationDetail.org_ids.map((org_id) => (
                <li
                  key={org_id}
                  className="text-xs bg-tertiary text-white font-semibold dark:bg-dark-tertiary rounded-full px-3 py-1"
                >
                  {org_id}
                </li>
              ))}
            </ul>
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
        <dd>{formatDateToString(organisationDetail.created_at)}</dd>
      </dl>
    </div>
  );
};
