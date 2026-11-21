import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addGroupMember } from './api';
import { TAddGroupMemberRequestBody, TAddGroupMemberResponse } from './types';

interface UseAddGroupMemberProps {
  /** The re-auth grant for this group, which the engine requires on a change, read when the request goes out. */
  reauth?: () => string | undefined;
  group_name: string;
  onSuccess?: (data: TAddGroupMemberResponse) => void;
  onError?: (error: Error) => void;
}

export const useAddGroupMember = ({
  reauth,
  group_name,
  onSuccess,
  onError,
}: UseAddGroupMemberProps) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (member: TAddGroupMemberRequestBody) =>
      addGroupMember({
        headerParams: { [REAUTH_HEADER]: reauth?.() },
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
