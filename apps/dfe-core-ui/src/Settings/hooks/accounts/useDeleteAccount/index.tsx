import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAccount } from './api';

export const useDeleteAccount = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    // The re-auth grant for *username*, which the engine requires on a delete.
    mutationFn: ({ reauth, username }: { reauth: string; username: string }) =>
      deleteAccount({
        headerParams: { [REAUTH_HEADER]: reauth },
        pathParams: { username },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.default(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
