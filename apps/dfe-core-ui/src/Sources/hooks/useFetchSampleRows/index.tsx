import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchSampleRows = ({
  source_name,
}: {
  source_name: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sample-rows', source_name],
    queryFn: () =>
      apiClient.get(API_CONFIG.schemas.sampleRows, {
        pathParams: { source_name },
      }),
  });

  return { data, isLoading, error };
};
