import { GenericErrorCard } from '@/core/components/GenericError';
import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '@/Sources/components/CreateUpdateSourceForm';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import {
  SOURCE_DETAIL_QUERY_KEY,
  useFetchSourceDetail,
} from '@/Sources/hooks/useFetchSourceDetail';
import { useUpdateSource } from '@/Sources/hooks/useUpdateSource';
import { useQueryClient } from '@tanstack/react-query';
import { notification, Spin, Typography } from 'antd';
import { EmptyDetail } from './EmptyDetail';

export const SourceDetail = () => {
  const [api, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
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
      void queryClient.invalidateQueries({
        queryKey: SOURCE_DETAIL_QUERY_KEY(source_name),
      });
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
    <>
      {contextHolder}
      <div className="h-[calc(100vh-125px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
        <Typography.Title level={5}>Source Configuration</Typography.Title>
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
    </>
  );
};
