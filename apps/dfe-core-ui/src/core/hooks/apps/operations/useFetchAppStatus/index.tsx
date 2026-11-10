import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchAppStatusApi } from './api';

/**
 * Whether the instance is reporting telemetry, and since when.
 *
 * Liveness is derived from the recency of the app's own OTel rows rather than
 * a probe, so an engine that cannot reach the telemetry store answers 503 and
 * the caller says so instead of showing the app as down. A `process` reads one
 * of the engine's own processes instead of the instance.
 */
export const useFetchAppStatus = ({
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
    queryKey: QUERY_KEYS.apps.status({ service, instance, process }),
    queryFn: () =>
      fetchAppStatusApi({
        pathParams: { service, instance },
        ...(process ? { queryParams: { process } } : {}),
      }),
    enabled: !!service && !!instance && queryEnabled,
    refetchInterval,
    retry: false,
  });

  return { data, isLoading, error };
};
