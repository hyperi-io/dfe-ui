import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import {
  formatDateToString,
  formatDateXAgo,
} from '@/core/helpers/date.helpers';
import { useFetchAccountDetail } from '@/Settings/hooks/useFetchAccountDetail';
import { IconCheck, IconX } from '@repo/dfe-icons';
import { Spin, Tooltip } from 'antd';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);

export const ViewAccountDetails = ({ username }: { username: string }) => {
  const { data, isLoading, error } = useFetchAccountDetail({ username });

  if (isLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading {username} details</p>
      </>
    );
  }

  if (error) {
    return (
      <GenericErrorCard
        title={`Error fetching ${username} details`}
        description={error.message}
      />
    );
  }

  if (!data) {
    return (
      <EmptyDetail
        title="No account details found"
        description="Please try again later."
      />
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-0 right-0">
        <Tooltip destroyOnHidden title={formatDateToString(data.created_at)}>
          <p className="flex items-center text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-full px-4 py-1">
            Created {formatDateXAgo(data.created_at)}
          </p>
        </Tooltip>
      </div>

      <dl className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
        <dt className={dataListTermStyle}>Username:</dt>
        <dd>{data.username}</dd>
        <dt className={dataListTermStyle}>Enabled:</dt>
        <dd className="flex items-center text-lg">
          {data.enabled ? <IconCheck /> : <IconX />}
        </dd>
        <dt className={dataListTermStyle}>Groups:</dt>
        <dd>
          {data.groups?.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-1">
              {data.groups.map((group) => (
                <li
                  key={group}
                  className="text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-md px-2 py-0.5 whitespace-nowrap"
                >
                  {group}
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
