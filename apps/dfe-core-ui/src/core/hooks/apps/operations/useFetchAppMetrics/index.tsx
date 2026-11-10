import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchAppMetricsApi } from './api';

/**
 * Throughput, CPU, memory and saturation for the instance.
 *
 * `gauges` are point-in-time readings, `rates` are per-second counters over the
 * reported window - they are not interchangeable and are shown apart. A
 * `process` reads one of the engine's own processes instead of the instance.
 */
export const useFetchAppMetrics = ({
  service,
  instance,
  process,
  queryEnabled = true,
  refetchInterval = false,
}: {
  service: string;
  instance: string;
  process?: string;
  queryEnabled?: boolean;
  refetchInterval?: number | false;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.apps.metrics({ service, instance, process }),
    queryFn: () =>
      fetchAppMetricsApi({
        pathParams: { service, instance },
        ...(process ? { queryParams: { process } } : {}),
      }),
    enabled: !!service && !!instance && queryEnabled,
    refetchInterval,
    retry: false,
  });

  return { data, isLoading, error };
};
