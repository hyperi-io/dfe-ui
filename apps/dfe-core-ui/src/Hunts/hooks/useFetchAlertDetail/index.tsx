import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchAlertDetail = ({ name }: { name?: string | null }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['alert', name],
    queryFn: ({ signal }) =>
      apiClient.get(API_CONFIG.alerts.destination, {
        pathParams: { name: name ?? '' },
        signal,
      }),
    enabled: !!name,
  });

  return { data, isLoading, error };
};
