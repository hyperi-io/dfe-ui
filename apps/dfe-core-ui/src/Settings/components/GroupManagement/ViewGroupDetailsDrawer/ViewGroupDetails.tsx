import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useFetchGroupDetail } from '@/Settings/hooks/groups/useFetchGroupDetail';
import { Spin } from 'antd';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = ({ label = 'None' }: { label?: string }) => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">
    {label}
  </span>
);

const SourceProvider = ({
  source_id,
  source_provider,
}: {
  source_id: string;
  source_provider: string;
}) => {
  if (source_provider) return source_provider;
  return (
    <EmptyData
      label={source_id ? 'Any provider (set one to restrict the link)' : 'None'}
    />
  );
};

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
    <dl className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
      <dt className={dataListTermStyle}>Group name:</dt>
      <dd>{data.name}</dd>
      <dt className={dataListTermStyle}>Description:</dt>
      <dd>{data.description || <EmptyData />}</dd>
      <dt className={dataListTermStyle}>Scope:</dt>
      <dd className="text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-md px-2 py-0.5 whitespace-nowrap mr-auto">
        {data.scope}
      </dd>
      <dt className={dataListTermStyle}>Source ID:</dt>
      <dd className="break-all">
        {data.source_id || <EmptyData label="Not linked" />}
      </dd>
      <dt className={dataListTermStyle}>Source provider:</dt>
      <dd>
        <SourceProvider
          source_id={data.source_id}
          source_provider={data.source_provider}
        />
      </dd>
      <dt className={dataListTermStyle}>Roles:</dt>
      <dd>
        {data.roles?.length > 0 ? (
          <ul className="flex flex-wrap items-center gap-1">
            {data.roles.map((role) => (
              <li
                key={role}
                className="text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-md px-2 py-0.5 whitespace-nowrap"
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
        {data.members?.length > 0 ? (
          <ul className="flex flex-wrap items-center gap-1">
            {data.members.map((member) => (
              <li
                key={member}
                className="text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-md px-2 py-0.5 whitespace-nowrap"
              >
                {member}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyData />
        )}
      </dd>
    </dl>
  );
};
