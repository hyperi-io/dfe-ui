import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchSourceDetail = ({
  source_name,
}: {
  source_name?: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['source', source_name],
    queryFn: () =>
      apiClient.get(API_CONFIG.sources.source, {
        pathParams: { name: source_name ?? '' },
      }),
    enabled: !!source_name,
  });
  return { data, isLoading, error };
};
