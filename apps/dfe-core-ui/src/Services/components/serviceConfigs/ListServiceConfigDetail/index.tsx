import { GenericErrorCard } from '@/core/components/GenericError';
import { useListServicesContext } from '@/Services/contexts/ListServicesContext';
import { useFetchServiceConfigDetail } from '@/Services/hooks/serviceConfigs/useFetchServiceConfigDetail';
import { Spin } from 'antd';
import { EmptyDetail } from './EmptyDetail';
import { ViewServiceConfigDetail } from './ViewServiceConfigDetail';

export const ListServiceConfigDetail = () => {
  const {
    selectedService: {
      service_name: serviceConfigName,
      service_instance: serviceConfigInstanceName,
    },
  } = useListServicesContext();

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
      <div className="h-[calc(100vh-100px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
        <h4 className="text-lg font-medium flex items-center gap-2">
          <span className="text-foreground/50 dark:text-dark-foreground/50">
            Service Configuration:
          </span>
          {serviceConfigName}/{serviceConfigInstanceName}
        </h4>
        <ViewServiceConfigDetail {...serviceConfigDetailData} />
      </div>
    </>
  );
};
