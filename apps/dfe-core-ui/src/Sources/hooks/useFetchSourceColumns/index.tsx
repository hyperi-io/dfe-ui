import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchSourceColumns = ({
  source_name,
  version,
}: {
  source_name: string;
  version?: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['source-columns', source_name],
    queryFn: () =>
      apiClient.get(API_CONFIG.schemas.sourceColumns, {
        pathParams: { source_name },
        queryParams: { version },
      }),
    enabled: !!source_name,
  });

  return { data, isLoading, error };
};
