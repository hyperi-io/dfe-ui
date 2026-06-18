import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { RoleCreateRequest, RoleCreateResponse } from './types';

export const useCreateRole = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: RoleCreateResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (role: RoleCreateRequest) =>
      apiClient.post(API_CONFIG.roles.default, { body: role }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
