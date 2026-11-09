import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchAppResourceSeriesApi } from './api';

/**
 * CPU and memory per time bucket, aggregated across every pod of the instance.
 *
 * This is what says whether the vertical dials are set anywhere near what the
 * app actually uses, so it sits beside them rather than on its own page.
 *
 * A `bucketSeconds` of 0 asks for one bucket over the whole window, and a
 * `windowSeconds` of 0 for the whole retention. The previous range stays on
 * screen while another loads. A `process` reads one of the engine's own
 * processes instead of the instance.
 */
export const useFetchAppResourceSeries = ({
  service,
  instance,
  process,
  windowSeconds,
  bucketSeconds,
  queryEnabled = true,
  refetchInterval = false,
}: {
  service: string;
  instance: string;
  process?: string;
  windowSeconds?: number;
  bucketSeconds?: number;
  queryEnabled?: boolean;
  refetchInterval?: number | false;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.apps.metricsSeries({
      service,
      instance,
      windowSeconds,
      bucketSeconds,
      process,
    }),
    queryFn: () =>
      fetchAppResourceSeriesApi({
        pathParams: { service, instance },
        queryParams: {
          ...(process ? { process } : {}),
          ...(windowSeconds !== undefined
            ? { window_seconds: windowSeconds }
            : {}),
          ...(bucketSeconds !== undefined
            ? { bucket_seconds: bucketSeconds }
            : {}),
        },
      }),
    enabled: !!service && !!instance && queryEnabled,
    placeholderData: keepPreviousData,
    refetchInterval,
    retry: false,
  });

  return { data, isLoading, error };
};
