import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { GenericErrorCard } from '@/core/components/GenericError';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '@/Sources/components/CreateUpdateSourceForm';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useSourceDetailsContext } from '@/Sources/contexts/SourceDetailsContext';
import { useUpdateSource } from '@/Sources/hooks/useUpdateSource';
import { TSourceUpdateResponse } from '@/Sources/hooks/useUpdateSource/types';
import { awaitsReview } from '@/Sources/utils/sourceReview';
import { transformSourceFormDataToRequestBody } from '@/Sources/utils/transformSourceData/transformSourceFormDataToRequestBody';
import { transformSourceRequestBodyToFormData } from '@/Sources/utils/transformSourceData/transformSourceRequestBodyToFormData';
import { useQueryClient } from '@tanstack/react-query';
import { Spin } from 'antd';

interface EditSourceFormProps {
  onSuccess?: (response: TSourceUpdateResponse) => void;
}

export const EditSourceForm = ({ onSuccess }: EditSourceFormProps) => {
  const { componentHeight } = useSetComponentHeight({
    offset: 125,
  });
  const queryClient = useQueryClient();
  const {
    selectedSourceName: source_name,
    selectedSourceVersion: source_version,
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
      // A held version is not on main yet, so the page stays on the one it shows.
      if (!awaitsReview(response)) {
        setSelectedSource({
          source_name: response.source,
          source_version: response.current,
        });
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.sources.source({
            name: response.source,
            version: source_version,
          }),
        });
      }
      onSuccess?.(response);
    },
  });

  const handleUpdateSource = (values: CreateUpdateSourceFormData) => {
    const transformedValues = transformSourceFormDataToRequestBody(values);
    // A hidden Table Settings tab sends neither; the stored values keep the pins the engine compares.
    const stored = sourceDetailData?.version;
    updateSource({
      ...transformedValues,
      header: transformedValues.header ?? stored?.header,
      schema: transformedValues.schema ?? stored?.schema,
    });
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
    <CustomScrollbar height={componentHeight} className="flex flex-col gap-4">
      <CreateUpdateSourceForm
        key={source_name ?? 'empty'}
        disabledFields={{
          source: true,
          origin: true,
          fetcher: {
            topic: sourceDetailData?.current_table_topic_type === 'own' && true,
          },
          receiver_ui_config: {
            table: sourceDetailData?.current_table_topic_type === 'own' && true,
          },
        }}
        initialValues={initialValues}
        onFinish={handleUpdateSource}
        onValuesChange={resetUpdateSource}
        isPending={isUpdatingSource}
        error={updateSourceError}
        buttonLabel="Update Source"
        hasReset={true}
      />
    </CustomScrollbar>
  );
};
