import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchAppConfigApi } from './api';

/**
 * Every option the app's container contract declares, with this instance's
 * value and where that value comes from.
 *
 * The overlay alone cannot answer this - it holds only what was written, so an
 * option nobody has touched is absent from it. The contract supplies the rest,
 * which is what lets an untouched option render the default it would run
 * rather than an empty box. A deployment that has mounted no contract for the
 * app answers `available: false` rather than an empty field list.
 */
export const useFetchAppConfig = ({
  service,
  instance,
  queryEnabled = true,
}: {
  service: string;
  instance: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.apps.config({ service, instance }),
    queryFn: () => fetchAppConfigApi({ pathParams: { service, instance } }),
    enabled: !!service && !!instance && queryEnabled,
    retry: false,
  });

  // `data.etag` is the deploy repo revision to send back as If-Match on the
  // paired write. `refetch` is how a refused write recovers.
  return { data, isLoading, isFetching, error, refetch };
};
