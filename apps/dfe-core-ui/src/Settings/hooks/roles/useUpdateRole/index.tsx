import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRole } from './api';
import { TRoleUpdateRequest, UseUpdateRoleProps } from './types';

export const useUpdateRole = ({
  reauth,
  role_name,
  onSuccess,
  onError,
}: UseUpdateRoleProps) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (role: TRoleUpdateRequest) =>
      updateRole({
        headerParams: { [REAUTH_HEADER]: reauth?.() },
        body: role,
        pathParams: { name: role_name },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.roles.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.roles.role(),
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
