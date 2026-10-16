import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { SAMPLE_ROWS_QUERY_KEY } from '@/Sources/hooks/useFetchSampleRows';
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
          queryKey: QUERY_KEYS.sources.source({
            name: data.source,
            version: data.current,
          }),
        }),
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.sources.default(),
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
