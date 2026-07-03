import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchSourcePlan = ({
  source_name,
  version,
}: {
  source_name: string;
  version: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['source-plan', source_name, version],
    queryFn: () =>
      apiClient.get(API_CONFIG.sources.plan, {
        pathParams: { name: source_name },
        queryParams: {
          version,
        },
      }),
  });

  return { data, isLoading, error };
};
