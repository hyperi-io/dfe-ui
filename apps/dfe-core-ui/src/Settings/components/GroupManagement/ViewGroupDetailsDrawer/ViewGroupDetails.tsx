import { cn } from '@/core/utils/style';
import { TAG_CLASS } from '@/Settings/components/GroupManagement/GroupCard/TagList';
import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { LinkedMemberName } from '@/Settings/components/GroupManagement/LinkedMemberName';
import { useFetchGroupDetail } from '@/Settings/hooks/groups/useFetchGroupDetail';
import { Spin } from 'antd';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = ({ label = 'None' }: { label?: string }) => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">
    {label}
  </span>
);

export const ViewGroupDetails = ({ group_name }: { group_name: string }) => {
  const { data, isLoading, error } = useFetchGroupDetail({
    group_name,
  });

  if (isLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading {group_name} details</p>
      </>
    );
  }

  if (error) {
    return (
      <GenericErrorCard
        title={`Error fetching ${group_name} details`}
        description={error.message}
      />
    );
  }

  if (!data) {
    return (
      <EmptyDetail
        title="No group details found"
        description="Please try again later."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">{data.name}</h1>
      {/* Baselines line each label up with the first line of its value, tags included. */}
      <dl className="grid grid-cols-[160px_1fr] items-baseline gap-x-6 gap-y-3">
        <dt className={dataListTermStyle}>Description:</dt>
        <dd>{data.description || <EmptyData />}</dd>
        <dt className={dataListTermStyle}>Linked To:</dt>
        <dd className="break-all">
          {data.source_provider ? (
            `${data.source_provider}${data.source_id ? ` (${data.source_id})` : ''}`
          ) : (
            <EmptyData label="Not linked" />
          )}
        </dd>
        <dt className={dataListTermStyle}>Roles:</dt>
        <dd>
          {data.roles?.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-2">
              {data.roles.map((role) => (
                <li
                  key={role}
                  className={cn(TAG_CLASS, 'whitespace-normal break-all')}
                >
                  {role}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyData />
          )}
        </dd>
        <dt className={dataListTermStyle}>Members:</dt>
        <dd>
          {data.members?.length > 0 ||
          (data.linked_members ?? []).length > 0 ? (
            <ul className="flex flex-wrap items-center gap-2">
              {data.members.map((member) => (
                <li
                  key={`member-${member}`}
                  className={cn(TAG_CLASS, 'whitespace-normal break-all')}
                >
                  {member}
                </li>
              ))}
              {(data.linked_members ?? []).map((member) => (
                <li
                  key={`linked-${member}`}
                  className={cn(TAG_CLASS, 'whitespace-normal break-all')}
                >
                  <LinkedMemberName username={member} />
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
