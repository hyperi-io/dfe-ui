import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHunt } from './api';
import { THuntCreateRequest, THuntCreateResponse } from './types';

export const useCreateHunt = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: THuntCreateResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (hunt: THuntCreateRequest) => createHunt({ body: hunt }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.hunts.default(),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
