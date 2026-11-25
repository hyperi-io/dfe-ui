import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { Tooltip } from '@/core/components/Tooltip';
import {
  formatDateToString,
  formatDateXAgo,
} from '@/core/helpers/date.helpers';
import { useFetchYourOrganisation } from '@/core/hooks/useFetchYourOrganisation';
import { cn } from '@/core/utils/style';
import { TAG_CLASS } from '@/Settings/components/GroupManagement/GroupCard/TagList';
import { useFetchOrganisationDetail } from '@/Settings/hooks/organisations/useFetchOrganisationDetail';
import { Spin, Tag } from 'antd';

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
  const { data: yours } = useFetchYourOrganisation();
  const isYours = yours?.name === org_name;

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
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          {organisationDetail.display_name}
          {isYours && (
            <Tag color="blue" className="m-0">
              Your organisation
            </Tag>
          )}
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
      {/* Baselines line each label up with the first line of its value, tags included. */}
      <dl className="grid grid-cols-[160px_1fr] items-baseline gap-x-6 gap-y-3">
        <dt className={dataListTermStyle}>Organisation Name:</dt>
        <dd>{org_name}</dd>
        {/* Your organisation cannot be disabled, so it has no status to show. */}
        {yours && !isYours && (
          <>
            <dt className={dataListTermStyle}>Status:</dt>
            <dd>{organisationDetail.enabled ? 'Enabled' : 'Disabled'}</dd>
          </>
        )}
        <dt className={dataListTermStyle}>Created At:</dt>
        <dd>{formatDateToString(organisationDetail.created_at)}</dd>
        <dt className={dataListTermStyle}>Organisation IDs:</dt>
        <dd>
          {organisationDetail.org_ids?.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-2">
              {organisationDetail.org_ids.map((org_id) => (
                <li
                  key={org_id}
                  className={cn(TAG_CLASS, 'whitespace-normal break-all')}
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
    </div>
  );
};
