import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGroup } from './api';

export const useDeleteGroup = ({
  reauth,
  onSuccess,
  onError,
}: {
  /** The re-auth grant for this group, which the engine requires on a change, read when the request goes out. */
  reauth?: () => string | undefined;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: (group_name: string) =>
      deleteGroup({
        headerParams: { [REAUTH_HEADER]: reauth?.() },
        pathParams: { name: group_name },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.groups.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.groups.group(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
