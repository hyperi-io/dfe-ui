import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSource } from './api';
import { TCreateSourceRequestBody, TCreateSourceResponse } from './types';

interface UseCreateSourceProps {
  onSuccess?: (data: TCreateSourceResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateSource = ({
  onSuccess,
  onError,
}: UseCreateSourceProps = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (source: TCreateSourceRequestBody) =>
      createSource({ body: source }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sources.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sources.source({
          name: data.source,
          version: data.current,
        }),
      });
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
