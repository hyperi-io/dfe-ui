import { GenericErrorCard } from '@/core/components/GenericError';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useFetchSourceDetail } from '@/Sources/hooks/useFetchSourceDetail';
import { useUpdateSource } from '@/Sources/hooks/useUpdateSource';
import { notification, Spin } from 'antd';
import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '../CreateUpdateSourceForm';
import { EmptyDetail } from './EmptyDetail';

export const SourceDetail = () => {
  const [api, contextHolder] = notification.useNotification();
  const { selectedSourceName: source_name, refetch: refetchSources } =
    useListSourcesContext();
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
      refetchSources();
      api.success({
        title: 'Source updated successfully',
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

  if (!sourceDetailData) {
    return <EmptyDetail />;
  }
  return (
    <div className="h-[calc(100vh-125px)] css-custom-scrollbar pr-4">
      {contextHolder}
      <CreateUpdateSourceForm
        key={source_name ?? 'empty'}
        disabledFields={{
          source: true,
        }}
        initialValues={sourceDetailData ?? {}}
        onFinish={handleUpdateSource}
        isPending={isUpdatingSource}
        error={updateSourceError}
        buttonLabel="Update Source"
        hasReset={true}
      />
    </div>
  );
};
