import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchAppStatusApi } from './api';

/**
 * Whether the instance is reporting telemetry, and since when.
 *
 * Liveness is derived from the recency of the app's own OTel rows rather than
 * a probe, so an engine that cannot reach the telemetry store answers 503 and
 * the caller says so instead of showing the app as down.
 */
export const useFetchAppStatus = ({
  service,
  instance,
  queryEnabled = true,
}: {
  service: string;
  instance: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.apps.status({ service, instance }),
    queryFn: () => fetchAppStatusApi({ pathParams: { service, instance } }),
    enabled: !!service && !!instance && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
