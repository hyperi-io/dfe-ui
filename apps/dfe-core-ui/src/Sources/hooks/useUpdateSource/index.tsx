import { INFINITE_SOURCES_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSources';
import { SAMPLE_ROWS_QUERY_KEY } from '@/Sources/hooks/useFetchSampleRows';
import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSource } from './api';
import { TSourceUpdateRequestBody, TSourceUpdateResponse } from './types';

interface UseUpdateSourceProps {
  onSuccess?: (data: TSourceUpdateResponse) => void;
  onError?: (error: Error) => void;
}

export const useUpdateSource = ({
  onSuccess,
  onError,
}: UseUpdateSourceProps = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (source: TSourceUpdateRequestBody) =>
      updateSource({
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
        void queryClient.invalidateQueries({
          queryKey: SAMPLE_ROWS_QUERY_KEY(data.source, data.current),
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
