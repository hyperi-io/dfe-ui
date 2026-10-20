import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { RepositoryScope } from '@/Platform/hooks/repository/types';
import { useQuery } from '@tanstack/react-query';
import { fetchRepositoryObjectDetailApi } from './api';

export const useFetchRepositoryObjectDetail = ({
  scope,
  scope_id,
  namespace,
  key,
}: {
  scope: RepositoryScope;
  scope_id: string;
  namespace: string;
  key: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.repository.object({ scope, scope_id, namespace, key }),
    queryFn: () =>
      fetchRepositoryObjectDetailApi({
        pathParams: { scope, scope_id, namespace, key },
      }),
  });

  return { data, isLoading, error };
};
