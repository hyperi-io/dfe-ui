import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchServiceDetail = ({
  service_name,
  service_instance,
}: {
  service_name: string | null;
  service_instance: string | null;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['service', service_name, service_instance],
    queryFn: () =>
      apiClient.get(API_CONFIG.services.instance, {
        pathParams: {
          service: service_name ?? '',
          instance: service_instance ?? '',
        },
      }),
    enabled: !!service_name && !!service_instance,
  });
  return { data, isLoading, error };
};
