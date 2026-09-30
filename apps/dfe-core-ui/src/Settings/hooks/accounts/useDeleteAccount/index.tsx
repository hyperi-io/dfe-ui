import { QUERY_KEYS } from '@/core/config/api/queryKeys';
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
    mutationFn: (username: string) =>
      deleteAccount({
        pathParams: { username },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.infiniteFiltered(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
