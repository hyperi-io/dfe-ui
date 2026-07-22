import { NotificationCard } from '@/core/components/NotificationCard';
import { useFetchGovernancePolicyDetail } from '@/Platform/hooks/governance/useFetchGovernancePolicyDetail';
import { Spin } from 'antd';

const dataListTermStyle = 'text-foreground/50 dark:text-foreground/50';
const EmptyText = () => (
  <span className="text-foreground/50 dark:text-foreground/50">None</span>
);

export const ViewPolicyDetail = ({ name }: { name: string }) => {
  const { data, isLoading, error } = useFetchGovernancePolicyDetail({ name });

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
          <dt className={dataListTermStyle}>Required Policy</dt>
          <dd>{data.protected?.join(', ') || <EmptyText />}</dd>
        </dl>
      )}
    </>
  );
};
