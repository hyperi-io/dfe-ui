import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRole } from './api';

export const useDeleteRole = ({
  reauth,
  onSuccess,
  onError,
}: {
  /** The re-auth grant the engine requires on this change, read when the request goes out. */
  reauth?: () => string | undefined;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (role_name: string) =>
      deleteRole({
        headerParams: { [REAUTH_HEADER]: reauth?.() },
        pathParams: { name: role_name },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.roles.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.roles.role(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { mutate, isPending, error, reset };
};
