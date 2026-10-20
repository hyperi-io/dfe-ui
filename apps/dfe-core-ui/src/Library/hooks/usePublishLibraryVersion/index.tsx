import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publishLibraryVersionApi } from './api';
import {
  TPublishLibraryVersionRequest,
  TPublishLibraryVersionResponse,
} from './types';

import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';

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
        queryKey: QUERY_KEYS.library.versions({ artifact }),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.library.artifact({ artifact }),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
