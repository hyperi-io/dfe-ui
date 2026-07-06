import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { INFINITE_SOURCES_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSources';
import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SourceUpdateRequestBody, SourceUpdateResponse } from './types';

interface UseUpdateSourceProps {
  onSuccess?: (data: SourceUpdateResponse) => void;
  onError?: (error: Error) => void;
}

export const useUpdateSource = ({
  onSuccess,
  onError,
}: UseUpdateSourceProps = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (source: SourceUpdateRequestBody) =>
      apiClient.put(API_CONFIG.sources.source, {
        body: source,
        pathParams: { name: source.source ?? '' },
      }),
    onSuccess: (data) => {
      Promise.all([
        void queryClient.invalidateQueries({
          queryKey: SOURCE_DETAIL_QUERY_KEY(data.source, data.current),
        }),
        void queryClient.invalidateQueries({
          queryKey: INFINITE_SOURCES_QUERY_KEY(),
        }),
      ]);
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    mutate,
    isPending,
    error,
    reset,
  };
};
