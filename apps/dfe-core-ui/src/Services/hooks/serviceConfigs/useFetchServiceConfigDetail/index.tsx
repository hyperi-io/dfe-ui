import { useQuery } from '@tanstack/react-query';
import { fetchServiceConfigDetail } from './api';

export const QUERY_KEY_SERVICE_CONFIG_DETAIL = ({
  service_name,
  service_instance,
}: {
  service_name?: string | null;
  service_instance?: string | null;
} = {}) => [
  'service-config-detail',
  ...(service_name ? [service_name] : []),
  ...(service_instance ? [service_instance] : []),
];

export const useFetchServiceConfigDetail = ({
  service_name,
  service_instance,
}: {
  service_name: string | null;
  service_instance: string | null;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY_SERVICE_CONFIG_DETAIL({
      service_name,
      service_instance,
    }),
    queryFn: () =>
      fetchServiceConfigDetail(service_name ?? '', service_instance ?? ''),
    enabled: !!service_name && !!service_instance,
  });
  return { data, isLoading, error };
};
