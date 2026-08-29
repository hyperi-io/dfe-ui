import { useQuery } from '@tanstack/react-query';
import { fetchAppHistoryApi } from './api';

export const APP_HISTORY_QUERY_KEY = (
  service: string,
  instance: string,
  limit?: number,
) => ['app-history', service, instance, ...(limit ? [String(limit)] : [])];

/**
 * Every governed change to this instance, newest first.
 *
 * `state` is 'committed' unless an Argo-synced revision is supplied, in which
 * case each commit reads as 'applied' or 'pending' against it.
 */
export const useFetchAppHistory = ({
  service,
  instance,
  limit,
  queryEnabled = true,
}: {
  service: string;
  instance: string;
  limit?: number;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: APP_HISTORY_QUERY_KEY(service, instance, limit),
    queryFn: () =>
      fetchAppHistoryApi({
        pathParams: { service, instance },
        ...(limit ? { queryParams: { limit } } : {}),
      }),
    enabled: !!service && !!instance && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
