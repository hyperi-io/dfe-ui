import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { jsonPaths } from './api';

export const useFetchJsonPaths = ({
  source_name,
  samples,
  stats,
  paths,
  version,
}: {
  source_name: string;
  samples?: number;
  stats?: boolean;
  paths?: string;
  version?: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.schemas.jsonPaths({
      source_name,
      samples,
      stats,
      paths,
      version,
    }),
    queryFn: () =>
      jsonPaths({
        pathParams: { source_name: source_name ?? '' },
        queryParams: {
          version: version,
          samples: samples,
          stats: stats,
          paths: paths,
        },
      }),
  });

  return { data, isLoading, error };
};
