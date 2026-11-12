import { NotificationCard } from '@/core/components/NotificationCard';
import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '@/Sources/components/CreateUpdateSourceForm';
import { useCreateSource } from '@/Sources/hooks/useCreateSource';
import { TCreateSourceResponse } from '@/Sources/hooks/useCreateSource/types';
import { useFetchSourceDetail } from '@/Sources/hooks/useFetchSourceDetail';
import { stringifyFetcherConfig } from '@/Sources/utils/transformSourceData/helpers';
import { transformSourceFormDataToRequestBody } from '@/Sources/utils/transformSourceData/transformSourceFormDataToRequestBody';
import { Spin } from 'antd';

export const CloneSourceContent = ({
  sourceName,
  sourceVersion,
  onSuccess,
}: {
  sourceName: string;
  sourceVersion: string;
  onSuccess?: (response: TCreateSourceResponse) => void;
}) => {
  const title = 'Clone Source';

  const {
    data: sourceDetail,
    isLoading: isSourceDetailLoading,
    error: sourceDetailError,
  } = useFetchSourceDetail({
    source_name: sourceName,
    source_version: sourceVersion,
  });

  const {
    mutate: createSourceMutation,
    isPending,
    error,
    reset: resetCreateSource,
  } = useCreateSource({
    onSuccess: (response) => {
      onSuccess?.(response);
    },
  });
  const handleCloneSource = (values: CreateUpdateSourceFormData) => {
    const transformedValues = transformSourceFormDataToRequestBody(values);
    createSourceMutation(transformedValues);
  };
  const clonedFetcher = sourceDetail?.version?.fetcher;
  const clonedExternal = sourceDetail?.version?.external;

  return (
    <>
      <div className="flex flex-col gap-4 mt-4">
        {isSourceDetailLoading && (
          <>
            <Spin /> <span className="sr-only">Loading source detail</span>
          </>
        )}
        {sourceDetailError && (
          <>
            <NotificationCard
              type="error"
              title="Error loading source detail"
              description={sourceDetailError.message}
            />
          </>
        )}

        {!isSourceDetailLoading && !sourceDetailError && !sourceDetail && (
          <NotificationCard
            type="warning"
            title="Unable to clone source"
            description="Source details are not available"
          />
        )}
      </div>

      {sourceDetail && (
        <CreateUpdateSourceForm
          onFinish={handleCloneSource}
          onValuesChange={resetCreateSource}
          isPending={isPending}
          error={error}
          buttonLabel={title}
          initialValues={{
            schema: {
              ...sourceDetail.version?.schema,
              meta_schema: sourceDetail.version?.schema?.meta_schema ?? '',
              meta_schema_version:
                sourceDetail.version?.schema?.meta_schema_version ?? '',
            },
            // Hyphen, not underscore: the engine takes a DNS-1123 label.
            source: `${sourceName}-copy`,
            enabled: sourceDetail.enabled,
            state: sourceDetail.state,
            description: sourceDetail.description,
            display_name: `Copy - ${sourceDetail.display_name}`,
            current: sourceDetail.current,
            versions: sourceDetail.versions,
            // A clone runs the same flow as what it was cut from, so it
            // carries the transport choice and the archive decision over.
            transport: sourceDetail.version?.transport ?? null,
            archive: sourceDetail.version?.archive ?? false,
            // The clone keeps the origin it was cut from, and a receiver clone
            // still re-asks for its match rule, which must be unique.
            origin: clonedFetcher
              ? 'fetcher'
              : clonedExternal
                ? 'external'
                : 'receiver',
            external: clonedExternal
              ? {
                  credential_ref: clonedExternal.credential_ref ?? null,
                  org: clonedExternal.org ?? null,
                  allowed_org_ids: clonedExternal.allowed_org_ids ?? [],
                  allowed_sources: clonedExternal.allowed_sources ?? [],
                }
              : null,
            fetcher: clonedFetcher
              ? {
                  source_type: clonedFetcher.source_type ?? '',
                  topic: clonedFetcher.topic ?? 'own',
                  config: stringifyFetcherConfig(clonedFetcher.config),
                }
              : null,
            match: {
              field: '',
              operator: 'equals',
              value: '',
            },
            receiver_ui_config: {
              table: 'main',
            },
          }}
        />
      )}
    </>
  );
};
