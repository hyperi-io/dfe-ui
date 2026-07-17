import { useMutation } from '@tanstack/react-query';
import { deleteRepositoryObjectApi } from './api';

export const useDeleteRepositoryObject = ({
  scope,
  scope_id,
  namespace,
  key,
  onSuccess,
  onError,
}: {
  scope: string;
  scope_id: string;
  namespace: string;
  key: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: () =>
      deleteRepositoryObjectApi({
        pathParams: { scope, scope_id, namespace, key },
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
