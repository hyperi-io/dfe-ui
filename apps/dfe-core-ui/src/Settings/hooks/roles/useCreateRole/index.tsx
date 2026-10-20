import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRole } from './api';
import { TRoleCreateRequest, TRoleCreateResponse } from './types';

export const useCreateRole = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TRoleCreateResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (role: TRoleCreateRequest) => createRole({ body: role }),
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
