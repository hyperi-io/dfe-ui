import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { formatDateToString } from '@/core/helpers/date.helpers';
import { useFetchDeploymentHistory } from '@/Services/hooks/deployments/useFetchDeploymentHistory';
import { Card, Spin } from 'antd';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);
export const ViewDeploymentHistory = ({
  service,
  instance,
}: {
  service: string;
  instance: string;
}) => {
  const { data, isLoading, error } = useFetchDeploymentHistory({
    service_name: service,
    service_instance: instance,
  });

  if (isLoading) {
    return (
      <>
        <Spin /> <span className="sr-only">Loading...</span>
      </>
    );
  }

  if (error) {
    return (
      <GenericErrorCard
        title="Error fetching deployment history"
        description={error.message}
      />
    );
  }

  if (data?.length === 0) {
    return <NotificationCard title="No deployment history found" />;
  }

  return (
    <div className="h-[calc(100vh-215px)] css-custom-scrollbar flex flex-col gap-2">
      {data?.map((item) => (
        <Card size="small" key={item.commit}>
          <dl className="grid grid-cols-[auto_1fr] gap-2">
            <dt className={dataListTermStyle}>Commit</dt>
            <dd>{item.commit || <EmptyData />} </dd>
            <dt className={dataListTermStyle}>Author</dt>
            <dd>{item.author || <EmptyData />} </dd>
            <dt className={dataListTermStyle}>Date</dt>
            <dd>{formatDateToString(item.date) || <EmptyData />} </dd>
            <dt className={dataListTermStyle}>Message</dt>
            <dd>{item.message || <EmptyData />} </dd>
          </dl>
        </Card>
      ))}
    </div>
  );
};
