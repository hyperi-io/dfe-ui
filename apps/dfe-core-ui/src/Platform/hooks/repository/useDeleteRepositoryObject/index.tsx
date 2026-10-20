import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { RepositoryScope } from '@/Platform/hooks/repository/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRepositoryObjectApi } from './api';

export const useDeleteRepositoryObject = ({
  scope,
  scope_id,
  namespace,
  key,
  onSuccess,
  onError,
}: {
  scope: RepositoryScope;
  scope_id: string;
  namespace: string;
  key: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: () =>
      deleteRepositoryObjectApi({
        pathParams: { scope, scope_id, namespace, key },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.repository.objects(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.repository.object({ scope, scope_id, namespace }),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
