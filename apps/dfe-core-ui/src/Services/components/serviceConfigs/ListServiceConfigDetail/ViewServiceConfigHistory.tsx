import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { formatDateToString } from '@/core/helpers/date.helpers';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useFetchServiceConfigHistory } from '@/Services/hooks/serviceConfigs/useFetchServiceConfigHistory';
import { Card, Spin } from 'antd';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);
export const ViewServiceConfigHistory = ({
  service,
  instance,
}: {
  service: string;
  instance: string;
}) => {
  const { data, isLoading, error } = useFetchServiceConfigHistory({
    service_name: service,
    service_instance: instance,
  });

  const { componentHeight } = useSetComponentHeight({
    offset: 100,
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
        title="Error fetching service config history"
        description={error.message}
      />
    );
  }

  if (data?.length === 0) {
    return <NotificationCard title="No service config history found" />;
  }

  return (
    <CustomScrollbar height={componentHeight} className="flex flex-col gap-2">
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
    </CustomScrollbar>
  );
};
