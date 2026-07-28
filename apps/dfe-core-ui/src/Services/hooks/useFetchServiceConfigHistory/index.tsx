import { useQuery } from '@tanstack/react-query';
import { fetchServiceConfigHistory } from './api';

export const QUERY_KEY_SERVICE_CONFIG_HISTORY = ({
  service_name,
  service_instance,
}: {
  service_name?: string | null;
  service_instance?: string | null;
} = {}) => [
  'service-config-history',
  ...(service_name ? [service_name] : []),
  ...(service_instance ? [service_instance] : []),
];

export const useFetchServiceConfigHistory = ({
  service_name,
  service_instance,
}: {
  service_name: string | null;
  service_instance: string | null;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY_SERVICE_CONFIG_HISTORY({
      service_name,
      service_instance,
    }),
    queryFn: () =>
      fetchServiceConfigHistory(service_name ?? '', service_instance ?? ''),
    enabled: !!service_name && !!service_instance,
  });
  return { data, isLoading, error };
};
