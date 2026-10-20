import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeGroupMember } from './api';
import { TRemoveGroupMemberResponse } from './types';

interface UseRemoveGroupMemberProps {
  group_name: string;
  onSuccess?: (data: TRemoveGroupMemberResponse) => void;
  onError?: (error: Error) => void;
}

export const useRemoveGroupMember = ({
  group_name,
  onSuccess,
  onError,
}: UseRemoveGroupMemberProps) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (username: string) =>
      removeGroupMember({
        pathParams: { name: group_name, username },
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

  return {
    data,
    mutate,
    isPending,
    error,
  };
};
