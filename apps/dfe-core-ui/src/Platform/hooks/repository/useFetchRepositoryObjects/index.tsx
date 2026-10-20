import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { RepositoryScope } from '@/Platform/hooks/repository/types';
import { useQuery } from '@tanstack/react-query';
import { fetchRepositoryObjectsApi } from './api';

export const useFetchRepositoryObjects = ({
  scope,
  scope_id,
  namespace,
}: {
  scope: RepositoryScope;
  scope_id: string;
  namespace: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.repository.objects({ scope, scope_id, namespace }),
    queryFn: () =>
      fetchRepositoryObjectsApi({ pathParams: { scope, scope_id, namespace } }),
  });

  return { data, isLoading, error };
};
