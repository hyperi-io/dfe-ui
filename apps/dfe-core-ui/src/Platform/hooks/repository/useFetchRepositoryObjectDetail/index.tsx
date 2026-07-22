import { useQuery } from '@tanstack/react-query';
import { fetchRepositoryObjectDetailApi } from './api';

export const REPOSITORY_OBJECT_DETAIL_QUERY_KEY = ({
  scope,
  scope_id,
  namespace,
  key,
}: {
  scope?: string;
  scope_id?: string;
  namespace?: string;
  key?: string;
} = {}) => [
  'repository',
  'object',
  'detail',
  ...(scope ? [scope] : []),
  ...(scope_id ? [scope_id] : []),
  ...(namespace ? [namespace] : []),
  ...(key ? [key] : []),
];

export const useFetchRepositoryObjectDetail = ({
  scope,
  scope_id,
  namespace,
  key,
}: {
  scope: string;
  scope_id: string;
  namespace: string;
  key: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: REPOSITORY_OBJECT_DETAIL_QUERY_KEY(),
    queryFn: () =>
      fetchRepositoryObjectDetailApi({
        pathParams: { scope, scope_id, namespace, key },
      }),
  });

  return { data, isLoading, error };
};
