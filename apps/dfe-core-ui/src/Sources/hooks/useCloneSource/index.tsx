import { CloneSourceFormData } from '@/Sources/components/CloneSourceModal';
import { useCreateSource } from '@/Sources/hooks/useCreateSource';
import {
  SourceCreateRequestBody,
  SourceCreateResponse,
} from '@/Sources/hooks/useCreateSource/types';
import { useFetchSourceDetail } from '@/Sources/hooks/useFetchSourceDetail';
import { SourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { useState } from 'react';

interface UseCloneSourceProps {
  onSuccess?: (source: SourceCreateResponse) => void;
  onError?: (error: Error) => void;
  source_name: string;
  source_version: string | null;
}

const cloneSourceError = ({
  source_version,
  isFetchingSourceDetail,
  sourceDetailData,
}: {
  source_version: string | null;
  isFetchingSourceDetail: boolean;
  sourceDetailData: SourceVersionDetail | undefined;
}) => {
  if (isFetchingSourceDetail) return;
  if (!source_version) return;
  if (sourceDetailData?.version) return;
  return { message: 'Unable to clone source' };
};
export const useCloneSource = ({
  onSuccess,
  onError,
  source_name,
  source_version,
  queryEnabled,
}: UseCloneSourceProps & { queryEnabled: boolean }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: sourceDetailData, isLoading: isFetchingSourceDetail } =
    useFetchSourceDetail({
      source_name,
      source_version,
      queryEnabled,
    });

  const {
    mutate,
    isPending,
    error: createSourceError,
  } = useCreateSource({
    onSuccess,
    onError,
  });

  const handleMutate = (values: CloneSourceFormData) => {
    if (!sourceDetailData?.version) {
      const errMessage = 'Unable to clone source - no available version';
      setErrorMessage(errMessage);
      onError?.(new Error(errMessage));
      return;
    }
    const body: SourceCreateRequestBody = {
      source: values.source,
      display_name: values.display_name,
      enabled: values.enabled,
      ...sourceDetailData.version,
    };
    mutate(body);
  };

  const error =
    createSourceError ??
    (errorMessage ? new Error(errorMessage) : null) ??
    cloneSourceError({
      source_version,
      isFetchingSourceDetail,
      sourceDetailData,
    });

  return { mutate: handleMutate, isPending, error };
};
