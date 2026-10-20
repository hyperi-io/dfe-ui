import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminLinksApi } from './api';

/**
 * The admin UIs this deployment runs, in the order its deployer listed them.
 *
 * The engine reuses one round of probes for 30 seconds, so a refetch inside
 * that window returns the same statuses. Nothing here refetches on a timer.
 */
export const useFetchAdminLinks = () => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.deployment.adminLinks(),
    queryFn: () => fetchAdminLinksApi(),
    // A 403 is the engine's answer, and retrying it only delays saying so.
    retry: false,
  });

  return { data, isLoading, isFetching, error, refetch };
};
