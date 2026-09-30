import { QUERY_KEYS } from '@/core/config/api/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRetentionApi } from './api';
import { TUpdateRetentionRequest, TUpdateRetentionResponse } from './types';

export const useUpdateRetention = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TUpdateRetentionResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TUpdateRetentionRequest) =>
      updateRetentionApi({
        body,
      }),
    onSuccess: (values) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.system.retention(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.system.settings(),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
