import { NotificationCard } from '@/core/components/NotificationCard';
import { cn } from '@/core/utils/style';
import { useFetchGovernanceActionDetail } from '@/Platform/hooks/governance/useFetchGovernanceActionDetail';
import { Spin } from 'antd';

const dataListTermStyle = 'text-foreground/50 dark:text-foreground/50';
const EmptyText = () => (
  <span className="text-foreground/50 dark:text-foreground/50">None</span>
);

export const ViewActionDetail = ({ name }: { name: string }) => {
  const { data, isLoading, error } = useFetchGovernanceActionDetail({ name });

  return (
    <>
      {isLoading && (
        <>
          <Spin />
          Loading...
        </>
      )}
      {error && (
        <NotificationCard
          title="Error"
          description={error.message}
          type="error"
        />
      )}
      {data && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          <dt className={dataListTermStyle}>Name</dt>
          <dd>{data.name}</dd>
          <dt className={dataListTermStyle}>Description</dt>
          <dd>{data.description || <EmptyText />}</dd>
          <dt className={dataListTermStyle}>Required Action</dt>
          <dd>{data.required_action || <EmptyText />}</dd>
          <dt className={cn(dataListTermStyle, 'col-span-2')}>Changes</dt>
          <dd className="col-span-2">
            {data.changes && data.changes.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {data.changes.map((change) => (
                  <li
                    className="border rounded-md p-2 border-foreground/10 dark:border-foreground/10"
                    key={change.path}
                  >
                    <pre>
                      {Object.entries(change)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </pre>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyText />
            )}
          </dd>
        </dl>
      )}
    </>
  );
};
