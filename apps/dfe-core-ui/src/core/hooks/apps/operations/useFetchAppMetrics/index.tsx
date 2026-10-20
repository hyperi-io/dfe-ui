import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchAppMetricsApi } from './api';

/**
 * Throughput, CPU, memory and saturation for the instance.
 *
 * `gauges` are point-in-time readings, `rates` are per-second counters over the
 * reported window - they are not interchangeable and are shown apart.
 */
export const useFetchAppMetrics = ({
  service,
  instance,
  queryEnabled = true,
}: {
  service: string;
  instance: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.apps.metrics({ service, instance }),
    queryFn: () => fetchAppMetricsApi({ pathParams: { service, instance } }),
    enabled: !!service && !!instance && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
