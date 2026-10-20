import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup } from './api';
import { TGroupCreateRequestBody, TGroupCreateResponse } from './types';

interface UseCreateGroupProps {
  onSuccess?: (data: TGroupCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateGroup = ({
  onSuccess,
  onError,
}: UseCreateGroupProps = {}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (group: TGroupCreateRequestBody) =>
      createGroup({
        body: group,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.groups.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.default(),
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
    reset,
  };
};
