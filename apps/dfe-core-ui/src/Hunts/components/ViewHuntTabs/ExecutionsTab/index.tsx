import { NotificationCard } from '@/core/components/NotificationCard';
import { useFetchHuntExecutions } from '@/Hunts/hooks/useFetchHuntExecutions';
import { Spin } from 'antd';

export const ExecutionsTab = ({ name }: { name: string }) => {
  const { data, isLoading, error } = useFetchHuntExecutions({ name });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 w-full justify-center">
        <Spin /> <span className="sr-only">Loading hunt executions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <NotificationCard
        type="error"
        title="Error loading hunt executions"
        description={error.message}
      />
    );
  }

  return data?.items && data?.items.length > 0 ? (
    <ul className="flex flex-col gap-2">
      {data?.items.map((item) => (
        <li key={item.fire}>
          <div>
            <span>{item.fire}</span>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <NotificationCard
      type="default"
      title="No executions found for this hunt"
      description="This hunt has not been executed yet."
    />
  );
};
