import { useQuery } from '@tanstack/react-query';
import { fetchAppStatusApi } from './api';

export const APP_STATUS_QUERY_KEY = (service: string, instance: string) => [
  'app-status',
  service,
  instance,
];

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
    queryKey: APP_STATUS_QUERY_KEY(service, instance),
    queryFn: () => fetchAppStatusApi({ pathParams: { service, instance } }),
    enabled: !!service && !!instance && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
