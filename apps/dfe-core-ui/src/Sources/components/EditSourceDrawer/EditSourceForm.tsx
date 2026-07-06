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
import { SourceUpdateResponse } from '@/Sources/hooks/useUpdateSource/types';
import { transformSourceFormDataToRequestBody } from '@/Sources/utils/transformSourceData/transformSourceFormDataToRequestBody';
import { transformSourceRequestBodyToFormData } from '@/Sources/utils/transformSourceData/transformSourceRequestBodyToFormData';
import { useQueryClient } from '@tanstack/react-query';
import { Spin } from 'antd';

interface EditSourceFormProps {
  onSuccess?: (response: SourceUpdateResponse) => void;
}

export const EditSourceForm = ({ onSuccess }: EditSourceFormProps) => {
  const queryClient = useQueryClient();
  const {
    selectedSourceName: source_name,
    selectedSourceVersion: source_version,
    refetch: refetchSources,
    setSelectedSource,
  } = useListSourcesContext();

  const {
    data: sourceDetailData,
    isLoading: isFetchingSourceDetail,
    error: fetchSourceDetailError,
  } = useFetchSourceDetail({ source_name, source_version });

  const {
    mutate: updateSource,
    isPending: isUpdatingSource,
    error: updateSourceError,
    reset: resetUpdateSource,
  } = useUpdateSource({
    onSuccess: (response) => {
      setSelectedSource({
        source_name: response.source,
        source_version: response.current,
      });
      void queryClient.invalidateQueries({
        queryKey: SOURCE_DETAIL_QUERY_KEY(response.source),
      });
      refetchSources();
      onSuccess?.(response);
    },
  });

  const handleUpdateSource = (values: CreateUpdateSourceFormData) => {
    const transformedValues = transformSourceFormDataToRequestBody(values);
    updateSource(transformedValues);
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

  const initialValues = transformSourceRequestBodyToFormData(sourceDetailData);
  return (
    <div className="h-[calc(100vh-125px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
      <CreateUpdateSourceForm
        key={source_name ?? 'empty'}
        disabledFields={{
          source: true,
        }}
        initialValues={initialValues}
        onFinish={handleUpdateSource}
        onValuesChange={resetUpdateSource}
        isPending={isUpdatingSource}
        error={updateSourceError}
        buttonLabel="Update Source"
        hasReset={true}
      />
    </div>
  );
};
