import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const SOURCE_DETAIL_QUERY_KEY = (
  source_name: string | null,
  source_version: string | null = null,
) => [
  'source',
  ...(source_name ? [source_name] : []),
  ...(source_version ? [source_version] : []),
];

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
    queryKey: SOURCE_DETAIL_QUERY_KEY(source_name, source_version),
    queryFn: () =>
      apiClient.get(API_CONFIG.sources.sourceVersion, {
        pathParams: { name: source_name ?? '', version: source_version ?? '' },
      }),
    enabled: !!source_name && queryEnabled,
  });
  return { data, isLoading, error };
};
