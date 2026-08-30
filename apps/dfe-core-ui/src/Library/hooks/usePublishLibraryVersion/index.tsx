import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publishLibraryVersionApi } from './api';
import {
  TPublishLibraryVersionRequest,
  TPublishLibraryVersionResponse,
} from './types';

import { LIBRARY_ARTIFACT_QUERY_KEY } from '@/Library/hooks/useFetchLibraryArtifactDetail';
import { LIBRARY_VERSIONS_QUERY_KEY } from '@/Library/hooks/useFetchLibraryVersions';

/**
 * Publish a new version. Versions are immutable, so republishing an existing
 * one is refused rather than silently overwritten.
 */
export const usePublishLibraryVersion = ({
  artifact,
  onSuccess,
  onError,
}: {
  artifact: string;
  onSuccess?: (values: TPublishLibraryVersionResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TPublishLibraryVersionRequest) =>
      publishLibraryVersionApi({ body, pathParams: { artifact } }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: LIBRARY_VERSIONS_QUERY_KEY(artifact),
      });
      queryClient.invalidateQueries({
        queryKey: LIBRARY_ARTIFACT_QUERY_KEY(artifact),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
