import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRole } from './api';
import { TRoleCreateRequest, TRoleCreateResponse } from './types';

export const useCreateRole = ({
  reauth,
  onSuccess,
  onError,
}: {
  /** The re-auth grant the engine requires on this change, read when the request goes out. */
  reauth?: () => string | undefined;
  onSuccess?: (data: TRoleCreateResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (role: TRoleCreateRequest) =>
      createRole({ body: role, headerParams: { [REAUTH_HEADER]: reauth?.() } }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.roles.default(),
      });

      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
