import { useQuery } from '@tanstack/react-query';
import { fetchAppResourceSeriesApi } from './api';

export const APP_RESOURCE_SERIES_QUERY_KEY = (
  service: string,
  instance: string,
  windowSeconds?: number,
) => [
  'app-resource-series',
  service,
  instance,
  ...(windowSeconds ? [String(windowSeconds)] : []),
];

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
    queryKey: APP_RESOURCE_SERIES_QUERY_KEY(service, instance, windowSeconds),
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
