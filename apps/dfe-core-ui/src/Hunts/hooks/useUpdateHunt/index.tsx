import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateHunt } from './api';
import { THuntUpdateRequest, THuntUpdateResponse } from './types';

export const useUpdateHunt = ({
  name,
  onSuccess,
  onError,
}: {
  name: string;
  onSuccess?: (data: THuntUpdateResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (hunt: THuntUpdateRequest) =>
      updateHunt({
        body: hunt,
        pathParams: { name },
      }),
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

  return {
    data,
    mutate,
    isPending,
    error,
  };
};
