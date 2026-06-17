import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { RoleUpdateRequest, UseUpdateRoleProps } from './types';

export const useUpdateRole = ({
  role_name,
  onSuccess,
  onError,
}: UseUpdateRoleProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (role: RoleUpdateRequest) =>
      apiClient.put(API_CONFIG.roles.role, {
        body: role,
        pathParams: { name: role_name },
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
