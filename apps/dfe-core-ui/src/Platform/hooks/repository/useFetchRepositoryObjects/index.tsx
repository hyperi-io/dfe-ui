import { useQuery } from '@tanstack/react-query';
import { fetchRepositoryObjectsApi } from './api';

export const REPOSITORY_OBJECTS_QUERY_KEY = ({
  scope,
  scope_id,
  namespace,
}: {
  scope?: string;
  scope_id?: string;
  namespace?: string;
} = {}) => [
  'repository',
  'objects',
  ...(scope ? [scope] : []),
  ...(scope_id ? [scope_id] : []),
  ...(namespace ? [namespace] : []),
];

export const useFetchRepositoryObjects = ({
  scope,
  scope_id,
  namespace,
}: {
  scope: string;
  scope_id: string;
  namespace: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: REPOSITORY_OBJECTS_QUERY_KEY({ scope, scope_id, namespace }),
    queryFn: () =>
      fetchRepositoryObjectsApi({ pathParams: { scope, scope_id, namespace } }),
  });

  return { data, isLoading, error };
};
