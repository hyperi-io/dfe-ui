import { useMutation } from '@tanstack/react-query';
import { deleteRole } from './api';

export const useDeleteRole = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (role_name: string) =>
      deleteRole({
        pathParams: { name: role_name },
      }),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { mutate, isPending, error };
};
