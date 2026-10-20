import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRole } from './api';
import { TRoleUpdateRequest, UseUpdateRoleProps } from './types';

export const useUpdateRole = ({
  role_name,
  onSuccess,
  onError,
}: UseUpdateRoleProps) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (role: TRoleUpdateRequest) =>
      updateRole({
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

  return { data, mutate, isPending, error };
};
