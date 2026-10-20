import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchAppResourceSeriesApi } from './api';

/**
 * CPU and memory per time bucket, aggregated across every pod of the instance.
 *
 * This is what says whether the vertical dials are set anywhere near what the
 * app actually uses, so it sits beside them rather than on its own page.
 */
export const useFetchAppResourceSeries = ({
  service,
  instance,
  windowSeconds,
  bucketSeconds,
  queryEnabled = true,
}: {
  service: string;
  instance: string;
  windowSeconds?: number;
  bucketSeconds?: number;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.apps.metricsSeries({
      service,
      instance,
      windowSeconds,
    }),
    queryFn: () =>
      fetchAppResourceSeriesApi({
        pathParams: { service, instance },
        queryParams: {
          ...(windowSeconds ? { window_seconds: windowSeconds } : {}),
          ...(bucketSeconds ? { bucket_seconds: bucketSeconds } : {}),
        },
      }),
    enabled: !!service && !!instance && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
