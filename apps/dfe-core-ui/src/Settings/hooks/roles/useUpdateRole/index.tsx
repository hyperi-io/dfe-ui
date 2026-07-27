import { useMutation } from '@tanstack/react-query';
import { updateRole } from './api';
import { TRoleUpdateRequest, UseUpdateRoleProps } from './types';

export const useUpdateRole = ({
  role_name,
  onSuccess,
  onError,
}: UseUpdateRoleProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (role: TRoleUpdateRequest) =>
      updateRole({
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
