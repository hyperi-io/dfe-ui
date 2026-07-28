import { useFetchServiceDetail } from '@/Services/hooks/useFetchServiceDetail';
import { AceEditor } from '@/core/components/AceEditor';
import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useListServicesContext } from '@/core/contexts/ListServicesContext';
import { Spin } from 'antd';

export const ServicesDetail = () => {
  const { selectedService } = useListServicesContext();
  const {
    data: serviceDetailData,
    isLoading: isFetchingServiceDetail,
    error: fetchServiceDetailError,
  } = useFetchServiceDetail({
    service_name: selectedService?.service_name ?? null,
    service_instance: selectedService?.service_instance ?? null,
  });

  if (isFetchingServiceDetail)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  if (fetchServiceDetailError)
    return (
      <GenericErrorCard
        title="Error fetching source detail"
        description={fetchServiceDetailError.message}
      />
    );

  if (!serviceDetailData) {
    return (
      <EmptyDetail
        title="No service selected"
        description="Please add or select a service to see the detail."
      />
    );
  }
  return (
    <div className="h-[calc(100vh-125px)] css-custom-scrollbar pr-4">
      <div className="flex items-center justify-between mb-4 text-sm text-error border border-error rounded-md p-2">
        TODO: Add service detail here
      </div>
      <AceEditor
        value={JSON.stringify(serviceDetailData, null, 2)}
        mode="json"
        height="70%"
      />
    </div>
  );
};
