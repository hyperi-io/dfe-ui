import { ApiError } from '@/core/config/api/client';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { sourceVersion } from './api';

export const useFetchSourceDetail = ({
  source_name,
  source_version,
  queryEnabled = true,
}: {
  source_name: string | null;
  source_version: string | null;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.sources.source({
      name: source_name,
      version: source_version,
    }),
    queryFn: () =>
      sourceVersion({
        pathParams: { name: source_name ?? '', version: source_version ?? '' },
      }),
    enabled: !!source_name && !!source_version && queryEnabled,
    // A 404 is the engine's answer that the source is not there, and retrying it only delays saying so.
    retry: (failures, error) =>
      !(error instanceof ApiError && error.status === 404) && failures < 3,
  });
  return { data, isLoading, error };
};
