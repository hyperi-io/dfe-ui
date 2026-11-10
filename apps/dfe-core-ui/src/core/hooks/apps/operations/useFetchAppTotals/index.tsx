import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchAppTotalsApi } from './api';

/**
 * How much the instance did over the window, counted across every restart and
 * pod: its pipeline counters, requests and CPU time.
 *
 * A `windowSeconds` of 0 counts everything the metrics tables still keep. A
 * `process` reads one deployed from the app's image instead of the instance.
 * The previous range stays on screen while another loads.
 */
export const useFetchAppTotals = ({
  service,
  instance,
  process,
  windowSeconds,
  queryEnabled = true,
  refetchInterval = false,
}: {
  service: string;
  instance: string;
  process?: string;
  windowSeconds: number;
  queryEnabled?: boolean;
  refetchInterval?: number | false;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.apps.metricsTotals({
      service,
      instance,
      windowSeconds,
      process,
    }),
    queryFn: () =>
      fetchAppTotalsApi({
        pathParams: { service, instance },
        queryParams: {
          window_seconds: windowSeconds,
          ...(process ? { process } : {}),
        },
      }),
    enabled: !!service && !!instance && queryEnabled,
    placeholderData: keepPreviousData,
    refetchInterval,
    retry: false,
  });

  return { data, isLoading, error };
};
