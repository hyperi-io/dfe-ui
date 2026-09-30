import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { ServiceConfigActionMenu } from '@/Services/components/serviceConfigs/ServiceConfigActionMenu';
import { useListServicesContext } from '@/Services/contexts/ListServicesContext';
import { useFetchServiceConfigDetail } from '@/Services/hooks/serviceConfigs/useFetchServiceConfigDetail';
import { Spin, Tabs } from 'antd';
import { EmptyDetail } from './EmptyDetail';
import { ViewServiceConfigDetail } from './ViewServiceConfigDetail';
import { ViewServiceConfigHistory } from './ViewServiceConfigHistory';

export const ListServiceConfigDetail = () => {
  const {
    selectedService: {
      service_name: serviceConfigName,
      service_instance: serviceConfigInstanceName,
    },
  } = useListServicesContext();

  const { componentHeight } = useSetComponentHeight({
    offset: 100,
  });

  const {
    data: serviceConfigDetailData,
    isLoading: isFetchingServiceConfigDetail,
    error: fetchServiceConfigDetailError,
  } = useFetchServiceConfigDetail({
    service_name: serviceConfigName,
    service_instance: serviceConfigInstanceName,
  });

  if (!serviceConfigName || !serviceConfigInstanceName) {
    return <EmptyDetail />;
  }

  if (isFetchingServiceConfigDetail && !serviceConfigDetailData)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  if (fetchServiceConfigDetailError)
    return (
      <GenericErrorCard
        title="Error fetching service config detail"
        description={fetchServiceConfigDetailError.message}
      />
    );

  if (!serviceConfigDetailData) {
    return <EmptyDetail />;
  }

  return (
    <>
      <CustomScrollbar height={componentHeight} className="flex flex-col gap-4">
        <div className="flex shrink-0 items-center justify-between">
          <h4 className="flex items-center w-full gap-2 text-lg font-medium">
            <span className="text-foreground/50 dark:text-dark-foreground/50">
              Service Configuration:
            </span>
            {serviceConfigName}/{serviceConfigInstanceName}
          </h4>
          <ServiceConfigActionMenu serviceConfig={serviceConfigDetailData} />
        </div>
        <Tabs
          items={[
            {
              key: 'detail',
              label: 'Detail',
              children: (
                <ViewServiceConfigDetail {...serviceConfigDetailData} />
              ),
            },
            {
              key: 'history',
              label: 'History',
              children: (
                <ViewServiceConfigHistory
                  service={serviceConfigName}
                  instance={serviceConfigInstanceName}
                />
              ),
            },
          ]}
        />
      </CustomScrollbar>
    </>
  );
};
