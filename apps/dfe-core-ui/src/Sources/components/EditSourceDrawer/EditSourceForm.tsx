import { GenericErrorCard } from '@/core/components/GenericError';
import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '@/Sources/components/CreateUpdateSourceForm';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useSourceDetailsContext } from '@/Sources/contexts/SourceDetailsContext';
import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
import { useUpdateSource } from '@/Sources/hooks/useUpdateSource';
import { TSourceUpdateResponse } from '@/Sources/hooks/useUpdateSource/types';
import { transformSourceFormDataToRequestBody } from '@/Sources/utils/transformSourceData/transformSourceFormDataToRequestBody';
import { transformSourceRequestBodyToFormData } from '@/Sources/utils/transformSourceData/transformSourceRequestBodyToFormData';
import { useQueryClient } from '@tanstack/react-query';
import { Spin } from 'antd';

interface EditSourceFormProps {
  onSuccess?: (response: TSourceUpdateResponse) => void;
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
    sourceDetail: sourceDetailData,
    isLoadingSourceDetail,
    errorSourceDetail,
  } = useSourceDetailsContext();

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
        queryKey: SOURCE_DETAIL_QUERY_KEY(response.source, source_version),
      });
      refetchSources();
      onSuccess?.(response);
    },
  });

  const handleUpdateSource = (values: CreateUpdateSourceFormData) => {
    const transformedValues = transformSourceFormDataToRequestBody(values);
    updateSource(transformedValues);
  };
  if (isLoadingSourceDetail)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  if (errorSourceDetail)
    return (
      <GenericErrorCard
        title="Error fetching source detail"
        description={errorSourceDetail.message}
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
