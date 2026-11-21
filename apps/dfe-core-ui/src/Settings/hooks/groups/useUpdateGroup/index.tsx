import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGroup } from './api';
import { TGroupUpdateRequestBody, TGroupUpdateResponse } from './types';

interface UseUpdateGroupProps {
  /** The re-auth grant for this group, which the engine requires on a change, read when the request goes out. */
  reauth?: () => string | undefined;
  onSuccess?: (data: TGroupUpdateResponse) => void;
  onError?: (error: Error) => void;
  group_name: string;
}

export const useUpdateGroup = ({
  reauth,
  group_name,
  onSuccess,
  onError,
}: UseUpdateGroupProps) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (group: TGroupUpdateRequestBody) =>
      updateGroup({
        headerParams: { [REAUTH_HEADER]: reauth?.() },
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
