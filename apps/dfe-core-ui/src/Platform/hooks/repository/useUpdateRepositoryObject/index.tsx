import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { RepositoryScope } from '@/Platform/hooks/repository/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRepositoryObjectApi } from './api';
import {
  TUpdateRepositoryObjectRequest,
  TUpdateRepositoryObjectResponse,
} from './types';

export const useUpdateRepositoryObject = ({
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
  onSuccess?: (values: TUpdateRepositoryObjectResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TUpdateRepositoryObjectRequest) =>
      updateRepositoryObjectApi({
        body,
        pathParams: { scope, scope_id, namespace, key },
      }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.repository.objects(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.repository.object({ scope, scope_id, namespace }),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
