import { useCreateSource } from '@/Sources/hooks/useCreateSource';
import {
  SourceCreateRequestBody,
  SourceCreateResponse,
} from '@/Sources/hooks/useCreateSource/types';
import { useFetchSourceDetail } from '@/Sources/hooks/useFetchSourceDetail';

export const useCloneSource = ({
  onSuccess,
  onError,
  source_name,
  enabled = true,
}: {
  onSuccess?: (source: SourceCreateResponse) => void;
  onError?: (error: Error) => void;
  source_name: string;
  enabled?: boolean;
}) => {
  const { data: sourceDetailData, isLoading: isFetchingSourceDetail } =
    useFetchSourceDetail({
      source_name: source_name,
      enabled,
    });

  const {
    mutate,
    isPending,
    error: createSourceError,
  } = useCreateSource({
    onSuccess,
    onError,
  });

  const handleMutate = (
    values: Pick<
      SourceCreateRequestBody,
      'source' | 'display_name' | 'enabled'
    >,
  ) => {
    if (!sourceDetailData?.source) {
      throw new Error('Unable to clone source');
    }
    const body: SourceCreateRequestBody = {
      ...sourceDetailData,
      ...values,
    };
    mutate(body);
  };

  const error =
    createSourceError ??
    (enabled && !isFetchingSourceDetail && sourceDetailData?.source
      ? null
      : { message: 'Unable to clone source' });

  return { mutate: handleMutate, isPending, error };
};
