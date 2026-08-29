import { useQuery } from '@tanstack/react-query';
import { fetchAppMetricsApi } from './api';

export const APP_METRICS_QUERY_KEY = (service: string, instance: string) => [
  'app-metrics',
  service,
  instance,
];

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
    queryKey: APP_METRICS_QUERY_KEY(service, instance),
    queryFn: () => fetchAppMetricsApi({ pathParams: { service, instance } }),
    enabled: !!service && !!instance && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
