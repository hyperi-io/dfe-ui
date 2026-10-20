import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGroup } from './api';
import { TGroupUpdateRequestBody, TGroupUpdateResponse } from './types';

interface UseUpdateGroupProps {
  onSuccess?: (data: TGroupUpdateResponse) => void;
  onError?: (error: Error) => void;
  group_name: string;
}

export const useUpdateGroup = ({
  group_name,
  onSuccess,
  onError,
}: UseUpdateGroupProps) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (group: TGroupUpdateRequestBody) =>
      updateGroup({
        body: group,
        pathParams: { name: group_name },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.groups.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.groups.group({ name: group_name }),
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

  return { data, mutate, isPending, error, reset };
};
