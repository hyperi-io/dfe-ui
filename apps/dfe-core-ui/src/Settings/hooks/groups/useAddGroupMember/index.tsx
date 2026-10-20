import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addGroupMember } from './api';
import { TAddGroupMemberRequestBody, TAddGroupMemberResponse } from './types';

interface UseAddGroupMemberProps {
  group_name: string;
  onSuccess?: (data: TAddGroupMemberResponse) => void;
  onError?: (error: Error) => void;
}

export const useAddGroupMember = ({
  group_name,
  onSuccess,
  onError,
}: UseAddGroupMemberProps) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (member: TAddGroupMemberRequestBody) =>
      addGroupMember({
        body: member,
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

  return {
    data,
    mutate,
    isPending,
    error,
  };
};
