import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeGroupMember } from './api';
import { TRemoveGroupMemberResponse } from './types';

interface UseRemoveGroupMemberProps {
  /** The re-auth grant for this group, which the engine requires on a change, read when the request goes out. */
  reauth?: () => string | undefined;
  group_name: string;
  onSuccess?: (data: TRemoveGroupMemberResponse) => void;
  onError?: (error: Error) => void;
}

export const useRemoveGroupMember = ({
  reauth,
  group_name,
  onSuccess,
  onError,
}: UseRemoveGroupMemberProps) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (username: string) =>
      removeGroupMember({
        headerParams: { [REAUTH_HEADER]: reauth?.() },
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
