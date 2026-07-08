import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { INFINITE_SOURCES_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSources';
import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SourcePatchRequestBody, SourcePatchResponse } from './types';

export const usePatchSource = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (response: Omit<SourcePatchResponse, 'path'>) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ name, ...source }: SourcePatchRequestBody) =>
      apiClient.patch(API_CONFIG.sources.source, {
        body: source,
        pathParams: { name },
      }),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: SOURCE_DETAIL_QUERY_KEY(response.source),
      });
      void queryClient.invalidateQueries({
        queryKey: INFINITE_SOURCES_QUERY_KEY(),
      });
      onSuccess?.(response);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
