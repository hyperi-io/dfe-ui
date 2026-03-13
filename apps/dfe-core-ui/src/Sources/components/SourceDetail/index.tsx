import { GenericErrorCard } from '@/core/components/GenericError';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useFetchSourceDetail } from '@/Sources/hooks/useFetchSourceDetail';
import { useUpdateSource } from '@/Sources/hooks/useUpdateSource';
import { notification, Spin } from 'antd';
import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '../CreateUpdateSourceForm';

export const SourceDetail = () => {
  const [api, contextHolder] = notification.useNotification();
  const { selectedSourceName: source_name } = useListSourcesContext();
  const {
    data: sourceDetailData,
    isLoading: isFetchingSourceDetail,
    error: fetchSourceDetailError,
  } = useFetchSourceDetail({ source_name });

  const {
    mutate: updateSource,
    isPending: isUpdatingSource,
    error: updateSourceError,
  } = useUpdateSource({
    onSuccess: () => {
      api.success({
        message: 'Source updated successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const handleUpdateSource = (values: CreateUpdateSourceFormData) => {
    updateSource(values);
  };
  if (isFetchingSourceDetail)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  if (fetchSourceDetailError)
    return (
      <GenericErrorCard
        title="Error fetching source detail"
        description={fetchSourceDetailError.message}
      />
    );
  return (
    <div className="h-[calc(100vh-125px)] css-custom-scrollbar pr-4">
      {contextHolder}
      <CreateUpdateSourceForm
        initialValues={sourceDetailData ?? {}}
        onFinish={handleUpdateSource}
        isPending={isUpdatingSource}
        error={updateSourceError}
        buttonLabel="Update Source"
      />
    </div>
  );
};
