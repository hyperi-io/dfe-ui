import { useMutation } from '@tanstack/react-query';
import { createRole } from './api';
import { TRoleCreateRequest, TRoleCreateResponse } from './types';

export const useCreateRole = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TRoleCreateResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (role: TRoleCreateRequest) => createRole({ body: role }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
