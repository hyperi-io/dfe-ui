import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchSourceDetail = ({
  source_name,
  enabled = true,
}: {
  source_name: string | null;
  enabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['source', source_name],
    queryFn: () =>
      apiClient.get(API_CONFIG.sources.source, {
        pathParams: { name: source_name ?? '' },
      }),
    enabled: !!source_name && enabled,
  });
  return { data, isLoading, error };
};
